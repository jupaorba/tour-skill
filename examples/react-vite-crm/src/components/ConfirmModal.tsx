import type { ReactNode } from 'react';

interface ConfirmModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export default function ConfirmModal({ title, children, onClose }: ConfirmModalProps) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal" data-tour-modal="true">
        <h2>{title}</h2>
        <div>{children}</div>
        <button type="button" className="btn btn-secondary" onClick={onClose} aria-label="Cerrar">
          Cerrar
        </button>
      </div>
    </div>
  );
}
