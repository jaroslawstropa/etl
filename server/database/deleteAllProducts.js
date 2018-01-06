var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbase = db.db("mydb"); //here
    dbase.collection("products").deleteMany(function(err, obj) {
        if (err) throw err;
        console.log("1 document deleted");
        db.close();
    });
});