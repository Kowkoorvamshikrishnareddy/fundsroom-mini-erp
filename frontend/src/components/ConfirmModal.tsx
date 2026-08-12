import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  onConfirm, 
  onCancel,
  isDestructive = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            {isDestructive && <AlertTriangle size={20} color="var(--danger-color)" />}
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{title}</h2>
          </div>
          <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={onCancel}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body" style={{ margin: '1.5rem 0', color: 'var(--text-secondary)' }}>
          <p>{message}</p>
        </div>

        <div className="flex justify-end gap-3" style={{ marginTop: '2rem' }}>
          <button className="btn btn-secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button 
            className={`btn ${isDestructive ? 'btn-danger' : 'btn-primary'}`} 
            style={isDestructive ? { background: 'var(--danger-color)', color: 'white' } : {}}
            onClick={() => {
              onConfirm();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
