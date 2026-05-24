import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiPhone, FiFileText, FiCheck } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { orderService } from '../services/orderService';
import { settingsService } from '../services/settingsService';
import { cloudinaryService } from '../services/cloudinaryService';
import { formatRupiah } from '../utils/format';
import { PAYMENT_METHOD, PAYMENT_METHOD_LABEL, WA_NUMBER } from '../utils/constants';
import { usePageSEO } from '../hooks/usePageSEO';

const InputField = ({ label, icon: Icon, error, ...props }) => (
  <div>
    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />}
      <input
        {...props}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 rounded-xl border-2 bg-white dark:bg-gray-800 dark:text-white outline-none transition-colors text-sm ${
          error ? 'border-red-400' : 'border-gray-200 dark:border-gray-600 focus:border-chocolate'
        }`}
      />
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const toast = useToast();

  usePageSEO({ title: 'Checkout' });

  const [form, setForm] = useState({ name: '', phone: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHOD.QRIS);
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [step, setStep] = useState(1);
  const [qrisUrl, setQrisUrl] = useState('');

  // Load QRIS URL dari Firestore settings
  useEffect(() => {
    const unsub = settingsService.subscribe((s) => {
      setQrisUrl(s.qrisImageUrl || '');
    });
    return unsub;
  }, []);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Nama wajib diisi';
    if (!form.phone.trim()) e.phone = 'Nomor HP wajib diisi';
    if (!/^[0-9]{10,13}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Nomor HP tidak valid';
    return e;
  };

  const handleProofFile = (file) => {
    const err = cloudinaryService.validate(file);
    if (err) { toast(err, 'error'); return; }
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setStep(2);
  };

  const handleConfirmOrder = async () => {
    setSubmitting(true);
    try {
      let proofUrl = null;

      // Upload bukti bayar kalau QRIS
      if (paymentMethod === PAYMENT_METHOD.QRIS && proofFile) {
        setUploading(true);
        proofUrl = await cloudinaryService.upload(proofFile, setUploadProgress);
        setUploading(false);
      }

      const orderItems = items.map(item => {
        const toppingText = Object.entries(item.toppings)
          .filter(([, v]) => v > 0)
          .map(([k, v]) => `${v} ${k}`)
          .join(', ') || 'Mix';
        return {
          productId: item.product.id,
          productName: item.product.name,
          category: item.product.category,
          quantity: item.quantity,
          toppings: toppingText,
          notes: item.notes,
          price: item.product.price,
          subtotal: item.product.price * item.quantity,
        };
      });

      const id = await orderService.create({
        items: orderItems,
        customerName: form.name.trim(),
        customerPhone: form.phone.trim(),
        notes: form.notes.trim(),
        paymentMethod,
        paymentProof: proofUrl,
        totalPrice,
        totalBoxes: totalItems,
      });

      setOrderId(id);
      clearCart();
      setStep(3);

      // Kirim notif WA ke penjual
      const waMsg = encodeURIComponent(
        `🍩 *Pesanan Baru — RN Donat*\n\n` +
        `👤 Nama: ${form.name}\n` +
        `📱 HP: ${form.phone}\n` +
        `💳 Pembayaran: ${PAYMENT_METHOD_LABEL[paymentMethod]}\n` +
        `📦 Total: ${totalItems} kotak\n` +
        `💰 Total Harga: ${formatRupiah(totalPrice)}\n` +
        (form.notes ? `📝 Catatan: ${form.notes}\n` : '') +
        `\nDetail pesanan:\n${orderItems.map(i => `• ${i.productName} x${i.quantity} — ${i.toppings}`).join('\n')}`
      );
      window.open(`https://wa.me/${WA_NUMBER}?text=${waMsg}`, '_blank');

    } catch (err) {
      toast('Gagal membuat pesanan. Coba lagi.', 'error');
      console.error(err);
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  if (items.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen bg-cream dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🍩</div>
          <h2 className="text-xl font-bold text-chocolate dark:text-pastel-pink mb-2">Keranjang Kosong</h2>
          <p className="text-gray-500 mb-6">Tambahkan donat dulu sebelum checkout</p>
          <button onClick={() => navigate('/')} className="bg-chocolate text-white px-6 py-3 rounded-full font-semibold hover:bg-dark-chocolate transition-colors">
            Lihat Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-4 flex items-center space-x-3">
        <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/')}
          className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <FiArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="font-bold text-gray-800 dark:text-white font-elegant text-lg">Checkout</h1>
        {/* Step indicator */}
        <div className="ml-auto flex items-center space-x-1">
          {[1, 2, 3].map(s => (
            <div key={s} className={`w-2 h-2 rounded-full transition-colors ${s <= step ? 'bg-chocolate' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Step 1: Form */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            {/* Order summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm mb-4">
              <h3 className="font-bold text-gray-800 dark:text-white mb-3">Ringkasan Pesanan</h3>
              <div className="space-y-2">
                {items.map(item => {
                  const toppingText = Object.entries(item.toppings).filter(([,v]) => v > 0).map(([k,v]) => `${v} ${k}`).join(', ') || 'Mix';
                  return (
                    <div key={item.key} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{item.product.name} x{item.quantity} — {toppingText}</span>
                      <span className="font-medium text-gray-800 dark:text-white">{formatRupiah(item.product.price * item.quantity)}</span>
                    </div>
                  );
                })}
                <div className="border-t border-gray-100 dark:border-gray-700 pt-2 flex justify-between font-bold">
                  <span className="text-gray-800 dark:text-white">Total</span>
                  <span className="text-chocolate">{formatRupiah(totalPrice)}</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitForm} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-800 dark:text-white">Data Pemesan</h3>
              <InputField label="Nama Lengkap" icon={FiUser} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Masukkan nama kamu" error={errors.name} />
              <InputField label="Nomor HP / WhatsApp" icon={FiPhone} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="08xxxxxxxxxx" type="tel" error={errors.phone} />
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">Catatan (opsional)</label>
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Alamat pengambilan, waktu, atau catatan lain..." rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white outline-none focus:border-chocolate transition-colors resize-none text-sm" />
              </div>
              <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full bg-chocolate text-white py-4 rounded-full font-semibold hover:bg-dark-chocolate transition-colors">
                Lanjut ke Pembayaran →
              </motion.button>
            </form>
          </motion.div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            {/* Pilih metode */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-800 dark:text-white mb-4">Metode Pembayaran</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(PAYMENT_METHOD).map(([, val]) => (
                  <button key={val} onClick={() => setPaymentMethod(val)}
                    className={`p-4 rounded-2xl border-2 text-center transition-all ${
                      paymentMethod === val ? 'border-chocolate bg-chocolate/5' : 'border-gray-200 dark:border-gray-600 hover:border-chocolate/40'
                    }`}>
                    <div className="text-2xl mb-1">{val === PAYMENT_METHOD.QRIS ? '📱' : '💵'}</div>
                    <div className={`text-sm font-semibold ${paymentMethod === val ? 'text-chocolate' : 'text-gray-600 dark:text-gray-400'}`}>
                      {PAYMENT_METHOD_LABEL[val]}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* QRIS */}
            {paymentMethod === PAYMENT_METHOD.QRIS && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-800 dark:text-white">Scan QRIS</h3>
                {qrisUrl ? (
                  <img src={qrisUrl} alt="QRIS RN Donat" className="w-48 h-48 mx-auto rounded-2xl object-contain border border-gray-100" />
                ) : (
                  <div className="w-48 h-48 mx-auto rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <p className="text-gray-400 text-sm text-center px-4">QRIS belum dikonfigurasi</p>
                  </div>
                )}
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  Transfer <strong className="text-chocolate">{formatRupiah(totalPrice)}</strong> ke QRIS di atas
                </p>
                {/* Upload bukti */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Upload Bukti Pembayaran</label>
                  <div onClick={() => document.getElementById('proof-input').click()}
                    className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-2xl p-4 text-center cursor-pointer hover:border-chocolate transition-colors">
                    {proofPreview ? (
                      <img src={proofPreview} alt="Bukti" className="w-full h-32 object-cover rounded-xl" />
                    ) : (
                      <div className="text-gray-400 py-4">
                        <p className="text-sm">Klik untuk upload foto bukti transfer</p>
                        <p className="text-xs mt-1">JPG, PNG · Maks 5MB</p>
                      </div>
                    )}
                  </div>
                  <input id="proof-input" type="file" accept="image/*" className="hidden"
                    onChange={e => { if (e.target.files[0]) handleProofFile(e.target.files[0]); }} />
                </div>
              </div>
            )}

            {/* COD info */}
            {paymentMethod === PAYMENT_METHOD.COD && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5">
                <p className="text-blue-700 dark:text-blue-300 text-sm font-medium">💵 Bayar Langsung</p>
                <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">
                  Siapkan uang <strong>{formatRupiah(totalPrice)}</strong> saat mengambil pesanan atau saat kurir tiba.
                </p>
              </div>
            )}

            <motion.button
              onClick={handleConfirmOrder}
              disabled={submitting || (paymentMethod === PAYMENT_METHOD.QRIS && !proofFile)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-full font-semibold transition-colors disabled:opacity-60 flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : <FiCheck className="w-5 h-5" />}
              <span>{submitting ? 'Memproses...' : 'Konfirmasi Pesanan'}</span>
            </motion.button>
          </motion.div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheck className="w-10 h-10 text-green-500" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white font-elegant mb-2">Pesanan Diterima!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              {paymentMethod === PAYMENT_METHOD.QRIS
                ? 'Pembayaran kamu sedang diverifikasi oleh admin.'
                : 'Pesanan kamu sudah masuk. Siapkan pembayaran saat pengambilan.'}
            </p>
            {orderId && <p className="text-xs text-gray-400 mb-6">ID Pesanan: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{orderId.slice(0, 8)}</code></p>}
            <button onClick={() => navigate('/')}
              className="bg-chocolate text-white px-8 py-3.5 rounded-full font-semibold hover:bg-dark-chocolate transition-colors">
              Kembali ke Beranda
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
