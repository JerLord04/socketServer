const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const request = require('request');
const lineNotify_Livingroom = require('line-notify-nodejs')('fPp96Lv1AOO4sForg7h4o7cmwkf11S7XtmYWl9PLjoJ');
const mysql = require('mysql');
const moment = require('moment');

const url_line_notification = "https://notify-api.line.me/api/notify";

const dotenv = require('dotenv');

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "smarthome_project"
});

connection.connect(function (err) {
  if (err) {
    console.error(err);
    throw err;
  } else {
    console.log("Connection to database was successful");
  }
});


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/get_humidity_data', (req, res) => {
  const room_detail = req.query;
  console.log(room_detail.room_id);
  const sql = `SELECT * FROM humidity_tb WHERE room_id = ${room_detail.room_id} ORDER BY id DESC LIMIT 5;`;
  connection.query(sql, (error, results, fields) => {
    if (error) throw error;
    for (const show_data in results) {
      const converted = moment(results[show_data].date, 'YYYY-MM-DD HH:mm:ss').format('MMMM Do YYYY h:mm:ss a');
      results[show_data].date = converted;
    }
    console.log(results);
    res.send(results);
  });
})

app.get('/get_temperature_data', (req, res) => {
  const sql = 'SELECT * FROM temperature_tb ORDER BY id DESC LIMIT 5';
  connection.query(sql, (error, results, fields) => {
    if (error) throw error;
    for (const show_data in results) {
      const converted = moment(results[show_data].date, 'YYYY-MM-DD HH:mm:ss').format('MMMM Do YYYY h:mm:ss a');
      results[show_data].date = converted;
    }
    res.send(results);
  });
})

app.get('/current_date', (req, res) => {
  const sql = 'SELECT * FROM humidity_tb WHERE DATE(date) = CURDATE() AND TIME(date) != CURTIME();';
  connection.query(sql, (error, results, fields) => {
    if (error) throw error;
    res.send(results);
  });
})

io.on('connection', (socket) => {
  console.log('a user connected');
  // socket.on('chat message', (data) =>{
  //   console.log(data);
  // });
  // console.log('a user connected');
  // socket.on('chat message', (data) => {
  //   console.log(data);
  //   io.emit('door_status', data);
  // })
  // socket.on('event_name', (data) => {
  //   console.log(data);
  //   lineNotify_Livingroom.notify({
  //     message: `Living Romm : Door is ${data.status_door}`,
  //   }).then(() => {
  //     console.log('send to line completed!');
  //   });
  //   io.emit('status_sensor', data);
  // })

  socket.on('humudity_sensor', (data) => {
    console.log(data.humudity_now);
    const sql = 'INSERT INTO humidity_tb (date,value) VALUES ((NOW()),?)';
    const params = [data.humudity_now];
    connection.query(sql, params, (error, results, fields) => {
      if (error) throw error;
      console.log('Successfully inserted current datetime value into the database');
    });
  })
  // socket.on('useState_test_emit',(data) => {

  //   console.log(data);
  // })
});

server.listen(5000, () => {
  console.log('listening on *:5000');
});