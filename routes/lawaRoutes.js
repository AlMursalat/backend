import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { createLawa, getAllLawa, getLawaById, updateLawa, deleteLawa } from "../controllers/lawaController.js";

const router = express.Router();

// Resolusi path __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup folder upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join("public", "uploads", "lawa"));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Routes
router.get("/", getAllLawa);
router.get('/:id', getLawaById);
router.post("/", upload.single("gambar"), createLawa);
router.put('/:id', upload.single('gambar'), updateLawa);
router.delete("/:id", deleteLawa);

export default router;
