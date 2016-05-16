var express = require('express');
var path = require('path');
var app = express();
var router = express.Router();
var fs = require('fs');

router.get('/', function(req, res, next) {
    fs.readFile('./data/villageList.json', 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      res.render('index', {
          'title': '疏散避難圖資上傳',
          'desc': '將內政部消防署提供之簡易疏散避難圖中的資料，填寫到下表中，並且送出，將即時更新疏散資料。'
      });
    });

});

app.set('port', (process.env.PORT || 5000));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', router);

app.listen(app.get('port'), function () {
  console.log('Ready');
});
