var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

// OpenShift vars
var mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || "mongodb://localhost:27017",
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

  }
}
var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
	console.log("initializing db");
  if (mongoURL == null) return;
  	console.log("mongoUrl not null :" + mongoURL);
  var mongodb = require('mongodb');
  if (mongodb == null) return;

  	console.log("mongodb not null");

  mongodb.connect(mongoURL, function(err, conn) {
    	console.log("connecting db");
    if (err) {
    	console.log("error  connecting db");
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  	callback(null);
  });
};

ArticleProvider = function(){
	// this.db = new Db('node-mongo-blog', new Server(host,port,{auto_reconnect: true},{}));
	if (!db) {
    	initDb(function(err){
  			console.log(db);
    	});
  	}
	// this.db.open(function(){});
}

ArticleProvider.prototype.getCollection = function(callback){
	db.collection('articles',function(err,article_collection){
		if(err)	callback(err);
		else callback(null,article_collection);
	});
}


ArticleProvider.prototype.findAll = function(callback){
	this.getCollection(function(err,article_collection){
		if(err)	callback(err);
		else{
			article_collection.find().toArray(function(err,result){
				if(err)	callback(err);
				else	callback(null,result);
			});
		}
	});
}

ArticleProvider.prototype.findById = function(id, callback){
	this.getCollection(function(err,article_collection){

		if(err){ 
			callback(err);
		}
		else{
			article_collection.findOne({_id: ObjectID.createFromHexString(id)}, function(error, result) {
	        	if( error ) callback(error);
	        	else callback(null, result);
	        });
		}
	});
}

ArticleProvider.prototype.save = function(articles, callback){
	var article = null;

	this.getCollection(function(err,article_collection){
		if( typeof(articles.length) == "undefined")
			articles = [articles];

		for(var i = 0; i < articles.length; i++ ){
			article = articles[i];
			article.created_at = new Date();

			if(article.comments == undefined)
				article.comments = [];
			for(var j = 0; j < article.comments.length; j++){
				article.comments[j].created_at = new Date();
			}
		}
		article_collection.insert(articles,function(){
			callback(null,articles);
		});
	});
}

ArticleProvider.prototype.addCommentToArticle = function(id,comment,callback){
	this.getCollection(function(err,article_collection){
		if (err) callback(err);
		else {
			article_collection.update(
				{_id:ObjectID.createFromHexString(id)},
				{"$push": {comments: comment}},
				function(err,article){
					if(err) callback(err);
					else callback(null,article);
				}
			);
		}
	});
}

ArticleProvider.prototype.removeCommentFromArticle = function(id,comment,callback){

	this.getCollection(function(err,article_collection){
		if (err) callback(err);
		else {
			article_collection.update(
				{_id:ObjectID.createFromHexString(id)},
				{"$pull": {comments: comment}},
				function(err,article){
					if(err) callback(err);
					else {
						callback(null,article);
					}
				}
			);
		}
	});
}

exports.ArticleProvider = ArticleProvider;