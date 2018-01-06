module.exports = {
    deleteAllProducts: function deleteAllProducts() {
        var MongoClient = require('mongodb').MongoClient;
        var url = "mongodb://localhost:27017/mydb";

        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbase = db.db("mydb"); //here
            dbase.collection("products").deleteMany(function (err, obj) {
                if (err) throw err;
                console.log("1 document deleted");
                db.close();
            });
        });
    },
    findAllProducts : function findAllProducts () {
        var MongoClient = require('mongodb').MongoClient;
        var url = "mongodb://localhost:27017/mydb";

        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var mysort = { name: -1 };
            var dbase = db.db("mydb"); //here
            dbase.collection("products").find().sort(mysort).toArray(function(err, result) {
                if (err) throw err;
                console.log(result);
                db.close();
                return result;
            });
        });
    }
};

