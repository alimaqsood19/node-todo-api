var mongoose = require('mongoose');

mongoose.Promise = global.Promise; //Sets to use the built in promise library 
mongoose.connect('mongodb://localhost:27017/TodoApp');

module.exports = {

    mongoose: mongoose

}