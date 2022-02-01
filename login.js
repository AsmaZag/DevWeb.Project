var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var bcrypt = require('bcrypt');
var app = express();
app.use("/login.css",express.static("login.css"));
app.use("/devWeb.css",express.static("devWeb.css"));
app.use("/pic.jpg",express.static("pic.jpg"));
app.use("/private.css",express.static("private.css"));

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'fati1949',
	database : 'nodejs'
});


app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/devWeb.html'));
});

app.post('/login.html', function(request, response) {
	var email = request.body.email;
	var password = request.body.password;
	if (email && password) {
		connection.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.email = email;
				response.redirect('/private');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter email and Password!');
		response.end();
	}
});

app.get('/private.html', function(request, response) {
	if (request.session.loggedin) {
		response.send('Welcome back, ' + request.session.email + '!');
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});

app.get("/private", function(req,res){
    res.sendFile(__dirname + "/private.html")
})
app.get("/login.html", function(req,res){
    res.sendFile(__dirname + "/login.html")
})
app.get("/logout.html", function(req,res){
    res.sendFile(__dirname + "/logout.html")
})
app.post('/logout.html', function(req, res){
	var email = req.body.email;
	var password = req.body.password;
	var cpassword = req.body.cpassword;
  
	if(cpassword == password){
  
	  var sql = 'select * from users where email = ?;';
  
	  connection.query(sql,[email], function(err, result, fields){
		if(err) throw err;
  
		if(result.length > 0){
		  req.session.flag = 1;
		  res.redirect('/');
		}else{
  
		  var hashpassword = bcrypt.hashSync(password, 10);
		  var sql = 'insert into users(email,password) values(?,?);';
  
		  connection.query(sql,[email, hashpassword], function(err, result, fields){
			if(err) throw err;
			req.session.flag = 2;
			res.redirect('/login.html');
		  });
		}
	  });
	}else{
	  req.session.flag = 3;
	  res.redirect('/login.html');
	}
  });
 

app.listen(4613);
