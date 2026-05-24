import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, onSnapshot, orderBy, query, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import { productService } from '../services/productService';
import { settingsService } from '../services/settingsService';
import { orderService } from '../services/orderService';
import { timeAgo, formatRupiah } from '../utils/format';
import { sendStatusNotification } from '../utils/waNotification';
import { PRODUCT_CATEGORIES, ORDER_STATUS, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from '../utils/constants';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import {
  FiTrash2, FiLogOut, FiStar, FiShield, FiMessageSquare,
  FiPackage, FiEdit2, FiPlus, FiToggleLeft, FiToggleRight,
  FiBarChart2, FiBox, FiSave, FiX, FiChevronDown, FiUsers, FiPhone,
} from 'react-icons/fi';
import ImageUploader from '../components/ImageUploader';

const Avatar = ({ src, name, size = 'md' }) => {
  const [err, setErr] = useState(false);
  const cls = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  if (src && !err) return <img src={src} alt={name} referrerPolicy="no-referrer" onError={() => setErr(true)} className={`${cls} rounded-full object-cover border-2 border-gray-200`} />;
  return <div className={`${cls} rounded-full bg-chocolate text-white flex items-center justify-center font-bold border-2 border-gray-200`}>{initials}</div>;
};

const STATUS_COLORS = ORDER_STATUS_COLOR;

const EMPTY_PRODUCT = {
  name: '', description: '', price: 15000,
  image: '', category: 'Coklat', rating: 4.5,
  bestseller: false, perBox: 6,
};

const ProductForm = ({ initial, onSave, onCancel, saving }) => {
  const [form, setForm] = useState(initial || EMPTY_PRODUCT);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
      <h3 className="font-bold text-gray-800">{initial?.id ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Nama Produk</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Donat Coklat" className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-chocolate outline-none text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Kategori</label>
          <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-chocolate outline-none text-sm bg-white">
            {PRODUCT_CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Harga (Rp)</label>
          <input type="number" value={form.price} onChange={e => set('price', Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-chocolate outline-none text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Rating (1-5)</label>
          <input type="number" min="1" max="5" step="0.1" value={form.rating} onChange={e => set('rating', Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-chocolate outline-none text-sm" />
        </div>
        <div className="sm:col-span-2">
          <ImageUploader value={form.image} onChange={(url) => set('image', url)} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Deskripsi</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-chocolate outline-none text-sm resize-none" />
        </div>
        <div className="flex items-center space-x-3">
          <input type="checkbox" id="bestseller" checked={form.bestseller} onChange={e => set('bestseller', e.target.checked)} className="w-4 h-4 accent-chocolate" />
          <label htmlFor="bestseller" className="text-sm font-medium text-gray-700">Tandai sebagai Bestseller</label>
        </div>
      </div>
      <div className="flex space-x-3 pt-2">
        <button onClick={() => onSave(form)} disabled={saving || !form.name}
          className="flex items-center space-x-2 bg-chocolate text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-dark-chocolate transition-colors disabled:opacity-60">
          {saving ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> : <FiSave className="w-4 h-4" />}
          <span>{saving ? 'Menyimpan...' : 'Simpan'}</span>
        </button>
        <button onClick={onCancel} className="flex items-center space-x-2 border-2 border-gray-200 text-gray-600 px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors">
          <FiX className="w-4 h-4" /><span>Batal</span>
        </button>
      </div>
    </div>
  );
};

const Admin = () => {
  const { user, loading, isAdmin } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('stats');
  const [testimonials, setTestimonials] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [storeSettings, setStoreSettings] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    const q1 = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
    const q2 = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const u1 = onSnapshot(q1, snap => setTestimonials(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u2 = onSnapshot(q2, snap => setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u3 = productService.subscribeAll(setProducts);
    const u4 = settingsService.subscribe(setStoreSettings);
    return () => { u1(); u2(); u3(); u4(); };
  }, [isAdmin]);

  const handleDeleteTestimoni = async (id) => {
    setDeleting(id);
    try {
      await deleteDoc(doc(db, 'testimonials', id));
      toast('Testimoni berhasil dihapus', 'success');
    } catch {
      toast('Gagal menghapus testimoni', 'error');
    } finally { setDeleting(null); setConfirmDelete(null); }
  };

  const handleSaveProduct = async (form) => {
    setSavingProduct(true);
    try {
      if (editingProduct?.id) {
        await productService.update(editingProduct.id, form);
        toast('Produk berhasil diupdate', 'success');
      } else {
        await productService.add(form);
        toast('Produk berhasil ditambahkan', 'success');
      }
      setShowProductForm(false);
      setEditingProduct(null);
    } catch {
      toast('Gagal menyimpan produk', 'error');
    } finally { setSavingProduct(false); }
  };

  const handleDeleteProduct = async (id) => {
    setDeleting(id);
    try {
      await productService.delete(id);
      toast('Produk berhasil dihapus', 'success');
    } catch {
      toast('Gagal menghapus produk', 'error');
    } finally { setDeleting(null); setConfirmDelete(null); }
  };

  const handleToggleStore = async () => {
    if (!storeSettings) return;
    await settingsService.toggleStore(!storeSettings.isOpen);
    toast(storeSettings.isOpen ? 'Toko ditutup' : 'Toko dibuka', 'info');
  };

  const handleUpdateOrderStatus = async (id, status, order) => {
    try {
      await orderService.updateStatus(id, status);
      toast(`Status diubah ke: ${ORDER_STATUS_LABEL[status]}`, 'success');
      // Kirim notif WA ke customer
      if (order?.customerPhone) {
        sendStatusNotification({ ...order, id }, status);
      }
    } catch {
      toast('Gagal update status', 'error');
    }
  };

  // Chart data — orders per hari 7 hari terakhir
  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
      const count = orders.filter(o => {
        if (!o.createdAt) return false;
        const od = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
        return od.toDateString() === d.toDateString();
      }).length;
      const revenue = orders.filter(o => {
        if (!o.createdAt) return false;
        const od = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
        return od.toDateString() === d.toDateString();
      }).reduce((s, o) => s + (o.totalPrice || 0), 0);
      days.push({ label, count, revenue });
    }
    return days;
  }, [orders]);

  // Customer list — unique by phone
  const customers = useMemo(() => {
    const map = new Map();
    orders.forEach(o => {
      if (!o.customerPhone) return;
      if (!map.has(o.customerPhone)) {
        map.set(o.customerPhone, {
          phone: o.customerPhone,
          name: o.customerName || 'Pelanggan',
          orderCount: 0,
          totalSpent: 0,
          lastOrder: null,
        });
      }
      const c = map.get(o.customerPhone);
      c.orderCount++;
      c.totalSpent += o.totalPrice || 0;
      if (!c.lastOrder || (o.createdAt && o.createdAt > c.lastOrder)) {
        c.lastOrder = o.createdAt;
      }
    });
    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  // Stats
  const totalRevenue = orders.reduce((s, o) => s + (o.totalPrice || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const avgRating = testimonials.length > 0
    ? (testimonials.reduce((a, t) => a + t.rating, 0) / testimonials.length).toFixed(1) : '-';
  const thisWeekOrders = orders.filter(o => {
    if (!o.createdAt) return false;
    const d = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
    return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
  }).length;

  if (loading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-chocolate border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-10 shadow-xl text-center max-w-sm w-full">
        <div className="w-16 h-16 bg-chocolate/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiShield className="w-8 h-8 text-chocolate" />
        </div>
        <h1 className="text-2xl font-bold text-chocolate font-elegant mb-2">Admin Panel</h1>
        <p className="text-gray-500 text-sm mb-6">Login dengan akun Google admin</p>
        <button onClick={authService.loginWithGoogle}
          className="w-full bg-chocolate text-white py-3 rounded-full font-semibold hover:bg-dark-chocolate transition-colors flex items-center justify-center space-x-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Login dengan Google</span>
        </button>
      </motion.div>
    </div>
  );

  if (!isAdmin) return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-10 shadow-xl text-center max-w-sm w-full">
        <div className="text-5xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-red-500 mb-2">Akses Ditolak</h1>
        <p className="text-gray-500 text-sm mb-2">Akun <strong>{user.email}</strong> tidak memiliki akses admin.</p>
        <p className="text-gray-400 text-xs mb-6">UID: <code className="bg-gray-100 px-1 rounded">{user.uid}</code></p>
        <button onClick={authService.logout} className="text-sm text-gray-500 hover:text-red-500 transition-colors">Logout</button>
      </motion.div>
    </div>
  );

  const TABS = [
    { id: 'stats', label: 'Statistik', icon: FiBarChart2 },
    { id: 'products', label: 'Produk', icon: FiBox },
    { id: 'orders', label: 'Pesanan', icon: FiPackage },
    { id: 'customers', label: 'Pelanggan', icon: FiUsers },
    { id: 'testimoni', label: 'Testimoni', icon: FiMessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-chocolate text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <FiShield className="w-6 h-6" />
          <div>
            <h1 className="font-bold text-lg font-elegant">Admin Panel — RN Donat</h1>
            <p className="text-xs text-white/70">Dashboard pengelolaan toko</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Avatar src={user.photoURL} name={user.displayName} size="sm" />
          <span className="text-sm hidden sm:block">{user.displayName}</span>
          <button onClick={authService.logout} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
            <FiLogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Store Toggle */}
        {storeSettings && (
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800 text-sm">Status Toko</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {storeSettings.isOpen ? '🟢 Toko sedang BUKA' : '🔴 Toko sedang TUTUP'}
                  {storeSettings.openOverride && ' (override manual)'}
                </p>
              </div>
              <button onClick={handleToggleStore}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-colors ${
                  storeSettings.isOpen
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                }`}>
                {storeSettings.isOpen ? <FiToggleRight className="w-5 h-5" /> : <FiToggleLeft className="w-5 h-5" />}
                <span>{storeSettings.isOpen ? 'Tutup Toko' : 'Buka Toko'}</span>
              </button>
            </div>
            {/* QRIS URL setting */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">URL Gambar QRIS</p>
              <div className="flex space-x-2">
                <input
                  type="url"
                  defaultValue={storeSettings.qrisImageUrl || ''}
                  id="qris-url-input"
                  placeholder="https://res.cloudinary.com/..."
                  className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-chocolate outline-none text-sm"
                />
                <button
                  onClick={async () => {
                    const val = document.getElementById('qris-url-input').value;
                    await settingsService.update({ qrisImageUrl: val });
                    toast('QRIS URL disimpan', 'success');
                  }}
                  className="bg-chocolate text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-dark-chocolate transition-colors"
                >
                  Simpan
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Upload foto QRIS ke Cloudinary lalu paste URL-nya di sini</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === id ? 'bg-chocolate text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}>
              <Icon className="w-4 h-4" /><span>{label}</span>
            </button>
          ))}
        </div>

        {/* Tab: Statistik */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Produk', value: products.length, color: 'text-chocolate', icon: '🍩' },
                { label: 'Total Pesanan', value: orders.length, color: 'text-blue-500', icon: '📦' },
                { label: 'Pesanan Pending', value: pendingOrders, color: 'text-orange-500', icon: '⏳' },
                { label: 'Pesanan Minggu Ini', value: thisWeekOrders, color: 'text-green-500', icon: '📈' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-gray-500 text-xs mt-1">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <p className="text-gray-500 text-sm mb-1">Rating Rata-rata</p>
                <div className="flex items-center space-x-2">
                  <span className="text-4xl font-bold text-yellow-500">{avgRating}</span>
                  <FiStar className="w-6 h-6 text-yellow-400 fill-current" />
                </div>
                <p className="text-xs text-gray-400 mt-1">dari {testimonials.length} testimoni</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <p className="text-gray-500 text-sm mb-1">Total Pendapatan</p>
                <div className="text-3xl font-bold text-chocolate">{formatRupiah(totalRevenue)}</div>
                <p className="text-xs text-gray-400 mt-1">dari {orders.length} pesanan tercatat</p>
              </div>
            </div>

            {/* Chart pesanan 7 hari */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">Pesanan 7 Hari Terakhir</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B4513" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B4513" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip formatter={(v) => [`${v} pesanan`, 'Jumlah']} />
                  <Area type="monotone" dataKey="count" stroke="#8B4513" fill="url(#colorCount)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Chart pendapatan 7 hari */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">Pendapatan 7 Hari Terakhir</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => [formatRupiah(v), 'Pendapatan']} />
                  <Bar dataKey="revenue" fill="#8B4513" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab: Produk */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {!showProductForm && (
              <button onClick={() => { setEditingProduct(null); setShowProductForm(true); }}
                className="flex items-center space-x-2 bg-chocolate text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-dark-chocolate transition-colors">
                <FiPlus className="w-4 h-4" /><span>Tambah Produk</span>
              </button>
            )}
            {showProductForm && (
              <ProductForm
                initial={editingProduct}
                onSave={handleSaveProduct}
                onCancel={() => { setShowProductForm(false); setEditingProduct(null); }}
                saving={savingProduct}
              />
            )}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-800">Semua Produk ({products.length})</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {products.map(p => (
                  <div key={p.id} className="px-6 py-4 flex items-center space-x-4 hover:bg-gray-50 transition-colors">
                    <img src={p.image} alt={p.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-800 text-sm">{p.name}</span>
                        {p.bestseller && <span className="text-xs bg-chocolate/10 text-chocolate px-2 py-0.5 rounded-full">Bestseller</span>}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{p.category} · {formatRupiah(p.price)} · ⭐ {p.rating}</p>
                    </div>
                    <div className="flex space-x-2 flex-shrink-0">
                      <button onClick={() => { setEditingProduct(p); setShowProductForm(true); }}
                        className="w-8 h-8 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center hover:bg-blue-100 transition-colors">
                        <FiEdit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setConfirmDelete({ type: 'product', id: p.id })}
                        className="w-8 h-8 bg-red-50 text-red-400 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors">
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Pesanan */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Semua Pesanan ({orders.length})</h2>
            </div>
            {orders.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <FiPackage className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Belum ada pesanan</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {orders.map(order => (
                  <div key={order.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="font-semibold text-gray-800 text-sm">{order.customerName || 'Pelanggan'}</span>
                        {order.customerPhone && <span className="text-xs text-gray-400 ml-2">· {order.customerPhone}</span>}
                        <p className="text-xs text-gray-400 mt-0.5">{timeAgo(order.createdAt)}</p>
                      </div>
                      {/* Status dropdown */}
                      <div className="relative">
                        <select
                          value={order.status || 'pending'}
                          onChange={e => handleUpdateOrderStatus(order.id, e.target.value, order)}
                          className={`text-xs px-2.5 py-1 rounded-full font-medium border-0 outline-none cursor-pointer appearance-none pr-6 ${ORDER_STATUS_COLOR[order.status] || ORDER_STATUS_COLOR.pending}`}
                        >
                          {Object.entries(ORDER_STATUS_LABEL).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                          ))}
                        </select>
                        <FiChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                      </div>
                    </div>
                    {/* Items */}
                    <div className="text-sm text-gray-600 space-y-0.5 mb-2">
                      {order.items?.map((item, i) => (
                        <p key={i}>• {item.productName} x{item.quantity} kotak — {item.toppings}</p>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {order.totalPrice && <span className="text-sm font-bold text-chocolate">{formatRupiah(order.totalPrice)}</span>}
                        {order.paymentMethod && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {order.paymentMethod === 'qris' ? '📱 QRIS' : '💵 COD'}
                          </span>
                        )}
                      </div>
                      {/* Bukti bayar */}
                      {order.paymentProof && (
                        <a href={order.paymentProof} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline flex items-center space-x-1">
                          <span>Lihat bukti bayar</span>
                        </a>
                      )}
                    </div>
                    {order.notes && <p className="text-xs text-gray-400 mt-1 italic">📝 {order.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Pelanggan */}
        {activeTab === 'customers' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiUsers className="w-5 h-5 text-chocolate" />
                <h2 className="font-bold text-gray-800">Pelanggan ({customers.length})</h2>
              </div>
            </div>
            {customers.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <FiUsers className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Belum ada data pelanggan</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {customers.map((c, i) => (
                  <div key={c.phone} className="px-6 py-4 flex items-center space-x-4 hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-chocolate/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-chocolate font-bold text-sm">{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm">{c.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{c.phone} · {c.orderCount} pesanan</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-chocolate text-sm">{formatRupiah(c.totalSpent)}</p>
                      <p className="text-xs text-gray-400">total belanja</p>
                    </div>
                    <a href={`https://wa.me/${c.phone.replace(/\D/g, '').replace(/^0/, '62')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="w-8 h-8 bg-green-50 text-green-500 rounded-full flex items-center justify-center hover:bg-green-100 transition-colors flex-shrink-0">
                      <FiPhone className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Testimoni */}
        {activeTab === 'testimoni' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Semua Testimoni ({testimonials.length})</h2>
            </div>
            {testimonials.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <FiMessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Belum ada testimoni</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {testimonials.map(t => (
                  <motion.div key={t.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="px-6 py-4 flex items-start space-x-4 hover:bg-gray-50 transition-colors">
                    <Avatar src={t.avatar} name={t.name} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-gray-800 text-sm">{t.name}</span>
                        <div className="flex">{[...Array(5)].map((_, i) => (
                          <FiStar key={i} className={`w-3.5 h-3.5 ${i < t.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                        ))}</div>
                      </div>
                      <p className="text-gray-600 text-sm">{t.text}</p>
                      <p className="text-gray-400 text-xs mt-1">{timeAgo(t.createdAt)}</p>
                    </div>
                    <button onClick={() => setConfirmDelete({ type: 'testimoni', id: t.id })}
                      className="w-8 h-8 bg-red-50 text-red-400 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          <a href="/" className="text-chocolate hover:underline">← Kembali ke website</a>
        </p>
      </div>

      {/* Confirm Delete Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onMouseDown={e => { if (e.target === e.currentTarget) setConfirmDelete(null); }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full text-center"
              onMouseDown={e => e.stopPropagation()}>
              <div className="text-4xl mb-3">🗑️</div>
              <h3 className="font-bold text-gray-800 mb-2">Hapus {confirmDelete.type === 'product' ? 'Produk' : 'Testimoni'}?</h3>
              <p className="text-gray-500 text-sm mb-6">Data ini akan dihapus permanen dan tidak bisa dikembalikan.</p>
              <div className="flex space-x-3">
                <button onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors">Batal</button>
                <button
                  onClick={() => confirmDelete.type === 'product' ? handleDeleteProduct(confirmDelete.id) : handleDeleteTestimoni(confirmDelete.id)}
                  disabled={!!deleting}
                  className="flex-1 py-2.5 rounded-full bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center space-x-1">
                  {deleting ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> : <FiTrash2 className="w-4 h-4" />}
                  <span>Hapus</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;
