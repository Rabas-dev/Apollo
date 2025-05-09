import { motion } from 'framer-motion';
import { useState } from 'react';
import { Message as MessageType } from '../types';

interface MessageProps extends MessageType {
  isOwn: boolean;
  plainText: string;
  showPlainText?: boolean;
}

const Message = ({ id, sender, content, plainText, key, iv, timestamp, isOwn, showPlainText }: MessageProps) => {
  const [showLocalPlainText, setShowLocalPlainText] = useState(false);

  const shouldShowPlain = showPlainText ? true : showLocalPlainText;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-[70%] rounded-lg p-3 cursor-pointer select-none ${
          isOwn
            ? 'bg-primary-600 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-900 rounded-bl-none'
        }`}
        onClick={() => {
          if (!showPlainText) setShowLocalPlainText((prev) => !prev);
        }}
        title={showPlainText
          ? 'Decrypted (Decrypt All is ON)'
          : shouldShowPlain
            ? 'Click to hide plain text'
            : 'Click to show plain text'}
      >
        <p className="text-sm break-words">
          {shouldShowPlain ? plainText : content}
        </p>
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs opacity-70">
            {new Date(timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Message; 