import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({ open, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Full-viewport backdrop — rendered outside any stacking context */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
            style={{ zIndex: 9998 }}
          />

          {/* Modal panel */}
          <div
            className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
            style={{ zIndex: 9999 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`pointer-events-auto w-full ${maxWidth} bg-[#0f1117] border border-white/10 rounded-[2rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto`}
            >
              <div className="flex items-center justify-between mb-7">
                <h2 className="text-lg text-white font-black uppercase tracking-wider font-outfit">{title}</h2>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-800 text-slate-500 hover:text-white transition-all">
                  <X size={18} />
                </button>
              </div>
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;
