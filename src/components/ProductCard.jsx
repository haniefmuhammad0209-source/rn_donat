import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiShoppingCart, FiX, FiMinus, FiPlus, FiClock, FiShoppingBag } from 'react-icons/fi';
import { useState, memo } from 'react';
import { analyticsService } from '../services/analyticsService';
import { useCart } from '../context/CartContext';
import { TOPPINGS, TOPPING_EMOJI, DONAT_PER_BOX } from '../utils/constants';
import { formatRupiah } from '../utils/format';
import PaymentModal from './PaymentModal';
import useStockStatus from '../hooks/useStockStatus';

const initToppings = () => Object.fromEntries(TOPPINGS.map((t) => [t, 0]));

const ProductCard = memo(({ product, storeIsOpen = true, nextOpenText = '' }) => {
  const [showModal, setShowModal] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);
  const [toppingCounts, setToppingCounts] = useState(initToppings());
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem, setIsOpen: openCart } = useCart();
  const { stock: currentStock, loading: stockLoading } = useStockStatus();

  const totalPrice = product.price * quantity;
  const totalDonat = DONAT_PER_BOX * quantity;
  const totalToppingSelected = Object.values(toppingCounts).reduce((a, b) => a + b, 0);
  const remaining = DONAT_PER_BOX - totalToppingSelected;
  const canOrder = product.category === 'Mix' || totalToppingSelected === DONAT_PER_BOX;

  const adjustTopping = (topping, delta) => {
    setToppingCounts((prev) => {
      const next = prev[topping] + delta;
      if (next < 0) return prev;
      if (delta > 0 && totalToppingSelected >= DONAT_PER_BOX) return prev;
      return { ...prev, [topping]: next };
    });
  };

  const toppingSummary = TOPPINGS
    .filter((t) => toppingCounts[t] > 0)
    .map((t) => `${toppingCounts[t]} ${t}`)
    .join(', ');

  const handleAddToCart = () => {
    if (!canOrder) return;
    addItem(product, quantity, toppingCounts, notes);
    analyticsService.trackPurchaseIntent(product, quantity, toppingSummary || 'Mix');
    setShowModal(false);
    setToppingCounts(initToppings());
    setQuantity(1);
    setNotes('');
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
    openCart(true);
  };

  const handleCheckoutNow = () => {
    if (!canOrder) return;
    // Simpan item sementara untuk PaymentModal
    const item = { product, quantity, toppings: toppingCounts, notes };
    setPendingItem(item);
    setShowModal(false);
    setShowPayment(true);
  };

  const handlePaymentClose = (shouldClear) => {
    setShowPayment(false);
    if (shouldClear) {
      // Item sudah dikirim via WA, reset state
      setToppingCounts(initToppings());
      setQuantity(1);
      setNotes('');
      setPendingItem(null);
    }
  };

  const openModal = () => {
    setToppingCounts(initToppings());
    setQuantity(1);
    setNotes('');
    analyticsService.trackViewProduct(product);
    setShowModal(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -12, boxShadow: '0 25px 50px -12px rgba(139, 69, 19, 0.25)' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden group relative border border-gray-100 dark:border-gray-700"
      >
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-pastel-pink/0 to-chocolate/0 group-hover:from-pastel-pink/5 group-hover:to-chocolate/5 transition-all duration-500 pointer-events-none z-10" />
        
        <div className="relative h-64 overflow-hidden bg-gradient-to-br from-warm-cream to-peach dark:from-gray-700 dark:to-gray-600">
          <motion.img
            src={product.image}
            alt={product.name}
            loading="lazy"
            whileHover={{ scale: 1.15, rotate: 2 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full h-full object-cover"
          />
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer bg-[length:200%_100%] transition-opacity duration-700" />
          
          {/* Badges with higher z-index to prevent overlap */}
          {product.bestseller && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-4 left-4 z-30 bg-gradient-to-r from-rose-gold to-caramel text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl backdrop-blur-md flex items-center space-x-1.5 border border-white/20"
            >
              <FiStar className="w-3.5 h-3.5 fill-current drop-shadow-sm" />
              <span className="drop-shadow-sm">Bestseller</span>
            </motion.div>
          )}
          <div className="absolute top-4 right-4 z-30 bg-white dark:bg-gray-800 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-chocolate dark:text-pastel-pink shadow-xl border-2 border-gray-100 dark:border-gray-700">
            {product.category}
          </div>
        </div>

        <div className="p-6 relative z-20">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white font-elegant group-hover:text-chocolate dark:group-hover:text-pastel-pink transition-colors duration-300">
              {product.name}
            </h3>
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="flex items-center space-x-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 px-2.5 py-1.5 rounded-full border border-yellow-200 dark:border-yellow-800"
            >
              <FiStar className="w-3.5 h-3.5 fill-current" />
              <span className="text-xs font-bold">{product.rating}</span>
            </motion.div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-5 line-clamp-2 leading-relaxed">{product.description}</p>
          <div className="flex items-end justify-between gap-3">
            <div className="flex-shrink-0">
              <div className="text-2xl font-extrabold text-chocolate dark:text-rose-gold">
                {formatRupiah(product.price)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">{DONAT_PER_BOX} donat/kotak</div>
            </div>
            <motion.button
              onClick={openModal}
              disabled={!storeIsOpen}
              whileHover={storeIsOpen ? { scale: 1.08, boxShadow: '0 10px 20px -5px rgba(139, 69, 19, 0.4)' } : {}}
              whileTap={storeIsOpen ? { scale: 0.92 } : {}}
              title={!storeIsOpen ? nextOpenText : ''}
              className={`px-6 py-3 rounded-full font-bold transition-all duration-300 flex items-center space-x-2 text-sm relative overflow-hidden flex-shrink-0 shadow-md ${
                storeIsOpen
                  ? addedToCart
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                    : 'bg-chocolate dark:bg-caramel text-white hover:bg-dark-chocolate dark:hover:bg-chocolate hover:shadow-xl cursor-pointer'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              {storeIsOpen ? <FiShoppingCart className="w-4 h-4" /> : <FiClock className="w-4 h-4" />}
              <span className="font-bold">{storeIsOpen ? (addedToCart ? 'Ditambahkan!' : 'Pesan') : 'Tutup'}</span>
              {storeIsOpen && !addedToCart && (
                <motion.div 
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-24 bg-black/50 backdrop-blur-sm overflow-y-auto"
            onMouseDown={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden max-h-[85vh] flex flex-col my-auto"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-chocolate to-dark-chocolate p-5 text-white relative flex-shrink-0">
                <button onClick={() => setShowModal(false)} type="button"
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40 transition-colors cursor-pointer z-10">
                  <FiX className="w-4 h-4 text-white" />
                </button>
                <div className="text-xs font-medium opacity-70 mb-1">Pilih pesanan</div>
                <h3 className="text-lg font-bold font-elegant">
                  {product.category === 'Mix' ? 'Pilih Jumlah Kotak' : 'Pilih Topping & Jumlah'}
                </h3>
                <p className="text-sm opacity-80 mt-0.5">{product.name}</p>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto">
                {/* Jumlah Kotak */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Jumlah Kotak</p>
                  <div className="flex items-center justify-between bg-cream dark:bg-gray-700 rounded-2xl p-4">
                    <div>
                      <div className="font-bold text-chocolate">{quantity} kotak</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{totalDonat} donat · {formatRupiah(totalPrice)}</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <motion.button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        whileTap={{ scale: 0.9 }} disabled={quantity <= 1}
                        className="w-9 h-9 bg-white dark:bg-gray-600 rounded-full shadow flex items-center justify-center text-chocolate hover:bg-chocolate hover:text-white transition-colors disabled:opacity-40">
                        <FiMinus className="w-4 h-4" />
                      </motion.button>
                      <span className="w-6 text-center font-bold text-chocolate text-lg">{quantity}</span>
                      <motion.button type="button" onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                        whileTap={{ scale: 0.9 }} disabled={quantity >= 20}
                        className="w-9 h-9 bg-white dark:bg-gray-600 rounded-full shadow flex items-center justify-center text-chocolate hover:bg-chocolate hover:text-white transition-colors disabled:opacity-40">
                        <FiPlus className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Topping — hanya untuk non-Mix */}
                {product.category !== 'Mix' && (
                  <div className="pt-2">
                    <div className="flex flex-col items-center mb-4">
                      <p className="text-base font-bold text-gray-800 dark:text-gray-200 mb-3">Stok Donat yang Tersisa</p>
                      {stockLoading ? (
                        <div className="h-9 w-32 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                      ) : (
                        <span className={`text-sm font-bold px-4 py-2 rounded-full ${
                          currentStock === 0 
                            ? 'bg-red-100 text-red-600' 
                            : currentStock < 30 
                            ? 'bg-yellow-100 text-yellow-700' 
                            : 'bg-green-100 text-green-600'
                        }`}>
                          {currentStock === 0 ? '⚠ Stok Habis' : `${currentStock} donat tersedia`}
                        </span>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                        Pilih topping untuk {DONAT_PER_BOX} donat per kotak
                      </p>
                    </div>
                    <div className="space-y-2">
                      {TOPPINGS.map((topping) => {
                        const count = toppingCounts[topping];
                        const canAdd = totalToppingSelected < DONAT_PER_BOX;
                        return (
                          <div key={topping}
                            className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all ${
                              count > 0 ? 'border-chocolate bg-chocolate/5' : 'border-gray-100 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                            }`}>
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{TOPPING_EMOJI[topping]}</span>
                              <span className="font-medium text-sm text-gray-700 dark:text-gray-300">{topping}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <motion.button type="button" onClick={() => adjustTopping(topping, -1)} disabled={count === 0}
                                whileTap={{ scale: 0.85 }}
                                className="w-7 h-7 rounded-full bg-white dark:bg-gray-600 shadow border border-gray-200 dark:border-gray-500 flex items-center justify-center text-chocolate disabled:opacity-30 hover:bg-chocolate hover:text-white transition-colors">
                                <FiMinus className="w-3 h-3" />
                              </motion.button>
                              <span className={`w-6 text-center font-bold text-sm ${count > 0 ? 'text-chocolate' : 'text-gray-300'}`}>{count}</span>
                              <motion.button type="button" onClick={() => adjustTopping(topping, 1)} disabled={!canAdd}
                                whileTap={{ scale: 0.85 }}
                                className="w-7 h-7 rounded-full bg-white dark:bg-gray-600 shadow border border-gray-200 dark:border-gray-500 flex items-center justify-center text-chocolate disabled:opacity-30 hover:bg-chocolate hover:text-white transition-colors">
                                <FiPlus className="w-3 h-3" />
                              </motion.button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Total topping</span>
                        <span className={totalToppingSelected === DONAT_PER_BOX ? 'text-green-500 font-semibold' : ''}>
                          {totalToppingSelected}/{DONAT_PER_BOX}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-600 rounded-full h-2">
                        <motion.div
                          className={`h-2 rounded-full ${totalToppingSelected === DONAT_PER_BOX ? 'bg-green-500' : 'bg-chocolate'}`}
                          animate={{ width: `${(totalToppingSelected / DONAT_PER_BOX) * 100}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Catatan */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                    Catatan <span className="text-gray-400 font-normal">(opsional)</span>
                  </label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: jangan terlalu manis, dll..."
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 outline-none focus:border-chocolate transition-colors resize-none text-sm" />
                </div>

                {/* Summary */}
                <AnimatePresence>
                  {canOrder && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="bg-cream dark:bg-gray-700 rounded-2xl p-4 text-sm text-chocolate dark:text-pastel-pink space-y-1">
                      {product.category !== 'Mix' && <div><span className="font-semibold">Topping: </span>{toppingSummary}</div>}
                      <div><span className="font-semibold">Total: </span>{formatRupiah(totalPrice)} ({quantity} kotak)</div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action buttons — dua pilihan */}
                <div className="space-y-2 pb-1">
                  {/* Tambah ke keranjang */}
                  <motion.button onClick={handleAddToCart} disabled={!canOrder}
                    whileHover={canOrder ? { scale: 1.02 } : {}} whileTap={canOrder ? { scale: 0.98 } : {}}
                    className={`w-full py-3.5 rounded-full font-semibold text-sm flex items-center justify-center space-x-2 transition-all ${
                      canOrder ? 'bg-chocolate hover:bg-dark-chocolate text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}>
                    <FiShoppingBag className="w-4 h-4" />
                    <span>{canOrder ? 'Tambah ke Keranjang' : `Pilih ${remaining} donat lagi`}</span>
                  </motion.button>

                  {/* Checkout sekarang */}
                  <motion.button onClick={handleCheckoutNow} disabled={!canOrder}
                    whileHover={canOrder ? { scale: 1.02 } : {}} whileTap={canOrder ? { scale: 0.98 } : {}}
                    className={`w-full py-3.5 rounded-full font-semibold text-sm flex items-center justify-center space-x-2 transition-all border-2 ${
                      canOrder
                        ? 'border-chocolate text-chocolate hover:bg-chocolate hover:text-white'
                        : 'border-gray-200 text-gray-300 cursor-not-allowed'
                    }`}>
                    <FiShoppingCart className="w-4 h-4" />
                    <span>Checkout Sekarang</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Payment Modal — untuk Checkout Sekarang */}
      {pendingItem && (
        <PaymentModal
          isOpen={showPayment}
          onClose={handlePaymentClose}
          items={[pendingItem]}
          totalPrice={pendingItem.product.price * pendingItem.quantity}
          totalBoxes={pendingItem.quantity}
        />
      )}
    </>
  );
});

ProductCard.displayName = 'ProductCard';
export default ProductCard;
