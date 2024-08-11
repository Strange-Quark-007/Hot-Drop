const socket = io();
socket.on('textChange', (text) => {
  const textArea = document.getElementById('textArea');
  textArea.value = text.data;
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