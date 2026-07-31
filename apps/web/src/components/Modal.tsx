import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { useRef } from "react";
import { FocusScope, useDialog, useModalOverlay } from "react-aria";
import { createPortal } from "react-dom";
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

  if (typeof document === "undefined") return null;

  return createPortal(
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
            className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border-3 border-brand-crust bg-brand-table p-5 shadow-card"
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
                    onClick={state.close}
                    aria-label="Cerrar"
                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border-2 border-brand-bechamel/25 text-xl leading-none text-brand-bechamel/75 transition-colors hover:bg-brand-bechamel/15 hover:text-brand-bechamel focus-visible:outline-3 focus-visible:outline-brand-basil"
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
    </AnimatePresence>,
    document.body,
  );
}
