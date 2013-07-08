function UploadCtrl($scope) {

  $scope.uploadComplete = function (content, completed) {
    if (completed) {
        console.log(content);
        $scope.response = content; // Presumed content is a json string!
    }
  };

}

function TranscriptionCtrl($scope, $log, Restangular, BinarySearch, Indexes) {

  //Point in the DTW
  function PointDtwTranscription(cost,operation,matrixLine,matrixCol) {
    this.cost = cost;
    this.operation = operation;
    this.indexHyp = matrixLine-1;
    this.indexRef = matrixCol-1;
  }

  //DTW for full transcriptions
  function DtwTranscription(hypothesis,reference) {

    this.hypothesis = hypothesis.content;
    this.reference = reference.content;
    this.iM=this.hypothesis.unshift({});
    this.jM=this.tableReference.unshift({});
    this.matrix=new Array(this.iM);
    for (var i = 0; i < this.iM; i++){
    	this.matrix[i]=new Array(this.jM);
    }
	
    this.calculate=function(){
    	this.matrix[0][0]=new PointDtwTranscription(0,'',0,0);
    	for (var i = 1 ; i < this.iM ;  i++) {
    		this.matrix[i][0]=new PointDtwTranscription(i,'suppr',i,0);
		}
		for (var j = 1 ; j < this.jM ;  j++) {
    		this.matrix[0][j]=new PointDtwTranscription(j,'inser',0,j);
		}
		
		var origins=new Array(3);
    	var cost;
    	var ope;
		for (var i = 1 ; i < this.iM ;  i++) {
			for (var j = 1 ; j < this.jM ;  j++) {	
    			if(this.hypothesis[i].word==this.reference[j].word){
    				cost=0;
    				ope='none';
    			}
    			else{
    				cost=1;
    				ope='subst'
    			}
    			origins[0]=new PointDtwTranscription(this.matrix[i-1][j].cost+1,'suppr',i,j);
    			origins[1]=new PointDtwTranscription(this.matrix[i-1][j-1].cost+cost,ope,i,j);
    			origins[2]=new PointDtwTranscription(this.matrix[i][j-1].cost+1,'inser',i,j);
    			origins.sort(function (a, b) {
  					return a.cost-b.cost;
				});
    			this.matrix[i][j]=origins[0];
			}
		}
    }
    
    this.path=function(){
    	var path=new Array();
    	var i=this.iM-1;
    	var j=this.jM-1;
    	var point;
    	do{
    		point=this.matrix[i][j];
    		path.unshift(point);
    		if(point.operation=='inser'){
    			j-=1;
    		}
    		else if(point.operation=='suppr'){
    			i-=1;
    		}
    		else if(point.operation=='subst' || point.operation=='none'){
    			i-=1;
    			j-=1;
    		}
    	}while(!(i==0&&j==0));
    	return path;
    }
  }

  function updateTranscriptionsWithDtw(transcriptions){
  	var reference=transcriptions[0];
  	for(var i=1;i<transcriptions.length;i++){
	  var dtw=new DtwTranscription(transcriptions[i],reference);
	  dtw.calculate();
	  var path=dtw.path();
	  for(p in path){
	    if(p.operation=='inser'){
	      var start=reference[p.indexRef].start;
	      var spk=reference[p.indexRef].spk;
	      ranscriptions[i].splice(p.indexHyp, 0, {"start":start,"word":"+++","spk":spk,"ope":"inser"});
	    }
	    else if(p.operation=='suppr'){
	      transcriptions[i][p.indexHyp].ope="suppr";
	    }
	    else if(p.operation=='subst'){
	      transcriptions[i][p.indexHyp].ope="subst";
	    }
	    else{
	      transcriptions[i][p.indexHyp].ope="none";
	    }
	  }
	}
  }


  function DisplayedTranscription(step) {
	this.nextWordToDisplay=0;
	this.currentHighlightedIndex=0;
	this.currentWordStart=0;
	this.currentWordEnd=0;
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
    }
    //$scope.updateTranscriptions(transcriptions);
    //We force the seeking function to execute so the nextWordToDisplay value is correct
    $('#mediafile')["0"].player.setCurrentTime(140);
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

