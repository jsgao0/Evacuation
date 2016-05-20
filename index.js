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
        'title': '災害預防資訊平台 Taiwan Alert',
        'desc': '災害預防資訊平台，能夠查詢到在你居住地的村里長、避難所資訊。 未來將持續增加災害應變中心、居住地的消防分隊、警察局等資訊，以提供你做防災諮詢。 藉此，達到讓全民防災意識提升的目的。 目前已匯入資料：各村里(完整)、各村里避難所清單(完整)、各村里長(有短缺)、各村里人口數(有短缺)。',
        'status': '目前已匯入資料：各村里(完整)、各村里避難所清單(完整)、各村里長(有短缺)、各村里人口數(有短缺)。'
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
