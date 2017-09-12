// Just to test if we are able to connect to
// our database and get all the documents in our collection
// Run node db.js from console
var uri = 'mongodb://localhost:27017/test';

var MongoClient = require('mongodb').MongoClient;

var findUsers = function(db, callback) {
    var cursor = db
        .collection('users')
        .find(); 
        
        // We're not passing in anything so it will find everything
        // It will return a cursor which we can iterate over
        cursor.each(function(err, doc) {
            if (doc != null) {
                console.dir(doc);
            } 
            else {
                callback()
            }
        });
}

MongoClient.connect(uri, function(err, db) {
    findUsers(db, function() {
        db.close();
    });
});