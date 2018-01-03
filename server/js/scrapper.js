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

            var title, release, rating, type, product, additionally,
                disadvantages, advantages, summary, starsNumbers, author,
                date, recommendation, helpfulNumbers, unhelpfulNumbers;
            var json = { type : "", product : "", additionally : "",
                opinions :
                [
                    {disadvantages : "", advantages : "", summary : "",
                    starsNumbers: "", author : "", date : "", recommendation : "",
                        helpfulNumbers : "", unhelpfulNumbers: ""}
                ]};


            $('.product-name').filter(function(){
                var data = $(this);
                product = data.children().first().text();

                json.product = product;
            });

            //type
            $('.breadcrumb').filter(function(){
                var data = $(this);
                type = data.children().first().text();

                json.type = type;
            });

            $('.product-score').filter(function(){
                var data = $(this);
                rating = data.text();

                json.rating = rating;
            });

            $('.review-box').filter(function(){
                var data = $(this).toString();

                $ = cheerio.load(data);

                disadvantages = $('.cons-cell').text();
                advantages = $('.pros-cell').text();
                summary = $('.product-review-body').text();
                starsNumbers = $('.review-score-count').text();
                author = $('.reviewer-name-line').text();
                date = $('.review-time').text();
                recommendation = $('.product-recommended').text();
                helpfulNumbers = $('.vote-yes').text();
                unhelpfulNumbers = $('.vote-no').text();

                json.opinions.push({disadvantages : disadvantages, advantages : advantages, summary : summary,
                    starsNumbers: starsNumbers, author : author, date : date, recommendation : recommendation,
                    helpfulNumbers : helpfulNumbers, unhelpfulNumbers: unhelpfulNumbers});

                console.log("elo");
            });


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