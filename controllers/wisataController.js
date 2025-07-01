import path from 'path';
import fs from 'fs';
import pool from '../models/db.js';

// Get all wisata
export const getAllWisata = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM wisata ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get Wisata by ID
export const getWisataById = async (req, res) => {
  const { id } = req.params;
  const lang = req.query.lang || 'id';
  const selectDeskripsi = lang === 'en' ? 'deskripsi_en' : 'deskripsi';

  try {
    const query = `
      SELECT id, nama, ${selectDeskripsi} AS deskripsi, gambar, lat, lng
      FROM wisata
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Gagal fetch detail wisata:', err);
    res.status(500).json({ error: 'Gagal mengambil data detail' });
  }
};

// Create wisata
export const createWisata = async (req, res) => {
  const { nama, deskripsi, deskripsi_en, lat, lng } = req.body;
  const gambar = req.file?.filename;

  if (!gambar) return res.status(400).json({ error: 'File gambar wajib diupload.' });

  try {
    const result = await pool.query(
      `INSERT INTO wisata (nama, deskripsi, deskripsi_en, gambar, lat, lng)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nama, deskripsi, deskripsi_en, gambar, lat, lng]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update wisata
export const updateWisata = async (req, res) => {
  const { id } = req.params;
  const { nama, deskripsi, deskripsi_en, lat, lng } = req.body;
  const fileBaru = req.file?.filename;

  try {
    const result = await pool.query('SELECT * FROM wisata WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Data tidak ditemukan' });
    }

    const wisataLama = result.rows[0];
    const gambarLama = wisataLama.gambar;

    // Hapus gambar lama jika ada file baru
    if (fileBaru && gambarLama) {
      const filePath = path.resolve('public/uploads/wisata', gambarLama);
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (!err) {
          fs.unlink(filePath, (err) => {
            if (err) console.error('Gagal hapus gambar lama:', err);
          });
        } else {
          console.warn(`⚠️ File lama tidak ditemukan: ${filePath}`);
        }
      });
    }

    const gambarAkhir = fileBaru || gambarLama;

    const updateResult = await pool.query(
      `UPDATE wisata 
       SET nama = $1, deskripsi = $2, deskripsi_en = $3, gambar = $4, lat = $5, lng = $6 
       WHERE id = $7 
       RETURNING *`,
      [nama, deskripsi, deskripsi_en, gambarAkhir, lat, lng, id]
    );

    res.json(updateResult.rows[0]);
  } catch (err) {
    console.error("Gagal update wisata:", err);
    res.status(500).json({ error: err.message });
  }
};

// Delete wisata
export const deleteWisata = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT gambar FROM wisata WHERE id = $1', [id]);
    const gambar = result.rows[0]?.gambar;

    await pool.query('DELETE FROM wisata WHERE id = $1', [id]);

    if (gambar) {
      const filePath = path.resolve('public/uploads/wisata', gambar);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Gagal hapus gambar:', err);
      });
    }

    res.json({ message: 'Wisata berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
