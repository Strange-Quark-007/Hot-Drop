const socket = io();

const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
let files = [];

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

async function handleUpload(e) {
  const selected = Array.from(e.target.files);
  for (const file of selected) {
    const buffer = await file.arrayBuffer();
    socket.emit('uploadFile', { name: file.name }, new Uint8Array(buffer));
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
      <span>${file.name}</span>
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
