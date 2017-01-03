$(document).ready(function() {
	$(".comment_delete_buttons").click(function(event){

		var count = $(".comment:visible").length;
		var id = $(this).attr('data-parent-id');
		var comment = $("#" + id);
		comment.css('display', 'none');

		if(count == 1){
			$("#comments_title").css('display', 'none');
		}

		var data = {
			id: getArticleId(),
			person: comment.find(".comment_person").html(),
			content: comment.find(".comment_content").html()
		};

		$.ajax({
	        type: 'POST',
	        data: JSON.stringify(data),
	        contentType: "application/json",
	        //contentType: "application/x-www-form-urlencoded",
	        dataType:'json',
	        url: 'http://localhost:3000/users/blog/deleteComment',                      
	        success: function(data) {
	            console.log('success');
	            console.log(JSON.stringify(data));                               
	        },
	        error: function(error) {
	            console.log("some error in fetching the notifications");
	         }

	    });
	});
});	

function getArticleId(){
	var path = window.location.pathname.split('/');
	var sz = path.length;
	return path[sz-1];
}