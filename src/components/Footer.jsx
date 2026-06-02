import { memo } from 'react';
import { motion } from 'framer-motion';
import { FiInstagram, FiMapPin, FiPhone, FiClock } from 'react-icons/fi';
import { WA_NUMBER } from '../utils/constants';

const YEAR = new Date().getFullYear();

const Footer = memo(() => (
  <footer className="bg-chocolate text-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
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
          <motion.a href={`https://www.instagram.com`} target="_blank" rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            className="inline-flex w-10 h-10 bg-white/10 rounded-full items-center justify-center hover:bg-pastel-pink transition-colors duration-200">
            <FiInstagram className="w-5 h-5" />
          </motion.a>
        </motion.div>

        {/* Quick Links */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
          <h3 className="text-lg font-bold mb-6 font-elegant">Link Cepat</h3>
          <ul className="space-y-3">
            {[
              { label: 'Beranda', href: '#home' },
              { label: 'Menu', href: '#menu' },
              { label: 'Tentang Kami', href: '#about' },
              { label: 'Testimoni', href: '#testimonials' },
              { label: 'Lokasi', href: '#location' },
            ].map(({ label, href }) => (
              <li key={href}>
                <a href={href} className="text-gray-300 hover:text-pastel-pink transition-colors duration-200">{label}</a>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Contact */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
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
              <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer"
                className="text-gray-300 hover:text-pastel-pink transition-colors">0823 9186 9544</a>
            </li>
          </ul>
        </motion.div>

        {/* Hours */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
          <h3 className="text-lg font-bold mb-6 font-elegant">Jam Operasional</h3>
          <ul className="space-y-3">
            {[
              { days: 'Senin - Jumat', hours: '08:00 - 20:00' },
              { days: 'Sabtu - Minggu', hours: '08:00 - 21:00' },
            ].map(({ days, hours }) => (
              <li key={days} className="flex items-center space-x-3">
                <FiClock className="w-5 h-5 text-pastel-pink flex-shrink-0" />
                <div>
                  <p className="text-gray-300">{days}</p>
                  <p className="text-white font-medium">{hours}</p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        className="border-t border-white/20 mt-12 pt-8 text-center">
        <p className="text-gray-300">© {YEAR} RN Donat. All rights reserved. Made with ❤️</p>
      </motion.div>
    </div>
  </footer>
));

Footer.displayName = 'Footer';
export default Footer;
