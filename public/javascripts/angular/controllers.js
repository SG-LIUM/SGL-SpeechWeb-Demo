function UploadCtrl($scope) {

  $scope.uploadComplete = function (content, completed) {
    if (completed) {
        console.log(content);
        $scope.response = content; // Presumed content is a json string!
    }
  };

}

function TranscriptionCtrl($scope, $log, Restangular, BinarySearch, Indexes) {

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
    $scope.updateTranscriptions(transcriptions);
  });

  $scope.moveVideo = function(eventObject) {
    var time = eventObject.currentTarget.attributes["data-start"].value;
    $('#mediafile')["0"].player.setCurrentTime(time);
  }

  $scope.updateTranscriptions = function(transcriptions) {
    var nextWords = Indexes.getNextWords(transcriptions[0], $scope.nextWordToDisplay, $scope.step);
    $scope.transcription = nextWords.words;
    $scope.currentWordEnd = nextWords.currentWordEnd;
    $scope.currentWordStart = nextWords.currentWordStart;
    $scope.nextWordToDisplay = nextWords.nextWordToDisplay;
    nextTimeToDisplay = nextWords.nextTimeToDisplay;
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
        $scope.updateTranscriptions($scope.fullTranscription);
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
            $scope.updateTranscriptions($scope.fullTranscription);
        }
      }
    });

  });

}

