'use strict';

/* jasmine specs for services go here */

describe('search services', function() {
    describe('when I call myService.one', function(){

        var content = angular.fromJson('[{"start":"2406.40","word":"donc","spk":{"id":"S23","gender":"m"}},{"start":"2406.56","word":"le","spk":{"id":"S23","gender":"m"}},{"start":"2406.88","word":"gouvernement","spk":{"id":"S23","gender":"m"}}]');

        it('returns -1 when not found', function(){
            var $injector = angular.injector([ 'searchServices' ]);
            var searchService = $injector.get( 'BinarySearch' );
            expect(searchService.search([], 0)).toEqual(-1);
            expect(searchService.search(content, 0)).toEqual(-1);
        });

    });
});
