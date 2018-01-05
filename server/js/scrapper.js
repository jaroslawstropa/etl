var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var MongoClient = require('mongodb').MongoClient;
var mongoUrl = "mongodb://localhost:27017/mydb";
require('./getProducts.js');


//addGetProductsWebService();

app.post('/etl', function(req, res){
    var product_id = req.param('id');

    url = 'https://www.ceneo.pl/'+product_id;

    request(url, function(error, response, html){
        if(!error){

            var $ = cheerio.load(html);

            var id, title, release, rating, type, product, additionally,
                disadvantages, advantages, summary, starsNumbers, author,
                date, recommendation, helpfulNumbers, unhelpfulNumbers;
            var json = { id : "", type : "", product : "", additionally : "",
                opinions :
                [
                    {disadvantages : "", advantages : "", summary : "",
                    starsNumbers: "", author : "", date : "", recommendation : "",
                        helpfulNumbers : "", unhelpfulNumbers: ""}
                ]};

            json.id = product_id;
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

            });

        }

        MongoClient.connect(mongoUrl, function(err, db) {
            if (err) throw err;
            var myquery = { id: product_id };
            var newvalues = { $set: json };
            var dbase = db.db("mydb"); //here
            dbase.collection("products").updateOne(myquery, newvalues, { upsert: true } , function(err, res) {
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

app.get('/', function(req, res){
    var response = '';

    MongoClient.connect(mongoUrl, function(err, db) {
        if (err) throw err;
        var mysort = { name: -1 };
        var dbase = db.db("mydb"); //here
        dbase.collection("products").find().sort(mysort).toArray(function(err, result) {
            if (err) throw err;
            console.log(result);
            response = result;
            db.close();
            fs.writeFile('output.json', JSON.stringify(response, null, 4), function(err){
                console.log('File successfully written! - Check your project directory for the output.json file');
            });

            res.send(response)
        });

    });
});

app.post('/extract', function(req, res){
    var product_id = req.param('id');

    url = 'https://www.ceneo.pl/'+product_id;

    request(url, function(error, response, html){
        fs.writeFile(product_id+'.html', html, function(err){
            console.log('File successfully written! - Check your project directory for the output.json file');
        });

        res.send(html)

    }) ;
});

app.post('/transform', function(req, res){
    var product_id = req.param('id');

    var content = fs.readFileSync(product_id+'.html');

    var $ = cheerio.load(content);

    var id, title, release, rating, type, product, additionally,
        disadvantages, advantages, summary, starsNumbers, author,
        date, recommendation, helpfulNumbers, unhelpfulNumbers;
    var json = { id : "", type : "", product : "", additionally : "",
        opinions :
            [
                {disadvantages : "", advantages : "", summary : "",
                    starsNumbers: "", author : "", date : "", recommendation : "",
                    helpfulNumbers : "", unhelpfulNumbers: ""}
            ]};

    json.id = product_id;
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

    });

    fs.writeFile(product_id+'.json', JSON.stringify(json, null, 4), function(err){
        console.log('File successfully written! - Check your project directory for the output.json file');
    });
    res.send(json);
});

app.post('/load', function(req, res){
    var product_id = req.param('id');

    var content = fs.readFileSync(product_id+'.json').toString();
    MongoClient.connect(mongoUrl, function(err, db) {
        if (err) throw err;
        var myquery = { id: product_id };
        var newvalues = { $set: content };
        var dbase = db.db("mydb"); //here
        dbase.collection("products").updateOne(myquery, newvalues, { upsert: true } , function(err, res) {
            if (err) throw err;
            console.log("Number of documents inserted: " + res.insertedCount);
            db.close();
        });
    });

    res.send(content);
});

app.listen('8081');
console.log('Magic happens on port 8081');
exports = module.exports = app;