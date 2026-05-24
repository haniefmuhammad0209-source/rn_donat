import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiMessageSquare, FiSend, FiX, FiLogOut, FiChevronDown } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection, addDoc, onSnapshot,
  orderBy, query, serverTimestamp,
  limit, startAfter, getDocs,
} from 'firebase/firestore';
import { auth, db, loginWithGoogle, logout } from '../firebase';
import { testimonials as defaultTestimonials } from '../data/products';
import { TestimoniGridSkeleton } from './Skeleton';

const PAGE_SIZE = 4;

const timeAgo = (timestamp) => {
  if (!timestamp) return 'Baru saja';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'Baru saja';
  if (minutes < 60) return `${minutes} menit yang lalu`;
  if (hours < 24) return `${hours} jam yang lalu`;
  if (days < 7) return `${days} hari yang lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const StarPicker = ({ value, onChange }) => (
  <div className="flex space-x-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button key={star} type="button" onClick={() => onChange(star)}
        className="focus:outline-none transition-transform hover:scale-110">
        <FiStar className={`w-7 h-7 transition-colors ${star <= value ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
      </button>
    ))}
  </div>
);

const Avatar = ({ src, name, size = 'md' }) => {
  const [imgError, setImgError] = useState(false);
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-12 h-12 text-sm';
  const initials = name ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  if (src && !imgError) {
    return (
      <img src={src} alt={name} referrerPolicy="no-referrer" onError={() => setImgError(true)}
        className={`${sizeClass} rounded-full object-cover border-2 border-pastel-pink flex-shrink-0`} />
    );
  }
  return (
    <div className={`${sizeClass} rounded-full bg-chocolate text-white flex items-center justify-center font-bold border-2 border-pastel-pink flex-shrink-0`}>
      {initials}
    </div>
  );
};

const TestimoniCard = ({ testimonial, index, isFirestore }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.05 }}
    whileHover={{ y: -8 }}
    className="bg-cream dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 relative"
  >
    {isFirestore && (
      <span className="absolute top-4 right-4 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
        Baru
      </span>
    )}
    <div className="text-pastel-pink mb-4">
      <FiMessageSquare className="w-8 h-8" />
    </div>
    <div className="flex items-center space-x-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <FiStar key={i} className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-500 fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
      ))}
    </div>
    <p className="text-gray-800 dark:text-gray-200 mb-6 leading-relaxed">{testimonial.text}</p>
    <div className="flex items-center space-x-4">
      <Avatar src={testimonial.avatar} name={testimonial.name} />
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {testimonial.createdAt ? timeAgo(testimonial.createdAt) : testimonial.date}
        </p>
      </div>
    </div>
  </motion.div>
);

