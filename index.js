const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const path = require("path");
const geolib = require('geolib');
const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
app.set(express.static(path.join(__dirname, "public")));
app.use(express.static("public"));

io.on("connection", function (socket) {
  console.log("connected");
  socket.on("send-location", function (data) {
    io.emit("recive-location", {
      id: socket.id,
      ...data,
    });
  });
  socket.on("second-marker", async function (req) {
    console.log("inside second-marker");
    let marker1 = req.currentPostion;
    let marker2 = req.data;
    console.log(JSON.stringify(req));
    console.log(JSON.stringify(marker1));
    const distance = await geolib.getDistance(marker1, marker2);
    console.log(`Distance: ${distance} meters`);
    if(distance){ 
      console.log("wmitting data")
      socket.emit("Route",{
        id : socket.id,
        distance,
        currentPostion:marker1,
        markedPosition:marker2
      })
    
    }
   else{
    socket.emit("Route",{
      id : socket.id,
      distance : false,
      currentPostion:marker1,
      markedPosition:marker2
    })
   }
  })
  socket.on("disconnect", function () {
    io.emit("user-disconnected", socket.id);
  });
});

app.get("/", function (req, res) {
  res.render("index");
});

server.listen(8000, () => {
  console.log("Server Start");
});
