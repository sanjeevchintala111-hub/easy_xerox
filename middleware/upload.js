const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { allowedExtensions } = require('../utils/fileAnalyzer');

function attachUploadBatch(req, res, next) {
  req.uploadBatchId = `batch-${Date.now()}-${crypto.randomBytes(5).toString('hex')}`;
  next();
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'orders', req.uploadBatchId);
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, safeName);
  },
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error('Only PDF, JPG, PNG, JPEG, DOC, and DOCX files are allowed.'));
  }
  cb(null, true);
}

const maxFileSizeMb = Number(process.env.MAX_FILE_SIZE_MB || 20);
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSizeMb * 1024 * 1024,
    files: 20,
  },
});

module.exports = { attachUploadBatch, upload };
