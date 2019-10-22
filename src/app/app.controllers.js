const constants = require('./../utils/constants');
const helpers = require('./app.helpers');
const crypto = require('crypto');

/**
 * @api {post} /upload Upload a mp3 file
 * @apiName uploadSong
 * @apiGroup App
 *
 * @apiHeader {String} Content-Type=multipart/form-data
 *
 * @apiParam {File} songFile Music mp3 file.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "status": "success",
 *       "message": "You successfully uploaded your song",
 *       "data": "f7110e021c2271d02c5e9cc2bd1b503e.mp3"
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "Something went wrong, please make sure you have selected a file."
 *     }
 */
async function uploadSong(req, res) {
    if (req.error) return res.status(500).json({
        status: 'error',
        message: 'Internal server error : ' + req.error
    });
    else if (!req.file) return res.status(400).json({
        status: 'error',
        message: 'Something went wrong, please make sure you have selected a file.'
    });
    else {
        return res.status(201).json({
            status: 'success',
            message: 'You successfully uploaded your song',
            data: req.ref
        });
    }
}


/**
 * @api {post} /import Import a mp3 file from a url
 * @apiName importSong
 * @apiGroup App
 *
 * @apiHeader {String} Content-Type=multipart/form-data
 *
 * @apiParam {String} songUrl Music mp3 file url.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "status": "success",
 *       "message": "You successfully imported your song",
 *       "data": "f7110e021c2271d02c5e9cc2bd1b503e.mp3"
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "Couldn't import the file : https://example.com/f7110e021c2271d02c5e9cc2bd1b503e.mp3"
 *     }
 */
async function importSong(req, res) {
    const url = req.body.songUrl;
    if (!url) return res.status(400).json({
        status: 'error',
        message: 'Please give a url'
    });

    const filename = crypto.createHash('md5').update(Date.now() + "").digest('hex') + ".mp3";

    helpers.downloadSong(filename, url).then(() => {
        return res.status(201).json({
            status: 'success',
            message: 'You successfully uploaded your song',
            data: filename
        });
    }).catch(err => {
        res.status(400).json({
            status: 'error',
            message: "Couldn't import the file : " + url
        });
    });
}


/**
 * @api {post} /edit/:song Edit the metadata of a specified song
 * @apiName editSong
 * @apiGroup App
 *
 * @apiParam (ref) {String} song Music mp3 file identifier.
 *
 * @apiParam (meta) {String} songTitle Title of the song.
 * @apiParam (meta) {String} songArtist Artist of the song.
 * @apiParam (meta) {String} songAlbum Album of the song.
 * @apiParam (meta) {String} songAlbumArtist Artist of the album of the song.
 * @apiParam (meta) {Number} trackNumber Track's number in the album.
 * @apiParam (meta) {Number} discNumber Disc's number in the album.
 * @apiParam (meta) {Number} songYear Year of the song's creation.
 * @apiParam (meta) {String} songGenre The genre(s) of the song.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "message": "You successfully updated the song metadata"
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal server error
 *     {
 *       "status": "error"
 *       "message": "Internal server error : "
 *     }
 */
async function editSong(req, res) {
    const ref = req.params.song;
    const data = {
        title: req.body.songTitle,
        artist: req.body.songArtist,
        album: req.body.songAlbum,
        album_artist: req.body.songAlbumArtist,
        track: req.body.trackNumber,
        disc: req.body.discNumber,
        date: req.body.songYear,
        genre: req.body.songGenre
    };

    const options = ((req.file)
        ? { attachments: [req.file.path ] }
        : ((req.body.cover)
            ? { attachments: [req.body.cover] }
            : {}));

    const result = await helpers.writeMetadata(ref, data, options);
    if (!result.success) return res.status(500).json({
        status: 'error',
        message: 'Internal server error : ' + result.error
    });

    return res.status(200).json({
        status: 'success',
        message: 'You successfully updated the song metadata'
    });
}


/**
 * @api {get} /metadata/:song Get the metadata of a specified song
 * @apiName readMetadata
 * @apiGroup App
 *
 * @apiParam (ref) {String} song Music mp3 file identifier.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "message": "Metadata successfully extracted"
 *       "data": {
 *           "title": "My song title"
 *       }
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal server error
 *     {
 *       "status": "error"
 *       "message": "Internal server error : "
 *     }
 */
async function readMetadata(req, res) {
    const ref = req.params.song;
    const data = await helpers.readMetadata(ref);
    if (!data.success) return res.status(500).json({
        status: 'error',
        message: 'Internal server error : ' + data.error
    });

    const cover = await helpers.readMetadataCover(ref);
    if (cover && cover.success) data.data.cover = '/download/image/' + ref + '.png';
    return res.status(200).json({
        status: 'success',
        message: 'Metadata successfully extracted',
        data: data.data
    });
}


/**
 * @api {get} /download/image/:image Download a specified song
 * @apiName downloadImage
 * @apiGroup App
 *
 * @apiParam (ref) {String} image Image file identifier.
 *
 */
async function downloadImage(req, res) {
    const ref = req.params.image;
    return res.download(constants.imageFolder + ref);
}


/**
 * @api {get} /download/song/:song Download a specified song
 * @apiName downloadSong
 * @apiGroup App
 *
 * @apiParam (ref) {String} song Music mp3 file identifier.
 *
 */
async function downloadSong(req, res) {
    const ref = req.params.song;
    return res.download(constants.songFolder + ref);
}

module.exports = {
    uploadSong,
    importSong,
    editSong,
    readMetadata,
    downloadImage,
    downloadSong
};
