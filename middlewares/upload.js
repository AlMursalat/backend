import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Konfigurasi kredensial Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,   // contoh: 'mycloudname'
  api_key: process.env.CLOUDINARY_API_KEY,         // contoh: '1234567890'
  api_secret: process.env.CLOUDINARY_API_SECRET,   // contoh: 'mysecretkey'
});

// Konfigurasi penyimpanan menggunakan multer-storage-cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    // Tentukan folder di Cloudinary berdasarkan URL
    let folder = 'visit-benteng-buton/uploads';

    if (req.originalUrl.includes('/beranda/slider')) {
      folder = 'visit-benteng-buton/slider';
    } else if (req.originalUrl.includes('/beranda/about')) {
      folder = 'visit-benteng-buton/about';
    }

    return {
      folder,
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      public_id: Date.now() + '-' + file.originalname.replace(/\s+/g, '_'),
    };
  },
});

const upload = multer({ storage });

export default upload;
