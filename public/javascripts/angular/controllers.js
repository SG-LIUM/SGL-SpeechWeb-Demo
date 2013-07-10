function UploadCtrl($scope) {

  $scope.uploadComplete = function (content, completed) {
    if (completed) {
        console.log(content);
        $scope.response = content; // Presumed content is a json string!
    }
  };

}

function TranscriptionCtrl($scope, $log, $http, Restangular, BinarySearch, Indexes, GetFile, GetSentenceBoundaries, Dtw) {

  function updateTranscriptionsWithDtw(){
  	for(var i=1;i<$scope.fullTranscription.length;i++){
	  var dtw=new DtwTranscription($scope.fullTranscription[i],$scope.fullTranscription[0]);
	  dtw.calculate();
	  var path=dtw.path();
	  for(p in path){
	    if(p.operation=='inser'){
	      var start=reference[p.indexRef].start;
	      var spk=reference[p.indexRef].spk;
	      $scope.fullTranscription[i].splice(p.indexHyp, 0, {"start":start,"word":"+++","spk":spk,"ope":"inser"});
	    }
	    else if(p.operation=='suppr'){
	      $scope.fullTranscription[i][p.indexHyp].ope="suppr";
	    }
	    else if(p.operation=='subst'){
	      $scope.fullTranscription[i][p.indexHyp].ope="subst";
	    }
	    else{
	      $scope.fullTranscription[i][p.indexHyp].ope="none";
	    }
	  }
	}
  }


  function DisplayedTranscription(step) {
	this.nextWordToDisplay=0;
	this.currentHighlightedIndex=0;
	this.currentWordStart=0;
	this.currentWordEnd=this.currentWordEnd+step;
	this.step=step;
	this.nextTimeToDisplay=0;
	this.transcription=[];
  }

  //Init some sane defaults
  $scope.fullTranscription = [];
  $scope.displayedTranscriptionS;
  var globalStep=50;
  
  /*
    $scope.nextWordToDisplay = 0;
    $scope.currentHighlightedIndex = 0;
    $scope.currentWordStart = 0;
    $scope.currentWordEnd = 0;
    $scope.step = 50;
    var nextTimeToDisplay = 0;

    $scope.transcription = [];
  */
  
  //Get the transcription from the server
  Restangular.one('audiofiles.json', 2).getList('transcriptions').then(function(transcriptions) {
    $scope.fullTranscription = transcriptions;
    console.log("Rectangular.one");
    $scope.displayedTranscriptionS=new Array(transcriptions.length);
    for(var i=0;i<$scope.displayedTranscriptionS.length;i++){
    	$scope.displayedTranscriptionS[i]=new DisplayedTranscription(globalStep);
    	//$scope.updateTranscription(transcriptions,i);
    }
    //We make sure that the nextWordToDisplay value is correct
    timeStart=146.39;
    $('#mediafile')["0"].player.setCurrentTime(timeStart);
    for(var i=0;i<$scope.displayedTranscriptionS.length;i++){
    	$scope.displayedTranscriptionS[i].nextWordToDisplay = BinarySearch.search($scope.fullTranscription[i].content, timeStart, function(item) { return item.start; });
    	$scope.updateTranscription(transcriptions,i);
    }
    
    GetFile.get({fileId: 'etape.dev.g.seg'}, function(data) {
    	console.log(GetSentenceBoundaries.getSentenceBoundaries(data));
    });
    
  });

  $scope.moveVideo = function(eventObject) {
    var time = eventObject.currentTarget.attributes["data-start"].value;
    $('#mediafile')["0"].player.setCurrentTime(time);
  }

  $scope.updateTranscription = function(transcriptions,i) {
    var nextWords = Indexes.getNextWords(transcriptions[i], $scope.displayedTranscriptionS[i].nextWordToDisplay, $scope.displayedTranscriptionS[i].step);
    $scope.displayedTranscriptionS[i].transcription = nextWords.words;
    $scope.displayedTranscriptionS[i].currentWordEnd = nextWords.currentWordEnd;
    $scope.displayedTranscriptionS[i].currentWordStart = nextWords.currentWordStart;
    $scope.displayedTranscriptionS[i].nextWordToDisplay = nextWords.nextWordToDisplay;
    $scope.displayedTranscriptionS[i].nextTimeToDisplay = nextWords.nextTimeToDisplay;
    console.log("updateTranscriptions("+i+") words to display="+$scope.displayedTranscriptionS[i].transcription.length);
  }


  //Non angular events
  $("#mediafile").on("timeupdate", function (e) {
    $scope.$apply( function() {
      for(var i=0;i<$scope.displayedTranscriptionS.length;i++){ 
	    console.log("timeupdate("+i+") t="+e.target.currentTime+" ,nextTimeToDisplay="+$scope.displayedTranscriptionS[i].nextTimeToDisplay);
	  
        //Seach the word through the words that are displayed
        var currentDisplayedWordIndex = BinarySearch.search($scope.displayedTranscriptionS[i].transcription, e.target.currentTime, function(item) { return item.start; })
        //Check boundaries
        if(currentDisplayedWordIndex >= 0 && currentDisplayedWordIndex < $scope.displayedTranscriptionS[i].transcription.length) {
          if (currentDisplayedWordIndex == $scope.displayedTranscriptionS[i].transcription.length - 1) {
            $('#content'+i+' span').addClass('current');
          } else {
            var currentWord = $scope.displayedTranscriptionS[i].transcription[currentDisplayedWordIndex + 1];
            $('#content'+i+' span').removeClass('current');
            $('#content'+i+' span[data-start="' + currentWord.start + '"]').prevAll().addClass('current');
          }
        }

         //Next page
        if($scope.displayedTranscriptionS[i].nextTimeToDisplay != 0 && e.target.currentTime > $scope.displayedTranscriptionS[i].nextTimeToDisplay && $scope.displayedTranscriptionS[i].nextTimeToDisplay!=-1) {
          $scope.updateTranscription($scope.fullTranscription,i);
        }
      } 
    });

  });

  $("#mediafile").on("seeking", function (e) {
    $scope.$apply( function() {
    for(var i=0;i<$scope.displayedTranscriptionS.length;i++){ 
        console.log("seeking("+i+") t="+e.target.currentTime);
    
        if(typeof $scope.fullTranscription[i] !== 'undefined') {
          var nextWordPosition = BinarySearch.search($scope.fullTranscription[i].content, e.target.currentTime, function(item) { return item.start; });
          //Change page only if the next word is not currently displayed
          if(nextWordPosition < $scope.displayedTranscriptionS[i].currentWordStart || nextWordPosition >= $scope.displayedTranscriptionS[i].currentWordStart + $scope.displayedTranscriptionS[i].step) {
        	$scope.displayedTranscriptionS[i].nextWordToDisplay = nextWordPosition;
            $scope.updateTranscription($scope.fullTranscription,i);
          }
        }
      }
    });

  });

}

