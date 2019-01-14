const express = require("express");
const bodyParser = require("body-parser");
const SourceMapSupport = require("source-map-support");
const path = require("path");
require("babel-polyfill");
const authApi = require('./auth-controller');
const characterApi = require('./characters-controller');
const userApi = require('./user-controller');

const mongoose = require("mongoose");

const mongoDBUrl =
  "mongodb+srv://HernanRossi:UMlYnuMQWVomlFYW@pathfinderarena-gmjjh.mongodb.net/test";
const { ObjectID } = require("mongodb");

SourceMapSupport.install();
const server = express();
const helmet = require('helmet');

server.use(helmet());

const expressOptions = {
  dotfiles: 'ignore',
  etag: false,
  index: false,
  maxAge: '1d',
  setHeaders: (res, path, stat) => {
    res.set('x-timestamp', Date.now());
  }
};

server.use(express.static(path.join(__dirname, '../../dist'), expressOptions));
server.use(bodyParser.json());

mongoose.Promise = require("bluebird");

let db;
(async () => {
  try {
    await mongoose.connect(mongoDBUrl, { useNewUrlParser: true });
    server.listen(process.env.PORT || 8080, () => {
      console.log("App started on port 8080.");
    });
    db = mongoose.connection;
    db.on("error", console.error.bind(console, "MongoDB connection error:"));
    exports.db = db;
  } catch (err) {
    console.error('DB connection error: ', err);
  }
})();


server.get('/api/authenticate', authApi.authenticate);
server.use(authApi.authError);
server.get("/api/characters/:id", characterApi.getCharacter);
server.get("/api/characters", characterApi.getCharacters);
server.get("/api/users", userApi.getUsers);
server.get("*", (req, res) => {
  res.sendFile(path.resolve("static/index.html"));
});

const jwtCheck = authApi.jwtCheck();
server.use(jwtCheck);

server.post("/api/users", userApi.createUser);
server.delete("/api/users", userApi.deleteUsers);
server.delete("/api/users/:name", userApi.deleteUser);

server.put("/api/characters/:id", characterApi.updateCharacter);
server.post("/api/characters", characterApi.createCharacter);
server.delete("/api/characters/:id", characterApi.deleteCharacter);
server.delete("/api/characters", characterApi.deleteCharacters);

module.exports = server;
