const express = require("express");

const app = express();
const path = require("path");
const http = require("http");
const socketio = require("socket.io");

const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

const users = {};

io.on("connection", function(socket) {
    console.log("connected to sockets");

    socket.on("user-joined", function(username) {
        users[socket.id] = username;
        io.emit("user-joined", { id: socket.id, username })
    })
    socket.on("send-location", function(data) {
        io.emit("receive-location", { id: socket.id, username: users[socket.id], ...data})
    })
    socket.on("disconnect", function() {
        io.emit("user-disconnected", { id: socket.id, username: users[socket.id] });
        delete users[socket.id];
    })
})
app.get("/", function(req, res) {
    console.log("ping by github actions")
    res.render("index");
})

server.listen(3000);