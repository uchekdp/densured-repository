import React from 'react';
import { OfficialReceipt } from '../../types';
import { ReceiptAndIDCardVerificationModal } from './ReceiptAndIDCardVerificationModal';

export interface OfficialReceiptModalProps {
  receipt: OfficialReceipt | null;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'receipt' | 'id-card' | 'gateway';
  studentAvatar?: string;
  onPaymentSuccess?: (amount: number, description: string, method: string) => void;
}

/**
 * Enhanced OfficialReceiptModal
 * Renders the D Ensured Consult official logo, cryptographically signed QR code
 * for student payment verification, biometric ID card pass, and payment gateway.
 */
export const OfficialReceiptModal: React.FC<OfficialReceiptModalProps> = (props) => {
  return <ReceiptAndIDCardVerificationModal {...props} />;
};
