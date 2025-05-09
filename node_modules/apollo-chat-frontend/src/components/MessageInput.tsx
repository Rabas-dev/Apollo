import { useState, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { encryptMessage } from '../utils/crypto';
import { EncryptedMessage } from '../types';

interface MessageInputProps {
  onSend: (message: any) => void; // Accept any for demo
  recipientPublicKey: string;
  onTyping?: () => void;
}

const MessageInput = ({ onSend, recipientPublicKey, onTyping }: MessageInputProps) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      // For demo: content is unreadable, plainText is the real message
      const demoMessage = {
        content: btoa(message), // unreadable string
        plainText: message,     // real message
        timestamp: new Date().toISOString(),
      };
      onSend(demoMessage);
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (onTyping) onTyping();
  };

  return (
    <div className="flex items-center gap-2 p-4 border-t">
      <input
        type="text"
        value={message}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder="Type a message..."
        className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSend}
        disabled={!message.trim()}
        className="p-2 bg-primary-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <PaperAirplaneIcon className="h-5 w-5" />
      </motion.button>
    </div>
  );
};

export default MessageInput; 