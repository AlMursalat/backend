import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Fungsi untuk menentukan folder tujuan berdasarkan route
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'public/uploads'; // default

    // Tentukan subfolder berdasarkan endpoint
    if (req.originalUrl.includes('/beranda/slider')) {
      folder = 'public/uploads/slider';
    } else if (req.originalUrl.includes('/beranda/about')) {
      folder = 'public/uploads/tentang';
    }

    // Buat folder jika belum ada
    fs.mkdirSync(folder, { recursive: true });

    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

export default upload;
