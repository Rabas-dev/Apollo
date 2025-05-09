import CryptoJS from 'crypto-js';
import JSEncrypt from 'jsencrypt';

// Encrypt a message with AES, then encrypt the AES key with RSA
export const encryptMessage = (message: string, publicKey: string) => {
  // Generate a random 256-bit AES key and IV
  const aesKey = CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
  const iv = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);

  // Encrypt the message with AES (CBC mode)
  const encrypted = CryptoJS.AES.encrypt(message, CryptoJS.enc.Hex.parse(aesKey), {
    iv: CryptoJS.enc.Hex.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  }).toString();

  // Encrypt the AES key with RSA (public key)
  const jsEncrypt = new JSEncrypt();
  jsEncrypt.setPublicKey(publicKey);
  const encryptedKey = jsEncrypt.encrypt(aesKey);

  return {
    encrypted, // AES-encrypted message (base64)
    key: encryptedKey, // RSA-encrypted AES key (base64)
    iv // IV (hex)
  };
};

// Decrypt a message: decrypt AES key with RSA, then decrypt message with AES
export const decryptMessage = (encryptedData: string, encryptedKey: string, iv: string, privateKey: string) => {
  try {
    // Decrypt the AES key with RSA (private key)
    const jsEncrypt = new JSEncrypt();
    jsEncrypt.setPrivateKey(privateKey);
    const decryptedKey = jsEncrypt.decrypt(encryptedKey);
    if (!decryptedKey) throw new Error('Failed to decrypt AES key');

    // Decrypt the message with AES
    const decrypted = CryptoJS.AES.decrypt(encryptedData, CryptoJS.enc.Hex.parse(decryptedKey), {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

// Generate a real RSA key pair using JSEncrypt
export const generateRSAKeyPair = () => {
  const crypt = new JSEncrypt({ default_key_size: 2048 });
  crypt.getKey();
  return {
    publicKey: crypt.getPublicKey(),
    privateKey: crypt.getPrivateKey()
  };
}; 