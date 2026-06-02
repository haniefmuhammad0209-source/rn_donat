import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiShoppingBag, FiMoon, FiSun } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

const NAV_LINKS = [
  { name: 'Beranda', href: '#home' },
  { name: 'Menu', href: '#menu' },
  { name: 'Tentang', href: '#about' },
  { name: 'Testimoni', href: '#testimonials' },
  { name: 'Lokasi', href: '#location' },
];

const Navbar = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalItems, setIsOpen: openCart } = useCart();
  const { isDark, toggleTheme } = useTheme();

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 50);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-9 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg' 
          : 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            className="flex-shrink-0"
          >
            <a href="#home" className="flex items-center space-x-3">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-11 h-11 bg-gradient-to-br from-pastel-pink via-rose-gold to-caramel rounded-full flex items-center justify-center shadow-lg"
              >
                <span className="text-white font-bold text-xl">R</span>
              </motion.div>
              <span className="font-elegant text-2xl font-bold bg-gradient-to-r from-chocolate to-caramel bg-clip-text text-transparent dark:from-pastel-pink dark:to-white">
                RN <span className="bg-gradient-to-r from-pastel-pink to-rose-gold bg-clip-text text-transparent dark:from-white dark:to-pastel-pink">Donat</span>
              </span>
            </a>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {NAV_LINKS.map((link, index) => {
              const isExternal = link.href.startsWith('/');
              const className = "text-gray-700 dark:text-gray-300 hover:text-chocolate dark:hover:text-pastel-pink font-semibold transition-all duration-200 relative group text-sm";
              const underline = <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-chocolate to-caramel dark:from-pastel-pink dark:to-rose-gold group-hover:w-full transition-all duration-300 rounded-full" />;
              return isExternal ? (
                <Link key={link.name} to={link.href} className={className}>
                  {link.name}{underline}
                </Link>
              ) : (
                <motion.a key={link.name} href={link.href}
                  initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }} className={className}>
                  {link.name}{underline}
                </motion.a>
              );
            })}

            {/* Dark mode toggle */}
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-600"
              aria-label="Toggle dark mode"
            >
              {isDark
                ? <FiSun className="w-4 h-4 text-yellow-400" />
                : <FiMoon className="w-4 h-4 text-gray-600" />
              }
            </motion.button>

            {/* Cart button */}
            <motion.button
              onClick={() => openCart(true)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05, boxShadow: '0 10px 30px -5px rgba(139, 69, 19, 0.4)' }}
              whileTap={{ scale: 0.95 }}
              className="relative bg-gradient-to-r from-chocolate to-caramel text-white px-6 py-3 rounded-full font-bold hover:shadow-xl transition-all duration-300 flex items-center space-x-2 border border-chocolate/20"
            >
              <FiShoppingBag className="w-4 h-4" />
              <span className="text-sm">Keranjang</span>
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-white dark:border-gray-900"
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Mobile buttons */}
          <div className="md:hidden flex items-center space-x-2">
            <motion.button
              onClick={toggleTheme}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600"
            >
              {isDark ? <FiSun className="w-4 h-4 text-yellow-400" /> : <FiMoon className="w-4 h-4 text-gray-600" />}
            </motion.button>
            <motion.button
              onClick={() => openCart(true)}
              whileTap={{ scale: 0.9 }}
              className="relative w-10 h-10 rounded-full bg-gradient-to-r from-chocolate to-caramel text-white flex items-center justify-center shadow-lg"
            >
              <FiShoppingBag className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold border-2 border-white">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </motion.button>
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              whileTap={{ scale: 0.9 }}
              className="text-gray-700 dark:text-gray-300 hover:text-chocolate dark:hover:text-pastel-pink transition-colors"
            >
              {isOpen ? <FiX className="w-7 h-7" /> : <FiMenu className="w-7 h-7" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 shadow-lg"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {NAV_LINKS.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  whileHover={{ x: 5 }}
                  className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-chocolate dark:hover:text-pastel-pink hover:bg-gradient-to-r hover:from-warm-cream hover:to-peach dark:hover:from-gray-800 dark:hover:to-gray-700 rounded-xl transition-all font-semibold"
                >
                  {link.name}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
});

Navbar.displayName = 'Navbar';
export default Navbar;
