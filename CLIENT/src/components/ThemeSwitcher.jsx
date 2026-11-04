import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const ThemeSwitcher = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-between w-16 h-8 px-1.5 py-1 rounded-full cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 select-none ${
        isDark
          ? 'bg-slate-900/90 border border-white/10 hover:border-indigo-500/40 shadow-inner'
          : 'bg-slate-200 border border-slate-300 hover:border-indigo-400/50 shadow-inner'
      } ${className}`}
    >
      <span className="sr-only">Toggle theme</span>

      {/* Sun icon */}
      <span className="flex items-center justify-center w-5 h-5 z-10 pointer-events-none">
        <FiSun
          className={`w-3.5 h-3.5 transition-all duration-300 ${
            !isDark
              ? 'text-amber-500 scale-110 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]'
              : 'text-gray-400 opacity-60 scale-90'
          }`}
        />
      </span>

      {/* Moon icon */}
      <span className="flex items-center justify-center w-5 h-5 z-10 pointer-events-none">
        <FiMoon
          className={`w-3.5 h-3.5 transition-all duration-300 ${
            isDark
              ? 'text-indigo-300 scale-110 drop-shadow-[0_0_6px_rgba(165,180,252,0.5)]'
              : 'text-gray-500 opacity-60 scale-90'
          }`}
        />
      </span>

      {/* Sliding thumb */}
      <span
        aria-hidden="true"
        className={`absolute top-1 bottom-1 left-1.5 w-6 h-6 rounded-full transition-transform duration-300 ease-in-out shadow-sm pointer-events-none ${
          isDark
            ? 'translate-x-7 bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-indigo-500/30'
            : 'translate-x-0 bg-white shadow-slate-300'
        }`}
      />
    </button>
  );
};

export default ThemeSwitcher;
