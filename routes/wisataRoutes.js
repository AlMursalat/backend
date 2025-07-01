import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  getAllWisata,
  getWisataById,
  createWisata,
  updateWisata,
  deleteWisata,
} from '../controllers/wisataController.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Pastikan folder upload tersedia
const wisataFolder = path.resolve(__dirname, '../public/uploads/wisata');
if (!fs.existsSync(wisataFolder)) {
  fs.mkdirSync(wisataFolder, { recursive: true });
}

// ✅ Setup multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, wisataFolder);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });


router.get('/', getAllWisata); 
router.get('/:id', getWisataById); 
router.post('/', upload.single('gambar'), createWisata);
router.put('/:id', upload.single('gambar'), updateWisata);
router.delete('/:id', deleteWisata);

export default router;
