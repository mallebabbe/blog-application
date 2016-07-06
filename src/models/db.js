// Set up sql
var Sequelize = require( 'sequelize' )
// Container object
var db = {
	mod: {}
}
// for heroku: Is DB URL available?
if (process.env.DATABASE_URL) {
    // the application is executed on Heroku
    db.conn = new Sequelize(process.env.DATABASE_URL, {
      dialect:  'postgres',
      protocol: 'postgres',
      logging:  true //false
    }) 
} else { 
	db.conn = new Sequelize('blog', process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
		host: process.env.DOCKER_HOST,
		port:'32770', 
		// host:'localhost',
		dialect: 'postgres'
	});
}
// ######### SET DB TABLES ########## 
db.User = db.conn.define('users', {
	name: Sequelize.STRING,
	email: Sequelize.STRING,
	password: Sequelize.STRING
});
db.Post = db.conn.define('posts', {
	title: Sequelize.STRING,
	body: Sequelize.TEXT
})
db.Comment = db.conn.define('comments', {
	body: Sequelize.TEXT
})
// ######### SET DB-TABLE CONNECTIONS ########
db.User.hasMany(db.Post);
db.Post.belongsTo(db.User);
db.User.hasMany(db.Comment)
db.Post.hasMany(db.Comment)
db.Comment.belongsTo(db.User)
db.Comment.belongsTo(db.Post)

db.conn.sync( {'force': false} ).then( 
	() => { 
		console.log ( 'Sync succeeded' )
	},
	( err ) => { console.log('sync failed: ' + err) } 
	)

module.exports = db
