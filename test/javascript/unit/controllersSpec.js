'use strict';

/* jasmine specs for controllers go here */
describe('Transcription controllers', function() {

  beforeEach(module('restangular'));
  beforeEach(module('searchServices'));
  
  describe('TranscriptionCtrl', function(){
    var scope, ctrl, $httpBackend, Restangular;

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
      $httpBackend = _$httpBackend_;

      $httpBackend.expectGET('/audiofiles.json/6/transcriptions').
          respond([{"system":null,"audioFile":{"id":6},"content":[{"start":"2406.40","word":"donc","spk":{"id":"S23","gender":"m"}},{"start":"2406.56","word":"le","spk":{"id":"S23","gender":"m"}},{"start":"2406.88","word":"gouvernement","spk":{"id":"S23","gender":"m"}}]}]);

      scope = $rootScope.$new();
      ctrl = $controller(TranscriptionCtrl, {$scope: scope});
    }));

    it('should create transcription model with 2 words', function() {
      expect(scope.fullTranscription.length).toBe(0);
      $httpBackend.flush();
      expect(scope.fullTranscription[0].content.length).toBe(3);
      expect(scope.transcription.length).toBe(3);
    });

  });
});
