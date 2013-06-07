function TranscriptionCtrl($scope, $log, Restangular, BinarySearch) {

  //Init some sane defaults
  $scope.displayWordStart = 0;
  $scope.fullTranscription = [];
  var step = 50;
  var nextTimeToDisplay = 0;

  $scope.transcription = [];

  //Get the transcription from the server
  Restangular.one('audiofiles.json', 6).getList('transcriptions').then(function(transcriptions) {
    $scope.fullTranscription = transcriptions;
    $scope.transcription = $scope.getNextWords($scope.fullTranscription);

  });


  //Get the next list of words to display on the screen
  $scope.getNextWords = function(transcriptions) {
    var displayWordEnd = $scope.displayWordStart + step;

    // Try to avoid out of bounds exception
    if ($scope.displayWordStart > transcriptions[0].length -1) {
      return [];
    }

    if (displayWordEnd > transcriptions[0].length -1) {
      displayWordEnd = transcriptions[0].length -1;
    }

    var words = transcriptions[0].content.slice($scope.displayWordStart, displayWordEnd);
    $scope.displayWordStart = displayWordEnd;
    displayWordEnd = $scope.displayWordStart + step;
    if(transcriptions[0].content.length >= $scope.displayWordStart) {
      nextTimeToDisplay = transcriptions[0].content[$scope.displayWordStart].start;
    }

    return words;
  }

  //Non angular events
  $("#mediafile").on("timeupdate", function (e) {
    $scope.$apply( function() {

      //instead of searching through the whole thing, we should keep
      //an index of the latest hightlighted word
      var currentWordIndex = BinarySearch.search($scope.fullTranscription[0].content, e.target.currentTime, function(item) { return item.start; })
      var currentWord = $scope.fullTranscription[0].content[currentWordIndex];
      console.log(currentWord);
      $('#content span[data-start="' + currentWord.start + '"]').prevAll().addClass('current');

      if(nextTimeToDisplay != 0 && e.target.currentTime > nextTimeToDisplay) {
        $scope.transcription = $scope.getNextWords($scope.fullTranscription);

      }
    });

  });

  $("#mediafile").on("seeking", function (e) {
    $scope.$apply( function() {
      if(typeof $scope.fullTranscription[0] !== 'undefined') {
        $scope.displayWordStart = BinarySearch.search($scope.fullTranscription[0].content, e.target.currentTime, function(item) { return item.start; })
        $scope.transcription = $scope.getNextWords($scope.fullTranscription);
      }
    });

  });

}

