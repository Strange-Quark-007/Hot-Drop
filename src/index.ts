import express, { Request, Response } from "express";
import { Socket, Server } from "socket.io";
import { createServer } from "http";
import { join } from "path";

const app = express();
const server = createServer(app);
const io = new Server(server);
const PORT = 4000;

const text = { data: "" };

app.use(express.static(join(__dirname, "../public")));

app.get("/", (req: Request, res: Response) => {
  res.sendFile("index.html");
});

io.on("connection", (socket: Socket) => {
  socket.emit("textChange", text);
  socket.on("textChange", (msg: string) => {
    text.data = msg;
    io.emit("textChange", text);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("server running");
});
