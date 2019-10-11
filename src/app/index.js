const app = require('./app.routes');

module.exports = function(server) {
    server.use('/', app);

    server.use('/ok', (req, res) => {
        return res.status(200).json({
            status: 'success',
            message: 'Server is up and ready'
        })
    });

    server.use((req, res, next) => {
        const err = new Error('Not Found');
        err.status = 404;
        next(err)
    })
};
