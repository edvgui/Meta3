const constants = require('./constants');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');

const uploadSong = multer({
    storage: multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, constants.songFolder);
        },
        filename: function (req, file, cb) {
            const ext = file.originalname.split(".");
            req.ref = crypto.createHash('md5').update(Date.now() + "").digest('hex') + "." + ext[ext.length - 1];
            cb(null, req.ref);
        }
    }),
    limits: {
        fileSize: 20000000
    },
    fileFilter: function (req, file, cb) {
        const name = file.originalname;
        const sp = name.split(".");
        if (sp.length < 2 || sp[sp.length - 1] !== "mp3") cb(new Error("This file doesn't have a valid extension."));
        else cb(null, true);
    }
}).single('songFile');

const uploadImg = multer({
    storage: multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, constants.imageFolder);
        },
        filename: function (req, file, cb) {
            const ext = file.originalname.split(".");
            req.ref = crypto.createHash('md5').update(Date.now() + "").digest('hex') + "." + ext[ext.length - 1];
            cb(null, req.ref);
        }
    }),
    limits: {
        fileSize: 3000000
    },
    fileFilter: function (req, file, cb) {
        const name = file.originalname;
        const sp = name.split(".");
        if (sp.length < 2 || (sp[sp.length - 1] !== "png" && sp[sp.length - 1] !== "jpg")) cb(new Error("This file doesn't have a valid extension."));
        else cb(null, true);
    }
}).single('songCover');

const uploadForm = multer().none();

function mySongUpload(req, res, next) {
    uploadSong(req, res, function (err) {
        req.error = err;
        next();
    });
    setTimeout((req) => {
        try {
            fs.unlinkSync(constants.songFolder + req.ref);
            fs.unlinkSync(constants.imageFolder + req.ref + '.png');
        } catch (error) {
            // do nothing
        }
    }, 1800000, req);
}

function myImgUpload(req, res, next) {
    uploadImg(req, res, function (err) {
        req.error = err;
        next();
    });
    setTimeout((req) => {
        try {
            fs.unlinkSync(req.file.path)
        } catch (error) {
            // do nothing
        }
    }, 60000, req);
}

function myFormUpload(req, res, next) {
    uploadForm(req, res, function (err) {
        req.error = err;
        next();
    });
}

module.exports = {
    mySongUpload,
    myImgUpload,
    myFormUpload
};
