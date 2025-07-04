import pool from "../models/db.js";
import { v2 as cloudinary } from "cloudinary";

// ✅ Get all Wisata
export const getAllWisata = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM wisata ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get Wisata by ID (multi-bahasa)
export const getWisataById = async (req, res) => {
  const { id } = req.params;
  const lang = req.query.lang || "id";
  const deskripsiField = lang === "en" ? "deskripsi_en" : "deskripsi";

  try {
    const result = await pool.query(
      `SELECT id, nama, ${deskripsiField} AS deskripsi, gambar, lat, lng FROM wisata WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data detail" });
  }
};

// ✅ Create Wisata
export const createWisata = async (req, res) => {
  const { nama, deskripsi, deskripsi_en, lat, lng } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "File gambar wajib diupload." });
  }

  try {
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "wisata" }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        })
        .end(req.file.buffer);
    });

    const { secure_url, public_id } = uploadResult;

    const result = await pool.query(
      `INSERT INTO wisata (nama, deskripsi, deskripsi_en, gambar, public_id, lat, lng)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        nama,
        deskripsi,
        deskripsi_en || "",
        secure_url,
        public_id,
        lat,
        lng,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Gagal tambah wisata:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update Wisata
export const updateWisata = async (req, res) => {
  const { id } = req.params;
  const { nama, deskripsi, deskripsi_en, lat, lng } = req.body;

  try {
    const oldResult = await pool.query("SELECT * FROM wisata WHERE id = $1", [
      id,
    ]);
    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: "Data tidak ditemukan." });
    }

    const wisataLama = oldResult.rows[0];
    let finalImage = wisataLama.gambar;
    let finalPublicId = wisataLama.public_id;

    if (req.file) {
      if (wisataLama.public_id) {
        await cloudinary.uploader.destroy(wisataLama.public_id);
      }

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "wisata" }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          })
          .end(req.file.buffer);
      });

      finalImage = uploadResult.secure_url;
      finalPublicId = uploadResult.public_id;
    }

    const updateResult = await pool.query(
      `UPDATE wisata
       SET nama = $1, deskripsi = $2, deskripsi_en = $3, gambar = $4, public_id = $5, lat = $6, lng = $7
       WHERE id = $8 RETURNING *`,
      [
        nama,
        deskripsi,
        deskripsi_en || "",
        finalImage,
        finalPublicId,
        lat,
        lng,
        id,
      ]
    );

    res.json(updateResult.rows[0]);
  } catch (err) {
    console.error("Gagal update wisata:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete Wisata
export const deleteWisata = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT public_id FROM wisata WHERE id = $1",
      [id]
    );
    const public_id = result.rows[0]?.public_id;

    await pool.query("DELETE FROM wisata WHERE id = $1", [id]);

    if (public_id) {
      await cloudinary.uploader.destroy(public_id);
    }

    res.json({ message: "Wisata berhasil dihapus." });
  } catch (err) {
    console.error("Gagal hapus wisata:", err);
    res.status(500).json({ error: err.message });
  }
};
