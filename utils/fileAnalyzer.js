const fs = require('fs/promises');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
const imageExtensions = ['.jpg', '.jpeg', '.png'];

function getFileType(extension) {
  const ext = extension.toLowerCase();
  if (ext === '.pdf') return 'pdf';
  if (imageExtensions.includes(ext)) return 'image';
  if (ext === '.doc' || ext === '.docx') return 'document';
  return 'unknown';
}

async function getPdfPageCount(filePath) {
  const bytes = await fs.readFile(filePath);
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return pdf.getPageCount();
}

async function analyzeUploadedFile(file) {
  const extension = path.extname(file.originalname).toLowerCase();
  const fileType = getFileType(extension);
  let pages = 1;
  let note = '';

  if (fileType === 'pdf') {
    try {
      pages = await getPdfPageCount(file.path);
    } catch (error) {
      pages = 1;
      note = 'Could not read PDF pages automatically. Admin should verify manually.';
    }
  }

  if (fileType === 'image') {
    pages = 1;
  }

  if (fileType === 'document') {
    pages = 1;
    note = 'DOC/DOCX page count is demo estimate only. Convert to PDF for accurate page count.';
  }

  return {
    originalName: file.originalname,
    savedName: file.filename,
    diskPath: file.path,
    mimeType: file.mimetype,
    extension,
    fileType,
    sizeBytes: file.size,
    pages,
    note,
  };
}

async function analyzeFiles(files) {
  const result = [];
  for (const file of files) {
    result.push(await analyzeUploadedFile(file));
  }
  return result;
}

module.exports = {
  allowedExtensions,
  analyzeFiles,
};
