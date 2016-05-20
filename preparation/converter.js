var fs = require('fs'),
    xml2js = require('xml2js');

var Converter = function() {
    this.parseXML2JSON = function(sourcePath, callback) {
        var parser = new xml2js.Parser();
        fs.readFile(sourcePath, function(err, data) {
            parser.parseString(data);
        });
        parser.addListener('end', function(result) {
            callback(result);
        });
    };
};

// Not complete yet.
Converter.prototype.villageShelterRawArrange = function(shelterList) {
    var notCatchedShelterList = [];
    var exceptionAmountList = [].reduce.call(shelterList, function(amount, shelter) {
        if(shelter.defaultville.length > 3) amount.expectTotal += 1;
        if(
            shelter.defaultville.indexOf(',') > -1 ||
            shelter.defaultville.indexOf('，') > -1
        ) {amount.comma += 1; amount.actualTotal += 1;}
        else if(shelter.defaultville.indexOf('。') > -1) {amount.fullStop += 1; amount.actualTotal += 1;}
        else if(shelter.defaultville.indexOf(' ') > -1) {amount.space += 1; amount.actualTotal += 1;}
        else if(shelter.defaultville.indexOf('　') > -1) {amount.tab += 1; amount.actualTotal += 1;}
        else if(shelter.defaultville.indexOf('.') > -1) {amount.dot += 1; amount.actualTotal += 1;}
        else if(shelter.defaultville.indexOf('、') > -1) {amount.scomma += 1; amount.actualTotal += 1;}
        else if(shelter.defaultville.indexOf('/') > -1) {amount.slash += 1; amount.actualTotal += 1;}
        else if(shelter.defaultville.indexOf('等') > -1) {amount.etc += 1; amount.actualTotal += 1;}
        else if(shelter.defaultville.indexOf('鄉') === 2) {amount.vil += 1; amount.actualTotal += 1;}
        // else if(shelter.defaultville.indexOf('鄰') > shelter.defaultville.length - 1) {amount.nb += 1; amount.actualTotal += 1;}
        else if(
            shelter.defaultville.indexOf('全區') > -1 ||
            shelter.defaultville.indexOf('不分里') > -1 ||
            shelter.defaultville.indexOf('各里') > -1
        ) {amount.forAll += 1; amount.actualTotal += 1;}
        else if(shelter.defaultville.length >= 3) {notCatchedShelterList.push(shelter.defaultville);}
        amount.diff = amount.expectTotal - amount.actualTotal;
        return amount;
    }, {
        none: 0,
        comma:0,
        fullStop: 0,
        space:0,
        tab: 0,
        dot:0,
        scomma: 0,
        slash: 0,
        etc: 0,
        vil: 0,
        forAll: 0,
        nb: 0, //Neighborhood
        actualTotal: 0,
        expectTotal: 0,
        diff: 0
    });
    console.log(notCatchedShelterList);
    console.log(exceptionAmountList);
};

Converter.prototype.villageFitShelters = function(shelterListRaw, callback) {
    /**
        villageShelterListRaw = [
            {
                "adaptForWeaker":"是",
                "address":"彰化縣北斗鎮斗中路712號",
                "county":"彰化縣",
                "defaultville":"東光里、七星里",
                "disastertype":"水災,震災",
                "isIndoor":"是",
                "isOutdoor":"否",
                "lat":"23.871139",
                "lon":"120.534312",
                "name":"螺青國小",
                "openstatus":"撤除",
                "peopleno":"440",
                "refugedno":"",
                "shelterCode":"SN521-0003",
                "shelterId":"1",
                "town":"北斗鎮",
                "twd97x":"202572.75",
                "twd97y":"2640828.38626",
                "village":"東光里"
            }
        ]
     */

    fs.readFile(__dirname + '/../public/data/villageList.json', 'utf8', function (err,data) {
        var villageListRaw = JSON.parse(data);
            villageList = [];
        [].forEach.call(villageListRaw, function(villageRaw) {
            var village = {
                county: villageRaw.COUNTY,
                town: villageRaw.TOWN,
                village: villageRaw.VILLAGE
            };
            [].forEach.call(shelterListRaw, function(shelter) {
                var villageName = village.village.substring(0, 2);
                if(!village.defaultShelterList) village.defaultShelterList = [];
                if( // 明確配對到村里，則屬village。
                    shelter.county.indexOf(village.county) > -1 &&
                    shelter.town.indexOf(village.town) > -1 &&
                    shelter.defaultville.indexOf(villageName) > -1
                ) {
                    village.defaultShelterList.push({
                        id: shelter.shelterId,
                        code: shelter.shelterCode,
                        name: shelter.name,
                        address: shelter.address,
                        accommodation: shelter.peopleno || 0,
                        lat: shelter.lat,
                        lon: shelter.lon,
                        openStatus: shelter.openstatus,
                        disasterType: shelter.disastertype,
                        isIndoor: shelter.shelter,
                        isOutdoor: shelter.isOutdoor,
                        adaptWeaker: shelter.adaptForWeaker
                    });
                } else if( // 未配對到，則屬town。
                    shelter.county.indexOf(village.county) > -1 &&
                    shelter.town.indexOf(village.town) > -1
                ) {
                    village.defaultShelterList.push({
                        id: shelter.shelterId,
                        code: shelter.shelterCode,
                        name: shelter.name,
                        address: shelter.address,
                        accommodation: shelter.peopleno || 0,
                        lat: shelter.lat,
                        lon: shelter.lon,
                        openStatus: shelter.openstatus,
                        disasterType: shelter.disastertype,
                        isIndoor: shelter.shelter,
                        isOutdoor: shelter.isOutdoor,
                        adaptWeaker: shelter.adaptForWeaker
                    });
                }
            });
            villageList.push(village);
        });
        callback(villageList);
    });
};

