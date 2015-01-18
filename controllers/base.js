require('dotenv').load();
var collections = ['deals', 'cities', 'categories', 'providers', 'price'];
var db = require("mongojs").connect(process.env.BOXEDSALE_MONGODB_URL, collections);
var Joi = require('joi');
var _ = require('underscore');
var loading = 'Fetching deals...';
var google = require('google');

// var bulk = db.deals.initializeOrderedBulkOp();

// bulk.find({provider_name: "Amazon Local", merchant_locality: "albany"}).update({$set: {merchant_locality: "boston"}});

// bulk.execute(function(err, res) {
//  console.log(res);
// });

// db.deals.distinct("category_name", {}, function(err,res){
// 	res.filter(function(str){
// 		return (/\S/).test(str);
// 	});

// 	res.forEach(function(str){
// 		var e = str.split(' ');
// 		e.filter(function(str){
// 			return (/\S/).test(str);
// 		});
// 		console.log(e);
// 	});
// });


String.prototype.replaceArray = function(find, replace) {
    var replaceString = this;
    var regex;
    for (var i = 0; i < find.length; i++) {
        regex = new RegExp(find[i], "g");
        replaceString = replaceString.replace(regex, replace[i]);
    }
    return replaceString;
};



var priceArray = {
    'less than $25': {
        $lt: 25
    },
    'less than $50': {
        $lt: 50
    },
    'less than $75': {
        $lt: 75
    },
    'over $75': {
        $gt: 75
    }
};

function hashFn(item, arr) {
    return arr[item];
}


module.exports = {
    all_deals: {
        handler: function(request, reply) {

            "use strict";

            var limit = request.query.limit || 20;
            var skip = request.query.offset || 0;
            var findObj = {};



            if (request.query.category) {
                var item = decodeURIComponent(request.query.category);

                findObj.category_name = new RegExp(item, "i");
            }


            if (request.query.city) findObj.merchant_locality = new RegExp(request.query.city, 'i');

            if (request.query.geo) {
                var lng = request.query.geo[0];
                var lat = request.query.geo[1];

                findObj.loc = {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [lng, lat]
                        },

                        $maxDistance: 5000 // 5 miles = roughly 8046.72meteres
                    }
                };

            }

            db.deals.find(findObj).skip(skip).limit(limit, function(err, results) {
                reply(results);
            });
        },

        validate: {
            query: {
                limit: Joi.number().integer().min(1).max(50).
                default(20),
                offset: Joi.number().min(1).max(100).integer(),
                category: Joi.string(),
                city: Joi.string(),
                provider: Joi.string(),
                region: Joi.string(),
                geo: Joi.array()
            }
        }

    },



    cities: {
        handler: function(request, reply) {
            db.cities.find({}, function(err, results) {
                reply(results);
            });
        }

    },

    price: {
        handler: function(request, reply) {
            db.price.find({}, function(err, results) {
                reply(results);
            });
        }

    },

    categories: {
        handler: function(request, reply) {
            db.categories.find({}, function(err, results) {
                reply(results);
            });
        }

    },


    providers: {
        handler: function(request, reply) {
            db.providers.find({}, function(err, results) {
                reply(results);
            });
        }

    }


};