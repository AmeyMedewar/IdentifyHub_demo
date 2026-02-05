import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { DatabaseInterface } from './DatabaseInterface';
import { FIREBASE_CONFIG } from '../../constants/config';

class FirebaseAdapter extends DatabaseInterface {
  constructor() {
    super();
    // Initialize Firebase
    this.app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
    this.db = getFirestore(this.app);
    this.storage = getStorage(this.app);
  }

  /**
   * Save new user to Firebase
   */
  async saveUser(userData) {
    try {
      const docRef = await addDoc(collection(this.db, 'users'), {
        ...userData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      console.log('User saved with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUser(userId) {
    try {
      const docRef = doc(this.db, 'users', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  /**
   * Get user by face ID (from backend face recognition)
   */
  async getUserByFaceId(faceId) {
    try {
      const q = query(
        collection(this.db, 'users'),
        where('faceId', '==', faceId)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting user by face ID:', error);
      throw error;
    }
  }

  /**
   * Update user details
   */
  async updateUser(userId, userData) {
    try {
      const docRef = doc(this.db, 'users', userId);
      await updateDoc(docRef, {
        ...userData,
        updatedAt: Timestamp.now(),
      });
      console.log('User updated:', userId);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Mark attendance
   */
  async markAttendance(userId, timestamp = null) {
    try {
      const attendanceTime = timestamp || new Date();
      const docRef = await addDoc(collection(this.db, 'attendance'), {
        userId,
        timestamp: Timestamp.fromDate(attendanceTime),
        date: attendanceTime.toISOString().split('T')[0], // YYYY-MM-DD
        time: attendanceTime.toLocaleTimeString('en-IN'),
        markedAt: Timestamp.now(),
      });
      console.log('Attendance marked:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  }

  /**
   * Get attendance records for a month
   */
  async getAttendanceByMonth(userId, month, year) {
    try {
      // Create start and end dates for the month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const q = query(
        collection(this.db, 'attendance'),
        where('userId', '==', userId),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        where('timestamp', '<=', Timestamp.fromDate(endDate)),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error getting attendance:', error);
      throw error;
    }
  }

  /**
   * Check if attendance already marked today
   */
  async isAttendanceMarkedToday(userId) {
    try {
      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59
      );

      const q = query(
        collection(this.db, 'attendance'),
        where('userId', '==', userId),
        where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
        where('timestamp', '<=', Timestamp.fromDate(endOfDay))
      );

      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking attendance:', error);
      throw error;
    }
  }

  /**
   * Upload face image and get URL
   */
  async saveFaceData(userId, faceImageBlob) {
    try {
      const storageRef = ref(this.storage, `faces/${userId}.jpg`);
      await uploadBytes(storageRef, faceImageBlob);
      const downloadURL = await getDownloadURL(storageRef);
      console.log('Face image uploaded:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading face image:', error);
      throw error;
    }
  }
}

export default FirebaseAdapter;
