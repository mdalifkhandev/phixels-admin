import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, User, KeyRound, ArrowRight } from 'lucide-react';
import { authApi } from '../../services/api';
import { StatusModal } from '../../components/dashboard/StatusModal';

export function SignupPage() {
    const [step, setStep] = useState<'signup' | 'verify'>('signup');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Status Modal State
    const [statusModal, setStatusModal] = useState<{
        isOpen: boolean;
        type: 'success' | 'error';
        title: string;
        message: string;
        action?: () => void;
    }>({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    });

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (password !== confirmPassword) {
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Validation Error',
                message: 'Passwords do not match.'
            });
            return;
        }

        if (password.length < 6) {
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Validation Error',
                message: 'Password must be at least 6 characters long.'
            });
            return;
        }

        setIsLoading(true);

        try {
            await authApi.signup({ name, email, password, role: 'admin' });
            setStatusModal({
                isOpen: true,
                type: 'success',
                title: 'Account Created',
                message: 'Please check your email for the verification code.',
                action: () => {
                    setStatusModal(prev => ({ ...prev, isOpen: false }));
                    setStep('verify');
                }
            });
        } catch (err: any) {
            let message = 'Signup failed. Please try again.';
            if (err.response && err.response.data && err.response.data.message) {
                message = err.response.data.message;
            } else if (err.message) {
                message = err.message;
            }
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Signup Failed',
                message: message
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await authApi.verifyEmail({ email, verificationCode });
            setStatusModal({
                isOpen: true,
                type: 'success',
                title: 'Email Verified',
                message: 'Your email has been verified successfully! You can now log in to your account.',
                action: () => {
                    setStatusModal(prev => ({ ...prev, isOpen: false }));
                    navigate('/login');
                }
            });
        } catch (err: any) {
            let message = 'Verification failed. Please check the code and try again.';
            if (err.response && err.response.data && err.response.data.message) {
                message = err.response.data.message;
            }
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Verification Failed',
                message: message
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[color:var(--deep-navy)] rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse" />
                <div
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[color:var(--deep-red)] rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse"
                    style={{
                        animationDelay: '1s'
                    }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10">

                {/* Logo */}
                <div className="text-center mb-8">
                    <img
                        src="/Phixels-Logo.svg"
                        alt="Phixels"
                        className="h-12 w-auto mx-auto mb-4" />

                    <h1 className="text-3xl font-bold text-white mb-2">
                        {step === 'signup' ? 'Create Account' : 'Verify Email'}
                    </h1>
                    <p className="text-gray-400">
                        {step === 'signup'
                            ? 'Sign up to access the admin panel'
                            : `Enter the code sent to ${email}`}
                    </p>
                </div>

                {/* Card */}
                <div className="p-8 rounded-2xl bg-[#0A0A0A] border border-white/10">
                    <AnimatePresence mode="wait">
                        {step === 'signup' ? (
                            <motion.form
                                key="signup-form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleSignup}
                                className="space-y-6">

                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 font-medium">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none transition-colors"
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 font-medium">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none transition-colors"
                                            placeholder="admin@phixels.io"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 font-medium">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none transition-colors"
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 font-medium">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none transition-colors"
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[color:var(--bright-red)] to-[color:var(--deep-red)] text-white font-bold hover:shadow-[0_0_20px_rgba(237,31,36,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    {isLoading ? 'Creating Account...' : (
                                        <>
                                            Sign Up <ArrowRight size={20} />
                                        </>
                                    )}
                                </button>

                                <div className="text-center">
                                    <p className="text-sm text-gray-400">
                                        Already have an account?{' '}
                                        <Link to="/login" className="text-[color:var(--bright-red)] hover:underline">
                                            Login here
                                        </Link>
                                    </p>
                                </div>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="verify-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleVerify}
                                className="space-y-6">

                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 font-medium">Verification Code</label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none transition-colors tracking-widest text-lg"
                                            placeholder="123456"
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Please enter the 6-digit code sent to your email.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[color:var(--bright-red)] to-[color:var(--deep-red)] text-white font-bold hover:shadow-[0_0_20px_rgba(237,31,36,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isLoading ? 'Verifying...' : 'Verify Email'}
                                </button>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => setStep('signup')}
                                        className="text-sm text-gray-400 hover:text-white transition-colors">
                                        Back to Signup
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            <StatusModal
                isOpen={statusModal.isOpen}
                onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
                type={statusModal.type}
                title={statusModal.title}
                message={statusModal.message}
                onAction={statusModal.action}
            />
        </div>);
}
