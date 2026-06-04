import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUpload, FiCheck } from 'react-icons/fi';
import { useSettings } from '../context/SettingsContext';
import { cloudinaryService } from '../services/cloudinaryService';
import { orderService } from '../services/orderService';
import { formatRupiah } from '../utils/format';
import { WA_NUMBER, PAYMENT_METHOD, PAYMENT_METHOD_LABEL, PICKUP_SCHEDULE_TYPES, PICKUP_SCHEDULE_LABEL } from '../utils/constants';
import { formatPickupSchedule } from '../utils/waNotification';

const PaymentModal = ({ isOpen, onClose, items, totalPrice, totalBoxes }) => {
  const { settings } = useSettings();
  const qrisUrl = settings?.qrisImageUrl || '';
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHOD.COD);
  const [proofPreview, setProofPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [proofUrl, setProofUrl] = useState('');
  const [proofError, setProofError] = useState('');
  const [pickupType, setPickupType] = useState(PICKUP_SCHEDULE_TYPES.NOW);
  const [pickupTime, setPickupTime] = useState('');
  const inputRef = useRef(null);

  // Reset saat modal dibuka/tutup
  useEffect(() => {
    if (!isOpen) {
      setProofPreview('');
      setProofUrl('');
      setProofError('');
      setUploadProgress(0);
      setPaymentMethod(PAYMENT_METHOD.COD);
      setPickupType(PICKUP_SCHEDULE_TYPES.NOW);
      setPickupTime('');
    }
  }, [isOpen]);

  const handleProofFile = async (file) => {
    const err = cloudinaryService.validate(file);
    if (err) { setProofError(err); return; }
    setProofError('');
    setProofPreview(URL.createObjectURL(file));
    setUploading(true);
    setUploadProgress(0);
    try {
      const url = await cloudinaryService.upload(file, setUploadProgress);
      setProofUrl(url);
    } catch {
      setProofError('Upload gagal, coba lagi.');
      setProofPreview('');
    } finally {
      setUploading(false);
    }
  };

  const buildWAMessage = (proofCloudUrl = '') => {
    const orderLines = items.map((item) => {
      const toppingText = Object.entries(item.toppings || {})
        .filter(([, v]) => v > 0)
        .map(([k, v]) => `${v} ${k}`)
        .join(', ') || 'Mix';
      return `• ${item.product.name} x${item.quantity} kotak — Topping: ${toppingText}${item.notes ? ` (${item.notes})` : ''}`;
    }).join('\n');

    const payLabel = PAYMENT_METHOD_LABEL[paymentMethod];
    const proofLine = proofCloudUrl ? `\n🧾 Bukti bayar: ${proofCloudUrl}` : '';

    const pickupSchedule = {
      type: pickupType,
      time: pickupType !== PICKUP_SCHEDULE_TYPES.NOW ? pickupTime : null,
    };
    const pickupText = formatPickupSchedule(pickupSchedule);
    const pickupLine = pickupText ? `\n${pickupText}` : '';

    return encodeURIComponent(
      `Halo kak, saya ingin memesan:\n\n` +
      `${orderLines}\n\n` +
      `📦 Total: ${totalBoxes} kotak\n` +
      `💰 Total Harga: ${formatRupiah(totalPrice)}\n` +
      `💳 Metode Bayar: ${payLabel}` +
      `${pickupLine}` +
      `${proofLine}\n\n` +
      `Mohon konfirmasi pesanan saya ya kak, terima kasih!`
    );
  };

  const handleConfirm = async () => {
    // QRIS harus upload bukti dulu
    if (paymentMethod === PAYMENT_METHOD.QRIS && !proofUrl) return;
    // Pickup schedule validation
    if (pickupType !== PICKUP_SCHEDULE_TYPES.NOW && !pickupTime) return;
    const pickupSchedule = {
      type: pickupType,
      time: pickupType !== PICKUP_SCHEDULE_TYPES.NOW ? pickupTime : null,
    };
    const message = buildWAMessage(proofUrl);
    // Save order to Firestore
    try {
      const orderItems = items.map((item) => ({
        productName: item.product.name,
        productId: item.product.id || '',
        quantity: item.quantity,
        toppings: Object.entries(item.toppings || {})
          .filter(([, v]) => v > 0)
          .map(([k, v]) => `${v} ${k}`)
          .join(', ') || 'Mix',
        notes: item.notes || '',
        price: item.product.price,
      }));
      await orderService.create({
        items: orderItems,
        customerName: '',
        customerPhone: '',
        notes: '',
        paymentMethod,
        totalPrice,
        totalBoxes,
        pickupSchedule,
        paymentProof: proofUrl || null,
      });
    } catch (err) {
      console.error('[Order] Gagal menyimpan order:', err);
    }
    window.open(`https://wa.me/${WA_NUMBER}?text=${message}`, '_blank');
    onClose(true, pickupSchedule);
  };

  const needsPickupTime = pickupType !== PICKUP_SCHEDULE_TYPES.NOW;
  const pickupTimeValid = !needsPickupTime || (pickupTime && pickupTime.length > 0);
  const canConfirm = pickupTimeValid && (paymentMethod === PAYMENT_METHOD.COD || (paymentMethod === PAYMENT_METHOD.QRIS && proofUrl));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(false); }}
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden max-h-[90vh] flex flex-col"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-chocolate to-dark-chocolate p-5 text-white flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-lg font-bold font-elegant">Metode Pembayaran</h3>
                <p className="text-sm opacity-80 mt-0.5">Total: {formatRupiah(totalPrice)}</p>
              </div>
              <button onClick={() => onClose(false)} type="button"
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40 transition-colors">
                <FiX className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Pilih metode */}
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(PAYMENT_METHOD).map(([, val]) => (
                  <button key={val} onClick={() => setPaymentMethod(val)}
                    className={`p-4 rounded-2xl border-2 text-center transition-all ${
                      paymentMethod === val
                        ? 'border-chocolate bg-chocolate/5 dark:bg-chocolate/10'
                        : 'border-gray-200 dark:border-gray-600 hover:border-chocolate/40'
                    }`}>
                    <div className="text-3xl mb-1">{val === PAYMENT_METHOD.QRIS ? '📱' : '💵'}</div>
                    <div className={`text-sm font-semibold ${paymentMethod === val ? 'text-chocolate' : 'text-gray-600 dark:text-gray-400'}`}>
                      {PAYMENT_METHOD_LABEL[val]}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {val === PAYMENT_METHOD.QRIS ? 'Transfer via QRIS' : 'Bayar saat terima'}
                    </div>
                  </button>
                ))}
              </div>

              {/* QRIS flow */}
              <AnimatePresence mode="wait">
                {paymentMethod === PAYMENT_METHOD.QRIS && (
                  <motion.div key="qris"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4">
                    {/* QR Code */}
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Scan & Transfer <span className="text-chocolate">{formatRupiah(totalPrice)}</span>
                      </p>
                      {qrisUrl ? (
                        <img src={qrisUrl} alt="QRIS RN Donat"
                          className="w-44 h-44 mx-auto rounded-2xl object-contain border-2 border-gray-100 dark:border-gray-600 shadow-md" />
                      ) : (
                        <div className="w-44 h-44 mx-auto rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <p className="text-gray-400 dark:text-gray-500 text-xs text-center px-4">QRIS belum dikonfigurasi admin</p>
                        </div>
                      )}
                    </div>

                    {/* Upload bukti */}
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Upload Bukti Pembayaran
                        <span className="text-red-500 ml-1">*</span>
                      </p>
                      <div
                        onClick={() => !uploading && inputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl overflow-hidden cursor-pointer transition-colors ${
                          uploading ? 'border-chocolate/50 cursor-wait' : 'border-gray-200 dark:border-gray-600 hover:border-chocolate'
                        }`}
                      >
                        {proofPreview ? (
                          <div className="relative">
                            <img src={proofPreview} alt="Bukti" className="w-full h-32 object-cover" />
                            {/* Upload progress overlay */}
                            <AnimatePresence>
                              {uploading && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                  className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                                  <div className="w-10 h-10 rounded-full border-4 border-white/20 border-t-white animate-spin mb-2" />
                                  <p className="text-white text-xs font-semibold">{uploadProgress}%</p>
                                </motion.div>
                              )}
                              {/* Success overlay */}
                              {!uploading && proofUrl && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                  className="absolute top-2 right-2 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
                                  <FiCheck className="w-4 h-4 text-white" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-6 text-gray-400 dark:text-gray-500">
                            <FiUpload className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-sm">Klik untuk upload foto bukti</p>
                            <p className="text-xs mt-0.5">JPG, PNG · Maks 5MB</p>
                          </div>
                        )}
                      </div>
                      {proofError && <p className="text-red-500 text-xs mt-1">{proofError}</p>}
                      {proofUrl && !uploading && (
                        <p className="text-green-500 text-xs mt-1 flex items-center space-x-1">
                          <FiCheck className="w-3 h-3" />
                          <span>Bukti berhasil diupload</span>
                        </p>
                      )}
                      <input ref={inputRef} type="file" accept="image/*" className="hidden"
                        onChange={e => { if (e.target.files[0]) handleProofFile(e.target.files[0]); }} />
                    </div>
                  </motion.div>
                )}

                {/* COD info */}
                {paymentMethod === PAYMENT_METHOD.COD && (
                  <motion.div key="cod"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 text-sm text-green-700 dark:text-green-300">
                    <p className="font-semibold mb-1">💵 Bayar Langsung:</p>
                    <p className="text-xs">Siapkan uang <strong>{formatRupiah(totalPrice)}</strong> saat pengambilan atau saat kurir tiba.</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Jadwal Pengambilan */}
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  🕐 Jadwal Pengambilan
                </p>
                <div className="space-y-2">
                  {Object.entries(PICKUP_SCHEDULE_TYPES).map(([, val]) => (
                    <label
                      key={val}
                      className={`flex items-center space-x-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        pickupType === val
                          ? 'border-chocolate bg-chocolate/5 dark:bg-chocolate/10'
                          : 'border-gray-200 dark:border-gray-600 hover:border-chocolate/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="pickupType"
                        value={val}
                        checked={pickupType === val}
                        onChange={() => { setPickupType(val); setPickupTime(''); }}
                        className="accent-chocolate"
                      />
                      <span className={`text-sm font-medium ${pickupType === val ? 'text-chocolate' : 'text-gray-700 dark:text-gray-300'}`}>
                        {PICKUP_SCHEDULE_LABEL[val]}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Time input for today/tomorrow */}
                {needsPickupTime && (
                  <div className="mt-3">
                    <label
                      htmlFor="pickup-time"
                      className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block"
                    >
                      Pilih Jam Pengambilan <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="pickup-time"
                      type="time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      aria-required="true"
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-chocolate outline-none text-sm text-gray-800 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                    {!pickupTime && (
                      <p className="text-red-500 text-xs mt-1">Jam pengambilan wajib diisi</p>
                    )}
                  </div>
                )}
              </div>

              {/* Tombol konfirmasi */}
              <motion.button
                onClick={handleConfirm}
                disabled={!canConfirm || uploading}
                whileHover={canConfirm ? { scale: 1.02 } : {}}
                whileTap={canConfirm ? { scale: 0.98 } : {}}
                className={`w-full py-4 rounded-full font-semibold flex items-center justify-center space-x-2 transition-all ${
                  canConfirm && !uploading
                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.528 5.845L0 24l6.335-1.508A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.65-.49-5.19-1.348l-.37-.22-3.762.895.952-3.67-.242-.38A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
                <span>
                  {uploading ? 'Mengupload...' :
                   needsPickupTime && !pickupTime ? 'Isi jam pengambilan dulu' :
                   paymentMethod === PAYMENT_METHOD.QRIS && !proofUrl ? 'Upload bukti dulu' :
                   'Konfirmasi & Chat WhatsApp'}
                </span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;
