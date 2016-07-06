const express = require('express');
var router = express.Router();
var db = require('../models/db');
var bodyParser = require('body-parser');
const bcrypt = require('bcrypt')

router.get('/', function (request, response) {
	console.log(request.session)
	var user = request.session.user;
	response.render('index', {
		titleHead: 'Blog Application',
		message: request.query.message,
		user: user
	});
});
// #### REGISTER #### FORM ON HOME-PAGE POST
router.post('/create-user', function (request, response) {
// take the input fields from the register form and save it to the DB as new user
console.log("Create user : " + request.body.username)
bcrypt.hash(request.body.userpassword, 9, function(err, hash) {
			if (err) {
				return err
			} else {
				db.User.create({
				name: request.body.username,
				email: request.body.useremail,
				password: hash
				})
			}
		})
console.log("Registration for " + request.body.username + " succeded")
response.redirect('/');
})

// ##### LOGIN ##### FORM ON HOME-PAGE POST
router.post('/login-user', bodyParser.urlencoded({extended: true}), function (request, response) {
	console.log("Login has been sended")

	db.User.findOne({
		where: {
			name: request.body.loginUserName
		}
	}).then(function (user) {
		console.log("Login match made for " + user.name)
		bcrypt.compare(request.body.loginUserPassword, user.password, function (err, res) {
			if (err) {
				console.log(err)
			} else {
				if (user !== null && res == true) {
					request.session.user = user;
					response.redirect('/profile');
				} else {
					response.redirect('/?message=' + encodeURIComponent("TRIED LOGIN => Invalid email or password."));
				}
			}
	});
	}, function (error) {
		response.redirect('/?message=' + encodeURIComponent("Error => Invalid email or password."));
	});
});


// ###### LOG-OUT ######
router.get('/logout', function (request, response) {
	console.log("USER is LOGGED-OUT")	
	request.session.destroy(function(error) {
		if(error) {
			throw error;
		}
		response.redirect('/?message=' + encodeURIComponent("Successfully logged out."));
	})
});

// ###### PROFILE ######
router.get('/profile', function (request, response) {
	console.log("LANDED on PROFILE")
	var user = request.session.user;
	if (user === undefined) {
		response.redirect('/?message=' + encodeURIComponent("Please log in to view your profile."));
	} else {
		response.render('profile', {
			titleHead: 'Profile',
			user: user
		});
	}
});
// #### PAGE of CREATE POST ####
router.get('/create-post', function (request, response) {
	console.log("LANDED ON CREATE POST")
	var user = request.session.user;
	if (user === undefined) {
		response.redirect('/?message=' + encodeURIComponent("Please log in to view your profile."));
	} else {
		response.render('create-post', {
			titleHead: 'Create New Post',
			user: user
		});
	}
})
// #### POST the BLOG POST
router.post('/post-post', function (request, response) {
	console.log("BLOGPOST on the way")
	var restoredUser = db.User.build(request.session.user)
	restoredUser.createPost({
		title: request.body.titlePost,
		body: request.body.bodyPost
	})
	
	response.redirect('/view-own-posts')
})

// ###### VIEW SPECIFIC POST ######

router.get('/singlepost/:id', function (request, response) {
	var requestParameters = request.params;
	var user = request.session.user;
	// console.log(requestParameters)	
	console.log("request param : ")
	if (user === undefined) {
		response.redirect('/?message=' + encodeURIComponent("Please log in to view your profile."));
	} else {
		db.Post.findOne({ 
			where: {
				id: request.params.id
			},	
			include: [
				{model: db.Comment, include: [
					{model: db.User}
				]}
			]
			}).then(function (post) {
				console.log(post)
				response.render('singlepost', {
					titleHead: 'Single Post',
					user: user,
					post: post
				})
			})
		}
});

// #### VIEW ALL POSTS ####
router.get('/view-all-posts', function (request, response) {
	console.log("LANDED ON VIEW ALL POSTS")
	var user = request.session.user;	
	if (user === undefined) {
		response.redirect('/?message=' + encodeURIComponent("Please log in to view your profile."));

	} else {
		db.Post.findAll( { include:[db.User, {model: db.Comment, include: [db.User] }] } ).then(function (posts){
			response.render('view-all-posts', {
				titleHead: 'View All Posts',
				data: posts,
				user: user
			})
		})
	}
});


// #### VIEW OWN POSTS ####
router.get('/view-own-posts', function (request, response) {
	console.log("LANDED ON VIEW OWN")
	var user = request.session.user;
	if (user === undefined) {
		response.redirect('/?message=' + encodeURIComponent("Please log in to view your profile."));
	} else {
		db.Post.findAll({ 
			where: {
				userId: user.id
			},	
			include: [
				{model: db.Comment, include: [
					{model: db.User}
				]}
			]
			}).then(function (posts) {
				console.log(posts)
				response.render('view-own-posts', {
					titleHead: 'View OWN Posts',
					data: posts,
					user: user
				})
			})
		}
	})
// ##### POST A COMMENT #####
router.post('/commentPost', function(request, response){
	console.log("COMMENT on the way")
	var user = request.session.user;
	// var restoredUser = User.build(request.session.user);
	console.log(user)
    Promise.all([
        db.Comment.create({
            body: request.body.commentfield
        }),
        db.User.findOne({
            where: {
                id: request.session.user.id
            }
        }),
       db.Post.findOne({
            where: {
                id: request.body.id
            }
        })
    ]).then(function(allofthem){
            allofthem[0].setUser(allofthem[1])
            allofthem[0].setPost(allofthem[2])
    }).then(function(){
        response.redirect(request.body.origin)
    })
})
module.exports = router