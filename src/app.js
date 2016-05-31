var Sequelize = require('sequelize');
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');

// ######### SET DB CONNECTION
var sequelize = new Sequelize('blog', 'postgres', 'mysecretpassword', {
	host: '192.168.99.100',
// port changes everytime I restart Docker
	port:'32771', 
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
	body: Sequelize.STRING
})
var Comment = sequelize.define('comments', {
	body: Sequelize.STRING
})
// ######### END DB TABLES ##########
// ######### SET TABLE CONNECTIONS ########
users.hasMany(posts);
posts.belongsTo(users);
users.hasMany(comments)
posts.hasMany(comments)
comments.belongsTo(users)
comments.belongsTo(posts)
// ######### END TABLE CONNECTIONS ########

// ###### EXPRESS INSTANCE ######
var app = express();

// ##### SET VIEW ENGINE
app.set('views', './src/views');
app.set('view engine', 'jade');



// ???????????????????????????????????????????????
// app.use(session({
// 	secret: 'oh wow very secret much security',
// 	resave: true,
// 	saveUninitialized: false
// }));


// ######## ROUTES ########

// LISTEN TO INDEX
app.get('/', function (request, response) {
	response.render('index', {
	//localhost:3000/?message=hello -> sets message to hello
		title: 'Blog Application',
		message: request.query.message,
		user: request.session.user
	});
});


//

app.get('/profile', function (request, response) {
	var user = request.session.user;
	if (user === undefined) {
		response.redirect('/?message=' + encodeURIComponent("Please log in to view your profile."));
	} else {
		response.render('profile', {
			title: 'Profile',
			user: user
		});
	}
});

app.post('/login', bodyParser.urlencoded({extended: true}), function (request, response) {
	if(request.body.email.length === 0) {
		response.redirect('/?message=' + encodeURIComponent("Please fill out your email address."));
		return;
	}

	if(request.body.password.length === 0) {
		response.redirect('/?message=' + encodeURIComponent("Please fill out your password."));
		return;
	}

	User.findOne({
		where: {
			email: request.body.email
		}
	}).then(function (user) {
		if (user !== null && request.body.password === user.password) {
			request.session.user = user;
			response.redirect('/profile');
		} else {
			response.redirect('/?message=' + encodeURIComponent("Invalid email or password."));
		}
	}, function (error) {
		response.redirect('/?message=' + encodeURIComponent("Invalid email or password."));
	});
});

app.get('/logout', function (request, response) {
	request.session.destroy(function(error) {
		if(error) {
			throw error;
		}
		response.redirect('/?message=' + encodeURIComponent("Successfully logged out."));
	})
});

// ########### END ROUTE SECTION #############



// normally never use the force:true // 
// sequelize.sync({force: true}).then(function () {
// 	User.create({
// 		name: "stabbins",
// 		email: "yes@no",
// 		password: "not_password"
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
	console.log('User app listening on port: ' + server.address().port);
});
