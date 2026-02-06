export const API_CONFIG = {
  BASE_URL:
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    process.env.API_BASE_URL ||
    'http://localhost:8080/api',
  TIMEOUT: 30000,
};

import { FIREBASE_CONFIG as FALLBACK_FIREBASE_CONFIG } from '../services/database/config';

export const FIREBASE_CONFIG = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
    process.env.FIREBASE_API_KEY ||
    FALLBACK_FIREBASE_CONFIG.apiKey,
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    process.env.FIREBASE_AUTH_DOMAIN ||
    FALLBACK_FIREBASE_CONFIG.authDomain,
  projectId:
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID ||
    FALLBACK_FIREBASE_CONFIG.projectId,
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    process.env.FIREBASE_STORAGE_BUCKET ||
    FALLBACK_FIREBASE_CONFIG.storageBucket,
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    process.env.FIREBASE_MESSAGING_SENDER_ID ||
    FALLBACK_FIREBASE_CONFIG.messagingSenderId,
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ||
    process.env.FIREBASE_APP_ID ||
    FALLBACK_FIREBASE_CONFIG.appId,
};

export const APP_CONFIG = {
  FACE_MATCH_THRESHOLD: 0.85,
  CAMERA_QUALITY: 0.7,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
};
