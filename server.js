var express = require("express");
var http = require('http');
var fs = require('fs');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var mongoose = require('mongoose');
var request = require('request');

var Channels = require('./server/schemas/channels.schema.js');

require('./server/tasks.js');

var port = process.env.PORT || 3700;

app.use(require('prerender-node'));

require('./server/routes/adaptv.routes.js')(app);

// define the root directory for the client files
app.use(express.static('app/src'));

// define the directory for the lib folder
app.use('/lib', express.static('app/lib'));

mongoose.connect('mongodb://localhost/adaptv');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {});

var User = require('./server/schemas/users.schema.js');

var user = new User({
	name: 'User A',
	mac: '00:26:AA:A1:E7:80'
});

user.save(function (err, user) {
	if (err) return console.error(err);
}

io.on('connection', function (socket) {
	socket.on('channels', function (data) {
		Channels.find({
			$or: [{
				serviceId: 8261
			}, {
				serviceId: 8384
			}, {
				serviceId: 4172
			}, {
				serviceId: 4287
			}, {
				serviceId: 8500
			}],
			providerId: 3
		}).sort({
			'providerId': 1
		}).exec(function (err, data) {
			socket.emit('channels', data);
		});
	});

	socket.on('viewing', function (){

	});

	socket.on('disconnect', function (data) {
		//Set as not viewing channels
	})
});

// for when not using socket.io
server.listen(port);

// when using socket.io
// var io = require('socket.io').listen(app.listen(port));

console.log("Listening on port " + port);
