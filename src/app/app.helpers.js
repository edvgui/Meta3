const constants = require('./../utils/constants');
const ffmetadata = require('ffmetadata');

function readMetadata(file) {
    return new Promise(function (resolve) {
        ffmetadata.read(constants.songFolder + file, function (err, data) {
            if (err) resolve({success: false, error: "Error reading metadata : " + err.message});
            else resolve({success: true, data: data});
        });
    });
}

function writeMetadata(file, data) {
    return new Promise(function (resolve) {
        ffmetadata.write(constants.songFolder + file, data, function(err) {
            if (err) resolve({ success: false, error: "Error writing metadata : " + err.message});
            else resolve({ success: true });
        });
    });
}

function writeMetadataCover(file, options) {
    return new Promise(function (resolve) {
        ffmetadata.write(constants.songFolder + file, {}, options, function(err) {
            if (err) resolve({ success: false, error: "Error writing metadata : " + err.message});
            else resolve({ success: true });
        });
    });
}

module.exports = {
    readMetadata,
    writeMetadata,
    writeMetadataCover,
};