import { getAuth, getFirestore } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithCredential,
  PhoneAuthProvider,
  updateProfile,
  signOut as firebaseSignOut,
  FirebaseAuthTypes,
} from "@react-native-firebase/auth";
import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
} from '@react-native-firebase/firestore';

const firebaseAuth = getAuth();
const db = getFirestore();

export interface SignUpData {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
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
 * Sign up a new user with email and password
 */
export const signUpWithEmail = async (
  data: SignUpData,
): Promise<FirebaseAuthTypes.UserCredential> => {
  try {
    const { email, password, firstName, lastName } = data;
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password || '');

    await updateProfile(userCredential.user, {
      displayName: `${firstName} ${lastName}`.trim(),
    });

    await setDoc(doc(db, 'users', userCredential.user.uid), {
      firstName,
      lastName,
      email,
      createdAt: serverTimestamp(),
    });

    return userCredential;
  } catch (error: any) {
    console.error('Signup error:', error);
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
 * Complete phone signup profile
 */
export const completePhoneSignup = async (
  uid: string,
  firstName: string,
  lastName: string,
  phone?: string
) => {
  try {
    const user = firebaseAuth.currentUser;
    if (!user) throw new Error('No user found');

    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`.trim(),
    });

    await setDoc(doc(db, 'users', uid), {
      firstName,
      lastName,
      phone,
      createdAt: serverTimestamp(),
    }, { merge: true });
  } catch (error: any) {
    console.error('Complete phone signup error:', error);
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
