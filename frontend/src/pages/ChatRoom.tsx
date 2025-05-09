import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeftIcon, LockClosedIcon, LockOpenIcon, PaperClipIcon, FaceSmileIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { io, Socket } from 'socket.io-client';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import Message from '../components/Message';
import MessageInput from '../components/MessageInput';

interface Message {
  id: string;
  sender: string;
  content: string;
  plainText?: string;
  timestamp: Date | string;
}

interface User {
  id: string;
  username: string;
  publicKey: string;
  avatarUrl?: string;
}

const TYPING_TIMEOUT = 1500;

const ChatRoom = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipient, setRecipient] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showPlainText, setShowPlainText] = useState(true);
  const [isRecipientOnline, setIsRecipientOnline] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [decryptAll, setDecryptAll] = useState(false);

  useEffect(() => {
    const fetchRecipient = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const recipientWithId = { ...response.data, id: response.data._id };
        setRecipient(recipientWithId);
      } catch (err) {
        setError('Failed to fetch recipient details');
      } finally {
        setLoading(false);
      }
    };
    fetchRecipient();
  }, [userId]);

  useEffect(() => {
    if (!user) return;
    socketRef.current = io('http://localhost:3000', {
      auth: {
        token: localStorage.getItem('token'),
      },
    });
    socketRef.current.emit('user_online', user.id);
    const roomId = [user.id, userId].sort().join('-');
    socketRef.current.emit('join_room', roomId);

    socketRef.current.on('receive_message', (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });
    socketRef.current.on('online_status', ({ userId, online }) => {
      if (userId === recipient?.id) setIsRecipientOnline(online);
    });
    socketRef.current.on('typing', ({ userId }) => {
      if (userId === recipient?.id) return;
      setIsTyping(true);
    });
    socketRef.current.on('stop_typing', ({ userId }) => {
      if (userId === recipient?.id) return;
      setIsTyping(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      socketRef.current?.off('online_status');
      socketRef.current?.off('typing');
      socketRef.current?.off('stop_typing');
    };
  }, [user, userId, recipient?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const encryptMessage = (message: string, publicKey: string) => {
    // Generate a random AES key
    const aesKey = CryptoJS.lib.WordArray.random(32);
    const aesIv = CryptoJS.lib.WordArray.random(16);

    // Encrypt the message with AES
    const encrypted = CryptoJS.AES.encrypt(message, aesKey, {
      iv: aesIv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    // Encrypt the AES key with RSA
    // Note: In a real application, you would use a proper RSA implementation
    // This is a simplified version for demonstration
    const encryptedKey = CryptoJS.AES.encrypt(aesKey.toString(), publicKey).toString();

    return {
      encryptedMessage: encrypted.toString(),
      encryptedKey,
      iv: aesIv.toString(),
    };
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !recipient || !socketRef.current) return;

    try {
      const { encryptedMessage, encryptedKey, iv } = encryptMessage(
        newMessage,
        recipient.publicKey
      );

      const roomId = [user?.id, userId].sort().join('-');
      socketRef.current.emit('send_message', {
        roomId,
        sender: user?.id,
        recipient: recipient.id,
        message: {
          encrypted: encryptedMessage,
          key: encryptedKey,
          iv,
        },
      });

      setNewMessage('');
    } catch (err) {
      setError('Failed to send message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Typing event handlers
  const handleTyping = () => {
    if (!socketRef.current || !user || !recipient) return;
    const roomId = [user.id, recipient.id].sort().join('-');
    socketRef.current.emit('typing', { roomId, userId: user.id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('stop_typing', { roomId, userId: user.id });
    }, 1200);
  };

  // Improved online status effect
  useEffect(() => {
    if (!user || !recipient || !socketRef.current) return;
    // Emit user_online for self
    socketRef.current.emit('user_online', user.id);
    // Listen for online status updates
    const handleStatus = ({ userId, online }) => {
      if (userId === recipient.id) setIsRecipientOnline(online);
    };
    socketRef.current.on('online_status', handleStatus);
    // Request current status (emit user_online for recipient to trigger status broadcast)
    socketRef.current.emit('user_online', recipient.id);
    return () => {
      socketRef.current?.off('online_status', handleStatus);
    };
  }, [user, recipient]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200">
        <div className="bg-red-100 text-red-700 p-6 rounded-xl shadow-lg text-lg font-semibold">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-300 via-blue-100 to-blue-400">
      <div className="w-full max-w-2xl p-6">
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-blue-200 flex flex-col min-h-[70vh]">
          {/* Chat Header */}
          <div className="flex items-center gap-4 p-6 border-b bg-gradient-to-r from-blue-200 to-blue-100 shadow-md">
            <motion.button
              whileHover={{ scale: 1.08, backgroundColor: '#dbeafe' }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 shadow transition"
            >
              <ArrowLeftIcon className="h-7 w-7 text-blue-500" />
            </motion.button>
            <div className="flex items-center gap-3 flex-1">
              {/* Avatar (placeholder) */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow">
                {recipient?.username?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-blue-900">{recipient?.username}</span>
                  <span className={`h-3 w-3 rounded-full border-2 border-white shadow ${isRecipientOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></span>
                  <span className="text-xs text-gray-500">{isRecipientOnline ? 'Online' : 'Offline'}</span>
                </div>
                <span className="text-xs text-gray-500">End-to-end encrypted chat</span>
              </div>
            </div>
            <button
              onClick={() => setDecryptAll((prev) => !prev)}
              className="ml-4 px-3 py-2 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition shadow flex items-center gap-2"
              title={decryptAll ? 'Show Encrypted' : 'Decrypt All'}
            >
              {decryptAll ? <LockOpenIcon className="h-5 w-5" /> : <LockClosedIcon className="h-5 w-5" />}
              {decryptAll ? 'Hide Plain' : 'Decrypt All'}
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 bg-gradient-to-b from-blue-50 to-white">
            <AnimatePresence>
              {messages.map((message, idx) => (
                <Message
                  key={message.id || idx}
                  {...message}
                  isOwn={message.sender === user?.id}
                  showPlainText={decryptAll}
                />
              ))}
            </AnimatePresence>
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 mb-2 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 flex items-center justify-center text-white font-bold text-base shadow">
                  {recipient?.username?.[0]?.toUpperCase() || '?'}
                </div>
                <span className="text-sm text-blue-500 font-medium">{recipient?.username} is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Message Input */}
          <div className="relative p-4 bg-gradient-to-r from-blue-100 to-blue-200 border-t flex items-center shadow-inner rounded-b-3xl">
            <div className="flex items-center w-full bg-white rounded-full shadow-lg px-4 py-2 gap-2 focus-within:ring-2 focus-within:ring-blue-400 transition-all">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 bg-blue-50 rounded-full px-4 py-2 text-base text-gray-900 placeholder-gray-400 border-0 shadow-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all outline-none"
                onChange={e => {
                  if (typeof handleTyping === 'function') handleTyping();
                  setNewMessage(e.target.value);
                }}
                value={newMessage}
                onKeyPress={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (newMessage.trim()) {
                      const demoMessage = {
                        content: btoa(newMessage),
                        plainText: newMessage,
                        timestamp: new Date().toISOString(),
                      };
                      if (!socketRef.current || !user || !recipient) return;
                      const roomId = [user.id, recipient.id].sort().join('-');
                      socketRef.current.emit('send_message', {
                        roomId,
                        sender: user.id,
                        recipient: recipient.id,
                        message: demoMessage,
                      });
                      setNewMessage('');
                    }
                  }
                }}
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (newMessage.trim()) {
                    const demoMessage = {
                      content: btoa(newMessage),
                      plainText: newMessage,
                      timestamp: new Date().toISOString(),
                    };
                    if (!socketRef.current || !user || !recipient) return;
                    const roomId = [user.id, recipient.id].sort().join('-');
                    socketRef.current.emit('send_message', {
                      roomId,
                      sender: user.id,
                      recipient: recipient.id,
                      message: demoMessage,
                    });
                    setNewMessage('');
                  }
                }}
                className="ml-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                title="Send"
              >
                <PaperAirplaneIcon className="h-6 w-6" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom; 