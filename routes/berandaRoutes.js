import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  uploadSliderImage,
  getSliderImages,
  deleteSliderImage,
  saveAbout,
  getAbout,
  deleteAbout,
} from '../controllers/berandaController.js';

const router = express.Router();

// Fungsi bantu untuk membuat folder jika belum ada
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Konfigurasi storage slider
const storageSlider = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = path.resolve('public/uploads/slider');
    ensureDirectoryExists(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueName);
  },
});

// Konfigurasi storage tentang
const storageAbout = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = path.resolve('public/uploads/tentang');
    ensureDirectoryExists(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueName);
  },
});

const uploadSlider = multer({ storage: storageSlider });
const uploadAbout = multer({ storage: storageAbout });

// Routes Slider
router.post('/slider', uploadSlider.single('image'), uploadSliderImage);
router.get('/slider', getSliderImages);
router.delete('/slider/:id', deleteSliderImage);

// Routes Tentang Kami
router.post('/about', uploadAbout.single('image'), saveAbout);
router.get('/about', getAbout);
router.delete('/about', deleteAbout);

export default router;
