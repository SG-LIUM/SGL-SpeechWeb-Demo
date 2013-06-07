function TranscriptionCtrl($scope, Restangular) {

  var displayWordStart = 0;
  var step = 50;
  var nextTimeToDisplay = 0;

  $scope.getNextWords = function(transcriptions) {
    var displayWordEnd = displayWordStart + step;

    // Try to avoid out of bounds exception
    if (displayWordStart > transcriptions[0].length -1) {
      return [];
    }

    if (displayWordEnd > transcriptions[0].length -1) {
      displayWordEnd = transcriptions[0].length -1;
    }

    var words = transcriptions[0].content.slice(displayWordStart, displayWordEnd);
    displayWordStart = displayWordEnd;
    displayWordEnd = displayWordStart + step;
    nextTimeToDisplay = transcriptions[0].content[displayWordStart].start;
    console.log("Next word to display " + nextTimeToDisplay);
    return words;
  }

  $scope.transcription = [];

  Restangular.one('audiofiles.json', 6).getList('transcriptions').then(function(transcriptions) {
    console.log(transcriptions);
    $scope.fullTranscription = transcriptions;
    $scope.transcription = $scope.getNextWords($scope.fullTranscription);
  });


  $("#mediafile").on("timeupdate", function (e) {

    $scope.$apply( function() {
      if(nextTimeToDisplay != 0 && e.target.currentTime > nextTimeToDisplay) {
        $scope.transcription = $scope.getNextWords($scope.fullTranscription);
      }
    });

  });

}
