import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  getDocs,
  orderBy,
  limit,
  addDoc,
  Timestamp
} from 'firebase/firestore';

// Firebase configuration - Replace with your own config from Firebase Console
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-auth-domain",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-storage-bucket",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "your-messaging-sender-id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Auth functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Firestore helper functions
export const createUserProfile = async (userId: string, data: any) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// ✅ CORRECTED VERSION
export const updateUserProfile = async (userId: string, data: any) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // setDoc with { merge: true } use karo instead of updateDoc
    // Yeh automatically document create karega agar exist nahi karta
    await setDoc(userRef, {
      ...data,
      updatedAt: Timestamp.now()
    }, { merge: true }); // 👈 merge: true is CRUCIAL
    
    console.log('Profile saved successfully');
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error; // Error throw karo taaki Profile.tsx catch kar sake
  }
};

// Daily tracking functions
export const getOrCreateDailyLog = async (userId: string, date: string) => {
  try {
    const logRef = doc(db, 'users', userId, 'dailyLogs', date);
    const docSnap = await getDoc(logRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    
    // Create new daily log
    const newLog = {
      date,
      waterIntake: 0,
      waterGoal: 2000,
      exercises: {},
      nutrition: {
        egg: false,
        fruit: false,
        protein: false,
        custom: []
      },
      weight: null,
      streak: 0,
      ramadanMode: false,
      sehriWater: 0,
      iftarWater: 0,
      createdAt: Timestamp.now()
    };
    
    await setDoc(logRef, newLog);
    return newLog;
  } catch (error) {
    console.error('Error getting/creating daily log:', error);
    throw error;
  }
};

export const updateDailyLog = async (userId: string, date: string, data: any) => {
  try {
    const logRef = doc(db, 'users', userId, 'dailyLogs', date);
    await updateDoc(logRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating daily log:', error);
    throw error;
  }
};

// Weight history functions
export const addWeightEntry = async (userId: string, weight: number, date: string) => {
  try {
    const weightRef = collection(db, 'users', userId, 'weightHistory');
    await addDoc(weightRef, {
      weight,
      date,
      createdAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error adding weight entry:', error);
    throw error;
  }
};

export const getWeightHistory = async (userId: string, limitCount: number = 30) => {
  try {
    const weightRef = collection(db, 'users', userId, 'weightHistory');
    const q = query(weightRef, orderBy('date', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);
    
    const history: any[] = [];
    querySnapshot.forEach((doc) => {
      history.push({ id: doc.id, ...doc.data() });
    });
    
    return history.reverse();
  } catch (error) {
    console.error('Error getting weight history:', error);
    throw error;
  }
};

// Badge functions
export const getUserBadges = async (userId: string) => {
  try {
    const badgesRef = collection(db, 'users', userId, 'badges');
    const querySnapshot = await getDocs(badgesRef);
    
    const badges: any[] = [];
    querySnapshot.forEach((doc) => {
      badges.push({ id: doc.id, ...doc.data() });
    });
    
    return badges;
  } catch (error) {
    console.error('Error getting user badges:', error);
    throw error;
  }
};

export const awardBadge = async (userId: string, badgeId: string, badgeData: any) => {
  try {
    const badgeRef = doc(db, 'users', userId, 'badges', badgeId);
    await setDoc(badgeRef, {
      ...badgeData,
      awardedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error awarding badge:', error);
    throw error;
  }
};

export { app };

export const deleteWeightEntry = async (userId: string, entryId: string) => {
  try {
    const entryRef = doc(db, 'users', userId, 'weightHistory', entryId);
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(entryRef);
  } catch (error) {
    console.error('Error deleting weight entry:', error);
    throw error;
  }
};
