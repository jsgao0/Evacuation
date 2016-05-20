var uploadApp = angular.module('uploadApp', []);

uploadApp.service('polyfillService', function() {
    if (typeof(Number.prototype.toRad) === "undefined") {
        Number.prototype.toRad = function() {
            return this * Math.PI / 180;
        };
    }
});

uploadApp.service('evacuationRouteService', function() {
    // TODO
});

uploadApp.service('dataService', function ($http) {
    var self = this;
    self.renderCountyList = function (callback) {
        var countyList = [];
        $http({
            method: 'JSONP',
            url: 'https://evacuation-restful.herokuapp.com/counties?callback=JSON_CALLBACK'
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
            url: 'https://evacuation-restful.herokuapp.com/' + countyId + '/towns?callback=JSON_CALLBACK'
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
            url: 'https://evacuation-restful.herokuapp.com/' + townId + '/villages?callback=JSON_CALLBACK'
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
            url: 'https://evacuation-restful.herokuapp.com/' + townId + '/' + villageId + '/village-head?callback=JSON_CALLBACK'
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
            url: 'https://evacuation-restful.herokuapp.com/' + townId + '/' + villageId + '/population?callback=JSON_CALLBACK'
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
            url: 'https://evacuation-restful.herokuapp.com/' + townId + '/' + villageId + '/shelters?callback=JSON_CALLBACK'
        }).then(function (result) {
            villageShelter = result.data.villageShelter;
            callback(villageShelter);
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
    // Initialiation.
    $scope.countyList = [];
    $scope.townList = [];
    $scope.villageList = [];
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
            $scope.renderEvacuationInfoByTownIdAndVillageId();
        });
    };
    $scope.renderEvacuationInfoByTownIdAndVillageId = function() {
        var townId = $scope.selectedTown.town_id;
        var villageId = $scope.selectedVillage.village_id;
        dataService.renderVillageHeadByTownIdAndVillageId(townId, villageId, function(villageHead) {
            $scope.villageHead = villageHead;
        });
        var populationPromise = dataService.renderVillagePopulationByTownIdAndVillageId(
            townId,
            villageId,
            function(villagePopulation) {
                $scope.population = villagePopulation;
                $scope.currentPopulation = $scope.population.population;
            }
        );
        var shelterPromise = dataService.renderVillageShelterByTownIdAndVillageId(
            townId,
            villageId,
            function(villageShelter) {
                $scope.shelter = villageShelter;
                $scope.currentAccommodation = [].reduce.call(
                    $scope.shelter.defaultShelterList,
                    function(totalAccommodation, shelter) {
                        shelter.fullAddress = $scope.selectedCounty.county + $scope.selectedTown.town + $scope.selectedVillage.village + shelter.address;
                        try {
                            if(shelter.openStatus !== '開設') totalAccommodation += 0;
                            else totalAccommodation += parseInt(shelter.accommodation);
                        } catch(Exception) {
                            totalAccommodation += 0;
                        } finally {
                            return totalAccommodation;
                        }
                    },
                0);
            }
        );
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
});
