import db from '../models/db.js';
import { v2 as cloudinary } from 'cloudinary';

// =============================
// === SLIDER SECTION =========
// =============================

// Upload slider image ke Cloudinary
export const uploadSliderImage = (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Tidak ada file yang diupload' });

  const imageUrl = req.file.path;       // URL lengkap dari Cloudinary
  const publicId = req.file.filename;   // public_id dari Cloudinary

  db.query(
    'INSERT INTO slider_images (image_url, public_id) VALUES ($1, $2)',
    [imageUrl, publicId],
    (err) => {
      if (err) return res.status(500).json({ message: 'Gagal menyimpan ke database', error: err });
      res.status(201).json({ message: 'Upload berhasil', imageUrl });
    }
  );
};

// Get all slider images
export const getSliderImages = (req, res) => {
  db.query('SELECT * FROM slider_images ORDER BY id DESC', (err, result) => {
    if (err) return res.status(500).json({ message: 'Gagal mengambil data', error: err });
    res.json(result.rows);
  });
};

// Delete slider image + Cloudinary image
export const deleteSliderImage = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('SELECT public_id FROM slider_images WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    const publicId = result.rows[0].public_id;

    // Hapus dari Cloudinary
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }

    // Hapus dari database
    await db.query('DELETE FROM slider_images WHERE id = $1', [id]);

    res.json({ message: 'Slider berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal hapus slider' });
  }
};

// =============================
// === ABOUT SECTION ==========
// =============================

export const saveAbout = (req, res) => {
  const { text, text_en } = req.body;
  const image = req.file ? req.file.path : null;
  const publicId = req.file ? req.file.filename : null;

  if (!text && !text_en && !image) {
    return res.status(400).json({ message: 'Isi deskripsi (ID/EN) atau gambar terlebih dahulu.' });
  }

  db.query('SELECT * FROM about_info LIMIT 1', (err, result) => {
    if (err) return res.status(500).json({ message: 'Gagal cek data', error: err });

    if (result.rows.length > 0) {
      const existing = result.rows[0];

      const query = image
        ? 'UPDATE about_info SET text = $1, text_en = $2, image = $3, public_id = $4 WHERE id = $5'
        : 'UPDATE about_info SET text = $1, text_en = $2 WHERE id = $3';

      const params = image
        ? [text, text_en, image, publicId, existing.id]
        : [text, text_en, existing.id];

      db.query(query, params, async (err) => {
        if (err) return res.status(500).json({ message: 'Gagal update', error: err });

        // Hapus gambar lama dari Cloudinary
        if (image && existing.public_id) {
          try {
            await cloudinary.uploader.destroy(existing.public_id);
          } catch (e) {
            console.warn('Gagal hapus gambar lama dari Cloudinary:', e.message);
          }
        }

        res.json({ message: 'Berhasil update Tentang Kami' });
      });

    } else {
      // Insert baru
      db.query(
        'INSERT INTO about_info (text, text_en, image, public_id) VALUES ($1, $2, $3, $4)',
        [text, text_en, image, publicId],
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

// Delete "Tentang Kami" + gambar dari Cloudinary
export const deleteAbout = async (req, res) => {
  try {
    const result = await db.query('SELECT public_id FROM about_info LIMIT 1');
    const publicId = result.rows[0]?.public_id;

    await db.query('DELETE FROM about_info');

    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (e) {
        console.warn('Gagal hapus gambar Cloudinary:', e.message);
      }
    }

    res.json({ message: 'Tentang Kami berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal hapus Tentang Kami' });
  }
};
