import { motion } from 'framer-motion';
import { FiArrowRight, FiStar, FiHeart, FiMessageCircle } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import Testimoni from '../components/Testimoni';
import Footer from '../components/Footer';
import PushNotification from '../components/PushNotification';
import StoreStatusBanner from '../components/StoreStatusBanner';
import OrderCounter from '../components/OrderCounter';
import { ProductGridSkeleton } from '../components/Skeleton';
import { SocialProofBanner, TrustIndicators } from '../components/SocialProof';
import { CTACard, FloatingCTA, StickyCTABar } from '../components/CTAButton';
import { usePageSEO } from '../hooks/usePageSEO';
import { useProducts } from '../hooks/useProducts';
import { useStoreStatus } from '../hooks/useStoreStatus';
import { WA_NUMBER } from '../utils/constants';
import { useState, useEffect } from 'react';

const Home = () => {
  const { products, loading: productsLoading } = useProducts();
  const { isOpen: storeIsOpen, nextOpenText, schedule: storeSchedule } = useStoreStatus();
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  usePageSEO({
    title: 'Donat Premium Payakumbuh',
    description: 'RN Donat — donat premium di Payakumbuh. 5 varian rasa: Coklat, Matcha, Cappuccino, Red Velvet, Tiramisu. 1 kotak isi 6 donat hanya Rp 15.000.',
  });

  // Show sticky CTA when user scrolls past hero
  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight * 0.7;
      setShowStickyCTA(window.scrollY > heroHeight);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <StoreStatusBanner isOpen={storeIsOpen} nextOpenText={nextOpenText} schedule={storeSchedule} />
      <Navbar />
      
      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center bg-gradient-to-br from-warm-cream via-peach/30 to-rose-gold/20 dark:from-gray-900 dark:via-espresso/50 dark:to-gray-900 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-pastel-pink/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-caramel/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-rose-gold/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div>
        
        <div className="absolute inset-0 bg-[url('/image/an_aesthetic_high_end_stack_of_gourmet_donuts_with_mixed_flavors_one_with_pink.png')] bg-cover bg-center opacity-5 dark:opacity-[0.02]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
                className="inline-block bg-gradient-to-r from-rose-gold/20 to-caramel/20 backdrop-blur-sm border border-rose-gold/30 text-chocolate dark:text-pastel-pink px-5 py-2.5 rounded-full text-sm font-semibold mb-6 shadow-lg"
              >
                🍩 RN Donat Premium
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-chocolate via-caramel to-espresso bg-clip-text text-transparent dark:from-pastel-pink dark:via-rose-gold dark:to-white font-elegant mb-6 leading-tight"
              >
                Kelezatan Donat
                <span className="block bg-gradient-to-r from-pastel-pink to-rose-gold bg-clip-text text-transparent dark:from-white dark:to-pastel-pink">
                  RN Donat
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed font-medium"
              >
                Nikmati donat dengan kualitas terbaik, dibuat dengan bahan-bahan pilihan dan cinta. 
                1 kotak berisi 6 donat hanya Rp 15.000. Pilih topping sesuai selera: meses, oreo, kacang, atau keju.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-wrap gap-4"
              >
                <motion.a
                  href="#menu"
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 40px -10px rgba(139, 69, 19, 0.4)' }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-chocolate to-caramel text-white px-10 py-4 rounded-full font-bold hover:shadow-2xl transition-all duration-300 flex items-center space-x-2 relative overflow-hidden group"
                >
                  <span className="relative z-10">Lihat Menu</span>
                  <FiArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                </motion.a>
                
                <motion.a
                  href="#about"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white dark:bg-gray-800 text-chocolate dark:text-pastel-pink px-10 py-4 rounded-full font-bold hover:bg-cream dark:hover:bg-gray-700 transition-all duration-300 border-2 border-chocolate dark:border-pastel-pink shadow-lg hover:shadow-xl"
                >
                  Tentang Kami
                </motion.a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex items-center space-x-10 mt-14"
              >
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold bg-gradient-to-r from-chocolate to-caramel bg-clip-text text-transparent">500+</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm font-medium mt-1">Pelanggan</div>
                </motion.div>
                <div className="w-px h-12 bg-gray-300 dark:bg-gray-600" />
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold bg-gradient-to-r from-chocolate to-caramel bg-clip-text text-transparent">4.9</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm flex items-center justify-center font-medium mt-1">
                    <FiStar className="w-4 h-4 fill-current text-yellow-500 mr-1" />
                    Rating
                  </div>
                </motion.div>
                <div className="w-px h-12 bg-gray-300 dark:bg-gray-600" />
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold bg-gradient-to-r from-chocolate to-caramel bg-clip-text text-transparent">6+</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm font-medium mt-1">Varian Rasa</div>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <motion.div
                animate={{
                  y: [0, -25, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pastel-pink/20 to-caramel/20 rounded-[3rem] blur-3xl animate-glow" />
                <motion.img
                  src="/image/an_aesthetic_high_end_stack_of_gourmet_donuts_with_mixed_flavors_one_with_pink.png"
                  alt="Premium Donut"
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  transition={{ duration: 0.5 }}
                  className="w-full max-w-lg mx-auto rounded-[3rem] shadow-2xl relative z-10 border-4 border-white/50 dark:border-gray-700/50"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 }}
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  className="absolute -bottom-6 -right-6 z-20 bg-gradient-to-br from-white to-cream dark:from-gray-800 dark:to-gray-700 p-5 rounded-3xl shadow-2xl border-2 border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <FiHeart className="w-6 h-6 text-white fill-current drop-shadow-md" />
                    </div>
                    <div>
                      <div className="font-bold text-chocolate dark:text-pastel-pink text-lg drop-shadow-sm">Best Seller</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Donat Mix</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-24 bg-gradient-to-b from-white to-warm-cream dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-pastel-pink/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-caramel/5 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-block mb-4"
            >
              <span className="text-5xl">🍩</span>
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-chocolate via-caramel to-espresso bg-clip-text text-transparent dark:from-pastel-pink dark:via-rose-gold dark:to-white font-elegant mb-6">
              Menu Donat Kami
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
              Pilih dari berbagai varian donat premium yang lezat dan menggugah selera
            </p>
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: 120 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="h-1.5 bg-gradient-to-r from-pastel-pink via-rose-gold to-caramel mx-auto mt-8 rounded-full"
            />
          </motion.div>

        {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {productsLoading ? (
              <ProductGridSkeleton count={4} />
            ) : products.length === 0 ? (
              <div className="col-span-4 text-center py-20">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-7xl mb-6 filter grayscale"
                >
                  🍩
                </motion.div>
                <p className="font-semibold text-gray-400 dark:text-gray-500 text-lg">Menu belum tersedia</p>
              </div>
            ) : (
              products.map((product) => (
                <ProductCard key={product.id} product={product} storeIsOpen={storeIsOpen} nextOpenText={nextOpenText} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-cream dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src="https://lh6.googleusercontent.com/proxy/ErX7eH-4ZQii1xdNB20ZVL0kCGb-KLHvGrg8CSwSXWEDQi4cD1SuOvm3aPrAmGUaqS5oambM46SAthUVRFI4P3A7aierAAfu-83mwzqkC8vBoRA5XkkB7CmDHtO5UsrG5yX6qPPc3ALrRxpHwMktNWAmiJAwTJGwZp_6XNM6v21GVac9uxGgP2Gp3_jzRF4stCXU_Sg56X5vgcXsWbkV-vIhNys"
                alt="About Us"
                loading="lazy"
                className="rounded-3xl shadow-2xl"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="absolute -bottom-8 -right-8 bg-chocolate text-white p-6 rounded-2xl shadow-xl"
              >
                <div className="text-4xl font-bold">1+</div>
                <div className="text-sm">Tahun Pengalaman</div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-chocolate font-elegant mb-6">
                Tentang Toko Kami
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-pastel-pink to-chocolate mb-6 rounded-full"></div>
              
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-6 leading-relaxed">
                RN Donat adalah usaha UMKM yang didirikan dengan passion untuk menghadirkan donat berkualitas tinggi 
                dengan harga terjangkau. Kami menggunakan sistem pre-order, donat dibuat segar setelah pesanan diterima.
                1 kotak berisi 6 donat hanya Rp 15.000.
              </p>
              
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 leading-relaxed">
                Tersedia 5 varian rasa: Coklat, Matcha, Cappuccino, Red Velvet, dan Tiramisu. 
                Tersedia juga pilihan Mix untuk yang ingin mencoba semua rasa dalam 1 kotak.
                Pilih topping sesuai selera: meses, oreo, kacang, atau keju. Setiap donat dibuat dengan cinta 
                dan perhatian terhadap detail.
              </p>

              <div className="grid grid-cols-2 gap-5">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ y: -5, boxShadow: '0 20px 40px -10px rgba(139, 69, 19, 0.2)' }}
                  className="bg-gradient-to-br from-white to-warm-cream dark:from-gray-700 dark:to-gray-800 p-6 rounded-3xl shadow-lg text-center border border-gray-100 dark:border-gray-600 group"
                >
                  <motion.div 
                    className="text-4xl mb-3"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    🥐
                  </motion.div>
                  <div className="font-bold text-chocolate dark:text-pastel-pink group-hover:text-caramel transition-colors">Bahan Premium</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Kualitas terbaik</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ y: -5, boxShadow: '0 20px 40px -10px rgba(139, 69, 19, 0.2)' }}
                  className="bg-gradient-to-br from-white to-warm-cream dark:from-gray-700 dark:to-gray-800 p-6 rounded-3xl shadow-lg text-center border border-gray-100 dark:border-gray-600 group"
                >
                  <motion.div 
                    className="text-4xl mb-3"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    💝
                  </motion.div>
                  <div className="font-bold text-chocolate dark:text-pastel-pink group-hover:text-caramel transition-colors">Dibuat dengan Cinta</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Penuh perhatian</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ y: -5, boxShadow: '0 20px 40px -10px rgba(139, 69, 19, 0.2)' }}
                  className="bg-gradient-to-br from-white to-warm-cream dark:from-gray-700 dark:to-gray-800 p-6 rounded-3xl shadow-lg text-center border border-gray-100 dark:border-gray-600 group"
                >
                  <motion.div 
                    className="text-4xl mb-3"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    ⚡
                  </motion.div>
                  <div className="font-bold text-chocolate dark:text-pastel-pink group-hover:text-caramel transition-colors">Cepat Segar</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Selalu fresh</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ y: -5, boxShadow: '0 20px 40px -10px rgba(139, 69, 19, 0.2)' }}
                  className="bg-gradient-to-br from-white to-warm-cream dark:from-gray-700 dark:to-gray-800 p-6 rounded-3xl shadow-lg text-center border border-gray-100 dark:border-gray-600 group"
                >
                  <motion.div 
                    className="text-4xl mb-3"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    💰
                  </motion.div>
                  <div className="font-bold text-chocolate dark:text-pastel-pink group-hover:text-caramel transition-colors">Harga Terjangkau</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Ramah kantong</div>
                </motion.div>
              </div>
              <div className="mt-6">
                <OrderCounter />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-gradient-to-b from-warm-cream to-white dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-chocolate dark:text-pastel-pink font-elegant mb-4">
              Dipercaya Ratusan Pelanggan
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
              Bergabunglah dengan pelanggan kami yang puas dengan kualitas donat premium kami
            </p>
          </motion.div>

          {/* Stats Banner */}
          <div className="mb-16">
            <SocialProofBanner />
          </div>

          {/* Trust Indicators */}
          <div>
            <TrustIndicators />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimoni />

      {/* CTA Card Section */}
      <section className="py-20 bg-gradient-to-b from-warm-cream to-white dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <CTACard
            title="Siap Menikmati Donat Premium?"
            description="Pesan sekarang dan rasakan kelezatan donat premium dengan bahan pilihan. Pre-order sekarang untuk mendapatkan donat segar!"
            benefits={[
              'Bahan premium berkualitas tinggi',
              'Dibuat fresh setelah pesanan diterima',
              '5 varian rasa dan topping pilihan',
              'Harga terjangkau, hanya Rp 15.000/kotak',
              'Proses order mudah via WhatsApp',
            ]}
            buttonText="Order via WhatsApp"
            buttonAction={() => {
              const message = encodeURIComponent('Halo kak, saya ingin memesan donat RN Donat. Bisa bantu saya untuk order?');
              window.open(`https://wa.me/${WA_NUMBER}?text=${message}`, '_blank');
            }}
            urgencyText="Pre-order sekarang untuk stok besok!"
          />
        </div>
      </section>

      {/* Location Section */}
      <section id="location" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-chocolate font-elegant mb-4">
              Lokasi Toko
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
              Kunjungi toko kami atau pesan langsung melalui WhatsApp
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-pastel-pink to-chocolate mx-auto mt-6 rounded-full"></div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-cream rounded-3xl p-8 shadow-lg"
            >
              <h3 className="text-2xl font-bold text-chocolate mb-6 font-elegant">Informasi Kontak</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-chocolate/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📍</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-chocolate mb-1">Alamat</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Ngalau, Balai Panjang,<br />
                      Kec. Payakumbuh Selatan,<br />
                      Kota Payakumbuh, Sumatera Barat 26226
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-chocolate/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📞</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-chocolate mb-1">Telepon</h4>
                    <p className="text-gray-600 dark:text-gray-400">0823 9186 9544</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-chocolate/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🕐</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-chocolate mb-1">Jam Operasional</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Senin - Jumat: 08:00 - 20:00<br />
                      Sabtu - Minggu: 08:00 - 21:00
                    </p>
                  </div>
                </div>
              </div>

              <motion.a
                href={`https://wa.me/${WA_NUMBER}?text=Halo%20kak,%20saya%20ingin%20memesan%20donat.%20Rasa:%20[pilih:%20coklat/matcha/cappuccino/red%20velvet/tiramisu].%20Topping:%20[pilih:%20meses/oreo/kacang/keju].%20Jumlah%20kotak:%20[isi%20jumlah].`}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full mt-8 bg-chocolate text-white px-8 py-4 rounded-full font-semibold hover:bg-dark-chocolate transition-colors duration-200 block text-center"
              >
                Pesan via WhatsApp
              </motion.a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-cream rounded-3xl overflow-hidden shadow-lg h-96"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.7774884935643!2d100.6072021!3d-0.2592155!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2fd54bcf7d9e2199%3A0x38a4e8acef7a94f7!2sRN%20Donat!5e0!3m2!1sen!2sid!4v1780481999680!5m2!1sen!2sid"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
      <PushNotification />

      {/* Floating WhatsApp CTA */}
      <FloatingCTA
        text="Chat WhatsApp"
        icon={FiMessageCircle}
        href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Halo kak, saya ingin memesan donat RN Donat.')}`}
        position="bottom-right"
        variant="whatsapp"
        pulse={true}
      />

      {/* Sticky CTA Bar for Mobile */}
      <StickyCTABar
        primaryText="Order Sekarang"
        primaryAction={() => {
          const message = encodeURIComponent('Halo kak, saya ingin memesan donat RN Donat.');
          window.open(`https://wa.me/${WA_NUMBER}?text=${message}`, '_blank');
        }}
        secondaryText="Lihat Menu"
        secondaryAction={() => {
          document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
        }}
        show={showStickyCTA && storeIsOpen}
      />
    </div>
  );
};

export default Home;
