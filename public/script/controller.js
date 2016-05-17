var uploadApp = angular.module('uploadApp', []);

uploadApp.service('dataService', function ($http) {
    var self = this;
    self.renderCountyList = function (callback) {
        var countyList = [];
        $http({
            method: 'JSONP',
            url: 'https://evacuation.herokuapp.com/counties?callback=JSON_CALLBACK'
        }).then(function (result) {
            countyList = result.data.countyList;
            callback(countyList);
        }, function (response) {
            console.log(response);
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    };
    self.renderTownListByCountyId = function(countyId, callback) {
        var townList = [];
        $http({
            method: 'JSONP',
            url: 'https://evacuation.herokuapp.com/' + countyId + '/towns?callback=JSON_CALLBACK'
        }).then(function (result) {
            townList = result.data.townList;
            callback(townList);
        }, function (response) {
            console.log(response);
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    };
    self.renderVillageListByTownId = function(townId, callback) {
        var villageList = [];
        $http({
            method: 'JSONP',
            url: 'https://evacuation.herokuapp.com/' + townId + '/villages?callback=JSON_CALLBACK'
        }).then(function (result) {
            villageList = result.data.villageList;
            callback(villageList);
        }, function (response) {
            console.log(response);
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    };
    self.renderEvacuationInfoByTownIdAndVillageId = function(townId, villageId, callback) {
        var evacuationInfo = {};
        $http({
            method: 'JSONP',
            url: 'https://evacuation.herokuapp.com/' + townId + '/' + villageId + '/sanctuaries?callback=JSON_CALLBACK'
        }).then(function (result) {
            try {
                evacuationInfo = result.data.evacuationInfo;
                if(!evacuationInfo) evacuationInfo = angular.copy(self.template);
                if(typeof evacuationInfo === 'string')
                    evacuationInfo = JSON.parse(evacuationInfo);
                console.log('ok');
            } catch(Exception) {
                evacuationInfo = angular.copy(self.template);
                console.log(Exception);
            }
            callback(evacuationInfo);
        }, function (response) {
            console.log(response);
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    };
    self.updateEvacuationInfoByTownIdAndVillageId = function(townId, villageId, body, callback) {
        var evacuationInfo = {};
        $http({
            method: 'PUT',
            url: '/' + townId + '/' + villageId + '/sanctuaries',
            data: body
        }).then(function (result) {
            callback(result);
        }, function (response) {
            console.log(response);
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    };
    self.template = {
        "location": {
            "county": "",
            "town": "",
            "village": ""
        },
        "responseCenter": {
            "name": "",
            "phoneNumber": ""
        },
        "villageHead": {
            "name": "",
            "phoneNumber": "",
            "cellphoneNumber": ""
        },
        "policeStation": {
            "name": "",
            "phoneNumber": ""
        },
        "fireBrigade": {
            "name": "",
            "phoneNumber": ""
        },
        "evacuatedDirection": {
            "sanctuaries": [
                {
                    "name": "",
                    "accommodation": 0,
                    "address": "",
                    "phoneNumber": ""
                }
            ]
        }
    };
});


uploadApp.controller('selectorController', function ($scope, dataService) {
  $scope.countyList = [];
  $scope.townList = [];
  $scope.villageList = [];
  $scope.evacuationInfo = {};
  $scope.sanctuaryList = [];
  dataService.renderCountyList(function(countyList) {
      $scope.countyList = countyList;
      $scope.selectedCounty = $scope.countyList[0];
      $scope.evacuationInfo = {};
      $scope.sanctuaryList = [];
      $scope.renderTownListByCountyId();
  });
  $scope.renderTownListByCountyId = function() {
      var countyId = $scope.selectedCounty.county_id;
      dataService.renderTownListByCountyId(countyId, function(townList) {
          $scope.townList = townList;
          $scope.selectedTown = $scope.townList[0];
          $scope.evacuationInfo = {};
          $scope.sanctuaryList = [];
          $scope.renderVillageListByTownId();
      });
  };
  $scope.renderVillageListByTownId = function() {
      var townId = $scope.selectedTown.town_id;
      dataService.renderVillageListByTownId(townId, function(villageList) {
          $scope.villageList = villageList;
          $scope.selectedVillage = $scope.villageList[0];
          $scope.evacuationInfo = {};
          $scope.sanctuaryList = [];
          $scope.renderEvacuationInfoByTownIdAndVillageId();
      });
  };
  $scope.renderEvacuationInfoByTownIdAndVillageId = function() {
      var townId = $scope.selectedTown.town_id;
      var villageId = $scope.selectedVillage.village_id;
      dataService.renderEvacuationInfoByTownIdAndVillageId(townId, villageId, function(evacuationInfo) {
          $scope.evacuationInfo = evacuationInfo;
          $scope.sanctuaryList = $scope.evacuationInfo.evacuatedDirection.sanctuaries;
      });
  };
  $scope.appendSanctuaryList = function() {
      $scope.sanctuaryList.push(
          {
              "name": "",
              "accommodation": 0,
              "address": "",
              "phoneNumber": ""
          }
      );
  };
  $scope.updateSanctuaryList = function() {
      var townId = $scope.selectedTown.town_id;
      var villageId = $scope.selectedVillage.village_id;
      var body = angular.copy($scope.evacuationInfo);
      dataService.updateEvacuationInfoByTownIdAndVillageId(townId, villageId, body, function(result) {
          var reCode = parseInt(JSON.parse(result.data).reCode) || 0;
          var reMessage = JSON.parse(result.data).reMessage || "";
          alert(reMessage);
          console.log(JSON.parse(result.data));
      });
    // angular.copy($scope.evacuationInfo); // return value;
  };
  $scope.deleteSanctuary = function(sanctuaryIndex) {
  console.log( $scope.sanctuaryList);
      $scope.sanctuaryList.splice(sanctuaryIndex, 1);
      console.log( $scope.sanctuaryList);
  };
  $scope.deleteSanctuaryList = function() {
      alert('還沒實作喔～');
      //TODO
  };
});
