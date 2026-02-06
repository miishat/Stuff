/**
 * @file UpdatePrompt.tsx
 * @description PWA update notification component.
 *              Prompts users when a new service worker is available
 *              and allows immediate update or dismissal.
 * @author Mishat
 * @version 1.0.2
 */

import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

/**
 * UpdatePrompt component - Notification for PWA updates.
 */
export const UpdatePrompt: React.FC = () => {
    const [showPrompt, setShowPrompt] = useState(false);

    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered:', r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    useEffect(() => {
        if (needRefresh) {
            setShowPrompt(true);
        }
    }, [needRefresh]);

    const handleUpdate = () => {
        updateServiceWorker(true);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        setNeedRefresh(false);
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-4 px-5 py-4 bg-gradient-to-r from-brand-600 to-brand-700 dark:from-brand-700 dark:to-brand-800 text-white rounded-2xl shadow-2xl border border-brand-500/20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                        <RefreshCw className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="font-semibold text-sm">Update Available</div>
                        <div className="text-xs text-white/80">A new version of Stuff is ready</div>
                    </div>
                </div>
                <div className="flex items-center gap-2 ml-2">
                    <button
                        onClick={handleUpdate}
                        className="px-4 py-2 bg-white text-brand-700 font-semibold text-sm rounded-xl hover:bg-brand-50 transition-colors"
                    >
                        Update Now
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                        title="Dismiss"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
