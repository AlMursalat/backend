import express from 'express';
import upload from '../middlewares/upload.js'; // Cloudinary config disini
import {
  uploadSliderImage,
  getSliderImages,
  deleteSliderImage,
  saveAbout,
  getAbout,
  deleteAbout,
} from '../controllers/berandaController.js';

const router = express.Router();

// Routes Slider
router.post('/slider', upload.single('image'), uploadSliderImage);
router.get('/slider', getSliderImages);
router.delete('/slider/:id', deleteSliderImage);

// Routes Tentang Kami
router.post('/about', upload.single('image'), saveAbout);
router.get('/about', getAbout);
router.delete('/about', deleteAbout);

export default router;
