const constants = require('./../utils/constants');
const helpers = require('./app.helpers');

async function uploadSong(req, res) {
    if (req.error) return res.status(500).json({
        status: 'error',
        message: 'Internal server error : ' + req.error
    });
    else if (!req.file) return res.status(500).json({
        status: 'error',
        message: 'Something went wrong, please make sure you have select a file.'
    });
    else {
        return res.status(201).json({
            status: 'success',
            message: 'You successfully uploaded your song',
            ref: req.ref
        });
    }
}

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

    const result = await helpers.writeMetadata(ref, data);
    if (!result.success) return res.status(500).json({
        status: 'error',
        message: 'Internal server error : ' + result.error
    });

    const options = ((req.file)
        ? { attachments: [req.file.path ] }
        : ((req.body.cover)
            ? { attachments: [req.body.cover] }
            : undefined));

    if (options) {
        const result2 = await helpers.writeMetadataCover(ref, options);
        if (!result2.success) return res.status(500).json({
            status: 'error',
            message: 'Internal server error : ' + result2.error
        });
    }

    return res.status(200).json({
        status: 'success',
        message: 'You successfully update the song metadata'
    });
}

async function readMetadata(req, res) {
    const ref = req.params.song;
    const data = await helpers.readMetadata(ref);
    if (!data.success) return res.status(500).json({
        status: 'error',
        message: 'Internal server error : ' + data.error
    });

    return res.status(200).json({
        status: 'success',
        message: 'Metadata successfully extracted',
        data: data.data
    });
}

async function downloadSong(req, res) {
    const ref = req.params.song;
    return res.download(constants.songFolder + ref);
}

module.exports = {
    uploadSong,
    editSong,
    readMetadata,
    downloadSong
};