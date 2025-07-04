import express from 'express';
import multer from 'multer';
import {
  getAllWisata,
  getWisataById,
  createWisata,
  updateWisata,
  deleteWisata,
} from '../controllers/wisataController.js';

const router = express.Router();

// Gunakan memory storage karena file akan dikirim langsung ke Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/', getAllWisata); 
router.get('/:id', getWisataById); 
router.post('/', upload.single('gambar'), createWisata);
router.put('/:id', upload.single('gambar'), updateWisata);
router.delete('/:id', deleteWisata);

export default router;
