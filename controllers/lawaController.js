import path from 'path';
import fs from 'fs';
import pool from '../models/db.js';

// Ambil semua lawa
export const getAllLawa = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM lawa ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Ambil lawa berdasarkan ID
export const getLawaById = async (req, res) => {
  const { id } = req.params;
  const lang = req.query.lang || 'id';
  const selectDeskripsi = lang === 'en' ? 'deskripsi_en' : 'deskripsi';

  try {
    const result = await pool.query(
      `SELECT id, nama, ${selectDeskripsi} AS deskripsi, gambar, lat, lng FROM lawa WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Gagal fetch detail lawa:", err);
    res.status(500).json({ error: 'Gagal mengambil data detail' });
  }
};


// Tambah lawa
export const createLawa = async (req, res) => {
  const { nama, deskripsi, deskripsi_en, lat, lng } = req.body;
  const gambar = req.file?.filename;

  if (!gambar) return res.status(400).json({ error: "File gambar wajib diupload." });

  try {
    const result = await pool.query(
      `INSERT INTO lawa (nama, deskripsi, deskripsi_en, gambar, lat, lng)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nama, deskripsi, deskripsi_en, gambar, lat, lng]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Gagal tambah lawa:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update lawa
export const updateLawa = async (req, res) => {
  const { id } = req.params;
  const { nama, deskripsi, deskripsi_en, lat, lng } = req.body;
  const fileBaru = req.file?.filename;

  try {
    const result = await pool.query("SELECT * FROM lawa WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Data tidak ditemukan" });
    }

    const lawaLama = result.rows[0];
    const gambarLama = lawaLama.gambar;

    // Hapus gambar lama jika upload baru
    if (fileBaru && gambarLama) {
      const filePath = path.resolve("public/uploads/lawa", gambarLama);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Gagal hapus gambar lama:", err);
      });
    }

    const gambarAkhir = fileBaru || gambarLama;

    const updateResult = await pool.query(
      `UPDATE lawa 
       SET nama = $1, deskripsi = $2, deskripsi_en = $3, gambar = $4, lat = $5, lng = $6 
       WHERE id = $7 RETURNING *`,
      [nama, deskripsi, deskripsi_en, gambarAkhir, lat, lng, id]
    );

    res.json(updateResult.rows[0]);
  } catch (err) {
    console.error("Gagal update lawa:", err);
    res.status(500).json({ error: err.message });
  }
};

// Hapus lawa
export const deleteLawa = async (req, res) => {
  const { id } = req.params;
  try {
    // Ambil nama gambar
    const result = await pool.query("SELECT gambar FROM lawa WHERE id = $1", [id]);
    const gambar = result.rows[0]?.gambar;

    // Hapus data dari database
    await pool.query("DELETE FROM lawa WHERE id = $1", [id]);

    // Hapus file gambar jika ada
    if (gambar) {
      const filePath = path.resolve("public/uploads/lawa", gambar);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Gagal hapus gambar:", err);
      });
    }

    res.json({ message: "Lawa berhasil dihapus." });
  } catch (err) {
    console.error("Gagal hapus lawa:", err);
    res.status(500).json({ error: err.message });
  }
};
