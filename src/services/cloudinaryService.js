const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export const cloudinaryService = {
  // Upload gambar, return URL
  upload: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'rn-donat/products');

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', UPLOAD_URL);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          // Tambah transformasi: auto format + quality + resize 500x500
          const optimizedUrl = data.secure_url.replace(
            '/upload/',
            '/upload/f_auto,q_auto,w_500,h_500,c_fill/'
          );
          resolve(optimizedUrl);
        } else {
          reject(new Error('Upload gagal'));
        }
      };

      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(formData);
    });
  },

  // Validasi file sebelum upload
  validate: (file) => {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Format file harus JPG, PNG, atau WebP';
    }
    if (file.size > MAX_SIZE) {
      return 'Ukuran file maksimal 5MB';
    }
    return null;
  },
};
