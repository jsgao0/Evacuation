
// TODO: Not done yet. Because it's always assert pass even assert.equal(true, false). It's quite weird.
describe('Test converter.js', function(){
    var Converter = require('../preparation/converter.js'),
    converter = new Converter();
    it('verify every village resident who belongs to at least one shelter', function() {
        converter.villageShelterXML2JSON(function(villageList) {
            var emptyShelterVillageAmount = [].reduce.call(villageList, function(count, village) {
                if(village.defaultVillageList.length === 0) {
                    console.log(village.COUNTY + ' ' + village.TOWN + ' ' + village.VILLAGE);
                    count += 1;
                }
                return count;
            }, 0);
            assert.equal(emptyShelterVillageAmount, 0);
            // console.log(emptyShelterVillageAmount + '/' + villageList.length); // actuallNot / expectAll
        });
    });

});
