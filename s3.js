require('dotenv').config();
const fs = require('fs');
const S3 = require('aws-sdk/clients/s3');

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});

function uploadFile(imagePath, storageName) {
  const fileStream = fs.createReadStream(imagePath);

  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: storageName,
  };

  return s3.upload(uploadParams).promise();
}

module.exports.uploadFile = uploadFile;
