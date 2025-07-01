// routes/baluaraRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { createBaluara, getAllBaluara, getBaluaraById, updateBaluara, deleteBaluara } from "../controllers/baluaraController.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup folder upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join("public", "uploads", "baluara"));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Routes
router.get("/", getAllBaluara);
router.get('/:id', getBaluaraById);
router.post("/", upload.single("gambar"), createBaluara);
router.put('/:id', upload.single('gambar'), updateBaluara);
router.delete("/:id", deleteBaluara);

export default router;
