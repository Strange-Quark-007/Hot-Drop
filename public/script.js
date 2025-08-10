const socket = io();

const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
let files = [];

// Add paste event listener for automatic image uploads
document.addEventListener('paste', handlePaste);

window.addEventListener('dragover', (e) => e.preventDefault());
window.addEventListener('drop', (e) => e.preventDefault());

socket.on('textChange', (text) => {
  const textArea = document.getElementById('textArea');
  textArea.value = text.data;
});

socket.on('fileListUpdate', (filesArr) => {
  files = filesArr;
  renderFileList();
});

function handleTextChange() {
  const textArea = document.getElementById('textArea');
  const text = textArea.value;
  socket.emit('textChange', text);
}

function handleCopy() {
  const textArea = document.getElementById('textArea');
  const cursorStart = textArea.selectionStart;
  const cursorEnd = textArea.selectionEnd;
  textArea.select();
  textArea.setSelectionRange(0, 99999);
  document.execCommand('copy');
  textArea.setSelectionRange(cursorStart, cursorEnd);
  textArea.focus();
}

async function handleDrop(e) {
  e.preventDefault();
  const selected = Array.from(e.dataTransfer.files);
  for (const file of selected) {
    const buffer = await file.arrayBuffer();
    socket.emit('uploadFile', { name: file.name }, new Uint8Array(buffer));
  }
}

async function handleUpload(e) {
  const selected = Array.from(e.target.files);
  for (const file of selected) {
    const buffer = await file.arrayBuffer();
    socket.emit('uploadFile', { name: file.name }, new Uint8Array(buffer));
  }
}

async function handlePaste(e) {
  const items = e.clipboardData?.items;
  if (!items) return;

  for (let item of items) {
    if (item.type.indexOf('image') !== -1) {
      const file = item.getAsFile();
      if (file) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const extension = file.name.split('.').pop() || 'png';
        const fileName = `image-${timestamp}.${extension}`;

        const buffer = await file.arrayBuffer();
        socket.emit('uploadFile', { name: fileName }, new Uint8Array(buffer));
      }
    }
  }
}

function downloadFile(url, fileName) {
  const encodedFileName = encodeURIComponent(fileName);
  const downloadUrl = `${url}?filename=${encodedFileName}`;

  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = fileName;
  a.click();
}

function handleDownloadAll() {
  if (!files.length) {
    return alert('No files to download.');
  }
  files.forEach(({ url, name }) => downloadFile(url, name));
}

function renderFileList() {
  fileList.innerHTML = '';
  files.forEach((file) => {
    const fileRow = document.createElement('div');
    fileRow.className = 'file-row courier-prime-regular';

    fileRow.innerHTML = `
      <a href="${file.url}" target="_blank" class="file-name"><span>${file.name}</span></a>
      <div class="actions">
        <button class="file-button" onclick="downloadFile('${file.url}', '${file.name}')">
          Download
        </button>
        <button class="file-button delete" onclick="socket.emit('deleteFile', '${file.name}')">
          Delete
        </button>
      </div>
    `;

    fileList.appendChild(fileRow);
  });
}
