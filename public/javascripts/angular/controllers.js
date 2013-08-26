
//Gives the coordinates of the mouse position.
function getMousePosition(event) {
  if (event.pageX) {
    return {
             x: event.pageX,
             y: event.pageY
           };
  } else {
    return { 
             x: event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft, 
             y: event.clientY + document.body.scrollTop  + document.documentElement.scrollTop
           };
  }
}

//Gives the absolute position of the element in the page.
function getPosition(element){
  var top = 0, left = 0;
    
  while (element) {
    left   += element.offsetLeft;
    top    += element.offsetTop;
    element = element.offsetParent;
  }
  return { x: left, y: top };
}


/*** CONTROLLERS ***/
function UploadCtrl($scope) {

  $scope.uploadComplete = function (content, completed) {
    if (completed) {
        console.log(content);
        $scope.response = content; // Presumed content is a json string!
    }
  };

}

function TranscriptionCtrl($scope, $log, $http, Restangular, File, SentenceBoundaries, TranscriptionsData, Video) {

  $scope.startVideo=function(timeStart){
  	Video.startVideo(timeStart,$scope.transcriptionsData);
  }
  
  $scope.moveVideo=function(eventObject){
  	Video.moveVideo(eventObject);
  }
  
  //Get the transcription from the server: if the transcription enhanced with the dtw exist, we use it. Otherwise we make the calculation.
  File.get({fileId: 'enhanced-transcription.json'}, 
      function(transcriptions) {
    	$scope.transcriptionsData=new TranscriptionsData.instance(transcriptions);
    	//We make sure that the nextWordToDisplay value is correct
    	$scope.startVideo($scope.transcriptionsData.fullTranscription[0].content[0].start);
      },
      function(){
        Restangular.one('audiofiles.json', 2).getList('transcriptions').then(function(transcriptions) {
  	      $scope.transcriptionsData=new TranscriptionsData.instance(transcriptions);
  	      $scope.transcriptionsData.adjustTranscriptions();
          File.get({fileId: 'etape.dev.g.seg'}, 
            function(data) {
    	      //We get the bounds of the sentences we will use for the DTWs
    	      $scope.sentenceBounds=SentenceBoundaries.get(data);	
    	      $scope.transcriptionsData.updateTranscriptionsWithDtw($scope.sentenceBounds);
    	      //We make sure that the nextWordToDisplay value is correct
    	      $scope.startVideo($scope.transcriptionsData.fullTranscription[0].content[0].start);
            }
          );
        });
      }
  );

  //Non angular events
  $("#mediafile").on("timeupdate", function (e) {
    $scope.$apply( function() {
      $scope.transcriptionsData.timeUpdateDisplay(e.target.currentTime);
    });
  });

  $("#mediafile").on("seeking", function (e) {
    $scope.$apply( function() {
      $scope.transcriptionsData.seekingUpdateDisplay(e.target.currentTime);
    });
  });

}

function SpeakerCtrl($scope, $log, $http, Restangular, TranscriptionsData, SpeakerBar, Video) {
  
  $scope.startVideo=function(timeStart){
  	Video.startVideo(timeStart,$scope.transcriptionsData);
  }
  
  $scope.moveVideo=function(eventObject){
  	Video.moveVideo(eventObject);
  }
  
  $scope.clickUpdate=function(event) {
    $scope.speakerBar.clickUpdate(event);
  }
  
  //Get the transcription from the server
  Restangular.one('audiofiles.json', 1).getList('transcriptions').then(function(transcriptions) {
  	$scope.transcriptionsData=new TranscriptionsData.instance(transcriptions);
  	$scope.transcriptionsData.adjustTranscriptions();
  	$scope.speakerBar=new SpeakerBar.instance($scope.transcriptionsData.fullTranscription[0],0);
  	$scope.speakerBar.updateSpeakers();
  	$scope.speakerBar.drawSpeakers();
    $scope.startVideo($scope.transcriptionsData.fullTranscription[0].content[0].start);
    
    var firstPart="";
    var cssStyle="white";
    var filling="";
    var lastPart="";
    if($scope.speakerBar.speakers.length>1){
    	//If the last color is used at least twice.
    	if($scope.speakerBar.speakers[$scope.speakerBar.speakers.length-2].color==$scope.speakerBar.speakers[$scope.speakerBar.speakers.length-1].color){
    		firstPart="The color ";
    		var color=$scope.speakerBar.colors[$scope.speakerBar.colors.length-1];
    		cssStyle="color:"+";background:"+color+";padding:2px 10px 2px;";
    		filling="__";
    		lastPart="  is used for several speakers (those who talk the less).";
    	}
    }
    $scope.captionMessage={begin:firstPart,style:cssStyle,fill:filling,end:lastPart};
  });

  //Non angular events
  $("#mediafile").on("timeupdate", function (e) {
    $scope.$apply( function() {
      $scope.transcriptionsData.timeUpdateDisplay(e.target.currentTime);
      $scope.speakerBar.timeUpdate(e.target.currentTime);
    });
  });

  $("#mediafile").on("seeking", function (e) {
    $scope.$apply( function() {
      $scope.transcriptionsData.seekingUpdateDisplay(e.target.currentTime);
    });
  });

}
