var express = require('express');
var app = express();
var fs = require("fs");
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var hash = require('object-hash');
var auth = express.Router();
var login = express.Router();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/', auth);
app.use('/user', login);

login.use( function(req, res, next) {
    var users = JSON.parse(fs.readFileSync("db.txt", "utf8"));
    var activeUsers = users["active"];
    var token = req.body.token;
    var arr = [];
    var res = 0;
    for(key in activeUsers){
        arr.push(activeUsers[key].token)
    };
    for(var i = 0; i < arr.length; i++){
        if(arr[i] == token){
            res += 1;
        }
    };
    if(res == 0) {

    }
    else {
        next()
    } ;
});

var getData = function(req) {
    var data = JSON.parse(fs.readFileSync("db.txt", "utf8"));
    var key = req.body.key;
    var token = req.body.token;
    var users = data[key];
    var user;
        for(user in users){
            delete user.pass;
        }
    return {data: users, key: key, token: token} ;
};

var loginUser = function(req) {
    var users = JSON.parse(fs.readFileSync("db.txt", "utf8"));
    var activeUsers = users["active"];
    var login = req.body.login;
    var password = req.body.password;
    var found = false;
    if ((login in activeUsers) && (activeUsers[login].pass == password)) {
        found = true;
        var token = activeUsers[login].token;
        return {res: found, token: token };
    };
    return {res: found};
};

var generatePassword = function() {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var string_length = 6;
    var password = '';
    for (var i=0; i <= string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        password += chars.substring(rnum,rnum+1);
    }
    return password;
}

var changePassword = function(req) {
    var users = JSON.parse(fs.readFileSync("db.txt", "utf8"));
    var login = req.body.login;
    var user = users["active"][login];
    var newPassword = generatePassword();
    user.pass = hash(newPassword);
    fs.writeFileSync("db.txt", JSON.stringify(users));
    return {pass: newPassword};
}

var  registerUser = function(req) {
    var data = JSON.parse(fs.readFileSync("db.txt", "utf8"));
    var user = req.body;
    user.token = hash(user.login + user.pass);
    if(user.login in data['active']){
        return {
            res: false,
            error: 'You are registered user!!!'
        }
    }
    else if(user.login in data['removed']){
        return {
            res: false,
            error: 'You are removed user please contact to your admin'
        }
    }
    else {
        user.token = hash(user.login + login.pass);
        data['active'][user.login] = user;
        fs.writeFileSync("db.txt", JSON.stringify(data));
        return {
            res: true
        }
    }
};

var addUser = function(req) {
    var data = JSON.parse(fs.readFileSync("db.txt", "utf8"));
    var login = req.body.login;
    var key = req.body.key;
    var user;
    if(key == "active"){
        user = data['removed'][login];
    }
    if(key == "removed") {
        user = data["active"][login];
    }
    var users = data[key];
    users[login] = user;
    data[key] = users;
    fs.writeFileSync("db.txt", JSON.stringify(data));
    return true;
};

var removeUser = function(req) {
    var data = JSON.parse(fs.readFileSync("db.txt", "utf8"));
    var login = req.body.login;
    var key = req.body.key;
    var users = data[key];
    delete users[login];
    data[key] = users;
    fs.writeFileSync("db.txt", JSON.stringify(data));
    return true;
};

auth.get('/', function (req,res) {
    res.send('hello')
});

auth.post('/register', function(req, res) {
    res.send(registerUser(req));
});

login.post('/getData', function(req, res) {
    res.send(getData(req));
});

auth.post('/login', function(req, res) {
    res.send(loginUser(req));
});

auth.post('/changePassword', function(req, res) {
    res.send(changePassword(req));
});

login.post('/addUser', function(req,res) {
    res.send(addUser(req));
});

login.post('/removeUser', function(req,res) {
    res.send(removeUser(req));
});

app.listen(3000, function(){
    console.log('example');
});