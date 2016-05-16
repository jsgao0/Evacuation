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
});


uploadApp.controller('selectorController', function ($scope, dataService) {
  $scope.countyList = [];
  $scope.townList = [];
  dataService.renderCountyList(function(countyList) {
      $scope.countyList = countyList;
      $scope.selectedCounty = $scope.countyList[0];
      $scope.renderTownListByCountyId();
  });
  $scope.renderTownListByCountyId = function() {
      var countyId = $scope.selectedCounty.county_id;
      dataService.renderTownListByCountyId(countyId, function(townList) {
          $scope.townList = townList;
          $scope.selectedTown = $scope.townList[0];
          $scope.renderVillageListByTownId();
      });
  };
  $scope.renderVillageListByTownId = function() {
      var townId = $scope.selectedTown.town_id;
      dataService.renderVillageListByTownId(townId, function(villageList) {
          $scope.villageList = villageList;
          $scope.selectedVillage = $scope.villageList[0];
      });
  };
});
