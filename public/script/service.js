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
    self.getShelterMarkers = function(shelterList) {
        var distinctShelterMarkers = [];
        shelterList.forEach(function(rawShelter) {
            var isRepeated = distinctShelterMarkers.some(function(shelter) {
                return rawShelter.id === shelter.id;
            });
            if(!isRepeated) {
                var marker = {
                    id: rawShelter.id,
                    coords: {
                        latitude: rawShelter.lat,
                        longitude: rawShelter.lon
                    },
                    windowOptions: {
                        visible: false
                    },
                    name: rawShelter.name,
                    address: rawShelter.address,
                    accommodation: rawShelter.accommodation,
                    openStatus: rawShelter.openStatus,
                    disasterType: rawShelter.disasterType,
                    isOutdoor: rawShelter.isOutdoor,
                    adaptWeaker: rawShelter.adaptWeaker
                };
                distinctShelterMarkers.push(marker);
            }
        });
        return distinctShelterMarkers;
    };
    self.getMarkersCenter = function(markerList) {
        var sortByLatitude = markerList.sort(function(a, b) {
                return parseFloat(a.coords.latitude) - parseFloat(b.coords.latitude);
            }
        ),
            sortByLongitude = markerList.sort(function(a, b) {
                return parseFloat(a.coords.longitude) - parseFloat(b.coords.longitude);
            }
        ),
            center = {
                latitude: (parseFloat(sortByLatitude[markerList.length - 1].coords.latitude) + parseFloat(sortByLatitude[0].coords.latitude)) / 2,
                longitude: (parseFloat(sortByLongitude[markerList.length - 1].coords.longitude) + parseFloat(sortByLongitude[0].coords.longitude)) / 2
            };
        return center;
    };
});
