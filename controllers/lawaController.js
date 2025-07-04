import pool from "../models/db.js";
import { v2 as cloudinary } from "cloudinary";

// ✅ Get all Lawa
export const getAllLawa = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM lawa ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get Lawa by ID (with language option)
export const getLawaById = async (req, res) => {
  const { id } = req.params;
  const lang = req.query.lang || "id";
  const deskripsiField = lang === "en" ? "deskripsi_en" : "deskripsi";

  try {
    const result = await pool.query(
      `SELECT id, nama, ${deskripsiField} AS deskripsi, gambar, lat, lng FROM lawa WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Gagal fetch detail lawa:", err);
    res.status(500).json({ error: "Gagal mengambil data detail" });
  }
};

// ✅ Create Lawa
export const createLawa = async (req, res) => {
  const { nama, deskripsi, deskripsi_en, lat, lng } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "File gambar wajib diupload." });
  }

  try {
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "lawa" }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        })
        .end(req.file.buffer);
    });

    const { secure_url, public_id } = uploadResult;

    const result = await pool.query(
      `INSERT INTO lawa (nama, deskripsi, deskripsi_en, gambar, public_id, lat, lng)
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
    console.error("Gagal tambah lawa:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update Lawa
export const updateLawa = async (req, res) => {
  const { id } = req.params;
  const { nama, deskripsi, deskripsi_en, lat, lng } = req.body;

  try {
    const oldResult = await pool.query("SELECT * FROM lawa WHERE id = $1", [
      id,
    ]);
    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: "Data tidak ditemukan." });
    }

    const dataLama = oldResult.rows[0];
    let finalImage = dataLama.gambar;
    let finalPublicId = dataLama.public_id;

    if (req.file) {
      if (dataLama.public_id) {
        await cloudinary.uploader.destroy(dataLama.public_id);
      }

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "lawa" }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          })
          .end(req.file.buffer);
      });

      finalImage = uploadResult.secure_url;
      finalPublicId = uploadResult.public_id;
    }

    const updateResult = await pool.query(
      `UPDATE lawa
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
    console.error("Gagal update lawa:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete Lawa
export const deleteLawa = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT public_id FROM lawa WHERE id = $1",
      [id]
    );
    const public_id = result.rows[0]?.public_id;

    await pool.query("DELETE FROM lawa WHERE id = $1", [id]);

    if (public_id) {
      await cloudinary.uploader.destroy(public_id);
    }

    res.json({ message: "Lawa berhasil dihapus." });
  } catch (err) {
    console.error("Gagal hapus lawa:", err);
    res.status(500).json({ error: err.message });
  }
};
