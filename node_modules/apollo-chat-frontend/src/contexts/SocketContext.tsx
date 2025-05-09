import { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { EncryptedMessage, SocketMessage } from '../types';

interface SocketContextType {
  socket: Socket | null;
  sendMessage: (recipientId: string, message: EncryptedMessage) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const { token, user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (token && user) {
      // Initialize socket connection
      socketRef.current = io('http://localhost:3000', {
        auth: {
          token
        }
      });

      // Handle connection events
      socketRef.current.on('connect', () => {
        console.log('Connected to socket server');
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from socket server');
      });

      socketRef.current.on('error', (error: Error) => {
        console.error('Socket error:', error);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [token, user]);

  const sendMessage = (recipientId: string, message: EncryptedMessage) => {
    if (!socketRef.current || !user) return;

    // Generate room ID (sorted to ensure consistency)
    const roomId = [user.id, recipientId].sort().join('-');

    // Join the room if not already joined
    socketRef.current.emit('join_room', roomId);

    // Send the message
    const socketMessage: SocketMessage = {
      roomId,
      sender: user.id,
      recipient: recipientId,
      message
    };

    socketRef.current.emit('send_message', socketMessage);
  };

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, sendMessage }}>
      {children}
    </SocketContext.Provider>
  );
}; 