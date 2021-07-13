const path = require('path');
const fs = require('fs');
const { Grid, conn } = require('../config/mongo');


// Code below: for each chunk in the image, pass it into the writeStream which will go into the mongoDB under the filename passed in
function storeImage(image, callback) {
  const gfs = Grid(conn.db);

  const writeStream = gfs.createWriteStream({});
  fs.createReadStream(image).pipe(writeStream);
  writeStream.on('close', (file) => {
    callback(file._id);
  });
};

module.exports.storeImage = storeImage;