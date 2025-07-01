import path from 'path';
import fs from 'fs';
import db from '../models/db.js';

// =============================
// === SLIDER SECTION =========
// =============================

// Upload slider image to `uploads/slider`
export const uploadSliderImage = (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Tidak ada file yang diupload' });

  const filename = req.file.filename;

  db.query('INSERT INTO slider_images (image_url) VALUES ($1)', [filename], (err) => {
    if (err) return res.status(500).json({ message: 'Gagal menyimpan ke database', error: err });
    res.status(201).json({ message: 'Upload berhasil', imageUrl: filename });
  });
};

// Get all slider images
export const getSliderImages = (req, res) => {
  db.query('SELECT * FROM slider_images ORDER BY id DESC', (err, result) => {
    if (err) return res.status(500).json({ message: 'Gagal mengambil data', error: err });
    res.json(result.rows);
  });
};

// Delete slider image and record
export const deleteSliderImage = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('SELECT image_url FROM slider_images WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    const filename = result.rows[0].image_url;
    const filePath = path.resolve('public/uploads/slider', filename);

    await db.query('DELETE FROM slider_images WHERE id = $1', [id]);

    fs.unlink(filePath, (err) => {
      if (err) console.error('Gagal hapus file:', err);
    });

    res.json({ message: 'Slider berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal hapus slider' });
  }
};

// =============================
// === ABOUT SECTION ==========
// =============================

// Save or update "Tentang Kami" (image stored in `uploads/tentang`)
export const saveAbout = (req, res) => {
  const { text, text_en, id } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!text && !text_en && !image) {
    return res.status(400).json({ message: 'Isi deskripsi (ID/EN) atau gambar terlebih dahulu.' });
  }

  db.query('SELECT * FROM about_info LIMIT 1', (err, result) => {
    if (err) return res.status(500).json({ message: 'Gagal cek data', error: err });

    // Jika data sudah ada, update
    if (result.rows.length > 0) {
      const existing = result.rows[0];
      const query = image
        ? 'UPDATE about_info SET text = $1, text_en = $2, image = $3 WHERE id = $4'
        : 'UPDATE about_info SET text = $1, text_en = $2 WHERE id = $3';
      const params = image
        ? [text, text_en, image, existing.id]
        : [text, text_en, existing.id];

      db.query(query, params, (err) => {
        if (err) return res.status(500).json({ message: 'Gagal update', error: err });

        // Hapus gambar lama jika ada gambar baru
        if (image && existing.image) {
          const oldPath = path.resolve('public/uploads/tentang', existing.image);
          fs.unlink(oldPath, (err) => {
            if (err) console.error('Gagal hapus gambar lama:', err);
          });
        }

        res.json({ message: 'Berhasil update Tentang Kami' });
      });

    } else {
      // Jika belum ada data, insert baru
      db.query(
        'INSERT INTO about_info (text, text_en, image) VALUES ($1, $2, $3)',
        [text, text_en, image],
        (err) => {
          if (err) return res.status(500).json({ message: 'Gagal simpan', error: err });
          res.status(201).json({ message: 'Berhasil simpan Tentang Kami' });
        }
      );
    }
  });
};

// Get "Tentang Kami"
export const getAbout = (req, res) => {
  db.query('SELECT * FROM about_info LIMIT 1', (err, result) => {
    if (err) return res.status(500).json({ message: 'Gagal ambil data', error: err });
    res.json(result.rows[0] || {});
  });
};

// Delete "Tentang Kami"
export const deleteAbout = async (req, res) => {
  try {
    const result = await db.query('SELECT image FROM about_info LIMIT 1');
    const image = result.rows[0]?.image;

    await db.query('DELETE FROM about_info');

    if (image) {
      const filePath = path.resolve('public/uploads/tentang', image);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Gagal hapus gambar tentang:', err);
      });
    }

    res.json({ message: 'Tentang Kami berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal hapus Tentang Kami' });
  }
};
