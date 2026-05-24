import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiShoppingBag, FiMoon, FiSun } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalItems, setIsOpen: openCart } = useCart();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Beranda', href: '#home' },
    { name: 'Menu', href: '#menu' },
    { name: 'Tentang', href: '#about' },
    { name: 'Testimoni', href: '#testimonials' },
    { name: 'Lokasi', href: '#location' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent dark:bg-gray-900/80'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-shrink-0">
            <a href="#home" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-pastel-pink to-light-brown rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="font-elegant text-2xl font-bold text-chocolate dark:text-pastel-pink">
                RN <span className="text-pastel-pink dark:text-white">Donat</span>
              </span>
            </a>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link, index) => {
              const isExternal = link.href.startsWith('/');
              const className = "text-gray-700 dark:text-gray-300 hover:text-chocolate dark:hover:text-pastel-pink font-medium transition-colors duration-200 relative group text-sm";
              const underline = <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-chocolate dark:bg-pastel-pink group-hover:w-full transition-all duration-300" />;
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
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative bg-chocolate text-white px-5 py-2.5 rounded-full font-medium hover:bg-dark-chocolate transition-colors duration-200 flex items-center space-x-2"
            >
              <FiShoppingBag className="w-4 h-4" />
              <span className="text-sm">Keranjang</span>
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Mobile buttons */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
            >
              {isDark ? <FiSun className="w-4 h-4 text-yellow-400" /> : <FiMoon className="w-4 h-4 text-gray-600" />}
            </button>
            <button
              onClick={() => openCart(true)}
              className="relative w-9 h-9 rounded-full bg-chocolate text-white flex items-center justify-center"
            >
              <FiShoppingBag className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 dark:text-gray-300 hover:text-chocolate transition-colors"
            >
              {isOpen ? <FiX className="w-7 h-7" /> : <FiMenu className="w-7 h-7" />}
            </button>
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
            className="md:hidden overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-700"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-chocolate dark:hover:text-pastel-pink hover:bg-cream dark:hover:bg-gray-800 rounded-xl transition-colors font-medium"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
