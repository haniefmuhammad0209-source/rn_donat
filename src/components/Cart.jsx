import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { useState, memo } from 'react';
import { useCart } from '../context/CartContext';
import { formatRupiah } from '../utils/format';
import PaymentModal from './PaymentModal';
import { EmptyCart } from './EmptyState';

const CartItem = memo(({ item }) => {
  const { updateQuantity, removeItem } = useCart();
  const toppingText = Object.entries(item.toppings)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `${v} ${k}`)
    .join(', ') || 'Mix';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-start space-x-3 py-4 border-b border-gray-100 dark:border-gray-700"
    >
      <img
        src={item.product.image}
        alt={item.product.name}
        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-800 dark:text-white text-sm">{item.product.name}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">Topping: {toppingText}</p>
        {item.notes && (
          <p className="text-xs text-chocolate dark:text-pastel-pink mt-0.5 italic">"{item.notes}"</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => updateQuantity(item.key, item.quantity - 1)}
              className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-chocolate hover:text-white transition-colors"
            >
              <FiMinus className="w-3 h-3" />
            </button>
            <span className="text-sm font-bold text-gray-800 dark:text-white w-4 text-center">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.key, item.quantity + 1)}
              className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-chocolate hover:text-white transition-colors"
            >
              <FiPlus className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-chocolate dark:text-rose-gold">
              {formatRupiah(item.product.price * item.quantity)}
            </span>
            <button
              onClick={() => removeItem(item.key)}
              className="w-6 h-6 rounded-full bg-red-50 dark:bg-red-900/30 text-red-400 dark:text-red-400 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
            >
              <FiTrash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

CartItem.displayName = 'CartItem';

const Cart = () => {
  const { items, isOpen, setIsOpen, totalItems, totalPrice, clearCart } = useCart();
  const [showPayment, setShowPayment] = useState(false);

  const handleCheckout = () => {
    setIsOpen(false);
    setShowPayment(true);
  };

  const handlePaymentClose = (shouldClear) => {
    setShowPayment(false);
    if (shouldClear) clearCart();
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-gray-900 z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <FiShoppingBag className="w-5 h-5 text-chocolate dark:text-pastel-pink" />
                <h2 className="font-bold text-gray-800 dark:text-white font-elegant text-lg">
                  Keranjang
                </h2>
                {totalItems > 0 && (
                  <span className="bg-chocolate dark:bg-caramel text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    {totalItems}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <FiX className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5">
              {items.length === 0 ? (
                <EmptyCart 
                  action={{
                    label: 'Lihat Menu',
                    icon: '🍩',
                    onClick: () => {
                      setIsOpen(false);
                      setTimeout(() => {
                        document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
                      }, 300);
                    }
                  }}
                />
              ) : (
                <AnimatePresence>
                  {items.map((item) => (
                    <CartItem key={item.key} item={item} />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-5 border-t border-gray-100 dark:border-gray-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Total</span>
                  <span className="text-xl font-bold text-chocolate dark:text-rose-gold">{formatRupiah(totalPrice)}</span>
                </div>
                <motion.button
                  onClick={handleCheckout}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-chocolate dark:bg-caramel hover:bg-dark-chocolate dark:hover:bg-chocolate text-white py-4 rounded-full font-semibold flex items-center justify-center space-x-2 transition-colors"
                >
                  <FiShoppingBag className="w-5 h-5" />
                  <span>Checkout ({totalItems} kotak)</span>
                </motion.button>
                <button
                  onClick={clearCart}
                  className="w-full text-sm text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors py-1"
                >
                  Kosongkan keranjang
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPayment}
        onClose={handlePaymentClose}
        items={items}
        totalPrice={totalPrice}
        totalBoxes={totalItems}
      />
    </>
  );
};

export default Cart;
