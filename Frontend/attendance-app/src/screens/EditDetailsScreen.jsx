import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import database from '../services/database/Index';

export default function EditDetailsScreen({ route }) {
  const { user } = route?.params || {};
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setContact(user.contact || '');
      setPosition(user.position || '');
      setDepartment(user.department || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!name || !email || !contact || !position) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User ID not found');
      return;
    }

    setIsSaving(true);
    try {
      await database.updateUser(user.id, {
        name,
        email,
        contact,
        position,
        department,
        updatedAt: new Date().toISOString(),
      });
      
      Alert.alert('Success', 'Details updated successfully!', [
        { text: 'OK' }
      ]);
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to update details. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => {
          // Navigate back
        }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <FontAwesome5 name="user" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.userName}>{user?.name || 'Unknown User'}</Text>
          <Text style={styles.userPosition}>{user?.position || ''}</Text>
        </View>

        {/* Edit Form */}
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

        {/* Save Button */}
        <TouchableOpacity 
          style={styles.saveBtn} 
          onPress={handleSave}
          disabled={isSaving}
        >
          <Ionicons name="save" size={20} color={COLORS.white} />
          <Text style={styles.saveBtnText}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>

        {/* Re-register Face Button */}
        <TouchableOpacity 
          style={styles.faceBtn}
          onPress={() => {
            Alert.alert('Face Re-registration', 'This will allow you to re-capture your face data for better recognition.');
          }}
        >
          <FontAwesome5 name="camera" size={18} color={COLORS.primary} />
          <Text style={styles.faceBtnText}>Re-register Face</Text>
        </TouchableOpacity>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  userCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  userPosition: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
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
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  faceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  faceBtnText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
