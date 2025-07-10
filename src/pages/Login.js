import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/userService';
import { motion } from 'framer-motion';
import { useRef } from 'react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const timeoutRef = useRef();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { token, user } = await loginUser({ email, password, role });
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setSuccess(true);
      timeoutRef.current = setTimeout(() => {
      if (user.role === 'cashier') {
        navigate('/stock-out');
      } else if (user.role === 'inventory') {
        navigate('/product');
      } else {
        navigate('/');
      }
      }, 5240);
      return;
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Clean up timeout on unmount
  React.useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 relative overflow-hidden">
      {/* Animated background gradient blobs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1 }}
        className="absolute -top-32 -left-32 w-96 h-96 bg-purple-300 rounded-full filter blur-3xl z-0"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 1.2 }}
        className="absolute -bottom-32 -right-32 w-96 h-96 bg-pink-200 rounded-full filter blur-3xl z-0"
      />
      {/* Congratulation Animation */}
      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-white/80"
        >
          {/* Emoji & SVG Confetti animation: 2.5s duration */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden z-50">
            {[...Array(500)].map((_, i) => {
              const shapeType = i % 4;
              const color = ['#a78bfa','#f472b6','#facc15','#4ade80','#38bdf8','#f87171'][i%6];
              const left = `${(i * 2.1 + 5) % 100}%`;
              const rotate = Math.random() > 0.5 ? 180 : -180;
              const duration = 2.2 + Math.random() * 0.5;
              const delay = 0.1 + Math.random() * 0.7;
              const emojis = ['🎉','🥳','🎊','💸','💎','🪙'];
              if (shapeType === 3) {
                // Emoji confetti
                return (
                  <motion.div
                    key={i}
                    style={{ position: 'absolute', left, top: '-20px', fontSize: 22 }}
                    initial={{ y: 0, opacity: 1, rotate: 0 }}
                    animate={{
                      y: [0, 180 + Math.random() * 60],
                      opacity: [1, 1, 0],
                      rotate: [0, rotate]
                    }}
                    transition={{
                      duration,
                      delay,
                      ease: 'easeIn'
                    }}
                  >
                    {emojis[i % emojis.length]}
                  </motion.div>
                );
              }
              // SVG confetti
              return (
                <motion.svg
                  key={i}
                  width="18" height="18" viewBox="0 0 18 18"
                  style={{ position: 'absolute', left, top: '-20px' }}
                  initial={{ y: 0, opacity: 1, rotate: 0 }}
                  animate={{
                    y: [0, 180 + Math.random() * 60],
                    opacity: [1, 1, 0],
                    rotate: [0, rotate]
                  }}
                  transition={{
                    duration,
                    delay,
                    ease: 'easeIn'
                  }}
                >
                  {shapeType === 0 && (
                    <rect width="18" height="18" rx="4" fill={color} />
                  )}
                  {shapeType === 1 && (
                    <circle cx="9" cy="9" r="8" fill={color} />
                  )}
                  {shapeType === 2 && (
                    <polygon points="9,2 16,16 2,16" fill={color} />
                  )}
                </motion.svg>
              );
            })}
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15, duration: 0.7 }}
            className="mb-4"
          >
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="40" r="40" fill="#a78bfa"/>
              <path d="M24 42l13 13 19-23" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-purple-700 mb-2"
          >
            Login Successful!
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-base text-gray-700"
          >
            Redirecting...
          </motion.p>
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md z-10 relative"
      >
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-extrabold mb-6 text-center text-purple-700 tracking-tight drop-shadow-sm"
        >
          Welcome Back
        </motion.h2>
        {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 text-red-600 text-center">{error}</motion.div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400 focus:border-purple-500 transition-all duration-200 outline-none shadow-sm"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400 focus:border-purple-500 transition-all duration-200 outline-none shadow-sm"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400 focus:border-purple-500 transition-all duration-200 outline-none shadow-sm bg-white"
              value={role}
              onChange={e => setRole(e.target.value)}
              required
            >
              <option value="" disabled>select role</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="cashier">Cashier</option>
              <option value="inventory">Inventory</option>
            </select>
          </motion.div>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.04, backgroundColor: '#7c3aed' }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold transition-all duration-200 shadow-md mt-2 tracking-wide text-base"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

export default Login; 