const Router = require('express').Router;
const appController = require('./app.controllers');
const middlewares = require('./../utils/middlewares');

const routes = new Router();

routes.post('/upload', middlewares.mySongUpload, appController.uploadSong);
routes.post('/edit/:song', middlewares.myImgUpload, appController.editSong);
routes.get('/metadata/:song', appController.readMetadata);
routes.get('/download/:song', appController.downloadSong);

module.exports = routes;