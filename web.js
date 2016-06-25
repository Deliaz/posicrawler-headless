var express = require('express');
var bodyParser = require('body-parser');
var crawler = require('./crawler');
var path = require('path');
var morgan = require('morgan');
var easyimage = require('easyimage');
var async = require('async');

var app = express();

app.set('view engine', 'ejs');

app.use(morgan('tiny'));
app.use(express.static('static'));
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function (req, res) {
    res.render('index');
});

app.post('/info', function (req, res) {
    crawler(req.body.query, req.body.url, function (resJson) {

        if (resJson.screenshots.length) {
            async.each(resJson.screenshots, (image, cb) => {

                easyimage
                    .crop({
                        src: image, dst: image,
                        cropwidth: 670, cropheight: 1050,
                        gravity: 'NorthWest',
                        x: 0, y: 0
                    })
                    .then(function (info) {
                        cb();
                    }, cb);

            }, err => {
                if (err) {
                    console.error(err);
                }
                res.send(resJson);
            });
        } else {
            res.send(resJson);
        }
    });
});

app.listen(3015, function () {
    console.log('Start at 3015');
});