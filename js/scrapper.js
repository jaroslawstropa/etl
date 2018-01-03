var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var MongoClient = require('mongodb').MongoClient;
var mongoUrl = "mongodb://localhost:27017/mydb";

app.post('/scrape', function(req, res){
    var product_id = req.param('id');

    url = 'https://www.ceneo.pl/'+product_id;

    request(url, function(error, response, html){
        if(!error){

            var $ = cheerio.load(html);

            var title, release, rating;
            var json = { title : "", release : "", rating : ""};

            $('.product-name').filter(function(){
                var data = $(this);
                title = data.children().first().text();

                json.title = title;
            });

            $('.product-score').filter(function(){
                var data = $(this);
                rating = data.text();

                json.rating = rating;
            })
        }

        MongoClient.connect(mongoUrl, function(err, db) {
            if (err) throw err;
            var dbase = db.db("mydb"); //here
            dbase.collection("products").insertOne(json, function(err, res) {
                if (err) throw err;
                console.log("Number of documents inserted: " + res.insertedCount);
                db.close();
            });
        });

        fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){

            console.log('File successfully written! - Check your project directory for the output.json file');

        });

        res.send(json)

    }) ;
});

app.listen('8081');
console.log('Magic happens on port 8081');
exports = module.exports = app;