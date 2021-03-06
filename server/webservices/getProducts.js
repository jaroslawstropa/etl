var express = require('express');
var app     = express();
var MongoClient = require('mongodb').MongoClient;
var mongoUrl = "mongodb://localhost:27017/mydb";

module.exports = {
    webServiceGetProducts: function() {
        app.get('/', function (req, res) {
            var response = '';

            MongoClient.connect(mongoUrl, function (err, db) {
                if (err) throw err;
                var mysort = {name: -1};
                var dbase = db.db("mydb"); //here
                dbase.collection("products").find().sort(mysort).toArray(function (err, result) {
                    if (err) throw err;
                    console.log(result);
                    response = result;
                    db.close();
                    fs.writeFile('output.json', JSON.stringify(response, null, 4), function (err) {
                        console.log('File successfully written! - Check your project directory for the output.json file');
                    });

                    res.send(response)
                });

            });
        });
    }
};

