import React from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * PortalModal — renders a centered modal overlay directly on document.body
 * via a React portal, bypassing any parent stacking context or overflow clipping.
 *
 * Props:
 *   isOpen    {boolean}   — whether the modal is visible
 *   onClose   {function}  — called when backdrop is clicked or Escape pressed
 *   maxWidth  {string}    — tailwind max-w class, default 'max-w-md'
 *   children  {ReactNode} — modal content
 */
const PortalModal = ({ isOpen, onClose, maxWidth = 'max-w-md', children }) => {
    // Close on Escape key
    React.useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    // Prevent body scroll while open
    React.useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    return ReactDOM.createPortal(
        <AnimatePresence>
            {isOpen && (
                <div
                    style={{
                        position:       'fixed',
                        inset:          0,
                        zIndex:         9999,
                        display:        'flex',
                        alignItems:     'center',
                        justifyContent: 'center',
                        padding:        '24px',
                    }}
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={onClose}
                        style={{
                            position:        'absolute',
                            inset:           0,
                            backgroundColor: 'rgba(0,0,0,0.75)',
                            backdropFilter:  'blur(4px)',
                        }}
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className={`relative w-full ${maxWidth} bg-brand-surface border border-brand-border rounded-xl shadow-2xl flex flex-col`}
                        style={{ maxHeight: 'calc(100vh - 48px)' }}
                    >
                        {children}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default PortalModal;
