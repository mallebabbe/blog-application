var Sequelize = require('sequelize');
const express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var Promise = require('promise');
var bcrypt = require('bcrypt')
var path = require('path');
var port = process.env.PORT || 3000;
// ###### EXPRESS INSTANCE ######
var app = express();
// DB
var db = require( './models/db')

// require the routes

////////////////////////////////////////////////////////////////////////////////

  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(bodyParser.urlencoded({ extended:true }));

var sass = require( 'node-sass' )
var fs = require( 'fs' )

sass.render( {
    file: './public/sass/style.scss'
}, (err, result) => { 
    fs.writeFile( './public/css/style.css', result.css.toString(), ( err ) => {
        if ( err ) throw err
            console.log( 'Sass written to css' )
    } )
} )

sass.render( {
    file: './public/sass/_bootstrap.scss'
}, (err, result) => { 
    fs.writeFile( './public/css/bootstrap.css', result.css.toString(), ( err ) => {
        if ( err ) throw err
            console.log( 'Sass written to css' )
    } )
} )



// #### SESSION ####
app.use(session({
	secret: 'oh wow very secret much security',
	resave: true,
	saveUninitialized: false
}));


var routes = require('./routes/index');
app.use('/', routes);
app.use(express.static('./public'));

// ####### SERVER LISTEN TO PORT 3000 ########
var server = app.listen(port, function (){
	console.log ('Blog-app listening on: ' + server.address().port)
});
