import fs from 'fs';
import { join } from 'path';
import { createServer } from 'http';
import express, { Request, Response } from 'express';
import { Socket, Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, { maxHttpBufferSize: 1e8 });
const PORT = 4000;

const text = { data: '' };
const UPLOAD_DIR = join(__dirname, '../public/uploads');

app.use(express.static(join(__dirname, '../public')));

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

app.get('/', (req: Request, res: Response) => {
  res.sendFile(join(__dirname, '../public', 'index.html'));
});

io.on('connection', (socket: Socket) => {
  socket.emit('textChange', text);
  socket.emit('fileListUpdate', getFileList());

  socket.on('textChange', (msg: string) => {
    text.data = msg;
    io.emit('textChange', text);
  });

  socket.on('uploadFile', (meta, buffer: Buffer) => {
    const filePath = join(UPLOAD_DIR, meta.name);
    fs.writeFile(filePath, Buffer.from(buffer), (err) => {
      if (!err) {
        io.emit('fileListUpdate', getFileList());
      }
    });
  });

  socket.on('deleteFile', (fileName: string) => {
    const filePath = join(UPLOAD_DIR, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      io.emit('fileListUpdate', getFileList());
    }
  });
});

function getFileList() {
  return fs.readdirSync(UPLOAD_DIR).map((name) => ({
    name,
    url: `/uploads/${name}`,
  }));
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
