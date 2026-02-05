import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  StatusBar,
  Platform,
  Animated,
  ScrollView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const THEME = {
  bg: '#0B1410',
  panel: '#0F1F18',
  panelBorder: '#1E3E2B',
  text: '#E9FFF1',
  subtext: '#8FD3A7',
  muted: '#CFE7D6',
  green: '#21B66E',
  greenSoft: '#13391F',
  white: '#FFFFFF',
};

const API_BASE_URL = 'http://192.168.1.17:8000';

export default function HomeScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isNarrow = width < 900;
  const isSmall = width < 520;
  const isPortrait = height >= width;
  const useStack = isPortrait && isNarrow;
  const guideBase = isPortrait
    ? Math.min(width * 0.55, height * 0.35)
    : Math.min(height * 0.5, width * 0.3);
  const guideSize = {
    width: guideBase,
    height: guideBase * 1.4,
  };
  const guideOffsetY = isSmall ? -12 : -6;
  const cameraTopOffset = useStack ? (isSmall ? 20 : 14) : 0;
  const cameraRef = useRef(null);
  const actionsAnim = useRef(new Animated.Value(0)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const guideAnim = useRef(new Animated.Value(0)).current;

  const [permission, requestPermission] = useCameraPermissions();
  const [matchedUser, setMatchedUser] = useState(null);
  const [statusText, setStatusText] = useState('');
  const [apiResponse, setApiResponse] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showNextStep, setShowNextStep] = useState(false);
  const [pendingName, setPendingName] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const autoScanBusy = useRef(false);
  const resetTimerRef = useRef(null);

  const normalizePhotoUri = useCallback(async (photoUri) => {
    if (Platform.OS === 'web') return photoUri;
    const result = await ImageManipulator.manipulateAsync(
      photoUri,
      [{ flip: ImageManipulator.FlipType.Horizontal }],
      { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  }, []);

  const buildFormData = useCallback(async (photoUri) => {
    const formData = new FormData();
    if (Platform.OS === 'web') {
      const blob = await fetch(photoUri).then((r) => r.blob());
      const file = new File([blob], 'scan.jpg', { type: 'image/jpeg' });
      formData.append('image', file);
      return formData;
    }
    formData.append('image', {
      uri: photoUri,
      name: 'scan.jpg',
      type: 'image/jpeg',
    });
    return formData;
  }, []);

  const sendFaceToApi = useCallback(async (photoUri) => {
    const normalizedUri = await normalizePhotoUri(photoUri);
    const formData = await buildFormData(normalizedUri);

    const response = await fetch(`${API_BASE_URL}/identify`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    setApiResponse(data);
    if (data?.status === 'recognized' && data?.name) {
      setMatchedUser({ id: data.name, name: data.name, role: 'Employee' });
      setPendingName(data.name);
      setShowConfirm(true);
      setShowNextStep(false);
      return;
    }

    setMatchedUser(null);
    setPendingName('');
    setShowConfirm(false);
    const notFound = data?.status === 'not_in_database' || data?.name === 'Person Not Found';
    setShowNextStep(notFound);
    setStatusText(data?.status === 'no_face_detected' ? 'No face detected.' : 'Person not found.');
  }, [buildFormData, normalizePhotoUri]);

  const captureAndIdentify = useCallback(async () => {
    if (!cameraRef.current) return;
    setIsScanning(true);
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 0.8, duration: 120, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
    setStatusText('Capturing image...');
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.9, exif: false });
    setStatusText('Verifying identity...');
    await sendFaceToApi(photo.uri);
    setStatusText('');
    setIsScanning(false);
  }, [flashAnim, sendFaceToApi]);

  const handleMarkAttendance = async () => {
    if (!matchedUser) {
      await captureAndIdentify();
      return;
    }
    setStatusText('Attendance recorded.');
    // TODO: Replace with real attendance API call.
  };

  const handleScanFace = async () => {
    await captureAndIdentify();
  };

  const handleConfirmYes = async () => {
    setShowConfirm(false);
    setShowNextStep(false);
    await handleMarkAttendance();
  };

  const handleConfirmNo = () => {
    setShowConfirm(false);
    setShowNextStep(true);
  };

  const handleRetry = async () => {
    setShowNextStep(false);
    await handleScanFace();
  };

  const handleRegister = () => {
    setShowNextStep(false);
    router.push('/registration');
  };

  const formatConfidence = (value) => {
    if (typeof value !== 'number' || Number.isNaN(value)) return null;
    const normalized = value <= 1 ? value * 100 : value;
    return Math.max(0, Math.min(100, Math.round(normalized)));
  };

  const getStatusMeta = (status) => {
    if (status === 'recognized') {
      return { label: 'Recognized', tone: THEME.green, bg: 'rgba(33, 182, 110, 0.18)' };
    }
    if (status === 'no_face_detected') {
      return { label: 'No Face Detected', tone: '#F4C95D', bg: 'rgba(244, 201, 93, 0.14)' };
    }
    if (status === 'not_in_database') {
      return { label: 'Not Found', tone: '#FF8A7A', bg: 'rgba(255, 138, 122, 0.14)' };
    }
    if (status) {
      return { label: String(status).replace(/_/g, ' '), tone: THEME.subtext, bg: 'rgba(143, 211, 167, 0.12)' };
    }
    return { label: 'Awaiting Scan', tone: THEME.subtext, bg: 'rgba(143, 211, 167, 0.12)' };
  };

  const statusMeta = getStatusMeta(apiResponse?.status);
  const confidenceValue =
    formatConfidence(
      apiResponse?.confidence ??
        apiResponse?.score ??
        apiResponse?.match_score ??
        apiResponse?.similarity
    );
  const primaryName = apiResponse?.name || matchedUser?.name || 'Unknown';
  const detailRows = [
    apiResponse?.employee_id && { label: 'Employee ID', value: String(apiResponse.employee_id) },
    apiResponse?.role && { label: 'Role', value: String(apiResponse.role) },
    typeof confidenceValue === 'number' && { label: 'Confidence', value: `${confidenceValue}%` },
    apiResponse?.timestamp && { label: 'Timestamp', value: String(apiResponse.timestamp) },
  ].filter(Boolean);

  useEffect(() => {
    Animated.timing(actionsAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, [actionsAnim]);

  useEffect(() => {
    autoScanBusy.current = false;
  }, []);

  useEffect(() => {
    if (!isScanning) {
      guideAnim.stopAnimation();
      guideAnim.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(guideAnim, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(guideAnim, { toValue: 0, duration: 750, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [guideAnim, isScanning]);

  useEffect(() => {
    if (!apiResponse && !statusText && !showConfirm && !showNextStep) return;
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => {
      setMatchedUser(null);
      setStatusText('');
      setApiResponse(null);
      setShowConfirm(false);
      setShowNextStep(false);
      setPendingName('');
    }, 4000);
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, [apiResponse, showConfirm, showNextStep, statusText]);

  if (permission === null) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (permission?.granted === false) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera" size={56} color={THEME.green} />
        <Text style={styles.permissionText}>Camera permission is required</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.root, useStack && styles.rootStacked]}>
      <StatusBar hidden />

      {/* Left: Camera */}
      <View style={[styles.cameraPanel, useStack && styles.cameraPanelStacked, useStack && { paddingTop: cameraTopOffset }]}>
        <View
          style={[
            styles.cameraFrame,
            useStack && styles.cameraFrameStacked,
            useStack && { minHeight: Math.min(height * 0.5, 360) },
          ]}
        >
          <CameraView ref={cameraRef} style={styles.camera} facing="front" />
        </View>

        <Animated.View style={[styles.cameraFlash, { opacity: flashAnim }]} />


        <View
          style={[styles.faceGuide, { transform: [{ translateY: guideOffsetY }] }]}
          pointerEvents="none"
        >
          <Animated.View
            style={[
              styles.faceGuideOval,
              guideSize,
              {
                opacity: isScanning ? guideAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.95] }) : 0,
                transform: [
                  {
                    scale: isScanning
                      ? guideAnim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.02] })
                      : 0.9,
                  },
                ],
              },
            ]}
          />
        </View>

        {/* Overlay */}
        <View style={[styles.cameraOverlay, isSmall && styles.cameraOverlayCompact]}>
          <View style={styles.brandPill}>
            <Text style={styles.brandTitle}>IdentifyHub</Text>
            <Text style={styles.brandSub}>Attendance Suite</Text>
          </View>
        </View>

        <View
          style={[
            styles.bottomSheet,
            isSmall && styles.bottomSheetCompact,
            useStack && styles.bottomSheetStacked,
          ]}
        >
          <View style={styles.sheetHeader}>
            <Text style={styles.confirmLabel}>Verification</Text>
            {!!statusText && <Text style={styles.statusText}>{statusText}</Text>}
          </View>
          <Text style={[styles.confirmText, isSmall && styles.confirmTextCompact]}>
            {matchedUser
              ? `Confirm attendance for ${matchedUser.name}`
              : 'Position your face inside the guide.'}
          </Text>
          {matchedUser?.role ? (
            <Text style={[styles.confirmRole, isSmall && styles.confirmRoleCompact]}>{matchedUser.role}</Text>
          ) : null}
          <View style={styles.verifyActions}>
            <TouchableOpacity
              style={[styles.scanBtn, isSmall && styles.scanBtnCompactSmall]}
              onPress={handleScanFace}
              activeOpacity={0.85}
            >
              <Text style={[styles.scanBtnText, isSmall && styles.scanBtnTextSmall]}>Scan Face</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Right: Actions */}
      <View style={[styles.actionsPanel, useStack && styles.actionsPanelStacked]}>
        <ScrollView
          contentContainerStyle={styles.actionsScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Last Scan</Text>
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>{apiResponse ? 'Verification Result' : 'Ready to Scan'}</Text>
              <View style={[styles.statusPill, { backgroundColor: statusMeta.bg, borderColor: statusMeta.tone }]}>
                <Text style={[styles.statusPillText, { color: statusMeta.tone }]}>{statusMeta.label}</Text>
              </View>
            </View>
            <Text style={styles.resultName}>{primaryName}</Text>
            <Text style={styles.resultHint}>
              {apiResponse
                ? 'Details are formatted for quick review.'
                : 'Align your face inside the guide and tap Scan Face.'}
            </Text>
            {detailRows.length > 0 && (
              <View style={styles.resultRows}>
                {detailRows.map((row) => (
                  <View key={row.label} style={styles.resultRow}>
                    <Text style={styles.resultLabel}>{row.label}</Text>
                    <Text style={styles.resultValue}>{row.value}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <Animated.View
            style={{
              opacity: actionsAnim,
              transform: [
                {
                  translateY: actionsAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }),
                },
              ],
            }}
          >
            <TouchableOpacity style={[styles.actionBtn, isSmall && styles.actionBtnCompact]} onPress={() => router.push('/registration')}>
              <View style={styles.actionIconWrap}>
                <Ionicons name="person-add" size={18} color={THEME.text} />
              </View>
              <Text style={[styles.actionText, isSmall && styles.actionTextCompact]}>New Registration</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={{
              opacity: actionsAnim,
              transform: [
                {
                  translateY: actionsAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }),
                },
              ],
            }}
          >
            <TouchableOpacity style={[styles.actionBtn, isSmall && styles.actionBtnCompact]} onPress={() => router.push('/EditDetails')}>
              <View style={styles.actionIconWrap}>
                <Ionicons name="create" size={18} color={THEME.text} />
              </View>
              <Text style={[styles.actionText, isSmall && styles.actionTextCompact]}>Update Profile</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={{
              opacity: actionsAnim,
              transform: [
                {
                  translateY: actionsAnim.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }),
                },
              ],
            }}
          >
            <TouchableOpacity style={[styles.actionBtn, isSmall && styles.actionBtnCompact]} onPress={() => router.push('/AttendanceViewer')}>
              <View style={styles.actionIconWrap}>
                <Ionicons name="calendar" size={18} color={THEME.text} />
              </View>
              <Text style={[styles.actionText, isSmall && styles.actionTextCompact]}>Attendance Summary</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </View>

      {showConfirm && (
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Identity Check</Text>
            <Text style={styles.modalText}>Are you {pendingName}?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtnGhost} onPress={handleConfirmNo}>
                <Text style={styles.modalBtnGhostText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnPrimary} onPress={handleConfirmYes}>
                <Text style={styles.modalBtnPrimaryText}>Yes, Mark Attendance</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {showNextStep && (
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Not You?</Text>
            <Text style={styles.modalText}>Would you like to register or retry scan?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtnGhost} onPress={handleRetry}>
                <Text style={styles.modalBtnGhostText}>Retry</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnPrimary} onPress={handleRegister}>
                <Text style={styles.modalBtnPrimaryText}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: THEME.bg,
  },
  rootStacked: {
    flexDirection: 'column',
  },

  cameraPanel: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  cameraPanelStacked: {
    flex: 1,
    minHeight: 0,
  },
  cameraFrame: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A1F44',
    position: 'relative',
    width: '100%',
  },
  cameraFrameStacked: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 0,
    marginBottom: 0,
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 0,
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 28 : 20,
    paddingBottom: 28,
  },
  cameraOverlayCompact: {
    paddingHorizontal: 14,
    paddingBottom: 20,
  },
  bottomSheet: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 12,
    alignSelf: 'center',
    maxWidth: 280,
    backgroundColor: 'rgba(10, 18, 14, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(233, 255, 241, 0.22)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 6,
  },
  bottomSheetCompact: {
    left: 10,
    right: 10,
    bottom: 10,
    paddingHorizontal: 10,
  },
  bottomSheetStacked: {
    left: 16,
    right: 16,
    bottom: 16,
  },
  cameraFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
  },
  faceGuide: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceGuideOval: {
    borderRadius: 999,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: 'rgba(233, 255, 241, 0.9)',
    backgroundColor: 'rgba(11, 20, 16, 0.12)',
    shadowColor: '#21B66E',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  brandPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(11, 20, 16, 0.78)',
    borderWidth: 1,
    borderColor: THEME.panelBorder,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  brandTitle: {
    color: THEME.text,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  brandSub: {
    color: THEME.subtext,
    fontSize: 10,
    letterSpacing: 1.2,
  },
  confirmLabel: {
    color: THEME.text,
    fontSize: 12,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  confirmText: {
    color: THEME.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
  confirmTextCompact: {
    fontSize: 14,
    lineHeight: 19,
  },
  confirmRole: {
    color: THEME.muted,
    fontSize: 13,
    lineHeight: 16,
  },
  confirmRoleCompact: {
    fontSize: 12,
  },
  verifyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 4,
  },
  scanBtn: {
    alignSelf: 'flex-start',
    backgroundColor: THEME.green,
    borderWidth: 1.5,
    borderColor: '#2BD17F',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    shadowColor: THEME.green,
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  markBtn: {
    backgroundColor: THEME.green,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  markBtnText: {
    color: THEME.white,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  scanBtnCompactSmall: {
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  scanBtnText: {
    color: THEME.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  scanBtnTextSmall: {
    fontSize: 13,
  },
  statusText: {
    color: THEME.subtext,
    fontSize: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },

  actionsPanel: {
    width: 360,
    backgroundColor: THEME.panel,
    borderLeftWidth: 1,
    borderLeftColor: THEME.panelBorder,
    padding: 20,
  },
  actionsPanelStacked: {
    width: '100%',
    borderLeftWidth: 0,
    borderTopWidth: 1,
    borderTopColor: THEME.panelBorder,
    padding: 16,
    flex: 1,
    backgroundColor: THEME.panel,
    marginTop: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  actionsScrollContent: {
    paddingBottom: 20,
    gap: 14,
  },
  sectionTitle: {
    color: THEME.subtext,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  actionBtn: {
    backgroundColor: THEME.greenSoft,
    borderWidth: 1,
    borderColor: THEME.panelBorder,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtnCompact: {
    paddingVertical: 12,
  },
  actionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(233, 255, 241, 0.081)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  actionText: {
    color: THEME.text,
    fontSize: 16,
    fontWeight: '600',
  },
  actionTextCompact: {
    fontSize: 14,
  },
  resultCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.panelBorder,
    backgroundColor: 'rgba(9, 19, 14, 0.8)',
    padding: 16,
    gap: 10,
    marginBottom: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 16,
    
  },
  resultTitle: {
    color: THEME.text,
    fontSize: 15,
    fontWeight: '700',
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  resultName: {
    color: THEME.text,
    fontSize: 20,
    fontWeight: '700',
  },
  resultHint: {
    color: THEME.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  resultRows: {
    marginTop: 6,
    gap: 8,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLabel: {
    color: THEME.subtext,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  resultValue: {
    color: THEME.text,
    fontSize: 13,
    fontWeight: '600',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0F1F18',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.panelBorder,
    padding: 18,
    gap: 12,
  },
  modalTitle: {
    color: THEME.subtext,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  modalText: {
    color: THEME.text,
    fontSize: 16,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  modalBtnGhost: {
    borderWidth: 1,
    borderColor: THEME.panelBorder,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalBtnGhostText: {
    color: THEME.text,
    fontSize: 14,
    fontWeight: '600',
  },
  modalBtnPrimary: {
    backgroundColor: THEME.green,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalBtnPrimaryText: {
    color: THEME.white,
    fontSize: 14,
    fontWeight: '700',
  },

  permissionContainer: {
    flex: 1,
    backgroundColor: THEME.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  permissionText: {
    color: THEME.text,
    fontSize: 16,
  },
  permissionBtn: {
    backgroundColor: THEME.green,
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  permissionBtnText: {
    color: THEME.white,
    fontWeight: '700',
  },
});
