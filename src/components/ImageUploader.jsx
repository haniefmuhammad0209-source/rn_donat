import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';
import { cloudinaryService } from '../services/cloudinaryService';

const ImageUploader = ({ value, onChange, disabled }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(value || '');
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    setError('');
    const validationError = cloudinaryService.validate(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Preview lokal sebelum upload
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);
    setProgress(0);

    try {
      const url = await cloudinaryService.upload(file, setProgress);
      setPreview(url);
      onChange(url);
      URL.revokeObjectURL(localUrl); // aman direvoce setelah URL cloud sudah diset
    } catch (err) {
      setError('Upload gagal. Coba lagi.');
      setPreview(value || '');
      URL.revokeObjectURL(localUrl);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleClear = () => {
    setPreview('');
    onChange('');
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-gray-500 block">Foto Produk</label>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl overflow-hidden transition-colors cursor-pointer ${
          uploading ? 'border-chocolate/50 cursor-wait' : 'border-gray-200 hover:border-chocolate'
        }`}
      >
        {preview ? (
          <div className="relative">
            <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
            {!uploading && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleClear(); }}
                className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <FiImage className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm font-medium">Klik atau drag foto ke sini</p>
            <p className="text-xs mt-1">JPG, PNG, WebP · Maks 5MB</p>
          </div>
        )}

        {/* Progress overlay */}
        <AnimatePresence>
          {uploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center"
            >
              <div className="w-16 h-16 rounded-full border-4 border-white/20 border-t-white animate-spin mb-3" />
              <p className="text-white text-sm font-semibold">{progress}%</p>
              <div className="w-32 h-1.5 bg-white/20 rounded-full mt-2 overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* URL manual fallback */}
      <div className="flex items-center space-x-2">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">atau pakai URL</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
      <input
        type="url"
        value={preview.startsWith('blob:') ? '' : preview}
        onChange={(e) => { setPreview(e.target.value); onChange(e.target.value); }}
        placeholder="https://..."
        className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-chocolate outline-none text-sm"
      />

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => { if (e.target.files[0]) handleFile(e.target.files[0]); }}
      />
    </div>
  );
};

export default ImageUploader;
