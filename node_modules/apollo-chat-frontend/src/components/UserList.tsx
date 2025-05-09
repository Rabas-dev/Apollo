import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { User } from '../types';

interface UserListProps {
  users: User[];
  loading: boolean;
  error: string | null;
}

const UserList = ({ users, loading, error }: UserListProps) => {
  const navigate = useNavigate();

  const handleUserClick = (userId: string) => {
    navigate(`/chat/${userId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <motion.div
          key={user.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleUserClick(user.id)}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
        >
          <div className="relative">
            <UserCircleIcon className="h-8 w-8 text-primary-500" />
            {user.online && (
              <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">{user.username}</p>
            <p className="text-sm text-gray-500">
              {user.online ? 'Online' : `Last seen ${new Date(user.lastSeen).toLocaleString()}`}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default UserList; 