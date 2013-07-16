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
  
  	this.WordToAdd = function(wordStructure,position){
		this.wordStructure=wordStructure;
		this.position=position;
  	}
  	
  	this.addWords = function(wordsToAdd,i){
  		var shift=0;
  		for(var a=0;a<wordsToAdd.length;a++){
  			$scope.fullTranscription[i].content.splice(wordsToAdd[a].position+shift, 0, wordsToAdd[a].wordStructure);
  			shift++;
  		}
  	}
  
    var formerIndexEnd=new Array($scope.fullTranscription.length);
    for(var i=0;i<formerIndexEnd.length;i++){
    	formerIndexEnd[i]=-1;
    }
    var wordsToAddInTranscription=new Array($scope.fullTranscription.length);
    for(var i=1;i<wordsToAddInTranscription.length;i++){
    	wordsToAddInTranscription[i]=new Array();
    }
    
    for(var j=0;j<$scope.sentenceBounds.length;j++){
  		var indexStartRef = BinarySearch.search($scope.fullTranscription[0].content, $scope.sentenceBounds[j].start, function(item) { return item.start; });
  		var indexEndRef   = BinarySearch.search($scope.fullTranscription[0].content, $scope.sentenceBounds[j].end  , function(item) { return item.start; });
    	if(indexStartRef==-3 || indexStartRef==-1 || indexEndRef==-2 || indexEndRef==-1){
    		var refSlice=[];
    	}
    	else{
    		if(indexStartRef==-2){
    			indexStartRef=0;
    		}
    		if(indexEndRef==-3){
    			indexEndRef=$scope.fullTranscription[0].content.length-1;
    		}	
    		
    		if(indexStartRef==formerIndexEnd[0]){
    			indexStartRef++;
    		}
    		formerIndexEnd[0]=indexEndRef;
    		var refSlice = $scope.fullTranscription[0].content.slice(indexStartRef,indexEndRef+1);
    	}
    	
    	for(var i=1;i<$scope.fullTranscription.length;i++){
    		var indexStartHyp = BinarySearch.search($scope.fullTranscription[i].content, $scope.sentenceBounds[j].start, function(item) { return item.start; });
    		var indexEndHyp   = BinarySearch.search($scope.fullTranscription[i].content, $scope.sentenceBounds[j].end  , function(item) { return item.start; });
    		if(indexStartHyp==-3 || indexStartHyp==-1 || indexEndHyp==-2 || indexEndHyp==-1){
    			var hypSlice=[];
    		}
    		else{
    			if(indexStartHyp==-2){
    				indexStartHyp=0;
    			}
    			if(indexEndHyp==-3){
    				indexEndHyp=$scope.fullTranscription[i].content.length-1;
    			}	
    			
    			if(indexStartHyp==formerIndexEnd[i]){
    				indexStartHyp++;
    			}
    			formerIndexEnd[i]=indexEndHyp;
    			var hypSlice= $scope.fullTranscription[i].content.slice(indexStartHyp,indexEndHyp+1);
    		}
    		
    		var dtw=new Dtw.dtwTranscription(hypSlice,indexStartHyp,refSlice,indexStartRef);
	  		dtw.calculate();
	  		var path=dtw.path();
	  
	  		for(var k=0;k<path.length;k++){
	    		if(path[k].operation=='inser'){
	    		    var  word=$scope.fullTranscription[0].content[path[k].indexFullRef].word;
	      			var spk  =$scope.fullTranscription[0].content[path[k].indexFullRef].spk;
	      			var insertionIndex=path[k].indexFullHyp+1;
	      			
	      			if(insertionIndex>0){
	      				var start=($scope.fullTranscription[i].content[insertionIndex-1].start+$scope.fullTranscription[i].content[insertionIndex].start)/2;
	      			}
	      			else{
	      				var start=$scope.fullTranscription[i].content[insertionIndex].start/2;
	      			}
	      			
	      			var wordStructure={"start":start,"word":"+"+word+"+","spk":spk,"wordClass":"inser"};
	      			wordsToAddInTranscription[i].push(new WordToAdd(wordStructure,insertionIndex));
	      			$scope.fullTranscription[0].content[path[k].indexFullRef].wordClass="none";
	    		}
	    		else if(path[k].operation=='suppr'){
	    			var word=$scope.fullTranscription[i].content[path[k].indexFullHyp].word;
	    			$scope.fullTranscription[i].content[path[k].indexFullHyp].word="-"+word+"-";
	      			$scope.fullTranscription[i].content[path[k].indexFullHyp].wordClass="suppr";
	      			$scope.fullTranscription[0].content[path[k].indexFullRef].wordClass="none";
	    		}
	    		else if(path[k].operation=='subst'){
	    		    var current=$scope.fullTranscription[i].content[path[k].indexFullHyp].word;
	    		    var replacement=$scope.fullTranscription[0].content[path[k].indexFullRef].word;
	      			$scope.fullTranscription[i].content[path[k].indexFullHyp].wordClass="subst";
	      			$scope.fullTranscription[i].content[path[k].indexFullHyp].word=current+"(->"+replacement+")";
	      			$scope.fullTranscription[0].content[path[k].indexFullRef].wordClass="none";
	    		}
	    		else if(path[k].operation=='none'){
	    			$scope.fullTranscription[i].content[path[k].indexFullHyp].wordClass="none";
	    			$scope.fullTranscription[0].content[path[k].indexFullRef].wordClass="none";
	    		}
	  		}
    	}	
  	}
  	
  	for(var i=1;i<$scope.fullTranscription.length;i++){
  		addWords(wordsToAddInTranscription[i],i);
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
  $scope.displayedTranscriptionS = [];
  var globalStep=50;
  $scope.message="";
  $scope.clickableMessage="";
  
  //Get the transcription from the server
  Restangular.one('audiofiles.json', 2).getList('transcriptions').then(function(transcriptions) {
  
  	//We admit that the first transcription(index 0) is the reference
    $scope.fullTranscription = transcriptions;
    
    //We add/modify information to the transcriptions
    for(var i=0;i<$scope.fullTranscription.length;i++){
    	for(var j=0;j<$scope.fullTranscription[i].content.length;j++){
    		$scope.fullTranscription[i].content[j].wordClass="untreatedDtw";
    		$scope.fullTranscription[i].content[j].start=parseFloat($scope.fullTranscription[i].content[j].start);
    	}
    }
    
    //We adjust the transcriptions to the reference
    var referenceFirstTime=$scope.fullTranscription[0].content[0].start;
    var referenceLastTime=$scope.fullTranscription[0].content[$scope.fullTranscription[0].content.length-1].start;
    for(var i=1;i<$scope.fullTranscription.length;i++){
    	var hypothesisFirstIndex=BinarySearch.search($scope.fullTranscription[i].content, referenceFirstTime, function(item) { return item.start; });
    	var hypothesisLastIndex =BinarySearch.search($scope.fullTranscription[i].content, referenceLastTime,  function(item) { return item.start; });
    	// When the transcriptions doesn't overlap
    	if(hypothesisFirstIndex==-3 || hypothesisFirstIndex==-1 || hypothesisLastIndex==-2 || hypothesisLastIndex==-1){
    		$scope.fullTranscription[i].content=[];
    	}
    	else{
    		if(hypothesisFirstIndex==-2){
    			hypothesisFirstIndex=0;
    		}
    		if(hypothesisLastIndex==-3){
    			hypothesisLastIndex=$scope.fullTranscription[i].content.length-1;
    		}
    		
    		if(hypothesisLastIndex<$scope.fullTranscription[i].content.length-1){
    			// Generally, the BinarySearch function take the hypothesis index whose start is slightly under the start we searched
    			hypothesisLastIndex++;
    		}
    		
    		//We want the transcriptions to be included in the reference plus a certain margin
    		var margin=1;
    		if($scope.fullTranscription[i].content[hypothesisFirstIndex].start<(referenceFirstTime-margin)){
    			hypothesisFirstIndex++;
    		}
    		if($scope.fullTranscription[i].content[hypothesisLastIndex].start>(referenceLastTime+margin)){
    			hypothesisLastIndex--;
    		}
    		$scope.fullTranscription[i].content=$scope.fullTranscription[i].content.slice(hypothesisFirstIndex,hypothesisLastIndex+1);
    		//if the indexes become incorrect because of the (++) and (--), slice will return []
    	}
    }	
    	
    $scope.displayedTranscriptionS=new Array($scope.fullTranscription.length);
    for(var i=0;i<$scope.displayedTranscriptionS.length;i++){
    	$scope.displayedTranscriptionS[i]=new DisplayedTranscription(globalStep);
   	}
    
    GetFile.get({fileId: 'etape.dev.g.seg'}, function(data) {
    	
    	//We get the bounds of the sentences we will use for the DTWs
    	$scope.sentenceBounds=GetSentenceBoundaries.getSentenceBoundaries(data);
    	
    	updateTranscriptionsWithDtw();
    	
    	//We make sure that the nextWordToDisplay value is correct
    	$scope.startVideo(146.39);
    
    });
	
  });

  $scope.startVideo = function(timeStart){
    $('#mediafile')["0"].player.setCurrentTime(timeStart);
    for(var i=0;i<$scope.displayedTranscriptionS.length;i++){
    	$scope.displayedTranscriptionS[i].nextWordToDisplay = BinarySearch.search($scope.fullTranscription[i].content, timeStart, function(item) { return item.start; });
    	$scope.updateTranscription($scope.fullTranscription,i);
    }
  }

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
    //console.log("updateTranscriptions("+i+") words to display="+$scope.displayedTranscriptionS[i].transcription.length);
  }


  //Non angular events
  $("#mediafile").on("timeupdate", function (e) {
    $scope.$apply( function() {
      for(var i=0;i<$scope.displayedTranscriptionS.length;i++){ 
	    //console.log("timeupdate("+i+") t="+e.target.currentTime+" ,nextTimeToDisplay="+$scope.displayedTranscriptionS[i].nextTimeToDisplay);
	  
        //Seach the word through the words that are displayed
        var currentDisplayedWordIndex = BinarySearch.search($scope.displayedTranscriptionS[i].transcription, e.target.currentTime, function(item) { return item.start; });
        if(currentDisplayedWordIndex== -3){
        	currentDisplayedWordIndex=$scope.displayedTranscriptionS[i].transcription.length - 1;
        }
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
        
        // We add the 0.5 sec value that we chose in the Indexe service.
        if(e.target.currentTime>$scope.fullTranscription[0].content[$scope.fullTranscription[0].content.length-1].start+0.5){
    		$scope.message="La transcription ASH est finie. Elle démarre à";
  			$scope.clickableMessage=$scope.fullTranscription[0].content[0].start+" sec.";
        }
        else if(e.target.currentTime<$scope.fullTranscription[0].content[0].start){
        	$scope.message="La transcription ASH n'as pas encore commencé. Elle démarre à";
  			$scope.clickableMessage=$scope.fullTranscription[0].content[0].start+" sec.";
        }
        else{
        	$scope.message="";
  			$scope.clickableMessage="";
        }
        
      } 
    });

  });

  $("#mediafile").on("seeking", function (e) {
    $scope.$apply( function() {
    for(var i=0;i<$scope.displayedTranscriptionS.length;i++){ 
        //console.log("seeking("+i+") t="+e.target.currentTime);
    
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

