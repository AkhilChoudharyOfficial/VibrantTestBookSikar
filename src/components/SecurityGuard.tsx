import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Lock, EyeOff, RefreshCw, AlertOctagon } from 'lucide-react';
import { UserProfile } from '../types';

interface SecurityGuardProps {
  user: UserProfile | null;
  onLogViolation: (action: string, details: string, severity: 'INFO' | 'WARNING' | 'CRITICAL') => void;
}

export const SecurityGuard: React.FC<SecurityGuardProps> = ({ user, onLogViolation }) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [violationType, setViolationType] = useState<'visibility' | 'screenshot' | 'window_blur' | null>(null);
  const [violationCount, setViolationCount] = useState(0);

  useEffect(() => {
    // 1. Visibility change listener (tab switching or minimized)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setViolationType('visibility');
        setShowOverlay(true);
        setViolationCount(prev => {
          const next = prev + 1;
          onLogViolation(
            'DRM_VISIBILITY_HIDDEN',
            `Student switched tabs or minimized the browser window. Triggered security screen lock. Violation #${next}`,
            'WARNING'
          );
          return next;
        });
      }
    };

    // 2. Window Blur listener (switching applications or opening DevTools)
    const handleWindowBlur = () => {
      // Small timeout to prevent false positives during certain OS transitions
      setTimeout(() => {
        if (!document.hasFocus()) {
          setViolationType('window_blur');
          setShowOverlay(true);
          setViolationCount(prev => {
            const next = prev + 1;
            onLogViolation(
              'DRM_WINDOW_BLUR',
              `Student lost focus from portal (possible application switch, popup, or DevTools focus). Triggered security screen lock. Violation #${next}`,
              'WARNING'
            );
            return next;
          });
        }
      }, 150);
    };

    // 3. Anti-Screenshot keyboard combos
    const handleKeyDown = (e: KeyboardEvent) => {
      let triggered = false;
      let shortcutName = '';

      // a. PrintScreen key
      if (e.key === 'PrintScreen') {
        triggered = true;
        shortcutName = 'PrintScreen';
      }

      // b. Win+Shift+S or Cmd+Shift+S
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        triggered = true;
        shortcutName = 'Meta + Shift + S';
      }

      // c. Mac Cmd+Shift+3 or 4 or 5
      if (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5')) {
        triggered = true;
        shortcutName = `Command + Shift + ${e.key}`;
      }

      // d. Ctrl + Shift + S / Ctrl + Shift + X
      if (e.ctrlKey && e.shiftKey && (e.key.toLowerCase() === 's' || e.key.toLowerCase() === 'x')) {
        triggered = true;
        shortcutName = `Ctrl + Shift + ${e.key.toUpperCase()}`;
      }

      // e. Alt + PrintScreen
      if (e.altKey && e.key === 'PrintScreen') {
        triggered = true;
        shortcutName = 'Alt + PrintScreen';
      }

      if (triggered) {
        e.preventDefault();
        setViolationType('screenshot');
        setShowOverlay(true);

        // Clear clipboard immediately to overwrite any copied image data
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(
            "⚠️ DRM Policy Warning: Screenshots and recording are strictly prohibited. Continued violations will be reported to Vibrant administration Sikar."
          ).catch(() => {});
        }

        setViolationCount(prev => {
          const next = prev + 1;
          onLogViolation(
            'DRM_SCREENSHOT_ATTEMPT',
            `Screenshot keyboard shortcut detected (${shortcutName}). DRM protection intercepted capture. Violation #${next}`,
            'CRITICAL'
          );
          return next;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [onLogViolation]);

  const handleDismiss = () => {
    setShowOverlay(false);
    setViolationType(null);
  };

  return (
    <AnimatePresence>
      {showOverlay && (
        <motion.div
          id="drm-security-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl text-white select-none"
        >
          <motion.div
            initial={{ scale: 0.92, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="max-w-md w-full p-6 bg-[#111827] border border-red-500/30 rounded-[24px] shadow-2xl text-center space-y-5 text-xs text-[#F8FAFC]"
          >
            {/* Status Shield */}
            <div className="mx-auto w-16 h-16 rounded-full bg-red-950/50 border border-red-500/20 flex items-center justify-center text-red-400 relative">
              <span className="absolute inset-0 rounded-full border border-red-500/10 animate-ping" />
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-sm font-black tracking-widest text-red-500 uppercase">
                Secure Proctor Active
              </h2>
              <p className="text-[10px] text-[#06B6D4] font-mono font-bold tracking-wider uppercase">
                DRM Protection Intercept Code
              </p>
            </div>

            {/* Error Message Box */}
            <div className="p-4 bg-[#0B1220] rounded-[16px] border border-red-900/20 text-left space-y-2">
              <div className="flex items-center gap-1.5 text-red-400 font-bold uppercase text-[10px]">
                <AlertOctagon className="w-4 h-4 shrink-0" />
                <span>
                  {violationType === 'visibility' && 'Tab Switch Detected'}
                  {violationType === 'window_blur' && 'Window Focus Lost'}
                  {violationType === 'screenshot' && 'Screenshot Attempt Blocked'}
                </span>
              </div>

              <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                {violationType === 'visibility' && (
                  "You navigated away from this exam/notes portal or switched browser tabs. Sikar's proctor protocol requires strict window focus to maintain credential compliance."
                )}
                {violationType === 'window_blur' && (
                  "Your browser lost window focus, possibly because you switched to another application, opened developer tools, or clicked on an overlay. Focused state is required."
                )}
                {violationType === 'screenshot' && (
                  "A screenshot or snip tool shortcut was detected. Standard print screen buffers have been cleared. Continued screenshot attempts are flagged to administrative nodes."
                )}
              </p>
            </div>

            {/* Warning Counter */}
            <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900 rounded-[12px] border border-slate-800">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Telemetry Record:</span>
              <span className="px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-900/30 text-[9px] font-black">
                Warning #{violationCount}
              </span>
            </div>

            <div className="text-[10.5px] text-[#94A3B8] leading-normal italic">
              "Students enrolled at Nawalgarh Road, Sikar branches are bound by academic integrity contracts. Screenshot logs are paired to student rolls."
            </div>

            {/* Resume button */}
            <button
              onClick={handleDismiss}
              className="w-full py-2.5 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] text-white font-bold rounded-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              <span>Resume Digital Companion Portal</span>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
