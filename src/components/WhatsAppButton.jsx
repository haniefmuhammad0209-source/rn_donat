import { motion } from 'framer-motion';
import { FiMessageCircle } from 'react-icons/fi';

const WhatsAppButton = () => {
  const whatsappNumber = '6282391869544';
  const message = encodeURIComponent('Halo kak, saya ingin memesan donat. Rasa: [pilih: coklat/matcha/cappuccino/red velvet/tiramisu]. Topping: [pilih: meses/oreo/kacang/keju]. Jumlah kotak: [isi jumlah].');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 z-50 bg-green-500 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:bg-green-600 transition-colors duration-200"
      title="Chat via WhatsApp"
    >
      <FiMessageCircle className="w-8 h-8" />
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></span>
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"></span>
    </motion.a>
  );
};

export default WhatsAppButton;
