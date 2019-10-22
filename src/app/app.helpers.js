const constants = require('./../utils/constants');
const ffmetadata = require('ffmetadata');
const fs = require('fs');
const http = require('http');

function readMetadata(file) {
    return new Promise(function (resolve) {
        ffmetadata.read(constants.songFolder + file, function (err, data) {
            if (err) resolve({success: false, error: "Error reading metadata : " + err.message});
            else resolve({success: true, data: data});
        });
    });
}

function readMetadataCover(file) {
    return new Promise(function (resolve) {
        try {
            fs.unlinkSync(constants.imageFolder + file + ".png");
        } catch (error) {
            // do nothing
        }
        ffmetadata.read(constants.songFolder + file, { coverPath: constants.imageFolder + file + ".png" }, function (err, data) {
            if (err) resolve({success: false, error: "Error reading metadata : " + err.message});
            else resolve({success: true, data: data });
        });
    });
}

function writeMetadata(file, data, options) {
    return new Promise(function (resolve) {
        ffmetadata.write(constants.songFolder + file, data, options, function(err) {
            if (err) resolve({ success: false, error: "Error writing metadata : " + err.message});
            else resolve({ success: true });
        });
    });
}

function downloadSong(filename, url) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(constants.songFolder + "/" + filename);

        http.get(url, response => {
            response.pipe(file);
            file.on('finish', () => {
                if (response.statusCode === 200)
                    resolve();
                else {
                    fs.unlink(constants.songFolder + "/" + filename);
                    reject("Couldn't find that resource");
                }
            });
        }).on('error', (err) => {
            fs.unlink(constants.songFolder + "/" + filename);
            reject(err);
        });
    });
}

module.exports = {
    readMetadata,
    readMetadataCover,
    writeMetadata,
    downloadSong
};
