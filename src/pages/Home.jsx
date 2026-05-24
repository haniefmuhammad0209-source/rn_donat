import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiStar, FiHeart } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import Testimoni from '../components/Testimoni';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import Loading from '../components/Loading';
import PushNotification from '../components/PushNotification';
import StoreStatusBanner from '../components/StoreStatusBanner';
import OrderCounter from '../components/OrderCounter';
import { ProductGridSkeleton } from '../components/Skeleton';
import { usePageSEO } from '../hooks/usePageSEO';
import { useProducts } from '../hooks/useProducts';
import { PRODUCT_CATEGORIES } from '../utils/constants';

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { products, loading: productsLoading } = useProducts();

  usePageSEO({
    title: 'Donat Premium Payakumbuh',
    description: 'RN Donat — donat premium di Payakumbuh. 5 varian rasa: Coklat, Matcha, Cappuccino, Red Velvet, Tiramisu. 1 kotak isi 6 donat hanya Rp 15.000.',
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const categories = PRODUCT_CATEGORIES;

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <StoreStatusBanner />
      <Navbar />
      
      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center bg-gradient-to-br from-cream via-pastel-pink/20 to-light-brown/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHFiZ043UiU5fgejqlycAxgxlbOKb22wurEJCqlgrfmg&s')] bg-cover bg-center opacity-10 dark:opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block bg-chocolate/10 text-chocolate px-4 py-2 rounded-full text-sm font-medium mb-6"
              >
                🍩 RN Donat
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-5xl md:text-7xl font-bold text-chocolate font-elegant mb-6 leading-tight"
              >
                Kelezatan Donat
                <span className="text-pastel-pink block">RN Donat</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-xl text-gray-600 mb-8 leading-relaxed"
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
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-chocolate text-white px-8 py-4 rounded-full font-semibold hover:bg-dark-chocolate transition-colors duration-200 flex items-center space-x-2"
                >
                  <span>Lihat Menu</span>
                  <FiArrowRight className="w-5 h-5" />
                </motion.a>
                
                <motion.a
                  href="#about"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-chocolate px-8 py-4 rounded-full font-semibold hover:bg-cream transition-colors duration-200 border-2 border-chocolate"
                >
                  Tentang Kami
                </motion.a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex items-center space-x-8 mt-12"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-chocolate">500+</div>
                  <div className="text-gray-600 text-sm">Pelanggan</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-chocolate">4.9</div>
                  <div className="text-gray-600 text-sm flex items-center justify-center">
                    <FiStar className="w-4 h-4 fill-current text-yellow-500 mr-1" />
                    Rating
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-chocolate">8+</div>
                  <div className="text-gray-600 text-sm">Varian Rasa</div>
                </div>
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
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative"
              >
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHFiZ043UiU5fgejqlycAxgxlbOKb22wurEJCqlgrfmg&s"
                  alt="Premium Donut"
                  className="w-full max-w-lg mx-auto rounded-3xl shadow-2xl"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -bottom-4 -right-4 bg-white p-4 rounded-2xl shadow-xl"
                >
                  <div className="flex items-center space-x-2">
                    <FiHeart className="w-6 h-6 text-red-500 fill-current" />
                    <div>
                      <div className="font-bold text-chocolate">Best Seller</div>
                      <div className="text-sm text-gray-600">Donat Coklat</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-chocolate font-elegant mb-4">
              Menu Donat Kami
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Pilih dari berbagai varian donat premium yang lezat dan menggugah selera
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-pastel-pink to-chocolate mx-auto mt-6 rounded-full"></div>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {categories.map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-chocolate text-white'
                    : 'bg-cream text-chocolate hover:bg-light-brown'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </motion.div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {productsLoading ? (
              <ProductGridSkeleton count={4} />
            ) : (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
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
              
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                RN Donat adalah usaha UMKM yang didirikan dengan passion untuk menghadirkan donat berkualitas tinggi 
                dengan harga terjangkau. Kami menggunakan sistem pre-order, donat dibuat segar setelah pesanan diterima.
                1 kotak berisi 6 donat hanya Rp 15.000.
              </p>
              
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Tersedia 5 varian rasa: Coklat, Matcha, Cappuccino, Red Velvet, dan Tiramisu. 
                Tersedia juga pilihan Mix untuk yang ingin mencoba semua rasa dalam 1 kotak.
                Pilih topping sesuai selera: meses, oreo, kacang, atau keju. Setiap donat dibuat dengan cinta 
                dan perhatian terhadap detail.
              </p>

              <div className="grid grid-cols-2 gap-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white p-6 rounded-2xl shadow-lg text-center"
                >
                  <div className="text-3xl mb-2">🥐</div>
                  <div className="font-bold text-chocolate">Bahan Premium</div>
                  <div className="text-sm text-gray-600">Kualitas terbaik</div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white p-6 rounded-2xl shadow-lg text-center"
                >
                  <div className="text-3xl mb-2">💝</div>
                  <div className="font-bold text-chocolate">Dibuat dengan Cinta</div>
                  <div className="text-sm text-gray-600">Penuh perhatian</div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white p-6 rounded-2xl shadow-lg text-center"
                >
                  <div className="text-3xl mb-2">⚡</div>
                  <div className="font-bold text-chocolate">Cepat Segar</div>
                  <div className="text-sm text-gray-600">Selalu fresh</div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white p-6 rounded-2xl shadow-lg text-center"
                >
                  <div className="text-3xl mb-2">💰</div>
                  <div className="font-bold text-chocolate">Harga Terjangkau</div>
                  <div className="text-sm text-gray-600">Ramah kantong</div>
                </motion.div>
              </div>
              <div className="mt-6">
                <OrderCounter />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimoni />

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
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
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
                    <p className="text-gray-600">
                      Jl. Raya Bukittinggi - Payakumbuh No.233,<br />
                      Pakan Sinayan, Kec. Payakumbuh Barat,<br />
                      Kota Payakumbuh, Sumatera Barat 26224
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-chocolate/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📞</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-chocolate mb-1">Telepon</h4>
                    <p className="text-gray-600">0823 9186 9544</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-chocolate/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🕐</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-chocolate mb-1">Jam Operasional</h4>
                    <p className="text-gray-600">
                      Senin - Jumat: 08:00 - 20:00<br />
                      Sabtu - Minggu: 09:00 - 21:00
                    </p>
                  </div>
                </div>
              </div>

              <motion.a
                href="https://wa.me/6282391869544?text=Halo%20kak,%20saya%20ingin%20memesan%20donat.%20Rasa:%20[pilih:%20coklat/matcha/cappuccino/red%20velvet/tiramisu].%20Topping:%20[pilih:%20meses/oreo/kacang/keju].%20Jumlah%20kotak:%20[isi%20jumlah]."
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
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.777485343092!2d100.6071958!3d-0.2592255!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2fd54ad839d1b4a1%3A0x4d0f09023da507c5!2sRnw%20Sewa%20Bus%20Pariwisata!5e0!3m2!1sen!2sid!4v1779357596271!5m2!1sen!2sid"
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
      <WhatsAppButton />
      <PushNotification />
    </div>
  );
};

export default Home;
