# Apollo - Secure Real-Time Chat App

A modern, secure, and real-time chat application with end-to-end encryption.

## Features

- 🔒 End-to-end encryption using AES-256 and RSA-2048
- 💬 Real-time messaging with Socket.IO
- 👤 User authentication with JWT
- 🎨 Modern UI with TailwindCSS and Framer Motion
- 🔄 Real-time message delivery
- 📱 Responsive design

## Tech Stack

### Frontend
- React.js with TypeScript
- TailwindCSS for styling
- Framer Motion for animations
- Socket.IO client for real-time communication
- CryptoJS for encryption

### Backend
- Node.js with Express
- Socket.IO for real-time communication
- MongoDB for data storage
- JWT for authentication
- Bcrypt for password hashing

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/apollo-chat.git
cd apollo-chat
```

2. Install dependencies:
```bash
npm run install:all
```

3. Set up environment variables:
Create a `.env` file in the backend directory:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/apollo-chat
JWT_SECRET=your_jwt_secret_key_here
FRONTEND_URL=http://localhost:5173
```

4. Start the development servers:
```bash
npm start
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:3000`.

## Security Features

### End-to-End Encryption
- Messages are encrypted using AES-256 on the client side
- AES keys are exchanged using RSA-2048 public/private key pairs
- Only encrypted messages are stored in the database
- Private keys are never transmitted over the network

### Authentication
- Passwords are hashed using bcrypt
- JWT tokens for session management
- WebSocket connections are authenticated using JWT

## Project Structure

```
apollo-chat/
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── backend/               # Node.js backend
│   ├── src/
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   └── utils/         # Utility functions
│   └── .env              # Environment variables
└── package.json          # Root package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## Acknowledgments

- [Socket.IO](https://socket.io/) for real-time communication
- [CryptoJS](https://github.com/brix/crypto-js) for encryption
- [TailwindCSS](https://tailwindcss.com/) for styling
- [Framer Motion](https://www.framer.com/motion/) for animations 
