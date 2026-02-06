import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import database from '../services/database/Index';
import { API_CONFIG } from '../constants/config';

export default function RegistrationScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Details, 2: Face Capture
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [pickedImage, setPickedImage] = useState(null);

  React.useEffect(() => {
    if (step === 2 && Platform.OS !== 'web' && !permission?.granted) {
      requestPermission();
    }
  }, [step, permission?.granted, requestPermission]);

  const handleContinue = async () => {
    if (!name || !email || !contact || !position) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (Platform.OS !== 'web') {
      if (!permission?.granted) {
        const result = await requestPermission();
        if (!result.granted) {
          Alert.alert('Camera Permission', 'Please allow camera access to continue.');
          return;
        }
      }
    }
    setStep(2);
  };

  const handleCaptureAndRegister = async () => {
    if (!name || !email || !contact || !position) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (Platform.OS !== 'web') {
      if (!permission?.granted) {
        Alert.alert('Camera Permission', 'Please allow camera access to continue.');
        return;
      }
      if (!cameraRef.current) {
        Alert.alert('Camera Error', 'Camera is not ready. Please try again.');
        return;
      }
    }

    setIsLoading(true);
    try {
      // Create user in Firebase
      const userData = {
        name,
        email,
        contact,
        position,
        department,
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      const userId = await database.saveUser(userData);

      let photoUri = null;
      if (Platform.OS === 'web') {
        if (!pickedImage?.uri) {
          Alert.alert('Image Required', 'Please upload a face photo to continue.');
          return;
        }
        photoUri = pickedImage.uri;
      } else if (pickedImage?.uri) {
        photoUri = pickedImage.uri;
      } else {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          exif: false,
        });
        photoUri = photo.uri;
      }

      // We do NOT store face images. Only send to backend for embeddings.
      await database.updateUser(userId, {
        faceCapturedAt: new Date().toISOString(),
      });

      let faceEnrolledOk = false;
      // Register face embedding in backend (non-blocking for user registration)
      try {
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('image', {
          uri: photoUri,
          name: 'face.jpg',
          type: 'image/jpeg',
        });
        const timeoutMs = 30000;
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Face register timeout')), timeoutMs)
        );
        const faceRes = await Promise.race([
          fetch(`${API_CONFIG.BASE_URL}/face/register`, {
            method: 'POST',
            body: formData,
          }),
          timeoutPromise,
        ]);
        if (!faceRes.ok) {
          throw new Error('Face registration failed');
        }
        const faceJson = await faceRes.json();
        faceEnrolledOk = faceJson?.status === 'registered';
        if (faceEnrolledOk) {
          await database.updateUser(userId, {
            faceEnrolled: true,
            faceUpdatedAt: new Date().toISOString(),
            faceModel: faceJson?.model || null,
            faceEmbeddingLength: faceJson?.embeddingLength || null,
          });
        }
      } catch (faceErr) {
        console.error('Face registration error:', faceErr);
        Alert.alert(
          'Face Registration Warning',
          faceErr?.message === 'Face register timeout'
            ? 'User saved, but face enrollment timed out. Try again.'
            : 'User saved, but face registration failed. Check backend URL and try again.'
        );
      }
      
      Alert.alert(
        'Success',
        faceEnrolledOk
          ? 'User registered in Firebase and face enrolled successfully.'
          : 'User registered in Firebase. Face enrollment pending.',
        [
        { text: 'OK', onPress: () => {
          // Reset form
        setName('');
        setEmail('');
        setContact('');
        setPosition('');
        setDepartment('');
        setStep(1);
        setPickedImage(null);
      }}
    ]);
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', `Failed to register. ${error?.message || ''}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => {
            // Navigate back - in real app use useNavigation
            if (step === 2) {
              setStep(1);
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Registration</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        <View style={[styles.step, step >= 1 && styles.stepActive]}>
          <Text style={[styles.stepText, step >= 1 && styles.stepTextActive]}>1</Text>
          <Text style={styles.stepLabel}>Details</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={[styles.step, step >= 2 && styles.stepActive]}>
          <Text style={[styles.stepText, step >= 2 && styles.stepTextActive]}>2</Text>
          <Text style={styles.stepLabel}>Face</Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {step === 1 ? (
          <>
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter full name"
                  placeholderTextColor={COLORS.textSecondary}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter email"
                  placeholderTextColor={COLORS.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contact Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter contact number"
                  placeholderTextColor={COLORS.textSecondary}
                  value={contact}
                  onChangeText={setContact}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Employment Details</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Position/Role *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter position"
                  placeholderTextColor={COLORS.textSecondary}
                  value={position}
                  onChangeText={setPosition}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Department</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter department"
                  placeholderTextColor={COLORS.textSecondary}
                  value={department}
                  onChangeText={setDepartment}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={styles.continueBtn} 
              onPress={handleContinue}
            >
              <Text style={styles.continueBtnText}>Continue to Face Capture</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.faceCaptureContainer}>
              {Platform.OS === 'web' ? (
                <View style={styles.webUploadContainer}>
                  {pickedImage?.uri ? (
                    <Image source={{ uri: pickedImage.uri }} style={styles.webPreview} />
                  ) : (
                    <View style={styles.cameraPlaceholder}>
                      <FontAwesome5 name="camera" size={60} color={COLORS.textSecondary} />
                      <Text style={styles.placeholderText}>Upload Face Photo</Text>
                      <Text style={styles.placeholderSubtext}>
                        Camera preview is limited on web. Upload a clear face image.
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.permissionBtn}
                    onPress={async () => {
                      const result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        quality: 0.8,
                      });
                      if (!result.canceled) {
                        setPickedImage(result.assets[0]);
                      }
                    }}
                  >
                    <Text style={styles.permissionBtnText}>
                      {pickedImage?.uri ? 'Change Photo' : 'Upload Photo'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : permission?.granted ? (
                <View>
                  <CameraView
                    ref={cameraRef}
                    style={styles.cameraPreview}
                    facing="front"
                  />
                  <View style={styles.uploadRow}>
                    <TouchableOpacity
                      style={styles.uploadBtn}
                      onPress={async () => {
                        const result = await ImagePicker.launchImageLibraryAsync({
                          mediaTypes: ImagePicker.MediaTypeOptions.Images,
                          quality: 0.8,
                        });
                        if (!result.canceled) {
                          setPickedImage(result.assets[0]);
                        }
                      }}
                    >
                      <Text style={styles.uploadBtnText}>
                        {pickedImage?.uri ? 'Change Upload' : 'Upload Photo'}
                      </Text>
                    </TouchableOpacity>
                    {pickedImage?.uri ? (
                      <TouchableOpacity
                        style={styles.uploadBtn}
                        onPress={() => setPickedImage(null)}
                      >
                        <Text style={styles.uploadBtnText}>Use Camera</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  {pickedImage?.uri ? (
                    <Image source={{ uri: pickedImage.uri }} style={styles.uploadPreview} />
                  ) : null}
                </View>
              ) : (
                <View style={styles.cameraPlaceholder}>
                  <FontAwesome5 name="camera" size={60} color={COLORS.textSecondary} />
                  <Text style={styles.placeholderText}>Camera Permission</Text>
                  <Text style={styles.placeholderSubtext}>
                    Please allow camera access to continue
                  </Text>
                  <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
                    <Text style={styles.permissionBtnText}>Allow Camera</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.instructionsCard}>
              <Ionicons name="information-circle" size={24} color={COLORS.primary} />
              <Text style={styles.instructionsText}>
                Ensure good lighting and look directly at the camera for accurate face recognition.
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.captureBtn} 
              onPress={handleCaptureAndRegister}
              disabled={isLoading}
            >
              <FontAwesome5 name="camera" size={20} color={COLORS.white} />
              <Text style={styles.captureBtnText}>
                {isLoading ? 'Registering...' : 'Capture & Register'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: COLORS.primary,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
  },
  headerRight: {
    width: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: COLORS.white,
  },
  step: {
    alignItems: 'center',
  },
  stepActive: {
    opacity: 1,
  },
  stepText: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.border,
    color: COLORS.textSecondary,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontWeight: '700',
    marginBottom: 4,
  },
  stepTextActive: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
  },
  stepLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  formSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  continueBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  faceCaptureContainer: {
    marginBottom: 16,
  },
  cameraPreview: {
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
  },
  uploadRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    marginBottom: 12,
  },
  uploadBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  uploadPreview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  cameraPlaceholder: {
    height: 300,
    backgroundColor: COLORS.black,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  placeholderSubtext: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
  permissionBtn: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  permissionBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  webUploadContainer: {
    gap: 12,
  },
  webPreview: {
    height: 300,
    borderRadius: 16,
    width: '100%',
    backgroundColor: COLORS.black,
  },
  instructionsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  instructionsText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  captureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  captureBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
