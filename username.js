var express = require('express');
var fs = require('fs');
var helpers = require('./helpers');

var router = express.Router({
    mergeParams: true
});

/*router.all('/', function(req, res, next) {
    console.log(req.method, 'for', req.params.username);
    next();
}); */

// You can use the use method and omit the path altogether, in this case
// it will fire for every request that this route handles regardless of the 
// path
router.use(function(req, res, next) {
    console.log(req.method, 'for', req.params.username, 'at ' + req.path);
    next();
});

router.get('/', helpers.verifyUser, function(req, res) {
    var username = req.params.username;
    var user = helpers.getUser(username);

    res.render('user', {
        user: user,
        address: user.location
    });
});

router.use(function(err, req, res, next) {
    console.log(err.stack);
    res.status(500).send('Something broke!');
});

router.get('/edit', function (req, res) {
  res.send('You want to edit ' + req.params.username + '???')
});

router.put('/', function (req, res) {
  var username = req.params.username;
  var user = helpers.getUser(username);

  user.location = req.body; // req.body will be the data object that is going to be sent by our form

  helpers.saveUser(username, user);

  res.end();
});

router.delete('/', function(req, res) {
    var fp = helpers.getUserFilePath(req.params.username);

    fs.unlinkSync(fp); // delete the file

    res.sendStatus(200); // send status code 200 to let the client know request completed successfully
});

module.exports = router;