const Testimoni = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [firestoreTestimonials, setFirestoreTestimonials] = useState([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ text: '', rating: 0 });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Listen auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  // Load testimoni pertama (real-time untuk batch pertama)
  useEffect(() => {
    const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'), limit(PAGE_SIZE));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setFirestoreTestimonials(data);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
      setLoadingTestimonials(false);
    }, () => setLoadingTestimonials(false));
    return unsub;
  }, []);

  const loadMore = async () => {
    if (!lastDoc || loadingMore) return;
    setLoadingMore(true);
    try {
      const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(PAGE_SIZE));
      const snapshot = await getDocs(q);
      const newData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setFirestoreTestimonials((prev) => [...prev, ...newData]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    try {
      await loginWithGoogle();
      setShowForm(true);
    } catch (err) {
      console.error('Login gagal:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowForm(false);
  };

  const validate = () => {
    const e = {};
    if (!form.text.trim()) e.text = 'Testimoni tidak boleh kosong';
    if (form.text.trim().length < 10) e.text = 'Testimoni minimal 10 karakter';
    if (form.rating === 0) e.rating = 'Pilih rating bintang';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'testimonials'), {
        name: user.displayName || 'Pengguna Google',
        avatar: user.photoURL || null,
        uid: user.uid,
        text: form.text.trim(),
        rating: form.rating,
        createdAt: serverTimestamp(),
      });
      setForm({ text: '', rating: 0 });
      setErrors({});
      setShowForm(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      console.error('Gagal simpan testimoni:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const firestoreIds = new Set(firestoreTestimonials.map((t) => t.id));
  const allTestimonials = [...firestoreTestimonials, ...defaultTestimonials];

  return (
    <section id="testimonials" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-chocolate dark:text-pastel-pink font-elegant mb-4">Apa Kata Pelanggan Kami</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">Testimoni nyata dari pelanggan yang telah mencicipi donat premium kami</p>
          <div className="w-24 h-1 bg-gradient-to-r from-pastel-pink to-chocolate mx-auto mt-6 rounded-full"></div>
        </motion.div>

        {/* Success Toast */}
        <AnimatePresence>
          {submitted && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="mb-8 bg-green-50 border border-green-200 text-green-700 rounded-2xl px-6 py-4 text-center font-medium">
              ✅ Terima kasih! Testimoni kamu sudah ditambahkan dan bisa dilihat semua orang.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading state */}
        {loadingTestimonials ? (
          <div className="mb-8">
            <TestimoniGridSkeleton count={4} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {allTestimonials.map((t, index) => (
              <TestimoniCard key={t.id} testimonial={t} index={index} isFirestore={firestoreIds.has(t.id)} />
            ))}
          </div>
        )}

        {/* Load More */}
        {!loadingTestimonials && hasMore && (
          <div className="text-center mb-8">
            <motion.button
              onClick={loadMore}
              disabled={loadingMore}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-cream dark:bg-gray-700 border-2 border-chocolate/20 text-chocolate dark:text-pastel-pink px-8 py-3 rounded-full font-medium hover:border-chocolate transition-all duration-200 inline-flex items-center space-x-2 disabled:opacity-60"
            >
              {loadingMore ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : <FiChevronDown className="w-4 h-4" />}
              <span>{loadingMore ? 'Memuat...' : 'Lihat Lebih Banyak'}</span>
            </motion.button>
          </div>
        )}

        {/* CTA Area */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">

          {/* Belum login */}
          {!user && !showForm && (
            <div className="flex flex-col items-center space-y-3">
              <p className="text-gray-500 text-sm">Login dengan Google untuk menulis testimoni</p>
              <motion.button onClick={handleGoogleLogin} disabled={authLoading}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-3.5 rounded-full font-semibold hover:border-chocolate hover:text-chocolate transition-all duration-200 inline-flex items-center space-x-3 shadow-md disabled:opacity-60">
                {authLoading ? (
                  <svg className="w-5 h-5 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04-2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                <span>{authLoading ? 'Menghubungkan...' : 'Login dengan Google'}</span>
              </motion.button>
            </div>
          )}

          {/* Sudah login, belum buka form */}
          {user && !showForm && (
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-3 bg-cream px-5 py-3 rounded-full shadow-sm">
                <Avatar src={user.photoURL} name={user.displayName} size="sm" />
                <span className="text-gray-700 font-medium text-sm">{user.displayName}</span>
                <button type="button" onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors ml-1" title="Logout">
                  <FiLogOut className="w-4 h-4" />
                </button>
              </div>
              <motion.button onClick={() => setShowForm(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="bg-chocolate text-white px-8 py-4 rounded-full font-semibold hover:bg-dark-chocolate transition-colors duration-200 inline-flex items-center space-x-2">
                <FiMessageSquare className="w-5 h-5" />
                <span>Tulis Testimoni</span>
              </motion.button>
            </div>
          )}

          {/* Form testimoni */}
          <AnimatePresence>
            {user && showForm && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="max-w-lg mx-auto bg-cream dark:bg-gray-800 rounded-3xl p-8 shadow-xl text-left">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Avatar src={user.photoURL} name={user.displayName} size="sm" />
                    <div>
                      <p className="font-semibold text-chocolate text-sm">{user.displayName}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => { setShowForm(false); setErrors({}); }}
                    className="w-8 h-8 bg-chocolate/10 rounded-full flex items-center justify-center hover:bg-chocolate/20 transition-colors cursor-pointer">
                    <FiX className="w-4 h-4 text-chocolate" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Rating</label>
                    <StarPicker value={form.rating} onChange={(r) => { setForm({ ...form, rating: r }); setErrors({ ...errors, rating: '' }); }} />
                    {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Testimoni</label>
                    <textarea value={form.text}
                      onChange={(e) => { setForm({ ...form, text: e.target.value }); setErrors({ ...errors, text: '' }); }}
                      placeholder="Ceritakan pengalaman kamu dengan donat kami..."
                      rows={4}
                      className={`w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-gray-700 dark:text-white outline-none transition-colors resize-none ${errors.text ? 'border-red-400' : 'border-gray-200 dark:border-gray-600 focus:border-chocolate'}`}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {errors.text ? <p className="text-red-500 text-xs">{errors.text}</p> : <span />}
                      <span className="text-xs text-gray-400">{form.text.length} karakter</span>
                    </div>
                  </div>

                  <motion.button type="submit" disabled={submitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full bg-chocolate text-white py-4 rounded-full font-semibold hover:bg-dark-chocolate transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-60">
                    {submitting ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    ) : <FiSend className="w-4 h-4" />}
                    <span>{submitting ? 'Mengirim...' : 'Kirim Testimoni'}</span>
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimoni;
