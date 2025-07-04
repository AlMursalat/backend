import express from "express";
import multer from "multer";
import {
  createLawa,
  getAllLawa,
  getLawaById,
  updateLawa,
  deleteLawa,
} from "../controllers/lawaController.js";

const router = express.Router();

// Pakai memory storage untuk Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

// Routes
router.get("/", getAllLawa);
router.get("/:id", getLawaById);
router.post("/", upload.single("gambar"), createLawa);
router.put("/:id", upload.single("gambar"), updateLawa);
router.delete("/:id", deleteLawa);

export default router;
