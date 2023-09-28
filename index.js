const { Server } = require("socket.io");
const port = process.env.PORT || 8000;
const io = new Server(port, {
  cors: true,
});

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log("Socket connected", socket.id);

  socket.on("room:join", (data) => {
    try {
      const { email, room } = data;
      emailToSocketIdMap.set(email, socket.id);
      socketIdToEmailMap.set(socket.id, email);
      io.to(room).emit("user:joined", { email, id: socket.id });
      socket.join(room);
      io.to(socket.id).emit("room:join", data);
    } catch (error) {
      console.error("Error handling 'room:join' event:", error);
      // You can optionally emit an error event or take other error-handling actions here
    }
  });

  socket.on("user:call", ({ to, offer }) => {
    try {
      io.to(to).emit("incoming:call", { from: socket.id, offer });
    } catch (error) {
      console.error("Error handling 'user:call' event:", error);
      // You can optionally emit an error event or take other error-handling actions here
    }
  });

  socket.on("call:accepted", ({ to, ans }) => {
    try {
      io.to(to).emit("call:accepted", { from: socket.id, ans });
    } catch (error) {
      console.error("Error handling 'call:accepted' event:", error);
      // You can optionally emit an error event or take other error-handling actions here
    }
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    try {
      io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
    } catch (error) {
      console.error("Error handling 'peer:nego:needed' event:", error);
      // You can optionally emit an error event or take other error-handling actions here
    }
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    try {
      io.to(to).emit("peer:nego:final", { from: socket.id, ans });
    } catch (error) {
      console.error("Error handling 'peer:nego:done' event:", error);
      // You can optionally emit an error event or take other error-handling actions here
    }
  });
});
