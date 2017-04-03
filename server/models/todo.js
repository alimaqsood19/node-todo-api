var mongoose = require('mongoose');

var Todo = mongoose.model('Todo', {
    text: {
        type: String,
        required: true,
        minlength: 1,
        trim: true //removes all leading and trailing spaces from the inputted string 
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Number,
        default: null
    },
    _creator: { //We store the ID of the user
        type: mongoose.Schema.Types.ObjectId,
        required: true 
    }
});

module.exports = {
    Todo: Todo
}