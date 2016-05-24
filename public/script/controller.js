uploadApp.controller('selectorController', function ($scope, $q, dataService) {

    $scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };

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
            $scope.allShelterMarkers = dataService.getShelterMarkers($scope.shelter.defaultShelterList);
            $scope.map = {
                center: dataService.getMarkersCenter($scope.allShelterMarkers),
                zoom: 13
            };
            $scope.windowOptions = {
                visible: false
            };
            $scope.onClick = function(marker) {
                marker.windowOptions.visible = !marker.windowOptions.visible;
            };

            $scope.closeClick = function() {
                marker.windowOptions.visible = false;
            };
        });
    };
});
