'use strict';

/* jasmine specs for services go here */

describe('search services', function() {
    describe('when I call myService.one', function(){

        var content = angular.fromJson('[{"start":"2406.40","word":"donc","spk":{"id":"S23","gender":"m"}},{"start":"2406.56","word":"le","spk":{"id":"S23","gender":"m"}},{"start":"2406.88","word":"gouvernement","spk":{"id":"S23","gender":"m"}}, {"start":"3000","word":"test","spk":{"id":"S23","gender":"m"}}, {"start":"4000","word":"test2","spk":{"id":"S23","gender":"m"}}]');
        var $injector = angular.injector([ 'searchServices' ]);
        var searchService = $injector.get( 'BinarySearch' );

        it('returns -1 when not found', function(){
            expect(searchService.search([], 0)).toEqual(-1);
            expect(searchService.search(content, 0)).toEqual(-1);
            expect(searchService.search(content, 0, function(item) { return item.start; })).toEqual(-1);
            expect(searchService.search(content, -200, function(item) { return item.start; })).toEqual(-1);
            expect(searchService.search(content, 10000, function(item) { return item.start; })).toEqual(-1);
            expect(searchService.search(content, 4001, function(item) { return item.start; })).toEqual(-1);
        });

        it('returns the good value when found', function(){
            expect(searchService.search(content, 2406.45, function(item) { return item.start; })).toEqual(0);
            expect(searchService.search(content, 3200, function(item) { return item.start; })).toEqual(3);
            expect(searchService.search(content, 2500, function(item) { return item.start; })).toEqual(2);
            expect(searchService.search(content, 4000, function(item) { return item.start; })).toEqual(4);
        });

    });
});
