function TranscriptionCtrl($scope, $log, Restangular, BinarySearch) {

  //Init some sane defaults
  $scope.nextWordToDisplay = 0;
  $scope.currentHighlightedIndex = 0;
  $scope.currentWordStart = 0;
  $scope.currentWordEnd = 0;
  $scope.fullTranscription = [];
  $scope.step = 100;
  var nextTimeToDisplay = 0;

  $scope.transcription = [];

  //Get the transcription from the server
  Restangular.one('audiofiles.json', 1).getList('transcriptions').then(function(transcriptions) {
    $scope.fullTranscription = transcriptions;
    $scope.transcription = $scope.getNextWords($scope.fullTranscription);
  });

  $scope.moveVideo = function(eventObject) {
    var time = eventObject.currentTarget.attributes["data-start"].value;
    $('#mediafile')["0"].player.setCurrentTime(time);
  }

  //Get the next list of words to display on the screen
  $scope.getNextWords = function(transcriptions) {
    $scope.currentWordEnd = $scope.nextWordToDisplay + $scope.step;
    $scope.currentWordStart = $scope.nextWordToDisplay;

    // Try to avoid out of bounds exception
    if ($scope.currentWordStart > transcriptions[0].length -1) {
      return [];
    }

    // Same here
    if ($scope.currentWordEnd > transcriptions[0].length -1) {
      $scope.currentWordEnd = transcriptions[0].length -1;
    }

    //Get the words
    var words = transcriptions[0].content.slice($scope.currentWordStart, $scope.currentWordEnd);

    //Reset the counters
    $scope.nextWordToDisplay = $scope.currentWordEnd;
    if(transcriptions[0].content.length >= $scope.nextWordToDisplay) {
      nextTimeToDisplay = transcriptions[0].content[$scope.nextWordToDisplay].start;
    }

    return words;
  }

  //Non angular events
  $("#mediafile").on("timeupdate", function (e) {
    $scope.$apply( function() {

      //Seach the word through the words that are displayed
      var currentDisplayedWordIndex = BinarySearch.search($scope.transcription, e.target.currentTime, function(item) { return item.start; })

      //Check boundaries
      if(currentDisplayedWordIndex >= 0 && currentDisplayedWordIndex < $scope.transcription.length) {
        if (currentDisplayedWordIndex == $scope.transcription.length - 1) {
          $('#content span').addClass('current');
        } else {
          var currentWord = $scope.transcription[currentDisplayedWordIndex + 1];
          $('#content span').removeClass('current');
          $('#content span[data-start="' + currentWord.start + '"]').prevAll().addClass('current');
        }
      }

      //Next page
      if(nextTimeToDisplay != 0 && e.target.currentTime > nextTimeToDisplay) {
        $scope.transcription = $scope.getNextWords($scope.fullTranscription);

      }
    });

  });

  $("#mediafile").on("seeking", function (e) {
    $scope.$apply( function() {
      if(typeof $scope.fullTranscription[0] !== 'undefined') {
        var nextWordPosition = BinarySearch.search($scope.fullTranscription[0].content, e.target.currentTime, function(item) { return item.start; });

        //Change page only if the next word is not currently displayed
        if(nextWordPosition < $scope.currentWordStart || nextWordPosition >= $scope.currentWordStart + $scope.step) {
            $scope.nextWordToDisplay = BinarySearch.search($scope.fullTranscription[0].content, e.target.currentTime, function(item) { return item.start; })
            $scope.transcription = $scope.getNextWords($scope.fullTranscription);
        }
      }
    });

  });

}

