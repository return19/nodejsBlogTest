var express = require('express');
var router = express.Router();
var articleProvider = require('../articleProvider');

/* GET home page. */
// router.get('/', function(req, res) {
//   res.render('index', { title: 'Express' });
// });
var ap = new articleProvider.ArticleProvider();
router.get('/', function(req,res){
    
    ap.findAll(function(err,articles){
    	res.render('index.jade',{ 
			title: 'Blog',
			articles: articles
    	});
    });
});

router.get('/blog/new', function(req,res){
	res.render('blog_new.jade', {
		title: 'Blog',
	});
});

router.post('/blog/new', function(req,res){
	ap.save({
		title: req.param('title'),
		body: req.param('body')
	}, function(err,data){
		res.redirect('/');
	});
});

router.get('/blog/:id', function(req,res){
	ap.findById(req.params.id,function(err,article){
		res.render('single_blog.jade',{
			title: article.title,
			article: article
		});
	});
});

router.post('/blog/:id',function(req,res){
	var comment = {
		person: req.param('person'),
		content: req.param('content'),
		created_at: new Date()
	};
	ap.addCommentToArticle(req.params.id,comment,function(err,article){
		res.redirect('/blog/'+req.params.id);
	});
});

module.exports = router;
