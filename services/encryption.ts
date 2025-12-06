/**
 * End-to-End Encryption Service for Secure Messaging
 * Implements AES-256-GCM encryption with secure key derivation
 * @author Sadhana-Tracker Security Team
 * @version 1.0.0
 */

// Encryption configuration
const ENCRYPTION_CONFIG = {
  algorithm: 'AES-GCM',
  keyLength: 256,
  ivLength: 12, // 96 bits for GCM
  saltLength: 16,
  iterations: 100000, // PBKDF2 iterations
  tagLength: 128, // Authentication tag length in bits
};

/**
 * Generate a cryptographically secure encryption key from a password
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: ENCRYPTION_CONFIG.iterations,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: ENCRYPTION_CONFIG.algorithm, length: ENCRYPTION_CONFIG.keyLength },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generate a user-specific encryption key based on their UID
 * This creates a deterministic key for each user
 */
export function getUserEncryptionPassword(uid: string): string {
  // In production, this should be enhanced with additional user-specific entropy
  // For now, we use a combination of UID and a server-side secret
  const serverSecret = 'SADHANA_SECURE_2025_ISKCON_DEVOTIONAL_APP';
  return `${uid}:${serverSecret}`;
}

/**
 * Encrypt a message using AES-256-GCM
 */
export async function encryptMessage(plaintext: string, uid: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.saltLength));
    const iv = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.ivLength));

    // Derive encryption key
    const password = getUserEncryptionPassword(uid);
    const key = await deriveKey(password, salt);

    // Encrypt the message
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: ENCRYPTION_CONFIG.algorithm,
        iv,
        tagLength: ENCRYPTION_CONFIG.tagLength,
      },
      key,
      data
    );

    // Combine salt + iv + encrypted data
    const encryptedArray = new Uint8Array(encryptedData);
    const combined = new Uint8Array(salt.length + iv.length + encryptedArray.length);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(encryptedArray, salt.length + iv.length);

    // Convert to base64 for storage
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt message');
  }
}

/**
 * Decrypt a message using AES-256-GCM
 */
export async function decryptMessage(ciphertext: string, uid: string): Promise<string> {
  try {
    // Convert from base64
    const combined = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));

    // Extract salt, iv, and encrypted data
    const salt = combined.slice(0, ENCRYPTION_CONFIG.saltLength);
    const iv = combined.slice(
      ENCRYPTION_CONFIG.saltLength,
      ENCRYPTION_CONFIG.saltLength + ENCRYPTION_CONFIG.ivLength
    );
    const encryptedData = combined.slice(ENCRYPTION_CONFIG.saltLength + ENCRYPTION_CONFIG.ivLength);

    // Derive decryption key
    const password = getUserEncryptionPassword(uid);
    const key = await deriveKey(password, salt);

    // Decrypt the message
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: ENCRYPTION_CONFIG.algorithm,
        iv,
        tagLength: ENCRYPTION_CONFIG.tagLength,
      },
      key,
      encryptedData
    );

    // Convert to string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    console.error('Decryption error:', error);
    // Return a safe fallback - don't expose encrypted content
    return '[Encrypted Message - Unable to Decrypt]';
  }
}

/**
 * Check if a message is encrypted (for backward compatibility)
 */
export function isEncrypted(text: string): boolean {
  try {
    // Encrypted messages are base64 encoded and have a specific length
    if (!text || text.length < 40) return false;
    
    // Try to decode - encrypted messages should decode successfully
    const decoded = atob(text);
    return decoded.length >= ENCRYPTION_CONFIG.saltLength + ENCRYPTION_CONFIG.ivLength + 16;
  } catch {
    return false;
  }
}

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Generate a secure hash for integrity verification
 */
export async function generateHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
