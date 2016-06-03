var Sequelize = require('sequelize');
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var Promise = require('promise');
// ######### SET DB CONNECTION
var sequelize = new Sequelize('blog', process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {

//note: to make connction to the DB set IP adres
	// host: '192.168.99.100',
// note: port changes everytime I restart Docker
	// port:'32768', 
	host:'localhost',
	dialect: 'postgres'
});

// ######### SET DB TABLES ########## 
var User = sequelize.define('users', {
	name: Sequelize.STRING,
	email: Sequelize.STRING,
	password: Sequelize.STRING
});
var Post = sequelize.define('posts', {
	title: Sequelize.STRING,
	body: Sequelize.TEXT
})
var Comment = sequelize.define('comments', {
	body: Sequelize.TEXT
})
// ######### END DB TABLES ##########
// ######### SET TABLE CONNECTIONS ########
User.hasMany(Post);
Post.belongsTo(User);
User.hasMany(Comment)
Post.hasMany(Comment)
Comment.belongsTo(User)
Comment.belongsTo(Post)

// ######### END TABLE CONNECTIONS ########
// sequelize.sync({force: true}).then(function( ){

// })
// ###### EXPRESS INSTANCE ######
var app = express();

// ##### SET VIEW ENGINE
app.set('views', './src/views');
app.set('view engine', 'jade');

// use the css and js files from public
app.use(express.static('./public/css'));
app.use(express.static('./public/js'));

app.use(bodyParser.urlencoded({ extended:true }))

// #### SESSION ####
app.use(session({
	secret: 'oh wow very secret much security',
	resave: true,
	saveUninitialized: false
}));

// ######## ROUTES ########

// ###### INDEX ######
// GET HOME-PAGE
app.get('/', function (request, response) {
	response.render('index', {
		titleHead: 'Blog Application',
		message: request.query.message,
		user: request.session.user
	});
});
// #### REGISTER #### FORM ON HOME-PAGE POST
app.post('/create-user', function (request, response) {
// take the input fields from the register form and save it to the DB as new user
console.log("Create user : " + request.body.username)
User.create({
	name: request.body.username,
	email: request.body.useremail,
	password: request.body.userpassword
})
console.log("Registration for " + request.body.username + " succeded")
response.redirect('/');
})

// ##### LOGIN ##### FORM ON HOME-PAGE POST
app.post('/login-user', bodyParser.urlencoded({extended: true}), function (request, response) {
	console.log("Login has been sended")
	User.findOne({
		where: {
			name: request.body.loginUserName
		}
	}).then(function (user) {
		console.log("Login match made for " + request.body.loginUserName)
		if (user !== null && request.body.loginUserPassword === user.password) {
			request.session.user = user;
			response.redirect('/profile');
		} else {
			response.redirect('/?message=' + encodeURIComponent("TRIED LOGIN -> Invalid email or password."));
		}
	}, function (error) {
		response.redirect('/?message=' + encodeURIComponent("Error -> Invalid email or password."));
	});
});


// ###### LOG-OUT ######
app.get('/logout', function (request, response) {
	console.log("USER is LOGGED-OUT")	
	request.session.destroy(function(error) {
		if(error) {
			throw error;
		}
		response.redirect('/?message=' + encodeURIComponent("Successfully logged out."));
	})
});

// ###### PROFILE ######
app.get('/profile', function (request, response) {
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
app.get('/create-post', function (request, response) {
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
app.post('/post-post', function (request, response) {
	console.log("BLOGPOST on the way")
	var restoredUser = User.build(request.session.user)
	restoredUser.createPost({
		title: request.body.titlePost,
		body: request.body.bodyPost
	})
	
	response.redirect('/view-own-posts')
})

// ###### VIEW SPECIFIC POST ######

app.get('/singlepost/:id', function (request, response) {
	var requestParameters = request.params;
	var user = request.session.user;
	// console.log(requestParameters)
	// console.log(requestParameters.id)
	
	console.log("request param : ")



	if (user === undefined) {
		response.redirect('/?message=' + encodeURIComponent("Please log in to view your profile."));
	} else {
		Post.findOne({ 
			where: {
				id: request.params.id
			},	
			include: [
				{model: Comment, include: [
					{model: User}
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
app.get('/view-all-posts', function (request, response) {
	console.log("LANDED ON VIEW ALL POSTS")
	var user = request.session.user;	
	if (user === undefined) {
		response.redirect('/?message=' + encodeURIComponent("Please log in to view your profile."));

	} else {
		Post.findAll( { include:[User, {model: Comment, include: [User] }] } ).then(function (posts){
			response.render('view-all-posts', {
				titleHead: 'View All Posts',
				data: posts,
				user: user
			})
		})
	}
});


// #### VIEW OWN POSTS ####
app.get('/view-own-posts', function (request, response) {
	console.log("LANDED ON VIEW OWN")
	var user = request.session.user;
	if (user === undefined) {
		response.redirect('/?message=' + encodeURIComponent("Please log in to view your profile."));
	} else {
		Post.findAll({ 
			where: {
				userId: user.id
			},	
			include: [
				{model: Comment, include: [
					{model: User}
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
app.post('/commentPost', function(request, response){
	console.log("COMMENT on the way")
	var user = request.session.user;
	// var restoredUser = User.build(request.session.user);
	console.log(user)
    Promise.all([
        Comment.create({
            body: request.body.commentfield
        }),
        User.findOne({
            where: {
                id: request.session.user.id
            }
        }),
        Post.findOne({
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

// ########### END ROUTE SECTION #############

// ######## RESTORE TABLES SECTION ########
// sequelize.sync({force: true}).then(function () {
// 	User.create({
// 		name: "jeez",
// 		email: "jezus@gmail.com",
// 		password: "jeez"
// 	}).then(function(user) {
// 		user.createPost( {
// 			title: 'Jezus is the Name',
// 			body: 'Hello my name is Jezus'
// 		})
// 	}).then(function () {
// 		var server = app.listen(3000, function () {
// 			console.log('Example app listening on port: ' + server.address().port);
// 		});
// 	});
// }, function (error) {
// 	console.log('sync failed: ');
// 	console.log(error);
// });

// ####### SERVER LISTEN TO PORT 3000 ########
var server = app.listen(3000, function () {
	console.log('Blog app listening on port: ' + server.address().port);
});
