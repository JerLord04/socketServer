const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const request = require('request');
const lineNotify_Livingroom = require('line-notify-nodejs')('fPp96Lv1AOO4sForg7h4o7cmwkf11S7XtmYWl9PLjoJ');

const url_line_notification = "https://notify-api.line.me/api/notify";

const dotenv = require('dotenv');

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  // console.log('a user connected');
  socket.on('chat message', (data) => {
    console.log(data);
    io.emit('door_status', data);
  })
  socket.on('event_name', (data) => {
    console.log(data);
    lineNotify_Livingroom.notify({
      message: `Living Romm : Door is ${data.status_door}`,
    }).then(() => {
      console.log('send to line completed!');
    });
    io.emit('status_sensor', data);
  })

  socket.on('humudity_sensor',(data) => {
    console.log(data);
    io.emit('humidity_value', data);
  })
  socket.on('useState_test_emit',(data) => {
    
    console.log(data);
  })
});

server.listen(5000, () => {
  console.log('listening on *:5000');
});