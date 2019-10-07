const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Todo = new Schema({
    text: String,
    user_id: String,
    create_data: String,
    completed: Boolean
});

module.exports = mongoose.model('Todo', Todo);
