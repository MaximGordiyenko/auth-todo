const express = require('express');
const app = express();
const authRouter = require('./auth/AuthController');
const todoRoute = require('./todo.route');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const verifyToken = require('./auth/verifyToken');
const PORT = 4000;
const config = require('./db');
const mainPageRouter = require('./mainPageRouter');

app.use(cors());
app.use(bodyParser.json());
app.use('/', mainPageRouter);
app.use('/', authRouter);
app.use('/todos', todoRoute);

mongoose.connect(config.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then((result) => {
    console.log("MongoDB database connection established successfully:");
    console.log(result.connections[0].host);
    console.log(result.connections[0].name);
    console.log(result.connections[0].name);
    console.log(result.connections[0].user);
    console.log(result.connections[0].pass);
    console.log(result.models.User);
    console.log(result.models.Todo);
});



app.listen(PORT, () => {
    console.debug("Server is running on Port: " + PORT);
});
