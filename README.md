# blog-application

You can:
- register
- login

and when logged in you can:
- create posts
- see everyones posts
- see all your own posts
- you can select a title and get to specific post and add comments there

# Requirements
- Postgres DB
- npm install:
	"dependencies": {
		"bcrypt": "^0.8.6",
		"body-parser": "^1.15.1",
		"express": "^4.13.4",
		"express-session": "^1.13.0",
		"jade": "^1.11.0",
		"nodemon": "^1.9.2",
		"pg": "^4.5.5",
		"promise": "^7.1.1",
		"pug": "^2.0.0-alpha8",
		"sequelize": "^3.23.3"
	}

# SETUP
1 do npm install
2 in src/app.js change the DB variables to connect to your own DB line:7
4 check if set force:true line:307 to create the tables in your Postgress DB
3 app is listening to port 3000


See gameplan.txt for the DB table connections