Converter.prototype.villageShelterXML2JSON = function() {
    var self = this;
    self.parseXML2JSON(__dirname + '/../public/source/village-shelter-list.xml', function(result) {
        var villageShelterListRaw = result.EEAResp.SheltersInfoList[0].shelterInfo.map(function(shelterRaw) {
            return shelterRaw.$;
        });

        self.villageFitShelters(villageShelterListRaw, function(villageList) {
            var emptyShelterVillageAmount = [].reduce.call(villageList, function(count, village) {
                if(village.defaultShelterList.length > 0) {
                    // console.log(village.COUNTY + ' ' + village.TOWN + ' ' + village.VILLAGE);
                    count += 1;
                }
                return count;
            }, 0);
            console.log(emptyShelterVillageAmount + '/' + villageList.length);


            var stream = fs.createWriteStream(__dirname + '/../public/data/villageFitShelterList.json');
            stream.once('open', function(fd) {
              stream.write(JSON.stringify(villageList));
              stream.end();
              console.log('Convert shelter list XML to JSON successfully.');
            });
        });

    });
};

Converter.prototype.villageHeadJSONArrange = function() {
    fs.readFile(__dirname + '/../public/source/village-head.json', 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      var villageHeadListRaw = JSON.parse(data);

      var villageHeadElection = {
          year: 103,
          villageHeadList: []
      };
      [].forEach.call(villageHeadListRaw, function(villageHeadRaw) {
          var villageHead = {
              county: villageHeadRaw.cityname || '',
              town: villageHeadRaw.townname || '',
              village: villageHeadRaw.villname || '',
              name: villageHeadRaw.idname || '',
              gender: villageHeadRaw.sex || '',
              party: villageHeadRaw.partymship || '',
              education: villageHeadRaw.education || '',
              profilo: villageHeadRaw.profession || '',
              avatar: villageHeadRaw.photograph || '',
              office: {
                  address: villageHeadRaw.officeadress || '',
                  phoneNumber: villageHeadRaw.officetelphone || ''
              }
          };
          villageHeadElection.villageHeadList.push(villageHead);
      });
      var stream = fs.createWriteStream(__dirname + '/../public/data/villageHead.json');
      stream.once('open', function(fd) {
        stream.write(JSON.stringify(villageHeadElection));
        stream.end();
      });
    });
};

Converter.prototype.villagePopulationCSV2JSON = function() {
    fs.readFile(__dirname + '/../public/source/village-population-104-12.csv', 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
        var rows = data.split('\n');
        var keys = rows[0].split(',');
        rows.splice(0,2); // Remove the Englisth and Chinese keys.

        var year = rows[0].split(',')[0].substring(0,3);
        var month = rows[0].split(',')[0].substring(3,6);

        var villagePopulation = {
            year: year,
            month: month,
            villagePopulationList: []
        };

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
            villagePopulation.villagePopulationList.push(village);
        });
        var stream = fs.createWriteStream(__dirname + '/../public/data/villagePopulation.json');
        stream.once('open', function(fd) {
            stream.write(JSON.stringify(villagePopulation));
            stream.end();
        });
    });
};

// Need to be refactored.
// And you should modify importVillageList POST method evacuationRESTful app.
Converter.prototype.villageDataCSV2JSON = function() {
    fs.readFile(__dirname + '/../public/source/village-list.csv', 'utf8', function (err,data) {
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
      var stream = fs.createWriteStream(__dirname + '/../public/data/villageList.json');
      stream.once('open', function(fd) {
        stream.write(JSON.stringify(villageList));
        stream.end();
        console.log('Convert village list CSV to JSON successfully.');
      });
    });
};

module.exports = Converter;
