const fs = require('fs/promises');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL is missing.');
}

if (!supabaseServiceRoleKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing.');
}

const supabase = createClient(
  supabaseUrl,
  supabaseServiceRoleKey
);

const BUCKET_NAME = 'easyxerox-orders';

async function uploadFileToSupabase(file, uploadBatchId) {
  const fileBuffer = await fs.readFile(file.path);

  const extension = path.extname(file.originalname).toLowerCase();

  const storagePath = `orders/${uploadBatchId}/${file.filename}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, fileBuffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  return {
    storagePath,
    bucket: BUCKET_NAME,
    originalName: file.originalname,
    savedName: file.filename,
    mimeType: file.mimetype,
    extension,
    sizeBytes: file.size,
  };
}

async function deleteSupabaseFile(storagePath) {
  if (!storagePath) return;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([storagePath]);

  if (error) {
    console.error(
      `Failed to delete Supabase file ${storagePath}:`,
      error.message
    );
  }
}

module.exports = {
  uploadFileToSupabase,
  deleteSupabaseFile,
  supabase,
  BUCKET_NAME,
};