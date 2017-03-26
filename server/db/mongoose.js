var mongoose = require('mongoose');

mongoose.Promise = global.Promise; //Sets to use the built in promise library 
mongoose.connect(process.env.MONGODB_URI);
//checks if the process enviornment variable is available to connect to heroku otherwise use the
//local host 
module.exports = {

    mongoose: mongoose

}