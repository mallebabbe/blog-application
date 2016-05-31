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
// test
console.log("table connections made")
// ######### END TABLE CONNECTIONS ########

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
		title: 'Blog Application',
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
console.log("User : " + request.body.username + " is created")
	response.redirect('/');
})

// ##### LOGIN ##### FORM ON HOME-PAGE POST
app.post('/login-user', bodyParser.urlencoded({extended: true}), function (request, response) {
	console.log("Login reached")
	if(request.body.loginUserName === 0) {
		response.redirect('/?message=' + encodeURIComponent("Please fill out your username."));
		return;
	}
	if(request.body.loginUserPassword.length === 0) {
		response.redirect('/?message=' + encodeURIComponent("Please fill out your password."));
		return;
	}
	User.findOne({
		where: {
			name: request.body.loginUserName
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












// ###### LOG-OUT ######
app.get('/logout', function (request, response) {
	request.session.destroy(function(error) {
		if(error) {
			throw error;
		}
		response.redirect('/?message=' + encodeURIComponent("Successfully logged out."));
	})
});

// ###### PROFILE ######
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

// SEARCH FOR SPECIFIC POST in DB
app.post('/api', function ( req, res ){
	
	var searchPost = req.body.userNameSearch.toLowerCase()
	console.log("Letter found ==> " + searchName)

	var userMatch = {}
	var totalUsers = []

	jsonREADER.readJSON('./resources/users.json', function ( jsonData, name ) {
		console.log("Search string received" )

		for (var i = 0; i < jsonData.length; i++) {

			var achternaam = jsonData[i].lastname.toLowerCase()
			var voornaam = jsonData[i].firstname.toLowerCase()
			var fullName = voornaam + " " + achternaam
			letterMatchFirstName = voornaam.indexOf(searchName)
			letterMatchLastName = achternaam.indexOf(searchName)
			letterMatchFullName = fullName.indexOf(searchName)

		// console.log("Letters found : " + letterMatchFirstName)

			if(letterMatchFirstName != -1 || letterMatchLastName != -1 || letterMatchFullName != -1) {
				userMatch = jsonData[i]
				totalUsers.push(userMatch)
				// console.log("total name : " + userMatch)
			} 
		}
		res.send(totalUsers)
	})	
})

// app.get('/all-posts', function ( request, response ) {

// 	User.findAll({
// 	include: [Post]
// }).then(function(result) {
// 	console.log("\n\nresult of: People including Messages");
// 	console.log(JSON.stringify(result, null, 2)); // note: the other parameters in JSON.stringify format the output so that it is easier to read.
// });

// Post.findAll({
// 	include: [User]
// }).then(function(result) {
// 	console.log("\n\nresult of: Messages including People");
// 	console.log(JSON.stringify(result, null, 2));
// });
// })

// ########### END ROUTE SECTION #############

// ####### SERVER LISTEN TO PORT 3000 ########
var server = app.listen(3000, function () {
	console.log('User app listening on port: ' + server.address().port);
});
