import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, onSnapshot, orderBy, query, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSettings } from '../context/SettingsContext';
import { authService } from '../services/authService';
import { productService } from '../services/productService';
import { settingsService } from '../services/settingsService';
import { orderService } from '../services/orderService';
import { stockService } from '../services/stockService';
import * as reportService from '../services/reportService';
import { timeAgo, formatRupiah } from '../utils/format';
import { sendStatusNotification, sendAdminNotification, formatPickupSchedule } from '../utils/waNotification';
import { ORDER_STATUS, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from '../utils/constants';
import { calculateTodayStats, calculateMonthStats, getBestSellingProduct, countUniqueCustomers } from '../utils/statsUtils';
import { computeCustomerList, getCustomerHistory } from '../utils/customerUtils';
import { useStockStatus } from '../hooks/useStockStatus';
import { useAdminOrdersListener } from '../hooks/useAdminOrdersListener';
import { useSalesReport } from '../hooks/useSalesReport';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import {
  FiTrash2, FiLogOut, FiStar, FiShield, FiMessageSquare,
  FiPackage, FiEdit2, FiPlus, FiToggleLeft, FiToggleRight,
  FiBarChart2, FiBox, FiSave, FiX, FiChevronDown, FiUsers, FiPhone, FiDollarSign,
  FiFileText, FiArrowLeft, FiDownload,
} from 'react-icons/fi';
import ImageUploader from '../components/ImageUploader';
import { EmptyOrders, EmptyReport, EmptyCustomers, EmptyTestimonials } from '../components/EmptyState';

const Avatar = ({ src, name, size = 'md' }) => {
  const [err, setErr] = useState(false);
  const cls = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  if (src && !err) return <img src={src} alt={name} referrerPolicy="no-referrer" onError={() => setErr(true)} className={`${cls} rounded-full object-cover border-2 border-gray-200`} />;
  return <div className={`${cls} rounded-full bg-chocolate text-white flex items-center justify-center font-bold border-2 border-gray-200`}>{initials}</div>;
};

const STATUS_COLORS = ORDER_STATUS_COLOR;

const PAGE_SIZE = 10;

const AdminOrdersTab = ({ orders, formatRupiah, timeAgo, handleUpdateOrderStatus, handleMarkAsPaid, ORDER_STATUS_COLOR, ORDER_STATUS_LABEL }) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(orders.length / PAGE_SIZE);
  const paginated = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-bold text-gray-800">Semua Pesanan ({orders.length})</h2>
        {totalPages > 1 && (
          <div className="flex items-center space-x-2 text-sm">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">‹</button>
            <span className="text-gray-500">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">›</button>
          </div>
        )}
      </div>
      {orders.length === 0 ? (
        <EmptyOrders size="lg" />
      ) : (
        <div className="divide-y divide-gray-50">
          {paginated.map(order => {
            const isCOD = order.paymentMethod === 'cod';
            const isUnpaid = ['pending', 'processing'].includes(order.status);
            const showMarkPaid = isCOD && isUnpaid;

            return (
              <div key={order.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-semibold text-gray-800 text-sm">{order.customerName || 'Pelanggan'}</span>
                    {order.customerPhone && <span className="text-xs text-gray-400 ml-2">· {order.customerPhone}</span>}
                    <p className="text-xs text-gray-400 mt-0.5">{timeAgo(order.createdAt)}</p>
                  </div>
                  <div className="relative">
                    <select value={order.status || 'pending'}
                      onChange={e => handleUpdateOrderStatus(order.id, e.target.value, order)}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium border-0 outline-none cursor-pointer appearance-none pr-6 ${ORDER_STATUS_COLOR[order.status] || ORDER_STATUS_COLOR.pending}`}>
                      {Object.entries(ORDER_STATUS_LABEL).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-0.5 mb-2">
                  {order.items?.map((item, i) => (
                    <p key={i}>• {item.productName} x{item.quantity} kotak — {item.toppings}</p>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                    {order.totalPrice && <span className="text-sm font-bold text-chocolate">{formatRupiah(order.totalPrice)}</span>}
                    {order.paymentMethod && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {isCOD ? '💵 COD' : '📱 QRIS'}
                      </span>
                    )}
                    {order.paidAt && (
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">
                        ✓ Lunas
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {order.paymentProof && (
                      <a href={order.paymentProof} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline">Lihat bukti</a>
                    )}
                    {/* Tombol Tandai Lunas — hanya untuk COD yang belum paid */}
                    {showMarkPaid && (
                      <button
                        onClick={() => handleMarkAsPaid(order.id, order)}
                        className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded-full font-semibold transition-colors"
                      >
                        <FiDollarSign className="w-3 h-3" />
                        <span>Tandai Lunas</span>
                      </button>
                    )}
                  </div>
                </div>
                {order.notes && <p className="text-xs text-gray-400 mt-1 italic">📝 {order.notes}</p>}
                {order.pickupSchedule && (
                  <p className="text-xs text-blue-500 mt-1">
                    {formatPickupSchedule(order.pickupSchedule)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

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
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Donat Coklat" className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-chocolate outline-none text-sm text-gray-800" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Kategori</label>
          <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-chocolate outline-none text-sm bg-white text-gray-800">
            {['Coklat', 'Matcha', 'Cappuccino', 'Red Velvet', 'Tiramisu', 'Mix'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Harga (Rp)</label>
          <input type="number" value={form.price} onChange={e => set('price', Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-chocolate outline-none text-sm text-gray-800" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Rating (1-5)</label>
          <input type="number" min="1" max="5" step="0.1" value={form.rating} onChange={e => set('rating', Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-chocolate outline-none text-sm text-gray-800" />
        </div>
        <div className="sm:col-span-2">
          <ImageUploader value={form.image} onChange={(url) => set('image', url)} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Deskripsi</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-chocolate outline-none text-sm resize-none text-gray-800" />
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
  const { settings: storeSettings } = useSettings();
  const qrisInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('stats');
  const [testimonials, setTestimonials] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);
  // Customer history
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState(null);
  // Stock management state
  const [stockInput, setStockInput] = useState('');
  const [thresholdInput, setThresholdInput] = useState('');
  const [savingStock, setSavingStock] = useState(false);

  // Stock real-time subscription
  const { stock, threshold, isLow } = useStockStatus();

  // Sales report hook
  const salesReport = useSalesReport(orders);

  useEffect(() => {
    if (!isAdmin) return;
    // Initialize stock document if not exists
    stockService.initStock().catch(err => console.error('[Stock] Init error:', err));
    
    const q1 = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
    const q2 = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const u1 = onSnapshot(q1, snap => setTestimonials(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u2 = onSnapshot(q2, snap => setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u3 = productService.subscribeAll(setProducts);
    return () => { u1(); u2(); u3(); };
  }, [isAdmin]);

  // Admin notification for new orders (Task 6.2, 6.3)
  const handleNewOrder = useCallback((order) => {
    // Browser push notification
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('Pesanan Baru 🍩', {
        body: `${order.customerName || 'Pelanggan'} — ${formatRupiah(order.totalPrice || 0)}`,
      });
    }
    // WA notification to admin
    sendAdminNotification(order);
  }, []);

  useAdminOrdersListener({ onNewOrder: handleNewOrder });

  // Request browser notification permission once (Task 6.2)
  useEffect(() => {
    if (!isAdmin) return;
    if (typeof Notification === 'undefined') return;
    const alreadyAsked = localStorage.getItem('rn_donat_admin_notif_asked');
    if (!alreadyAsked && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        localStorage.setItem('rn_donat_admin_notif_asked', permission);
      });
    }
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

  const handleMarkAsPaid = async (id, order) => {
    try {
      await orderService.markAsPaid(id);
      toast('Pesanan ditandai lunas 💰', 'success');
      // Kirim notif WA ke customer
      if (order?.customerPhone) {
        sendStatusNotification({ ...order, id }, 'paid');
      }
    } catch {
      toast('Gagal menandai lunas', 'error');
    }
  };

  // Chart data — orders per hari 7 hari terakhir (single pass)
  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      const label = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
      let count = 0;
      let revenue = 0;
      for (const o of orders) {
        if (!o.createdAt) continue;
        const od = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
        if (od.toDateString() === dateStr) {
          count++;
          // Revenue hanya dari order yang sudah paid/completed
          if (['paid', 'completed'].includes(o.status)) {
            revenue += o.totalPrice || 0;
          }
        }
      }
      days.push({ label, count, revenue });
    }
    return days;
  }, [orders]);

  // Customer list — unique by phone (using customerUtils)
  const customers = useMemo(() => computeCustomerList(orders), [orders]);

  // Stats — revenue hanya dari order yang sudah paid/completed
  const paidOrders = orders.filter(o => ['paid', 'completed'].includes(o.status));
  const totalRevenue = paidOrders.reduce((s, o) => s + (o.totalPrice || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const avgRating = testimonials.length > 0
    ? (testimonials.reduce((a, t) => a + t.rating, 0) / testimonials.length).toFixed(1) : '-';
  const thisWeekOrders = orders.filter(o => {
    if (!o.createdAt) return false;
    const d = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
    return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
  }).length;

  // Extended stats using statsUtils (Task 4.6)
  const { todayRevenue, todayOrderCount } = useMemo(() => calculateTodayStats(orders), [orders]);
  const { monthRevenue } = useMemo(() => calculateMonthStats(orders), [orders]);
  const bestSeller = useMemo(() => getBestSellingProduct(orders), [orders]);
  const uniqueCustomers = useMemo(() => countUniqueCustomers(orders), [orders]);

  // Pending badge count (Task 6.4)
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  // Customer history for selected customer
  const customerHistory = useMemo(() => {
    if (!selectedCustomerPhone) return null;
    return getCustomerHistory(selectedCustomerPhone, orders);
  }, [selectedCustomerPhone, orders]);

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
    { id: 'reports', label: 'Laporan', icon: FiFileText },
    { id: 'products', label: 'Produk', icon: FiBox },
    { id: 'orders', label: 'Pesanan', icon: FiPackage, badge: pendingCount > 0 ? pendingCount : null },
    { id: 'stock', label: 'Stok', icon: FiBox },
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
                  {storeSettings.openOverride ? ' (override manual)' : ' (jadwal otomatis)'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {/* Reset ke jadwal otomatis */}
                {storeSettings.openOverride && (
                  <button
                    onClick={async () => {
                      await settingsService.update({ openOverride: false });
                      toast('Kembali ke jadwal otomatis', 'info');
                    }}
                    className="text-xs text-gray-500 hover:text-chocolate border border-gray-200 px-3 py-1.5 rounded-full transition-colors"
                  >
                    🔄 Otomatis
                  </button>
                )}
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
            </div>
            {/* QRIS URL setting */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">URL Gambar QRIS</p>
              <div className="flex space-x-2">
                <input
                  type="url"
                  defaultValue={storeSettings.qrisImageUrl || ''}
                  ref={qrisInputRef}
                  placeholder="https://res.cloudinary.com/..."
                  className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-chocolate outline-none text-sm text-gray-800"
                />
                <button
                  onClick={async () => {
                    await settingsService.update({ qrisImageUrl: qrisInputRef.current.value });
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
          {TABS.map(({ id, label, icon: Icon, badge }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all relative ${
                activeTab === id ? 'bg-chocolate text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}>
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              {badge && (
                <span
                  aria-label={`${badge} pesanan pending`}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold"
                >
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab: Statistik */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            {/* Stock warning banner */}
            {isLow && (
              <div className={`rounded-2xl p-4 flex items-center space-x-3 ${stock < 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                <span className="text-2xl">{stock < 0 ? '🚨' : '⚠️'}</span>
                <div>
                  <p className="font-semibold text-sm">
                    {stock < 0 ? `Stok Habis: ${stock} pcs` : `Stok rendah: ${stock} pcs (batas: ${threshold} pcs)`}
                  </p>
                  <p className="text-xs opacity-80 mt-0.5">Segera tambah stok donat polos di tab Stok</p>
                </div>
              </div>
            )}

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

            {/* Extended stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <p className="text-gray-500 text-xs mb-1">Pendapatan Hari Ini</p>
                <div className="text-xl font-bold text-chocolate">{formatRupiah(todayRevenue)}</div>
                <p className="text-xs text-gray-400 mt-1">{todayOrderCount} pesanan</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <p className="text-gray-500 text-xs mb-1">Pendapatan Bulan Ini</p>
                <div className="text-xl font-bold text-purple-600">{formatRupiah(monthRevenue)}</div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <p className="text-gray-500 text-xs mb-1">Produk Terlaris</p>
                <div className="text-sm font-bold text-gray-800">{bestSeller || '—'}</div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <p className="text-gray-500 text-xs mb-1">Pelanggan Unik</p>
                <div className="text-2xl font-bold text-teal-600">{uniqueCustomers}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <p className="text-xs text-gray-400 mt-1">dari {paidOrders.length} pesanan lunas</p>
              </div>
              <div className={`rounded-2xl p-5 shadow-sm ${isLow ? 'bg-orange-50' : 'bg-white'}`}>
                <p className="text-gray-500 text-sm mb-1">Stok Donat Polos</p>
                <div className={`text-3xl font-bold ${stock < 0 ? 'text-red-600' : isLow ? 'text-orange-500' : 'text-green-600'}`}>
                  {stock} pcs
                </div>
                <p className="text-xs text-gray-400 mt-1">batas: {threshold} pcs</p>
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
            <div className="flex items-center space-x-3">
              {!showProductForm && (
                <button onClick={() => { setEditingProduct(null); setShowProductForm(true); }}
                  className="flex items-center space-x-2 bg-chocolate text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-dark-chocolate transition-colors">
                  <FiPlus className="w-4 h-4" /><span>Tambah Produk</span>
                </button>
              )}
              {/* Tombol migrate — hanya tampil kalau Firestore kosong */}
              {products.length === 0 && !showProductForm && (
                <button
                  onClick={async () => {
                    const staticProds = [
                      { name: 'Donat Coklat', description: 'Donat lembut dengan rasa coklat premium.', price: 15000, image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&h=500&fit=crop', category: 'Coklat', rating: 4.8, bestseller: true, perBox: 6 },
                      { name: 'Donat Matcha', description: 'Donat dengan matcha Jepang asli yang creamy.', price: 15000, image: 'https://images.unsplash.com/photo-1626803775151-61d756612fcd?w=500&h=500&fit=crop', category: 'Matcha', rating: 4.9, bestseller: true, perBox: 6 },
                      { name: 'Donat Cappuccino', description: 'Donat dengan rasa kopi cappuccino yang otentik.', price: 15000, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=500&fit=crop', category: 'Cappuccino', rating: 4.7, bestseller: false, perBox: 6 },
                      { name: 'Donat Red Velvet', description: 'Donat dengan tekstur red velvet yang lembut.', price: 15000, image: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=500&h=500&fit=crop', category: 'Red Velvet', rating: 4.9, bestseller: true, perBox: 6 },
                      { name: 'Donat Tiramisu', description: 'Donat dengan rasa tiramisu otentik dan creamy.', price: 15000, image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&h=500&fit=crop', category: 'Tiramisu', rating: 4.8, bestseller: false, perBox: 6 },
                      { name: 'Donat Mix', description: '1 kotak berisi 6 donat campuran berbagai rasa.', price: 15000, image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&h=500&fit=crop', category: 'Mix', rating: 5.0, bestseller: true, perBox: 6 },
                    ];
                    for (const p of staticProds) await productService.add(p);
                    toast('Semua produk berhasil dimigrate ke Firestore', 'success');
                  }}
                  className="flex items-center space-x-2 bg-blue-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-600 transition-colors"
                >
                  <span>⬆️ Import Produk Default</span>
                </button>
              )}
            </div>
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

        {/* Tab: Laporan (Task 7.5) */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-gray-800 mb-4">Laporan Penjualan</h2>

              {/* Filter mode toggle */}
              <div className="flex space-x-2 mb-4">
                {[
                  { mode: 'month', label: 'Per Bulan' },
                  { mode: 'range', label: 'Rentang Tanggal' },
                ].map(({ mode, label }) => (
                  <button key={mode}
                    onClick={() => salesReport.setFilterMode(mode)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      salesReport.filterMode === mode
                        ? 'bg-chocolate text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Filter inputs */}
              {salesReport.filterMode === 'month' ? (
                <div className="mb-4">
                  <label htmlFor="report-month" className="text-xs font-semibold text-gray-600 mb-1 block">Pilih Bulan</label>
                  <input
                    id="report-month"
                    type="month"
                    value={salesReport.selectedMonth}
                    onChange={e => salesReport.setSelectedMonth(e.target.value)}
                    aria-label="Pilih bulan laporan"
                    className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-chocolate outline-none text-sm text-gray-800"
                  />
                </div>
              ) : (
                <div className="flex flex-wrap gap-3 mb-4">
                  <div>
                    <label htmlFor="report-start" className="text-xs font-semibold text-gray-600 mb-1 block">Dari</label>
                    <input
                      id="report-start"
                      type="date"
                      value={salesReport.startDate}
                      onChange={e => salesReport.setStartDate(e.target.value)}
                      aria-label="Tanggal mulai laporan"
                      className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-chocolate outline-none text-sm text-gray-800"
                    />
                  </div>
                  <div>
                    <label htmlFor="report-end" className="text-xs font-semibold text-gray-600 mb-1 block">Sampai</label>
                    <input
                      id="report-end"
                      type="date"
                      value={salesReport.endDate}
                      onChange={e => salesReport.setEndDate(e.target.value)}
                      aria-label="Tanggal akhir laporan"
                      className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-chocolate outline-none text-sm text-gray-800"
                    />
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500">Jumlah Pesanan</p>
                  <p className="text-xl font-bold text-chocolate">{salesReport.totalOrders}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center col-span-2">
                  <p className="text-xs text-gray-500">Total Pendapatan</p>
                  <p className="text-xl font-bold text-chocolate">{formatRupiah(salesReport.totalRevenue)}</p>
                </div>
              </div>

              {/* Export buttons */}
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={async () => {
                    if (salesReport.rows.length === 0) { toast('Tidak ada data untuk diekspor', 'error'); return; }
                    const fname = `laporan_${salesReport.filterMode === 'month' ? salesReport.selectedMonth : `${salesReport.startDate}_${salesReport.endDate}`}`;
                    await reportService.exportToExcel(salesReport.rows, fname);
                  }}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-700 transition-colors"
                >
                  <FiDownload className="w-4 h-4" />
                  <span>Export Excel</span>
                </button>
                <button
                  onClick={async () => {
                    if (salesReport.rows.length === 0) { toast('Tidak ada data untuk diekspor', 'error'); return; }
                    const fname = `laporan_${salesReport.filterMode === 'month' ? salesReport.selectedMonth : `${salesReport.startDate}_${salesReport.endDate}`}`;
                    await reportService.exportToPDF(salesReport.rows, fname);
                  }}
                  className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-700 transition-colors"
                >
                  <FiDownload className="w-4 h-4" />
                  <span>Export PDF</span>
                </button>
              </div>

              {/* Table */}
              {salesReport.rows.length === 0 ? (
                <EmptyReport />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">Tanggal</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500">Jumlah Pesanan</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500">Total Pendapatan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesReport.rows.map(r => (
                        <tr key={r.date} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-2 px-3 text-gray-700">{r.date}</td>
                          <td className="py-2 px-3 text-right text-gray-700">{r.count}</td>
                          <td className="py-2 px-3 text-right font-semibold text-chocolate">{formatRupiah(r.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Pesanan */}
        {activeTab === 'orders' && (
          <AdminOrdersTab orders={orders} formatRupiah={formatRupiah} timeAgo={timeAgo}
            handleUpdateOrderStatus={handleUpdateOrderStatus}
            handleMarkAsPaid={handleMarkAsPaid}
            ORDER_STATUS_COLOR={ORDER_STATUS_COLOR} ORDER_STATUS_LABEL={ORDER_STATUS_LABEL} />
        )}

        {/* Tab: Stok (Task 9.1) */}
        {activeTab === 'stock' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-gray-800 mb-4">Manajemen Stok Donat Polos</h2>

              {/* Current stock display */}
              <div className={`rounded-xl p-4 mb-4 ${isLow ? (stock < 0 ? 'bg-red-50' : 'bg-orange-50') : 'bg-green-50'}`}>
                <p className="text-xs font-semibold text-gray-500 mb-1">Stok Saat Ini</p>
                <p className={`text-4xl font-bold ${stock < 0 ? 'text-red-600' : isLow ? 'text-orange-500' : 'text-green-600'}`}>
                  {stock} pcs
                </p>
                <p className="text-xs text-gray-400 mt-1">Batas peringatan: {threshold} pcs</p>
              </div>

              {/* Set stock */}
              <div className="mb-4">
                <label htmlFor="stock-input" className="text-sm font-semibold text-gray-700 mb-1 block">
                  Stok Donat Polos (pcs)
                </label>
                <div className="flex space-x-2">
                  <input
                    id="stock-input"
                    type="number"
                    min="0"
                    value={stockInput}
                    onChange={e => setStockInput(e.target.value)}
                    placeholder={String(stock)}
                    aria-required="true"
                    aria-label="Jumlah stok donat polos"
                    className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-chocolate outline-none text-sm text-gray-800"
                  />
                  <button
                    disabled={savingStock || stockInput === ''}
                    onClick={async () => {
                      setSavingStock(true);
                      try {
                        await stockService.setStock(Number(stockInput));
                        toast('Stok berhasil disimpan', 'success');
                        setStockInput('');
                      } catch (err) {
                        console.error('[Stock] Gagal menyimpan stok:', err);
                        toast(`Gagal menyimpan stok: ${err.message || 'Unknown error'}`, 'error');
                      } finally { setSavingStock(false); }
                    }}
                    className="bg-chocolate text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-dark-chocolate transition-colors disabled:opacity-60"
                  >
                    {savingStock ? '...' : 'Simpan Stok'}
                  </button>
                </div>
              </div>

              {/* Set threshold */}
              <div>
                <label htmlFor="threshold-input" className="text-sm font-semibold text-gray-700 mb-1 block">
                  Batas Minimum Peringatan (pcs)
                </label>
                <div className="flex space-x-2">
                  <input
                    id="threshold-input"
                    type="number"
                    min="1"
                    value={thresholdInput}
                    onChange={e => setThresholdInput(e.target.value)}
                    placeholder={String(threshold)}
                    aria-label="Batas minimum stok untuk peringatan"
                    className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-chocolate outline-none text-sm text-gray-800"
                  />
                  <button
                    disabled={thresholdInput === ''}
                    onClick={async () => {
                      try {
                        await stockService.setThreshold(Number(thresholdInput));
                        toast('Threshold berhasil disimpan', 'success');
                        setThresholdInput('');
                      } catch {
                        toast('Gagal menyimpan threshold', 'error');
                      }
                    }}
                    className="bg-gray-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60"
                  >
                    Simpan Threshold
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Default: 30 pcs. Peringatan muncul saat stok di bawah nilai ini.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Pelanggan */}
        {activeTab === 'customers' && (
          <div>
            {/* Customer detail panel */}
            {selectedCustomerPhone && customerHistory ? (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedCustomerPhone(null)}
                    onKeyDown={e => { if (e.key === 'Escape') setSelectedCustomerPhone(null); }}
                    aria-label="Kembali ke daftar pelanggan"
                    className="flex items-center space-x-2 text-chocolate hover:text-dark-chocolate transition-colors"
                  >
                    <FiArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Kembali</span>
                  </button>
                  <button
                    onClick={() => setSelectedCustomerPhone(null)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    aria-label="Tutup panel"
                  >
                    <FiX className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                {/* Customer summary */}
                <div className="px-6 py-4 bg-chocolate/5 border-b border-gray-100">
                  <p className="font-bold text-gray-800">{customers.find(c => c.phone === selectedCustomerPhone)?.name || 'Pelanggan'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{selectedCustomerPhone}</p>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <div className="bg-white rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500">Total Pesanan</p>
                      <p className="text-lg font-bold text-chocolate">{customerHistory.orderCount}</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500">Total Belanja</p>
                      <p className="text-sm font-bold text-chocolate">{formatRupiah(customerHistory.totalSpent)}</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500">Rata-rata</p>
                      <p className="text-sm font-bold text-gray-800">{formatRupiah(customerHistory.avgOrderValue)}</p>
                    </div>
                  </div>
                </div>

                {/* Order history */}
                <div className="divide-y divide-gray-50 dark:divide-gray-700">
                  {customerHistory.orders.length === 0 ? (
                    <EmptyOrders size="sm" variant="minimal" />
                  ) : customerHistory.orders.map(order => (
                    <div key={order.id} className="px-6 py-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">{timeAgo(order.createdAt)}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ORDER_STATUS_COLOR[order.status] || ORDER_STATUS_COLOR.pending}`}>
                          {ORDER_STATUS_LABEL[order.status] || order.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-0.5 mb-1">
                        {order.items?.map((item, i) => (
                          <p key={i}>• {item.productName} x{item.quantity} — {item.toppings}</p>
                        ))}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-chocolate">{formatRupiah(order.totalPrice)}</span>
                        <span className="text-xs text-gray-400">{order.paymentMethod === 'cod' ? '💵 COD' : '📱 QRIS'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FiUsers className="w-5 h-5 text-chocolate" />
                    <h2 className="font-bold text-gray-800">Pelanggan ({customers.length})</h2>
                  </div>
                </div>
                {customers.length === 0 ? (
                  <EmptyCustomers />
                ) : (
                  <div className="divide-y divide-gray-50">
                    {customers.map((c, i) => (
                      <div
                        key={c.phone}
                        onClick={() => setSelectedCustomerPhone(c.phone)}
                        className="px-6 py-4 flex items-center space-x-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
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
                          onClick={e => e.stopPropagation()}
                          className="w-8 h-8 bg-green-50 text-green-500 rounded-full flex items-center justify-center hover:bg-green-100 transition-colors flex-shrink-0">
                          <FiPhone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
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
              <EmptyTestimonials />
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
