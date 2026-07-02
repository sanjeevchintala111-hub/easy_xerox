const fileInput = document.getElementById('documents');
const fileList = document.getElementById('fileList');
const uploadForm = document.getElementById('uploadForm');
const submitBtn = document.getElementById('submitBtn');

function formatBytes(bytes) {
  if (!bytes) return '0 KB';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

if (fileInput && fileList) {
  fileInput.addEventListener('change', () => {
    fileList.innerHTML = '';
    const files = Array.from(fileInput.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      const item = document.createElement('div');
      item.className = 'file-pill';
      item.innerHTML = `<strong>${file.name}</strong><span>${formatBytes(file.size)}</span>`;
      fileList.appendChild(item);
    });
  });
}

if (uploadForm && submitBtn) {
  uploadForm.addEventListener('submit', () => {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Analyzing files...';
  });
}
