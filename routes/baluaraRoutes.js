import express from "express";
import multer from "multer";
import {
  createBaluara,
  getAllBaluara,
  getBaluaraById,
  updateBaluara,
  deleteBaluara,
} from "../controllers/baluaraController.js";

const router = express.Router();

// Memory storage untuk Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", getAllBaluara);
router.get("/:id", getBaluaraById);
router.post("/", upload.single("gambar"), createBaluara);
router.put("/:id", upload.single("gambar"), updateBaluara);
router.delete("/:id", deleteBaluara);

export default router;
