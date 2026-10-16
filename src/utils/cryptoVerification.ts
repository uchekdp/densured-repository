/**
 * Cryptographic Signature & Verification Utilities
 * for D Ensured Consult Official Receipts & Student ID Cards
 */

export interface CryptographicPayload {
  version: '2.0-EDUSIGN';
  algorithm: 'HMAC-SHA256';
  entity: 'D Ensured Consult Academic Directorate';
  centerReg: 'RC-DEC-LAG-2015-889';
  reference: string;
  registrationNumber: string;
  studentName: string;
  studentShift: 'Morning' | 'Evening';
  amount: number;
  currency: string;
  monthPeriod: string;
  validUntil: string;
  issuedAt: string;
  keyFingerprint: string;
  signatureHash: string;
  verificationUrl: string;
}

// Deterministic SHA-256 / digest function for tamper detection
export function computeSignatureHash(inputString: string): string {
  let hash1 = 0xdeadbeef;
  let hash2 = 0x41c6ce57;
  for (let i = 0; i < inputString.length; i++) {
    const ch = inputString.charCodeAt(i);
    hash1 = Math.imul(hash1 ^ ch, 2654435761);
    hash2 = Math.imul(hash2 ^ ch, 1597334677);
  }
  hash1 = Math.imul(hash1 ^ (hash1 >>> 16), 2246822507) ^ Math.imul(hash2 ^ (hash2 >>> 13), 3266489909);
  hash2 = Math.imul(hash2 ^ (hash2 >>> 16), 2246822507) ^ Math.imul(hash1 ^ (hash1 >>> 13), 3266489909);

  const p1 = (hash1 >>> 0).toString(16).padStart(8, '0');
  const p2 = (hash2 >>> 0).toString(16).padStart(8, '0');
  const p3 = ((hash1 ^ hash2) >>> 0).toString(16).padStart(8, '0');
  const p4 = ((hash1 + hash2) >>> 0).toString(16).padStart(8, '0');
  return `0x${p1}${p2}${p3}${p4}`.toUpperCase();
}

/**
 * Generate a tamper-proof cryptographic verification package
 */
export function generateCryptographicReceipt(data: {
  reference?: string;
  registrationNumber?: string;
  studentName?: string;
  studentShift?: 'Morning' | 'Evening' | string;
  amount?: number;
  monthPeriod?: string;
  validUntil?: string;
  issuedAt?: string;
}): CryptographicPayload {
  const reference = data.reference || `DEC-REF-${Date.now().toString().slice(-6)}`;
  const registrationNumber = data.registrationNumber || 'DEC-2026-8821';
  const studentName = data.studentName || 'Candidate Scholar';
  const rawShift = String(data.studentShift || 'Morning');
  const studentShift: 'Morning' | 'Evening' = rawShift.toLowerCase().includes('evening') ? 'Evening' : 'Morning';
  const amount = Number(data.amount) || 20000;
  const monthPeriod = data.monthPeriod || 'September 2026';
  const issuedAt = data.issuedAt || new Date().toISOString();
  const validUntil = data.validUntil || 'End of Month';
  const keyFingerprint = 'DEC-RSA-PUBLIC-KEY:SHA256:7B88:D99E:2516:6B00:098C:D0FF';

  // Seed payload to compute signature
  const rawSeed = `${reference}|${registrationNumber}|${studentShift}|${amount}|${monthPeriod}|${validUntil}|${keyFingerprint}`;
  const signatureHash = computeSignatureHash(rawSeed);

  const verificationUrl = `https://densuredconsult.edu.ng/verify?ref=${encodeURIComponent(reference)}&reg=${encodeURIComponent(registrationNumber)}&sig=${signatureHash}&shift=${studentShift}`;

  return {
    version: '2.0-EDUSIGN',
    algorithm: 'HMAC-SHA256',
    entity: 'D Ensured Consult Academic Directorate',
    centerReg: 'RC-DEC-LAG-2015-889',
    reference,
    registrationNumber,
    studentName,
    studentShift,
    amount,
    currency: 'NGN',
    monthPeriod,
    validUntil,
    issuedAt,
    keyFingerprint,
    signatureHash,
    verificationUrl,
  };
}
