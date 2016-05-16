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
                evacuationInfo = result.data;
                if(!evacuationInfo) evacuationInfo = angular.copy(self.template);
            } catch(Exception) {
                evacuationInfo = angular.copy(self.template);
            }
            callback(evacuationInfo);
        }, function (response) {
            console.log(response);
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    };
    self.template = {
        "location": {
            "county": "宜蘭縣",
            "town": "宜蘭市",
            "village": "慈安里"
        },
        "responseCenter": {
            "name": "宜蘭市災害應變中心",
            "phoneNumber": "03-9325164"
        },
        "villageHead": {
            "name": "周阿通",
            "phoneNumber": "03-9382805",
            "cellphoneNumber": "0935-207743"
        },
        "policeStation": {
            "name": "新民派出所",
            "phoneNumber": "03-9323108"
        },
        "fireBrigade": {
            "name": "宜蘭消防分隊",
            "phoneNumber": "03-9322225"
        },
        "evacuatedDirection": {
            "sanctuaries": [
                {
                    "name": "東園社區活動中心",
                    "accommodation": 200,
                    "address": "宜蘭市崇聖街192號",
                    "phoneNumber": "03-9367270"
                },
                {
                    "name": "國立宜蘭高商（體育館）",
                    "accommodation": 600,
                    "address": "宜蘭市延平路 50 號",
                    "phoneNumber": "03-9384147"
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
      console.log(angular.copy($scope.evacuationInfo));
  };
  $scope.updateSanctuaryList = function() {
    angular.copy($scope.evacuationInfo); // return value;
  };
  $scope.deleteSanctuaryList = function() {
      alert('還沒實作喔～');
      //TODO
  };
});
