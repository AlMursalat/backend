import path from 'path';
import fs from 'fs';
import pool from "../models/db.js";

// Folder untuk gambar baluara
const folderPath = path.resolve('public/uploads/baluara');

// Get all Baluara
export const getAllBaluara = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM baluara ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Baluara by ID
export const getBaluaraById = async (req, res) => {
  const { id } = req.params;
  const lang = req.query.lang || 'id';
  const selectDeskripsi = lang === 'en' ? 'deskripsi_en' : 'deskripsi';

  try {
    const result = await pool.query(
      `SELECT id, nama, ${selectDeskripsi} AS deskripsi, gambar, lat, lng FROM baluara WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Gagal fetch detail baluara:", err);
    res.status(500).json({ error: 'Gagal mengambil data detail' });
  }
};


// Create Baluara
export const createBaluara = async (req, res) => {
  const { nama, deskripsi, deskripsi_en, lat, lng } = req.body;
  const gambar = req.file?.filename;

  if (!gambar) return res.status(400).json({ error: "File gambar wajib diupload." });

  try {
    const result = await pool.query(
      `INSERT INTO baluara (nama, deskripsi, deskripsi_en, gambar, lat, lng)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nama, deskripsi, deskripsi_en || '', gambar, lat, lng]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Baluara
export const updateBaluara = async (req, res) => {
  const { id } = req.params;
  const { nama, deskripsi, deskripsi_en, lat, lng } = req.body;
  const gambarBaru = req.file?.filename;

  try {
    const oldResult = await pool.query("SELECT gambar FROM baluara WHERE id = $1", [id]);
    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: "Data tidak ditemukan." });
    }

    const oldImage = oldResult.rows[0].gambar;

    let updateQuery = `
      UPDATE baluara SET nama = $1, deskripsi = $2, deskripsi_en = $3, lat = $4, lng = $5`;
    let values = [nama, deskripsi, deskripsi_en || '', lat, lng];

    if (gambarBaru) {
      updateQuery += `, gambar = $6 WHERE id = $7 RETURNING *`;
      values.push(gambarBaru, id);
    } else {
      updateQuery += ` WHERE id = $6 RETURNING *`;
      values.push(id);
    }

    const result = await pool.query(updateQuery, values);

    // Hapus gambar lama jika ada gambar baru
    if (gambarBaru && oldImage) {
      const pathLama = path.join(folderPath, oldImage);
      fs.access(pathLama, fs.constants.F_OK, (err) => {
        if (!err) {
          fs.unlink(pathLama, (err) => {
            if (err) console.error("Gagal hapus gambar lama:", err);
          });
        }
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Baluara
export const deleteBaluara = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT gambar FROM baluara WHERE id = $1", [id]);
    const gambar = result.rows[0]?.gambar;

    await pool.query("DELETE FROM baluara WHERE id = $1", [id]);

    if (gambar) {
      const pathFile = path.join(folderPath, gambar);
      fs.unlink(pathFile, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error("Gagal hapus gambar:", err);
        }
      });
    }

    res.json({ message: "Baluara berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
