import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRightOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import React from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  publicKey: string;
}

const Dashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/users', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const usersWithId = response.data.map((user: any) => ({
          ...user,
          id: user._id,
        }));
        setUsers(usersWithId);
      } catch (err) {
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUserClick = (userId: string) => {
    navigate(`/chat/${userId}`);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="w-full max-w-2xl p-6">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-white rounded-2xl shadow-2xl p-8 border border-blue-100 flex flex-col gap-8 items-center"
        >
          <div className="w-full flex justify-between items-center mb-4">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-extrabold text-blue-900 tracking-tight drop-shadow-sm"
            >
              👋 Welcome, {user?.username}!
            </motion.h1>
            <motion.button
              whileHover={{ scale: 1.08, backgroundColor: '#ef4444' }}
              whileTap={{ scale: 0.96 }}
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition-all font-semibold text-base focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              <ArrowRightOnRectangleIcon className="h-6 w-6" />
              Logout
            </motion.button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 shadow w-full"
            >
              {error}
            </motion.div>
          )}

          <div className="w-full">
            <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center gap-2">
              <UserCircleIcon className="h-7 w-7 text-blue-400" />
              Available Users
            </h2>
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {users.map((user) => (
                  <motion.div
                    key={user.id}
                    whileHover={{ scale: 1.03, boxShadow: '0 4px 24px #60a5fa33' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleUserClick(user.id)}
                    className="flex items-center gap-4 p-5 rounded-xl bg-blue-50 hover:bg-blue-100 cursor-pointer transition-all shadow group border border-blue-100"
                  >
                    <UserCircleIcon className="h-12 w-12 text-blue-400 group-hover:text-blue-500 transition" />
                    <div className="flex-1">
                      <p className="font-semibold text-lg text-blue-900">{user.username}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard; 