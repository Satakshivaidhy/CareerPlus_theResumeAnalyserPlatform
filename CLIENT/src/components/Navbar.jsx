import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiTrendingUp, FiVideo, FiMenu, FiX, FiGrid, FiLogOut } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeSwitcher from './ThemeSwitcher';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleNavClick = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/10 dark:border-white/10 border-slate-200/80 bg-[#030014]/80 dark:bg-[#030014]/80 bg-white/80 backdrop-blur-xl transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex-shrink-0 flex items-center">
            <motion.button
              onClick={() => handleNavClick('/')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2.5 font-extrabold text-xl tracking-tight text-slate-900 dark:text-white group cursor-pointer bg-transparent border-none p-0 focus:outline-none"
            >
              <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
                <img
                  src={isDark ? "/logo.png" : "/logo_transparent.png"}
                  alt="PrepMatrix Logo"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
                />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                Prep<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400">Matrix</span>
              </span>
            </motion.button>
          </div>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center space-x-1">
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleNavClick('/')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer focus:outline-none ${
                isActive('/')
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 dark:bg-white/5 font-semibold'
                  : 'text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              Overview
            </motion.button>

            {user && (
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleNavClick('/dashboard')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer focus:outline-none ${
                  isActive('/dashboard')
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 dark:bg-white/5 font-semibold'
                    : 'text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <FiGrid size={14} /> Dashboard
              </motion.button>
            )}

            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleNavClick('/analyze')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer focus:outline-none ${
                isActive('/analyze')
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 dark:bg-white/5 font-semibold'
                  : 'text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <FiTrendingUp size={14} /> Resume Analyzer
            </motion.button>

            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleNavClick('/interview')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer focus:outline-none ${
                isActive('/interview')
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 dark:bg-white/5 font-semibold'
                  : 'text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <FiVideo size={14} /> Mock Interview
            </motion.button>
          </div>

          {/* User Auth Buttons, Theme Toggle, Profile badge */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle in Navbar */}
            <ThemeSwitcher />

            {user ? (
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleNavClick('/dashboard')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-indigo-500/50 transition-colors text-xs font-semibold text-slate-800 dark:text-gray-200 cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold">
                    {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                  </div>
                  <span>{user.fullName || user.email}</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="p-2 rounded-xl text-slate-500 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Log out"
                >
                  <FiLogOut size={16} />
                </motion.button>
              </div>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleNavClick('/login')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer focus:outline-none ${
                    isActive('/login')
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 dark:bg-white/5'
                      : 'text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  Sign In
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: '0 8px 25px -4px rgba(99, 102, 241, 0.45)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleNavClick('/register')}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20 cursor-pointer focus:outline-none"
                >
                  Register
                </motion.button>
              </>
            )}
          </div>

          {/* Mobile Right Controls: Theme Toggle & Hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeSwitcher />
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors focus:outline-none cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Animated Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden border-t border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-[#030014]/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2 shadow-2xl"
          >
            <button
              onClick={() => handleNavClick('/')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive('/')
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 dark:bg-white/5 font-semibold'
                  : 'text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              Overview
            </button>

            {user && (
              <button
                onClick={() => handleNavClick('/dashboard')}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 transition-all ${
                  isActive('/dashboard')
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 dark:bg-white/5 font-semibold'
                    : 'text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <FiGrid size={15} /> Dashboard
              </button>
            )}

            <button
              onClick={() => handleNavClick('/analyze')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 transition-all ${
                isActive('/analyze')
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 dark:bg-white/5 font-semibold'
                  : 'text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <FiTrendingUp size={15} /> Resume Analyzer
            </button>

            <button
              onClick={() => handleNavClick('/interview')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 transition-all ${
                isActive('/interview')
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 dark:bg-white/5 font-semibold'
                  : 'text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <FiVideo size={15} /> Mock Interview
            </button>

            <div className="pt-3 border-t border-slate-200/80 dark:border-white/10 flex flex-col gap-2">
              {user ? (
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => handleNavClick('/dashboard')}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-gray-200"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold">
                      {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                    </div>
                    <span>{user.fullName || user.email}</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                      navigate('/');
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-500/10 text-xs font-semibold"
                  >
                    <FiLogOut size={15} /> Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleNavClick('/login')}
                    className="w-full text-center py-2.5 rounded-xl border border-slate-300 dark:border-white/10 text-sm font-semibold text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/5"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleNavClick('/register')}
                    className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-sm font-semibold text-white shadow-md shadow-indigo-500/20"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

