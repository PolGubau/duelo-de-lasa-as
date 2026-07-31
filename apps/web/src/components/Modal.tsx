import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { useRef } from "react";
import { FocusScope, useDialog, useModalOverlay } from "react-aria";
import { useOverlayTriggerState } from "react-stately";
import { playSound } from "../lib/sound.ts";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  // Adapta el par open/onClose (controlado desde fuera) al estado que
  // esperan los hooks de React Aria, que se encargan del foco, el cierre
  // con Escape/clic fuera y de ocultar el resto de la página a lectores
  // de pantalla mientras el diálogo está abierto.
  const state = useOverlayTriggerState({
    isOpen: open,
    onOpenChange: (isOpen) => {
      if (!isOpen) {
        playSound("close");
        onClose();
      }
    },
  });
  const modalRef = useRef<HTMLDivElement>(null);
  const { modalProps, underlayProps } = useModalOverlay({ isDismissable: true }, state, modalRef);
  const dialogRef = useRef<HTMLDivElement>(null);
  const { dialogProps, titleProps } = useDialog({}, dialogRef);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          {...(underlayProps as Record<string, unknown>)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            {...(modalProps as Record<string, unknown>)}
            ref={modalRef}
            className="w-full max-w-md rounded-2xl border-3 border-brand-crust bg-brand-table p-5 shadow-card"
            initial={{ scale: 0.9, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
          >
            <FocusScope contain restoreFocus autoFocus>
              <div {...dialogProps} ref={dialogRef} className="outline-none">
                <div className="mb-4 flex items-center justify-between">
                  <h2 {...titleProps} className="font-display text-xl text-brand-cheese">
                    {title}
                  </h2>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar"
                    className="cursor-pointer rounded-lg px-2 text-brand-bechamel/70 hover:text-brand-bechamel"
                  >
                    ✕
                  </button>
                </div>
                {children}
              </div>
            </FocusScope>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
