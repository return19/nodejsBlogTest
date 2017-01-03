var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

ArticleProvider = function(host,port){
	this.db = new Db('node-mongo-blog', new Server(host,port,{auto_reconnect: true},{}));
	this.db.open(function(){});
}

ArticleProvider.prototype.getCollection = function(callback){
	this.db.collection('articles',function(err,article_collection){
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