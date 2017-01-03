var express = require('express');
var router = express.Router();

var articleProvider = require('../articleProvider');
var ap = new articleProvider.ArticleProvider('localhost',27017);


/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

router.post('/blog/deleteComment',function(req,res){
	var id = req.body.id;
	var person = req.body.person;
	var content = req.body.content;

	var comment = {
		person: person,
		content: content
	};

	console.log(comment);	

	ap.removeCommentFromArticle(id,comment,function(err,article){
		if(err){
			console.log("SHIT");
		} else{
			console.log("DELETED Successfully" + article);
		}
	});
});

module.exports = router;
