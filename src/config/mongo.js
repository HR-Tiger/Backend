const mongoose = require('mongoose');

// const { Schema } = mongoose;
mongoose.connect('mongodb://localhost/gridFS', { useNewUrlParser: true, useUnifiedTopology: true });
const conn = mongoose.connection;

const Grid = require('gridfs-stream');

Grid.mongo = mongoose.mongo;

module.exports.Grid = Grid;
module.exports.conn = conn;
