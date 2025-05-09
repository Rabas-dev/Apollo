export interface User {
  id: string;
  username: string;
  email: string;
  publicKey: string;
  privateKey?: string;
  online: boolean;
  lastSeen: string;
}

export interface Message {
  id: string;
  sender: string;
  recipient: string;
  content: string;
  key: string;
  iv: string;
  timestamp: Date;
  read: boolean;
}

export interface EncryptedMessage {
  encrypted: string;
  key: string;
  iv: string;
}

export interface SocketMessage {
  roomId: string;
  sender: string;
  recipient: string;
  message: EncryptedMessage;
} 