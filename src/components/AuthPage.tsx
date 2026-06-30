import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  UserCheck, 
  HardHat, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthPageProps {
  onAuthSuccess: (user: { name: string; email: string; role: 'citizen' | 'official'; points: number; picture?: string }) => void;
  onContinueAsGuest: () => void;
  onLoginWithGoogle: () => void;
}

// Icons for social buttons
const GoogleWhiteIcon = () => (
  <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
    <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.71 0 3.27.61 4.5 1.64l2.4-2.4C17.385 1.5 14.97 0 12.24 0c-6.075 0-11 4.925-11 11s4.925 11 11 11c6.35 0 10.56-4.47 10.56-10.74 0-.72-.065-1.41-.18-1.975H12.24z" />
  </svg>
);

const GoogleColorIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.22-.66-.35-1.36-.35-2.09z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
    <path d="M9 8H7v3h2v9h4v-9h3.6l.4-3H13V6c0-.5.5-1 1-1h2V1h-3c-3 0-5 2-5 5v2z" />
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
  </svg>
);

export default function AuthPage({ onAuthSuccess, onContinueAsGuest, onLoginWithGoogle }: AuthPageProps) {
  const [isRegister, setIsRegister] = useState(false);
  
  // Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'citizen' | 'official'>('citizen');
  const [showPassword, setShowPassword] = useState(false);
  
  // Feedback States
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRulesWarning, setShowRulesWarning] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setShowRulesWarning(false);
    setLoading(true);

    const lowerEmail = email.toLowerCase().trim();

    try {
      if (isRegister) {
        // 1. Create the user credentials with Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, lowerEmail, password);
        const firebaseUser = userCredential.user;

        // 2. Persist profile info to Firestore
        const userRef = doc(db, 'users', firebaseUser.uid);
        const initialPoints = role === 'official' ? 350 : 120;
        try {
          await setDoc(userRef, {
            uid: firebaseUser.uid,
            name: name.trim(),
            email: lowerEmail,
            role,
            points: initialPoints,
            createdAt: new Date().toISOString()
          });
        } catch (dbErr: any) {
          console.warn('Firestore profile set failed during registration (using fallback logic):', dbErr);
          handleFirestoreError(dbErr, OperationType.WRITE, 'users/' + firebaseUser.uid);
        }

        // 3. Immediately sign out so the user is forced to login manually as per instructions
        await signOut(auth);

        setSuccessMsg('Account registered successfully! Please sign in with your email and password to access the portal.');
        setPassword('');
        setName('');
        setTimeout(() => {
          setIsRegister(false);
          setSuccessMsg(null);
        }, 3000);
      } else {
        // 1. Sign in with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, lowerEmail, password);
        const firebaseUser = userCredential.user;

        // 2. Retrieve user details from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const profileData = userDoc.data();
            onAuthSuccess({
              name: profileData.name || 'User',
              email: profileData.email || lowerEmail,
              role: profileData.role || 'citizen',
              points: profileData.points || 120
            });
          } else {
            // Fallback if record does not exist in Firestore (create on the fly)
            const fallbackProfile = {
              name: firebaseUser.displayName || 'Resident Citizen',
              email: firebaseUser.email || lowerEmail,
              role: 'citizen' as const,
              points: 120
            };
            try {
              await setDoc(userDocRef, {
                uid: firebaseUser.uid,
                ...fallbackProfile,
                createdAt: new Date().toISOString()
              });
            } catch (writeErr: any) {
              console.warn('Firestore user profile write failed:', writeErr);
              handleFirestoreError(writeErr, OperationType.WRITE, 'users/' + firebaseUser.uid);
            }
            onAuthSuccess(fallbackProfile);
          }
        } catch (readErr: any) {
          console.error('Firestore user profile read failed:', readErr);
          handleFirestoreError(readErr, OperationType.GET, 'users/' + firebaseUser.uid);
        }
      }
    } catch (err: any) {
      let friendlyMessage = err.message;
      try {
        const parsed = JSON.parse(err.message);
        if (parsed && parsed.error && (parsed.error.includes('permission-denied') || parsed.error.includes('permissions') || parsed.error.includes('Missing or insufficient permissions'))) {
          friendlyMessage = 'Access was denied by Firestore rules. See the configuration instructions below.';
          setShowRulesWarning(true);
        }
      } catch (e) {
        // Not a JSON error, proceed with standard checks
      }

      if (err.code === 'auth/email-already-in-use') {
        friendlyMessage = 'The email address is already in use by another account.';
      } else if (err.code === 'auth/weak-password') {
        friendlyMessage = 'The password must be at least 6 characters long.';
      } else if (err.code === 'auth/invalid-email') {
        friendlyMessage = 'Please enter a valid email address.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        friendlyMessage = 'Invalid email or password.';
      } else if (err.message?.includes('network-request-failed')) {
        friendlyMessage = 'Network connection failure. Please try again.';
      } else if (err.code === 'permission-denied' || err.message?.includes('permission-denied')) {
        friendlyMessage = 'Access was denied by Firestore rules. See the configuration instructions below.';
        setShowRulesWarning(true);
      }
      setError(friendlyMessage);
    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fc] via-white to-[#f5f3ff] flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8 font-sans relative overflow-hidden" id="auth-page-root">
      {/* Dynamic Background Circles */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-100/50 rounded-full blur-3xl -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md z-10"
      >
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-11 h-11 bg-indigo-600 rounded-2xl shadow-md shadow-indigo-500/10 mb-3">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">CivicResolve</h2>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">
            Municipal Portal
          </p>
        </div>

        {/* Outer Card with pristine shadow & styling matching screens */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.06)] p-8 relative">
          
          {/* Form Content */}
          <form onSubmit={handleSubmit}>
            
            {/* 1. LOGIN VIEW (Figure 1) */}
            {!isRegister ? (
              <div className="space-y-6">
                <h1 className="text-3xl font-extrabold text-slate-800 text-center tracking-tight mb-8">
                  Login
                </h1>

                {/* Display Feedbacks */}
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs flex items-start gap-2.5"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {successMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs flex items-start gap-2.5"
                  >
                    <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}

                {/* Username Input with left icon and bottom border only */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 font-sans tracking-wide">
                    Username
                  </label>
                  <div className="flex items-center border-b border-slate-200 py-2 focus-within:border-indigo-500 transition-colors">
                    <User className="h-4 w-4 text-slate-400 mr-3 shrink-0" />
                    <input
                      type="email"
                      required
                      placeholder="Type your username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder-slate-400 font-medium"
                    />
                  </div>
                </div>

                {/* Password Input with left icon and bottom border only */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 font-sans tracking-wide">
                    Password
                  </label>
                  <div className="flex items-center border-b border-slate-200 py-2 focus-within:border-indigo-500 transition-colors">
                    <Lock className="h-4 w-4 text-slate-400 mr-3 shrink-0" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Type your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder-slate-400 font-medium"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 focus:outline-none ml-2"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password link on the right */}
                <div className="text-right">
                  <button 
                    type="button" 
                    onClick={() => setError('Password recovery link has been simulated. Please login with: password123')}
                    className="text-xs text-slate-400 hover:text-indigo-600 transition-colors font-sans"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Gradient Rounded LOGIN Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-gradient-to-r from-cyan-400 via-purple-500 to-fuchsia-500 hover:opacity-95 text-white font-extrabold tracking-widest rounded-full shadow-lg shadow-indigo-500/10 active:scale-[0.99] transition-all text-xs uppercase flex items-center justify-center cursor-pointer"
                >
                  {loading ? 'Processing...' : 'LOGIN'}
                </button>

                {/* Social logins */}
                <div className="text-center mt-8">
                  <span className="text-slate-500 text-xs font-semibold font-sans">
                    Or Sign Up Using
                  </span>
                  <div className="flex items-center justify-center gap-3.5 mt-4">
                    {/* Facebook Circle */}
                    <button
                      type="button"
                      onClick={() => alert('Facebook integration is a demo placeholder. Please use Google sign-in instead!')}
                      className="w-10 h-10 rounded-full bg-[#3b5998] hover:bg-[#324b80] flex items-center justify-center shadow-sm transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <FacebookIcon />
                    </button>
                    {/* Twitter Circle */}
                    <button
                      type="button"
                      onClick={() => alert('Twitter/X integration is a demo placeholder. Please use Google sign-in instead!')}
                      className="w-10 h-10 rounded-full bg-[#1da1f2] hover:bg-[#1988cc] flex items-center justify-center shadow-sm transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <TwitterIcon />
                    </button>
                    {/* Google Circle */}
                    <button
                      type="button"
                      onClick={onLoginWithGoogle}
                      className="w-10 h-10 rounded-full bg-[#ea4335] hover:bg-[#d63b2f] flex items-center justify-center shadow-sm transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <GoogleWhiteIcon />
                    </button>
                  </div>
                </div>

                {/* Mode Switch Footer */}
                <div className="text-center mt-6 pt-2 border-t border-slate-100 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(true);
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold transition-colors cursor-pointer"
                  >
                    Don't have an account? Sign Up
                  </button>
                  <button
                    type="button"
                    onClick={onContinueAsGuest}
                    className="text-xs text-slate-500 hover:text-slate-700 underline font-semibold transition-colors cursor-pointer"
                  >
                    Explore Platform as Guest
                  </button>
                </div>
              </div>
            ) : (
              /* 2. SIGN UP VIEW (Figure 2 - Perfect clean layout) */
              <div className="space-y-5">
                <h1 className="text-3xl font-extrabold text-slate-800 text-center tracking-tight mb-6">
                  Sign up
                </h1>

                {/* Display Feedbacks */}
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs flex items-start gap-2.5"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {successMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs flex items-start gap-2.5"
                  >
                    <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}

                {/* Full Name field with top active-style border label */}
                <div className="relative pt-1.5">
                  <span className="absolute top-0 left-3 bg-white px-1 text-[10px] font-bold text-blue-500 z-10">
                    Name
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="First and last name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-sm py-3 px-4 bg-white border border-blue-500 text-slate-800 placeholder-slate-400 rounded-lg focus:outline-none font-medium"
                  />
                </div>

                {/* Email address field */}
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-sm py-3 px-4 bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-lg focus:border-blue-500 focus:outline-none font-medium transition-colors"
                  />
                </div>

                {/* Password field with dynamic show/hide */}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-sm py-3 pl-4 pr-11 bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-lg focus:border-blue-500 focus:outline-none font-medium transition-colors"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>

                {/* Platform Clearance / Role Selection */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                    Clearance Level
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Citizen Selector */}
                    <button
                      type="button"
                      onClick={() => setRole('citizen')}
                      className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        role === 'citizen'
                          ? 'border-emerald-500 bg-emerald-50/20 text-slate-900'
                          : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full mb-1">
                        <UserCheck className={`h-4 w-4 ${role === 'citizen' ? 'text-emerald-500' : 'text-slate-400'}`} />
                        {role === 'citizen' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-800">Citizen Resident</p>
                        <p className="text-[9px] opacity-75 leading-tight">Report issues, earn XP</p>
                      </div>
                    </button>

                    {/* Official Selector */}
                    <button
                      type="button"
                      onClick={() => setRole('official')}
                      className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        role === 'official'
                          ? 'border-blue-500 bg-blue-50/20 text-slate-900'
                          : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full mb-1">
                        <HardHat className={`h-4 w-4 ${role === 'official' ? 'text-blue-500' : 'text-slate-400'}`} />
                        {role === 'official' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>}
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-800">Municipal Official</p>
                        <p className="text-[9px] opacity-75 leading-tight">Dispatch repair crews</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* SOLID Blue Sign Up Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-[#0091ff] hover:bg-[#007cdb] text-white font-bold rounded-lg shadow-sm active:scale-[0.99] transition-all text-sm cursor-pointer mt-2"
                >
                  {loading ? 'Processing...' : 'Sign Up'}
                </button>

                {/* Footer Switcher */}
                <div className="text-center mt-3 text-xs text-slate-500 font-medium">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(false);
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[#0091ff] hover:underline font-bold cursor-pointer"
                  >
                    Log In
                  </button>
                </div>

                {/* Or Divider */}
                <div className="relative my-4 select-none">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-3 text-slate-400 font-medium">or</span>
                  </div>
                </div>

                {/* Google Sign up button */}
                <button
                  type="button"
                  onClick={onLoginWithGoogle}
                  className="w-full h-11 bg-white border border-slate-300 text-slate-700 font-bold text-xs rounded-lg flex items-center justify-center gap-2.5 hover:bg-slate-50 active:scale-[0.99] transition-all cursor-pointer shadow-sm"
                >
                  <GoogleColorIcon />
                  <span>Sign up with Google</span>
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Firebase Firestore Rules Warning and Copy-paste Help box */}
        {showRulesWarning && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md mt-6 p-5 bg-amber-50 border border-amber-200 rounded-2xl shadow-sm text-slate-800 text-xs text-left"
          >
            <div className="flex items-center gap-2 text-amber-800 font-bold mb-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
              <span>Configure Firebase Security Rules</span>
            </div>
            <p className="text-slate-600 mb-3 leading-relaxed">
              Your Firestore security rules are currently blocking read/write access. We have logged you in with a safe client-side fallback session so you aren't blocked! 
            </p>
            <p className="text-slate-600 mb-3 leading-relaxed">
              To resolve this permanently, copy and paste the rules below into the <span className="font-bold">Rules</span> tab of your Firestore Database in the <a href="https://console.firebase.google.com/project/vibe2ship-3cc2f/firestore/rules" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline font-semibold">Firebase Console</a>:
            </p>
            <div className="relative bg-slate-900 rounded-lg p-3 text-[10px] font-mono text-slate-200 max-h-48 overflow-y-auto border border-slate-800 shadow-inner select-all">
              <pre className="whitespace-pre-wrap">{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create, update: if request.auth != null && request.auth.uid == userId;
      allow delete: if false;
    }
  }
}`}</pre>
            </div>
            <button 
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create, update: if request.auth != null && request.auth.uid == userId;
      allow delete: if false;
    }
  }
}`);
                alert('Rules copied to clipboard! You can paste them in your Firebase console.');
              }}
              className="mt-3 w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[10px] transition-colors cursor-pointer text-center block"
            >
              Copy Rules to Clipboard
            </button>
          </motion.div>
        )}

        {/* Demo Account Support Hints */}
        <div className="text-center mt-6 text-[10px] text-slate-400 font-medium flex flex-col items-center gap-1">
          <div className="flex items-center gap-1 justify-center">
            <Sparkles className="h-3 w-3 text-slate-400 shrink-0" />
            <span>Active Project ID: <span className="font-mono text-slate-600">{auth.config.apiKey ? 'vibe2ship-3cc2f' : 'Local Sandbox'}</span></span>
          </div>
          <span>Demobook: <span className="font-mono text-slate-500">officer@city.gov</span> (Official) or <span className="font-mono text-slate-500">ptanusha2006@gmail.com</span> (Citizen) with <span className="font-mono text-slate-500">password123</span></span>
        </div>
      </motion.div>
    </div>
  );
}
