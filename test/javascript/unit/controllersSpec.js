'use strict';

/* jasmine specs for controllers go here */
describe('Transcription controllers', function() {

  beforeEach(module('restangular'));
  beforeEach(module('searchServices'));
  
  describe('TranscriptionCtrl', function(){
    var scope, ctrl, $httpBackend, Restangular;

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller, Restangular, BinarySearch) {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET('/audiofiles.json/6/transcriptions').
          respond([{name: 'Nexus S'}, {name: 'Motorola DROID'}]);

      scope = $rootScope.$new();
      ctrl = $controller(TranscriptionCtrl, {$scope: scope});
    }));

    it('should create "phones" model with 3 phones', function() {
      var scope = {},
          ctrl = new TranscriptionCtrl(scope);

      expect(scope.transcription.length).toBe(3);
    });

  });
});
