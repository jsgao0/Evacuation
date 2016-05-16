var http = require('http');

function Caller() {
  var options = this.options = {};
  options.protocol = 'http:';
  options.host = 'evacuation.herokuapp.com';
  options.port = '80';
  options.headers = {
    'accesskey': 'accessKey_eb3604bd21a3176806f29607d47b069f17956cba'
  };
}

Caller.prototype.updateSanctuaryList = function(townId, villageId, body, callback) {
    var postData = JSON.stringify(body);

    this.options.method = 'PUT';
    this.options.path = '/' + townId + '/' + villageId + '/sanctuaries';
    this.options.headers = {
        'Content-Type': 'application/json'
    };
    var req = http.request(this.options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(result) {
            callback(result);
        });
    });
    req.write(postData);
    req.end();
};

Caller.prototype.getCategoryList = function(callback) {
  this.options.path = '/categorys';
  http.request(this.options, function(res) {
    callback(res);
  }).end();
};


module.exports = Caller;
