import { ReactNode } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/**
 * Reusable modal component for dialogs.
 */
export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;
  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
    >
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', padding: '24px', borderRadius: '12px', minWidth: '400px' }}
      >
        <h2 style={{ margin: '0 0 16px' }}>{title}</h2>
        {children}
      </div>
    </div>
  );
}
