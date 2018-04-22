var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var routes = require('./routes/routes.js');
var hbs = require('express-handlebars');
var expressValidator = require('express-validator');
var expressSession = require('express-session');
var bodyParser = require("body-parser");
const mongoClient = require('mongodb').MongoClient;

app.use('/', routes);
app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutDir:__dirname + '/views/layouts/'}));
app.set('views', __dirname + '/views/templates/');
app.set('view engine', 'hbs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false }));
app.use(expressValidator());
app.use(expressSession({secret:"node", saveUninitialized: false, resave: false}));

var clients = 0;
var nsp = io.of("/nsp1");
var chat = io.of("/chat");
var user = io.of("/user");

user.on('connection', function(socket){
  console.log('Here we go again');

  socket.on('userData', function(err, title){
    console.log(title);
    mongoClient.connect('mongodb://localhost:27017/', function(err, db, title){
      if(err) throw err;
      const database = db.db("test");
      database.collection('data').insertOne(title, function(err){
        if(err) console.log('Unable to insert data');
        console.log('Data inserted');
      });
    });
  });
});

var roomno = 1;
var users = [];

chat.on('connection', function(socket){
  console.log('User connected');
  socket.on('setUser', function(data){
    console.log('Form send');
    if(users.indexOf(data)===-1){
      users.push(data);
      socket.emit('correctUsername', {username: data});
    }else{
      socket.emit('usernameExists', {username: data});
    }
  });
});


nsp.on('connection', function(socket){
  socket.emit('wel', { welcone: "Hello my dear" });
  socket.send('Zostales zalogowany jako xxx');

  if(io.nsps['/nsp1'].adapter.rooms["room"+roomno] && io.nsps['/nsp1'].adapter.rooms["room"+roomno]['length'] > 1) roomno++;
   socket.join("room"+roomno);
   nsp.to("room"+roomno).emit('connectToRoom', "You are in room no. "+roomno);
   socket.leave("room"+roomno);
});
io.on('connection', function(socket){
  clients++;
  setTimeout( function(){ socket.send({name: "Adam"}) } , 500);
  setTimeout(function(){ socket.emit('testEmit', {desc: "Hi budy!"}) }, 1000);

  io.sockets.emit('broadcast', {desc: clients+' users online.'} );
  socket.on('clientEmit', function(data){
    console.log(data);
  });

  socket.broadcast.emit('newClient', "New user joined chat");
  socket.emit('newClient', "Welcome Newcomer!" );


//__________________________________________
  socket.on('welcome', function(inv){
    io.emit('welcome', inv);
  });

  socket.on('disconnect', function(){
    clients--;
    io.sockets.emit('broadcast', {desc: clients+' online!'});
  });

  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
