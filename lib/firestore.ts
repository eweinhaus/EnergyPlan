import { db } from './firebase';

// Dynamic imports to avoid SSR issues
let doc: any;
let setDoc: any;
let getDoc: any;
let collection: any;
let query: any;
let where: any;
let getDocs: any;
let orderBy: any;
let limit: any;
let Timestamp: any;
let deleteDoc: any;

const loadFirestore = async () => {
  if (typeof window !== 'undefined') {
    const firestoreModule = await import('firebase/firestore');
    doc = firestoreModule.doc;
    setDoc = firestoreModule.setDoc;
    getDoc = firestoreModule.getDoc;
    collection = firestoreModule.collection;
    query = firestoreModule.query;
    where = firestoreModule.where;
    getDocs = firestoreModule.getDocs;
    orderBy = firestoreModule.orderBy;
    limit = firestoreModule.limit;
    Timestamp = firestoreModule.Timestamp;
    deleteDoc = firestoreModule.deleteDoc;
  }
};

// Helper function to check if Firebase is available
const isFirebaseAvailable = () => {
  return typeof window !== 'undefined' && db !== null;
};
import {
  UserProfile,
  SavedRecommendation,
  UsageDataRecord,
  AuditLog,
  EnergyPlanFormData,
  Recommendation,
  GDPRConsent,
} from './types';

// User Profile Operations
export const createUserProfile = async (userId: string, email: string, displayName?: string): Promise<void> => {
  await loadFirestore();
  if (!isFirebaseAvailable()) {
    throw new Error('Firebase is not available');
  }
  const userDoc = doc(db, 'users', userId);
  const defaultConsent: GDPRConsent = {
    analytics: false,
    marketing: false,
    dataProcessing: true, // Required for core functionality
    dataStorage: false,
    lastUpdated: new Date(),
    version: '1.0',
  };

  await setDoc(userDoc, {
    uid: userId,
    email,
    displayName,
    preferences: {
      costPriority: 70,
      renewablePriority: 30,
    },
    createdAt: Timestamp.now().toDate(),
    lastLoginAt: Timestamp.now(),
    gdprConsent: defaultConsent,
  });
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  await loadFirestore();
  if (!isFirebaseAvailable()) {
    return null;
  }
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) return null;

  const data = userDoc.data();
  return {
    ...data,
    createdAt: data.createdAt.toDate(),
    lastLoginAt: data.lastLoginAt.toDate(),
    gdprConsent: {
      ...data.gdprConsent,
      lastUpdated: data.gdprConsent.lastUpdated.toDate(),
    },
  } as UserProfile;
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<void> => {
  await loadFirestore();
  const userDoc = doc(db, 'users', userId);
  await setDoc(userDoc, updates, { merge: true });
};

// Recommendation Operations
export const saveRecommendation = async (
  userId: string,
  formData: EnergyPlanFormData,
  recommendations: Recommendation[]
): Promise<string> => {
  await loadFirestore();
  const recommendationsRef = collection(db, 'recommendations');
  const newDoc = doc(recommendationsRef);

  const savedRecommendation: Omit<SavedRecommendation, 'id'> = {
    userId,
    formData,
    recommendations,
    createdAt: Timestamp.now().toDate(),
  };

  await setDoc(newDoc, savedRecommendation);
  return newDoc.id;
};

export const getUserRecommendations = async (
  userId: string,
  limitCount: number = 20
): Promise<SavedRecommendation[]> => {
  await loadFirestore();
  const q = query(
    collection(db, 'recommendations'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
  })) as SavedRecommendation[];
};

export const getRecommendation = async (recommendationId: string): Promise<SavedRecommendation | null> => {
  await loadFirestore();
  const docRef = doc(db, 'recommendations', recommendationId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt.toDate(),
  } as SavedRecommendation;
};

export const deleteRecommendation = async (recommendationId: string): Promise<void> => {
  await loadFirestore();
  await deleteDoc(doc(db, 'recommendations', recommendationId));
};

// Usage Data Operations
export const saveUsageData = async (
  userId: string,
  parsedData: any,
  originalXmlHash: string
): Promise<string> => {
  const usageDataRef = collection(db, 'usageData');
  const newDoc = doc(usageDataRef);

  const usageRecord: Omit<UsageDataRecord, 'id'> = {
    userId,
    parsedData,
    originalXmlHash,
    createdAt: Timestamp.now().toDate(),
  };

  await setDoc(newDoc, usageRecord);
  return newDoc.id;
};

export const getUserUsageData = async (userId: string): Promise<UsageDataRecord[]> => {
  await loadFirestore();
  const q = query(
    collection(db, 'usageData'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
  })) as UsageDataRecord[];
};

// Audit Logging
export const logAuditEvent = async (
  userId: string,
  action: AuditLog['action'],
  details: any,
  ipAddress?: string
): Promise<string> => {
  const auditRef = collection(db, 'auditLogs');
  const newDoc = doc(auditRef);

  const auditLog: Omit<AuditLog, 'id'> = {
    userId,
    action,
    timestamp: Timestamp.now().toDate(),
    details,
    ipAddress,
  };

  await setDoc(newDoc, auditLog);
  return newDoc.id;
};

// GDPR Compliance Operations
export const exportUserData = async (userId: string): Promise<any> => {
  await loadFirestore();
  const [profile, recommendations, usageData, auditLogs] = await Promise.all([
    getUserProfile(userId),
    getUserRecommendations(userId, 100), // Get all recommendations
    getUserUsageData(userId),
    getUserAuditLogs(userId),
  ]);

  return {
    profile,
    recommendations,
    usageData,
    auditLogs,
    exportDate: new Date().toISOString(),
  };
};

export const deleteUserData = async (userId: string): Promise<string[]> => {
  await loadFirestore();
  const deletedCollections: string[] = [];

  // Delete user profile
  try {
    await deleteDoc(doc(db, 'users', userId));
    deletedCollections.push('users');
  } catch (error) {
    console.error('Error deleting user profile:', error);
  }

  // Delete recommendations
  try {
    const recommendations = await getUserRecommendations(userId, 1000); // Get all
    const deletePromises = recommendations.map(rec =>
      deleteDoc(doc(db, 'recommendations', rec.id))
    );
    await Promise.all(deletePromises);
    deletedCollections.push('recommendations');
  } catch (error) {
    console.error('Error deleting recommendations:', error);
  }

  // Delete usage data
  try {
    const usageData = await getUserUsageData(userId);
    const deletePromises = usageData.map(record =>
      deleteDoc(doc(db, 'usageData', record.id))
    );
    await Promise.all(deletePromises);
    deletedCollections.push('usageData');
  } catch (error) {
    console.error('Error deleting usage data:', error);
  }

  // Delete audit logs
  try {
    const auditLogs = await getUserAuditLogs(userId);
    const deletePromises = auditLogs.map(log =>
      deleteDoc(doc(db, 'auditLogs', log.id))
    );
    await Promise.all(deletePromises);
    deletedCollections.push('auditLogs');
  } catch (error) {
    console.error('Error deleting audit logs:', error);
  }

  return deletedCollections;
};

const getUserAuditLogs = async (userId: string): Promise<AuditLog[]> => {
  const q = query(
    collection(db, 'auditLogs'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp.toDate(),
  })) as AuditLog[];
};
