var express = require('express');
var app = express();

var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var engines = require('consolidate');
var helpers = require('./helpers');
var bodyParser = require('body-parser');


var bodyParser = require('body-parser')

app.engine('hbs', engines.handlebars);
app.set('views', './views');
app.set('view engine', 'hbs');

app.use(express.static('images'));
app.use(bodyParser.urlencoded({extended: true}));

var userRouter = require('./username');
app.use('/:username', userRouter);

app.get('*.json', function(req, res) {
    res.download('./users/' + req.path);
});

app.get('/data/:username', function(req, res) {
    var username = req.params.username;
    var user = helpers.getUser(username);

    res.json(user);
});

app.get('/', function(req, res) {
    var users = [];

    fs.readdir('users', function(err, files) {
        if (err) throw err;

        files.forEach(function(file) {
            fs.readFile(path.join(__dirname, 'users', file), {encoding: 'utf8'}, function(err, data) {
                if (err) throw err;

                var user = JSON.parse(data);
                
                user.name.full = _.startCase(user.name.first + ' ' + user.name.last);
                
                users.push(user);

                if (users.length === files.length) {
                    res.render('index', {users: users});
                }
            });
        });
    });
});

app.get('/error/:username', function(req, res) {
    res
    .status(404)
    .send('No user named ' + req.params.username + ' found.');
});

app.get('/big*/', function(req, res, next) {
    //console.log('Big user access');
    next();
});

app.get('/*dog*/', function(req, res, next) {
    //console.log('Dogs go woff!');
    next();
});

var server = app.listen(3000, function() {
    console.log('Server running at http://localhost:' + server.address().port);
});