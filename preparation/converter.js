var fs = require('fs');

var Converter = function() {};

Converter.prototype.villagePopulationCSV2JSON = function() {
    fs.readFile('../source/village-population-104-12.csv', 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      var rows = data.split('\n');
      var keys = rows[0].split(',');
      rows.splice(0,2); // Remove the Englisth and Chinese keys.

      var villageList = [];
      [].forEach.call(rows, function(row) {
          var village = {},
              record = row.split(',');

          if(!record[1]) return;

          village.county = record[1].substring(0, 3);
          village.town = record[1].substring(3).replace(" ", "");
          village.village = record[2];
          village.householdAmount = record[3];
          village.population = record[4];
          console.log(village);
          villageList.push(village);
      });
      var stream = fs.createWriteStream("../data/villagePopulation.json");
      stream.once('open', function(fd) {
        stream.write(JSON.stringify(villageList));
        stream.end();
      });
    });
};

Converter.prototype.villageDataCSV2JSON = function() {
    fs.readFile('../source/village-list.csv', 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      var rows = data.split('\n');
      var keys = rows[0].split(',');
      rows.splice(0,1); // Remove the keys.

      var villageList = [];
      [].forEach.call(rows, function(row) {
          var village = {},
              record = row.split(',');
          village[keys[0]] = record[0];
          village[keys[1]] = record[1];
          village[keys[2]] = record[2];
          village[keys[3]] = record[3];
          village[keys[4]] = record[4];
          village[keys[5]] = record[5];
          village[keys[6]] = record[6];
          village[keys[7]] = record[7];
          village[keys[8]] = record[8];
          village[keys[9]] = record[9];
          village[keys[10]] = record[10];
          if(!!village.OBJECTID_1) villageList.push(village);
      });
      var stream = fs.createWriteStream("../data/villageList.json");
      stream.once('open', function(fd) {
        stream.write(JSON.stringify(villageList));
        stream.end();
      });
    });
};

module.exports = Converter;
