import { getAuth, getFirestore } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithCredential,
  PhoneAuthProvider,
  updateProfile,
  sendEmailVerification,
  signOut as firebaseSignOut,
  FirebaseAuthTypes,
} from "@react-native-firebase/auth";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import { COLLECTIONS } from '@/constants/collection';
import { UserFitnessProfile } from '@/interfaces/member';

const firebaseAuth = getAuth();
const db = getFirestore();

export interface SignUpData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface PhoneSignUpData {
  phone: string;
  firstName?: string;
  lastName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

/**
 * Sign in an existing user with email and password
 */
export const signInWithEmail = async (
  data: SignInData,
): Promise<FirebaseAuthTypes.UserCredential> => {
  try {
    console.log('Starting login for:', data.email);
    const userCredential = await signInWithEmailAndPassword(
      firebaseAuth,
      data.email,
      data.password,
    );
    console.log('Login successful:', userCredential.user.uid);
    return userCredential;
  } catch (error: any) {
    console.error('Login error:', error);
    let errorMessage = 'An error occurred during login';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password';
    }
    throw new Error(errorMessage);
  }
};

/**
 * Sign up a new user with email and password.
 * Creates a Firebase Auth account and an appusers Firestore document.
 */
export const signUpWithEmail = async (
  data: SignUpData,
): Promise<FirebaseAuthTypes.UserCredential> => {
  try {
    const { email, password, firstName = '', lastName = '' } = data;
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);

    const displayName = `${firstName} ${lastName}`.trim();
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }

    return userCredential;
  } catch (error: any) {
    console.error('Signup error:', error);
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('An account with this email already exists');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password must be at least 6 characters');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address');
    }
    throw error;
  }
};

/**
 * Send OTP to phone number
 */
export const signInWithPhone = async (phoneNumber: string): Promise<string> => {
  try {
    // Basic normalization: remove all non-numeric characters except +
    let cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    // If it's 10 digits, assume India (+91)
    if (cleaned.length === 10 && !cleaned.startsWith('+')) {
      cleaned = `+91${cleaned}`;
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
      cleaned = `+${cleaned}`;
    } else if (!cleaned.startsWith('+')) {
      cleaned = `+${cleaned}`;
    }

    console.log('Attempting phone login with:', cleaned);
    const confirmation = await signInWithPhoneNumber(firebaseAuth, cleaned);
    if (!confirmation.verificationId) {
      throw new Error('Failed to get verification ID');
    }
    return confirmation.verificationId;
  } catch (error: any) {
    console.error('Phone login error:', error);
    if (error.code === 'auth/invalid-phone-number') {
      throw new Error('The phone number format is invalid. Please include your country code (e.g. +91).');
    }
    throw error;
  }
};

/**
 * Verify OTP code
 */
export const verifyPhoneOTP = async (
  verificationId: string,
  code: string,
): Promise<FirebaseAuthTypes.UserCredential> => {
  try {
    const credential = PhoneAuthProvider.credential(verificationId, code);
    const userCredential = await signInWithCredential(firebaseAuth, credential);
    return userCredential;
  } catch (error: any) {
    console.error('OTP verification error:', error);
    throw error;
  }
};

/**
 * Complete phone signup profile — creates/updates the appusers doc.
 */
export const completePhoneSignup = async (
  uid: string,
  firstName: string = '',
  lastName: string = '',
  phone?: string
) => {
  try {
    const user = firebaseAuth.currentUser;
    if (!user) throw new Error('No user found');

    const displayName = `${firstName} ${lastName}`.trim();
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    await setDoc(doc(db, COLLECTIONS.APPUSERS, uid), {
      uid,
      firstName,
      lastName,
      phone,
      gyms: [],
      createdAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error: any) {
    console.error('Complete phone signup error:', error);
    throw error;
  }
};

/**
 * Complete email signup profile — creates the appusers doc after email is verified.
 */
export const completeEmailSignup = async (uid: string, email: string) => {
  try {
    await setDoc(doc(db, COLLECTIONS.APPUSERS, uid), {
      uid,
      firstName: '',
      lastName: '',
      email,
      gyms: [],
      createdAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error: any) {
    console.error('Complete email signup error:', error);
    throw error;
  }
};

/**
 * Send a verification email to the newly created user.
 * Call this right after signUpWithEmail.
 */
export const sendEmailVerificationToUser = async (
  user: FirebaseAuthTypes.User,
): Promise<void> => {
  try {
    await sendEmailVerification(user);
  } catch (error: any) {
    console.error('Send email verification error:', error);
    throw error;
  }
};

/**
 * Reload the Firebase user and return whether their email is verified.
 */
export const reloadAndCheckEmailVerified = async (): Promise<boolean> => {
  const user = firebaseAuth.currentUser;
  if (!user) return false;
  await user.reload();
  return firebaseAuth.currentUser?.emailVerified ?? false;
};

/**
 * Save the user's fitness profile to:
 *   appusers/{uid}/fitness/profile
 * Uses merge:true so it is safe to call multiple times (e.g. from settings).
 */
export const saveUserFitnessProfile = async (
  uid: string,
  data: Omit<UserFitnessProfile, 'updatedAt'>,
): Promise<void> => {
  try {
    await setDoc(
      doc(db, COLLECTIONS.APPUSERS, uid, 'fitness', 'profile'),
      { ...data, updatedAt: new Date().toISOString() },
      { merge: true },
    );
  } catch (error: any) {
    console.error('Save fitness profile error:', error);
    throw error;
  }
};

/**
 * Update the user's basic info (first name, last name) in the appusers document
 */
export const updateUserBasicInfo = async (
  uid: string,
  data: {
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    location?: string;
  }
): Promise<void> => {
  try {
    const user = firebaseAuth.currentUser;
    if (user) {
      await updateProfile(user, { displayName: `${data.firstName} ${data.lastName}`.trim() });
    }
    await setDoc(
      doc(db, COLLECTIONS.APPUSERS, uid),
      {
        firstName: data.firstName,
        lastName: data.lastName,
        ...(data.dateOfBirth ? { dateOfBirth: data.dateOfBirth } : {}),
        ...(data.gender ? { gender: data.gender } : {}),
        ...(data.location ? { location: data.location } : {}),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error: any) {
    console.error('Update user basic info error:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(firebaseAuth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

/**
 * Get the user's fitness profile
 */
export const getUserFitnessProfile = async (uid: string): Promise<UserFitnessProfile | null> => {
  try {
    const docRef = doc(db, COLLECTIONS.APPUSERS, uid, 'fitness', 'profile');
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as UserFitnessProfile) : null;
  } catch (error: any) {
    console.error('Get fitness profile error:', error);
    return null;
  }
};
