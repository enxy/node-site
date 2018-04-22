const express = require('express');
const router = express.Router();
const path = require('path');
const mongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url_mod = require('url');
const myModule = require('../modules/module1');
var bodyParser = require("body-parser");
var eventEmitter = require('events').EventEmitter, eventEmiter = new eventEmitter();

var url = 'mongodb://localhost:27017/';
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });
// create application/json parser
var jsonParser = bodyParser.json();


router.get('/', function(req, res){
  res.render( 'form', { title: "Second App", user: "Mama Muminka", condition: true, arr: [1,2,3,4,5] });
});
router.get('/user', function(req, res){
  res.render('form');
});
router.get('/nsp1', function(req, res){
  res.sendFile( path.resolve('views/wel.html'));
});
router.get('/nsp1/mini', function(req, res){
  res.sendFile( path.resolve('views/wel2.html'));
});
router.get('/chat', function(req, res){
  res.sendFile(path.resolve('views/chat.html'));
});

router.get('/user-form', function(req, res){
  let params = {
    "title": req.query.title,
    "content": req.query.content,
    "author": req.query.Author
  }
  console.log(params);
  res.render('form', {title:"Send your form", params: params});
});

router.get('/inserted-item', function(req, res){
  mongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("test");
    dbo.collection("data").find({}).toArray(function(err, result){
      if (err) throw err;
      res.render('item-list', {books: result, item: myModule.newVar });
    });
  });
});

router.post('/insert', urlencodedParser, function(req, res){
  var person = {
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
  }
  mongoClient.connect(url, function(err, db){
    if(err) throw err;
    const dbo = db.db("test");
    dbo.collection('data').insertOne(person, function(err){
      if(err) throw err;
      db.close();
    });
  });
  res.redirect(url_mod.format({pathname: '/user-form', query:{
    "title": person.title,
    "content": person.content,
    "author": person.author
    }
  }));
});

router.get('/login-form', function(req, res){
  res.render('user-form', {title: 'Forma Validation', success: false})
});
router.get('/update', function(req, res){

});
router.get('/delete', function(req, res){

});
module.exports = router;
