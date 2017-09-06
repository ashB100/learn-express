var express = require('express');
// Express instance
var app = express();

var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var engines = require('consolidate');
var bodyParser = require('body-parser');


var bodyParser = require('body-parser')

function getUserFilePath (username) {
  return path.join(__dirname, 'users', username) + '.json';
}

function getUser (username) {
  var user = JSON.parse(fs.readFileSync(getUserFilePath(username), {encoding: 'utf8'}));
  
  user.name.full = _.startCase(user.name.first + ' ' + user.name.last)
  _.keys(user.location).forEach(function (key) {
    user.location[key] = _.startCase(user.location[key]);
  });

  return user;
}

function saveUser (username, data) {
  var fp = getUserFilePath(username);

  fs.unlinkSync(fp); // delete the file
  
  fs.writeFileSync(fp, JSON.stringify(data, null, 2), {encoding: 'utf8'});
}

function verifyUser(req, res, next) {
     var fp = getUserFilePath(req.params.username);

    fs.exists(fp, function(yes) {
        if (yes) {
            next();
        }
        else {
            //next('route');
            res.redirect('/error/' + req.params.username);
        }
    });
}

app.engine('hbs', engines.handlebars);
app.set('views', './views');
//app.set('view engine', 'jade');
app.set('view engine', 'hbs');

app.use(express.static('images'));
app.use(bodyParser.urlencoded({extended: true}));

app.get('*.json', function(req, res) {
    res.download('./users/' + req.path);
});

app.get('/data/:username', function(req, res) {
    var username = req.params.username;
    var user = getUser(username);

    res.json(user);
});

app.all('/:username', function(req, res, next) {
    console.log(req.method, 'for', req.params.username);
    next();
});

// Express, when you get an HTTP Get request, call this function
app.get('/', function(req, res) {
    /*var buffer = '';

    users.forEach(function(user) {
        buffer += '<a href="/' + user.username + '">' + user.name.full + '<br>'
    });

    res.send(buffer); */

    var users = [];

    fs.readdir('users', function(err, files) {
        files.forEach(function(file) {
            fs.readFile(path.join(__dirname, 'users', file), {encoding: 'utf8'}, function(err, data) {
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

app.get('/:username', verifyUser, function(req, res) {
    var username = req.params.username;
    var user = getUser(username);

    //res.send(username);

    res.render('user', {
        user: user,
        address: user.location
    });
});

app.put('/:username', function (req, res) {
  var username = req.params.username;

  var user = getUser(username);

  // req.body will be the data object that is going to be sent by our form
  user.location = req.body;

  saveUser(username, user);

  res.end();
});

app.delete('/:username', function(req, res) {
    var fp = getUserFilePath(req.params.username);

    fs.unlinkSync(fp); // delete the file

    res.sendStatus(200); // send status code 200 to let the client know request completed successfully
})

var server = app.listen(3000, function() {
    console.log('Server running at http://localhost:' + server.address().port);
});