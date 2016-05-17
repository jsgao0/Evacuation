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
    // fs.readFile('./data/villageList.json', 'utf8', function (err,data) {
    //   if (err) {
    //     return console.log(err);
    //   }
    //   res.render('index', {
    //       'title': '疏散避難圖資上傳',
    //       'desc': '將內政部消防署提供之簡易疏散避難圖中的資料，填寫到下表中，並且送出，將即時更新疏散資料。'
    //   });
    // });

    res.render('index', {
        'title': '疏散避難圖資上傳',
        'desc': '將內政部消防署提供之簡易疏散避難圖中的資料，填寫到下表中，並且送出，將即時更新疏散資料。'
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
