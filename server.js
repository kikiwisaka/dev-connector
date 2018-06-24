const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const passport = require('passport');
const path = require('path');

const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");

//initialize
const app = express();

//Body parser middleware
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

//db config
const db = require("./config/keys").monggoURI;

//connect to DB
mongoose
  .connect(db)
  .then(() => console.log("MongoDB is connected."))
  .catch(err => console.log("MongoDB is not connected."));

//Passport middleware
app.use(passport.initialize());
//Passport config
require('./config/passport')(passport);

//using routes
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

// Server static assets if in production
if (process.env.NODE_ENV === 'production') {
  //set static folder
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server is running on port ${port}`));