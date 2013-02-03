var express = require('express');
    var app = express();

var mongoose = require('mongoose');
  var Schema = mongoose.Schema;

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.locals.pretty = true;
// app.use(express.favicon(__dirname + '/public/img/favicon.ico'));
app.use(express.bodyParser({ keepExtensions: true, uploadDir:__dirname + '/uploads' }));
app.use(express.cookieParser());
app.use(express.session({ secret: 'keyboard cat' }));
app.use(express.static(__dirname + '/public'));
app.use(function(req, res, next){
  res.locals.session = req.session;
  next();
});

mongoose.connect('localhost', 'main');

var exerciseSchema = new Schema({
  title: String,
  body: String
});

var courseSchema = new Schema({
  title: String,
  body: String,
  exercises: [exerciseSchema]
});

var BlockSchema = new Schema({
  title: String,
  access: {type: Boolean, default: true},
  date: {type: Date, default: Date.now},
  courses: [courseSchema]
});

var messageSchema = new Schema({
  title: String,
  body: String,
  date: {type: Date, default: Date.now},
});

var UserSchema = new Schema({
	name: String,
  country: String,
  email: String,
  login: String,
  pass: String,
  status: {type: String, default: 'User'},
  date: {type: Date, default: Date.now},
  messages: [messageSchema],
});

var newsSchema = new Schema({
  title: String,
  body: String,
  date: {type: Date, default: Date.now},
});

var User = mongoose.model('User', UserSchema);
var Block = mongoose.model('Block', BlockSchema);
var News = mongoose.model('News', newsSchema);

function checkAuth(req, res, next) {
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    next();
  }
}

// var block = new Block();
// block.title = 'block 2';
// block.courses.push({title:'rus', body:'lang'});
// block.courses[0].exercises.push({title:'exercise 1', body:'body of exercise 1'});

// block.save(function(err) {
//   if (err) { throw err;}
//   console.log('Block created');
// });

app.get('/', function(req, res) {
	News.find({}).sort('-date').execFind(function(err, news) {
  	res.render('index', {news: news});
	});
});

app.get('/library', function(req, res) {
  res.render('library');
});

app.get('/contacts', function(req, res) {
  res.render('contacts');
});

app.get('/courses', checkAuth, function(req, res) {
	Block.find({}).sort('-date').execFind(function(err, blocks) {
  	res.render('courses', {blocks: blocks});
	});
});

app.get('/course/:block_id/:course_id', checkAuth, function(req, res) {
	var block = req.params.block_id;
	var course = req.params.course_id;

	Block.findById(block, function (err, block) {
		var doc = block.courses.id(course);

		res.render('course', {doc: doc})
	});
});

app.get('/user/:login', function(req, res){

  res.render('user');
});

app.get('/login', function(req, res){
  if (req.session.user_id == '4786242642') {
    res.redirect('/');
  }
  else {
    res.render('login', {status: true});
  }
});

app.post('/login', function (req, res) {
  var post = req.body;

  User.findOne({ 'login': post.login, 'pass': post.password }, function (err, user) {
    if (err) return handleError(err);
    if (user) {
      req.session.user_id = '4786242642';
      req.session.name = user.name;
      req.session.login = user.login;
      req.session.pass = user.pass;
      res.redirect('/');
    } else {
      res.render('login', {status: false});
    }
  });
});

app.get('/registr', function(req, res) {
  res.render('registr');
});

app.post('/registr', function (req, res) {
  var post = req.body;
  var user = new User();

  user.login = post.login;
  user.pass = post.password;
  user.name = post.name;

  user.save(function(err) {
    if(err) {
      throw err;
    }
    console.log('New User created');
    res.redirect('/login');
  });
});

app.get('/logout', function (req, res) {
  delete req.session.user_id;
  delete req.session.name;
  delete req.session.login;
  delete req.session.pass;
  res.redirect('/');
});


app.listen(3000);
console.log('http://127.0.0.1:3000')
