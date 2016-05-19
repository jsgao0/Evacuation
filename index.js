var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
var Caller = require('./libs/caller');
var caller = new Caller();
var router = express.Router();
var fs = require('fs');

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

router.get('/', function(req, res, next) {
    res.render('index', {
        'title': '疏散避難所圖資',
        'desc': '目前已匯入資料：各村里(7855)、各村里長(7243)、各村里人口數(7074)、各村里避難所清單(7365)。'
    });
});

router.put('/:TOWN_ID/:VILLAGE_ID/sanctuaries', function(req, res, next) {
    caller.updateSanctuaryList(req.params.TOWN_ID, req.params.VILLAGE_ID, req.body, function(resData) {
        res.json(resData);
    });
});

app.set('port', (process.env.PORT || 5000));
// app.set('port', (10000));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', router);

app.listen(app.get('port'), function () {
  console.log('Ready');
});
