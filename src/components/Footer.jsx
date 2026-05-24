import { motion } from 'framer-motion';
import { FiFacebook, FiInstagram, FiTwitter, FiMapPin, FiPhone, FiMail, FiClock } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-chocolate text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-pastel-pink to-light-brown rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">R</span>
              </div>
              <span className="font-elegant text-2xl font-bold">
                RN <span className="text-pastel-pink">Donat</span>
              </span>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Donat premium dengan kualitas terbaik, dibuat dengan bahan-bahan pilihan dan cinta. 
              1 kotak berisi 6 donat hanya Rp 15.000. Sistem pre-order, dibuat segar setelah pesanan.
            </p>
            <div className="flex space-x-4">
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-pastel-pink transition-colors duration-200"
              >
                <FiInstagram className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-pastel-pink transition-colors duration-200"
              >
                <FiFacebook className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-pastel-pink transition-colors duration-200"
              >
                <FiTwitter className="w-5 h-5" />
              </motion.a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-bold mb-6 font-elegant">Link Cepat</h3>
            <ul className="space-y-3">
              <li>
                <a href="#home" className="text-gray-300 hover:text-pastel-pink transition-colors duration-200">
                  Beranda
                </a>
              </li>
              <li>
                <a href="#menu" className="text-gray-300 hover:text-pastel-pink transition-colors duration-200">
                  Menu
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-300 hover:text-pastel-pink transition-colors duration-200">
                  Tentang Kami
                </a>
              </li>
              <li>
                <a href="#testimonials" className="text-gray-300 hover:text-pastel-pink transition-colors duration-200">
                  Testimoni
                </a>
              </li>
              <li>
                <a href="#location" className="text-gray-300 hover:text-pastel-pink transition-colors duration-200">
                  Lokasi
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-bold mb-6 font-elegant">Hubungi Kami</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <FiMapPin className="w-5 h-5 mt-1 text-pastel-pink flex-shrink-0" />
                <span className="text-gray-300">
                  Jl. Raya Bukittinggi - Payakumbuh No.233<br />
                  Pakan Sinayan, Kec. Payakumbuh Bar.<br />
                  Kota Payakumbuh, Sumatera Barat 26224
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <FiPhone className="w-5 h-5 text-pastel-pink flex-shrink-0" />
                <span className="text-gray-300">0823 9186 9544</span>
              </li>
              <li className="flex items-center space-x-3">
                <FiMail className="w-5 h-5 text-pastel-pink flex-shrink-0" />
                <span className="text-gray-300">info@donatpremium.com</span>
              </li>
            </ul>
          </motion.div>

          {/* Opening Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-bold mb-6 font-elegant">Jam Operasional</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <FiClock className="w-5 h-5 text-pastel-pink flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Senin - Jumat</p>
                  <p className="text-white font-medium">08:00 - 20:00</p>
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <FiClock className="w-5 h-5 text-pastel-pink flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Sabtu - Minggu</p>
                  <p className="text-white font-medium">09:00 - 21:00</p>
                </div>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-white/20 mt-12 pt-8 text-center"
        >
          <p className="text-gray-300">
            © {currentYear} RN Donat. All rights reserved. Made with ❤️
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
