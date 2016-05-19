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
    self.renderVillageHeadByTownIdAndVillageId = function(townId, villageId, callback) {
        var villageHead = {};
        $http({
            method: 'JSONP',
            url: 'https://evacuation.herokuapp.com/' + townId + '/' + villageId + '/village-head?callback=JSON_CALLBACK'
        }).then(function (result) {
            villageHead = result.data.villageHead;
            callback(villageHead);
        }, function (response) {
            console.log(response);
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    };
    self.renderVillagePopulationByTownIdAndVillageId = function(townId, villageId, callback) {
        var villagePopulation = {};
        return $http({
            method: 'JSONP',
            url: 'https://evacuation.herokuapp.com/' + townId + '/' + villageId + '/population?callback=JSON_CALLBACK'
        }).then(function (result) {
            villagePopulation = result.data.villagePopulation;
            callback(villagePopulation);
        }, function (response) {
            console.log(response);
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    };
    self.renderVillageShelterByTownIdAndVillageId = function(townId, villageId, callback) {
        var villageShelter = {};
        return $http({
            method: 'JSONP',
            url: 'https://evacuation.herokuapp.com/' + townId + '/' + villageId + '/shelters?callback=JSON_CALLBACK'
        }).then(function (result) {
            villageShelter = result.data.villageShelter;
            callback(villageShelter);
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


uploadApp.controller('selectorController', function ($scope, $q, dataService) {
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
      dataService.renderVillageHeadByTownIdAndVillageId(townId, villageId, function(villageHead) {
          $scope.villageHead = villageHead;
      });
      var populationPromise = dataService.renderVillagePopulationByTownIdAndVillageId(townId, villageId, function(villagePopulation) {
          $scope.population = villagePopulation;
          $scope.currentPopulation = $scope.population.population;
      });
      var shelterPromise =  dataService.renderVillageShelterByTownIdAndVillageId(townId, villageId, function(villageShelter) {
          $scope.shelter = villageShelter;
        //   $scope.shelter.defaultShelterList.sort // TODO
          $scope.currentAccommodation = [].reduce.call($scope.shelter.defaultShelterList, function(totalAccommodation, shelter){
              shelter.fullAddress = $scope.selectedCounty.county + $scope.selectedTown.town + $scope.selectedVillage.village + shelter.address;
              try {
                  totalAccommodation += parseInt(shelter.accommodation);
              } catch(Exception) {
                  totalAccommodation += 0;
              } finally {
                  return totalAccommodation;
              }
          }, 0);
      });
      $q.all([
        populationPromise,
        shelterPromise
      ]).then(function(data) {
        $scope.shelterInfo = {
            currentStatus: $scope.currentAccommodation + '/' + $scope.currentPopulation,
            currentStatusAppend: '總收容人數/總人口',
            isEnougn: ($scope.currentAccommodation / $scope.currentPopulation) > 0.9
        };
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
      alert('暫時不開放更新～');
      return;
    //   var townId = $scope.selectedTown.town_id;
    //   var villageId = $scope.selectedVillage.village_id;
    //   var body = angular.copy($scope.evacuationInfo);
    //   dataService.updateEvacuationInfoByTownIdAndVillageId(townId, villageId, body, function(result) {
    //       var reCode = parseInt(JSON.parse(result.data).reCode) || 0;
    //       var reMessage = JSON.parse(result.data).reMessage || "";
    //       alert(reMessage);
    //       console.log(JSON.parse(result.data));
    //   });
    // angular.copy($scope.evacuationInfo); // return value;
  };
  $scope.deleteSanctuary = function(sanctuaryIndex) {
      $scope.sanctuaryList.splice(sanctuaryIndex, 1);
  };
  $scope.deleteSanctuaryList = function() {
      alert('還沒實作喔～');
      //TODO
  };
});
