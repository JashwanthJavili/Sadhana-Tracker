import React from 'react';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  type?: 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  type = 'info',
  size = 'md'
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  const iconClasses = {
    success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    warning: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100' },
    error: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
    info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-100' }
  };

  const Icon = iconClasses[type].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative ${sizeClasses[size]} w-full mx-4 bg-white rounded-2xl shadow-2xl border-3 border-stone-300 transform transition-all animate-scaleIn`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-stone-200">
          <div className="flex items-center gap-3">
            <div className={`${iconClasses[type].bg} p-2 rounded-xl`}>
              <Icon className={iconClasses[type].color} size={24} />
            </div>
            <h2 className="text-2xl font-bold text-stone-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-xl transition-colors"
          >
            <X size={24} className="text-stone-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'error' | 'info';
  confirmButtonColor?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  confirmButtonColor = 'bg-red-600 hover:bg-red-700'
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} type={type} size="sm">
      <p className="text-stone-700 text-base mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-6 py-3 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95"
        >
          {cancelText}
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`px-6 py-3 ${confirmButtonColor} text-white rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  message
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} type="success" size="sm">
      <p className="text-stone-700 text-base mb-6">{message}</p>
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg"
        >
          Got it!
        </button>
      </div>
    </Modal>
  );
};

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  title,
  message
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} type="error" size="sm">
      <p className="text-stone-700 text-base mb-6">{message}</p>
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};
