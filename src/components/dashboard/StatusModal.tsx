import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface StatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'success' | 'error';
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
    secondaryActionLabel?: string;
    onSecondaryAction?: () => void;
}

export function StatusModal({
    isOpen,
    onClose,
    type,
    title,
    message,
    actionLabel,
    onAction,
    secondaryActionLabel,
    onSecondaryAction
}: StatusModalProps) {
    const [isActing, setIsActing] = useState(false);

    const handleAction = async () => {
        if (isActing) return;
        setIsActing(true);
        try {
            await Promise.resolve((onAction || onClose)());
        } finally {
            setIsActing(false);
        }
    };

    const handleSecondaryAction = async () => {
        if (isActing) return;
        setIsActing(true);
        try {
            await Promise.resolve((onSecondaryAction || onClose)());
        } finally {
            setIsActing(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
                    />

                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-sm bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden pointer-events-auto p-6 text-center shadow-2xl"
                        >
                            <div className="flex justify-end">
                                <button
                                    onClick={onClose}
                                    disabled={isActing}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex flex-col items-center gap-4">
                                <div className={`p-4 rounded-full ${type === 'success'
                                    ? 'bg-green-500/10 text-green-500'
                                    : 'bg-red-500/10 text-red-500'
                                    }`}>
                                    {type === 'success' ? (
                                        <CheckCircle size={48} />
                                    ) : (
                                        <AlertTriangle size={48} />
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-white">
                                        {title}
                                    </h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        {message}
                                    </p>
                                </div>

                                <div className="flex gap-2 w-full mt-4">
                                    {secondaryActionLabel && (
                                        <button
                                            onClick={handleSecondaryAction}
                                            disabled={isActing}
                                            className="flex-1 py-3 rounded-xl font-bold text-gray-400 bg-white/5 border border-white/10 hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {secondaryActionLabel}
                                        </button>
                                    )}
                                    <button
                                        onClick={handleAction}
                                        disabled={isActing}
                                        className={`${secondaryActionLabel ? 'flex-1' : 'w-full'} py-3 rounded-xl font-bold text-white transition-all ${type === 'success'
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                                            : 'bg-gradient-to-r from-red-500 to-rose-600 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                                            }`}
                                    >
                                        {isActing
                                            ? 'Loading...'
                                            : actionLabel || (type === 'success' ? 'Continue' : 'Try Again')}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
