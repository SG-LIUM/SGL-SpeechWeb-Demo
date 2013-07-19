/*** CLASSES ***/
//This class represent all that concern a DTW between two transcriptions. hypothesis and reference are parts of a complete transcription. The index are the places where those parts start in the complete transcriptions.
function DtwTranscription(hypothesis,indexStartHyp,reference,indexStartRef) {

  //This sub-class regroups the information of a point in the DTW matrix
  function PointDtwTranscription(dtw,cost,operation,matrixLine,matrixCol){
    this.cost = cost;
    this.operation = operation;
    this.indexFullHyp = dtw.indexStartHyp+matrixLine-1;
    this.indexFullRef = dtw.indexStartRef+matrixCol -1;
  }

  //VI:
  this.indexStartHyp=indexStartHyp;
  this.indexStartRef=indexStartRef;
  //We use slice(0) to copy those value and not modified them
  this.hypothesis = hypothesis.slice(0);
  this.reference = reference.slice(0);
  this.iM=this.hypothesis.unshift({});
  this.jM=this.reference.unshift({});
  this.matrix=new Array(this.iM);
  for (var i = 0; i < this.iM; i++){
    this.matrix[i]=new Array(this.jM);
  }
  
  //Methods:
  //Fill the matrix with points	
  this.calculate=function(){
    this.matrix[0][0]=new PointDtwTranscription(this,0,'',0,0);
    for (var i = 1 ; i < this.iM ;  i++) {
      this.matrix[i][0]=new PointDtwTranscription(this,i,'suppr',i,0);
    }
    for (var j = 1 ; j < this.jM ;  j++) {
      this.matrix[0][j]=new PointDtwTranscription(this,j,'inser',0,j);
    }	
    var origins=new Array(3);
    var cost;
    var ope;
    for (var i = 1 ; i < this.iM ; i++) {
      for (var j = 1 ; j < this.jM ; j++) {	
        if(this.hypothesis[i].word==this.reference[j].word){
          cost=0;
          ope='none';
        }
        else{
          cost=1;
          ope='subst'
        }
        origins[0]=new PointDtwTranscription(this,this.matrix[i-1][j].cost+1,'suppr',i,j);
        origins[1]=new PointDtwTranscription(this,this.matrix[i-1][j-1].cost+cost,ope,i,j);
		origins[2]=new PointDtwTranscription(this,this.matrix[i][j-1].cost+1,'inser',i,j);
        origins.sort(function (a, b) {
              					return a.cost-b.cost;
            		});
        this.matrix[i][j]=origins[0];
      }
    }
  }
  //Return the shorter path           
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

//This class represent all that concern the transcription. transcriptionTable is an array which contains the json data of the different transcriptions
function TranscriptionInfo(transcriptionTable,BinarySearch,Indexes){

  //This sub-class regroups the information which concern the displayed part of a transcription
  function DisplayedTranscription(step) {
	this.nextWordToDisplay=0;
	this.currentHighlightedIndex=0;
	this.currentWordStart=0;
	this.currentWordEnd=this.currentWordEnd+step;
	this.step=step;
	this.nextTimeToDisplay=0;
	this.transcription=[];
  }
  //This sub-class represents a word object that will have to be inserted in a transcription
  function WordToAdd(wordStructure,position){
	this.wordStructure=wordStructure;
	this.position=position;
  }
  
  //VI:
  this.fullTranscription = transcriptionTable; //We admit that the first transcription(index 0) is the reference. The other (if there is) are hypothesis
  this.globalStep=50;
  this.displayedTranscriptionS =new Array(this.fullTranscription.length);
  for(var i=0;i<this.displayedTranscriptionS.length;i++){
    this.displayedTranscriptionS[i]=new DisplayedTranscription(this.globalStep);
  }
  this.message="";
  this.clickableMessage="";
  
  //Methods:
  //Update the content of the complete transcription n°transcriptionNum that will be displayed
  this.updateTranscription = function(transcriptionNum) {
    var nextWords = Indexes.getNextWords(this.fullTranscription[transcriptionNum], this.displayedTranscriptionS[transcriptionNum].nextWordToDisplay, this.displayedTranscriptionS[transcriptionNum].step);
    this.displayedTranscriptionS[transcriptionNum].transcription = nextWords.words;
    this.displayedTranscriptionS[transcriptionNum].currentWordEnd = nextWords.currentWordEnd;
    this.displayedTranscriptionS[transcriptionNum].currentWordStart = nextWords.currentWordStart;
    this.displayedTranscriptionS[transcriptionNum].nextWordToDisplay = nextWords.nextWordToDisplay;
    this.displayedTranscriptionS[transcriptionNum].nextTimeToDisplay = nextWords.nextTimeToDisplay;
  }
  //Update the display of the transcription at a specific time (currentTime)
  this.timeUpdateDisplay = function(currentTime) {
    for(var i=0;i<this.displayedTranscriptionS.length;i++){ 
	  //Search the word through the words that are displayed
      var currentDisplayedWordIndex = BinarySearch.search(this.displayedTranscriptionS[i].transcription, currentTime, function(item) { return item.start; });
      if(currentDisplayedWordIndex== -3){
        currentDisplayedWordIndex=this.displayedTranscriptionS[i].transcription.length - 1;
      }
      //Check boundaries
      if(currentDisplayedWordIndex >= 0 && currentDisplayedWordIndex < this.displayedTranscriptionS[i].transcription.length) {
        if (currentDisplayedWordIndex == this.displayedTranscriptionS[i].transcription.length - 1) {
          $('#content'+i+' span').addClass('current');
        } else {
          var currentWord = this.displayedTranscriptionS[i].transcription[currentDisplayedWordIndex + 1];
          $('#content'+i+' span').removeClass('current');
          $('#content'+i+' span[data-start="' + currentWord.start + '"]').prevAll().addClass('current');
        }
      }
      //Next page
      if(this.displayedTranscriptionS[i].nextTimeToDisplay != 0 && currentTime > this.displayedTranscriptionS[i].nextTimeToDisplay && this.displayedTranscriptionS[i].nextTimeToDisplay!=-1) {
        this.updateTranscription(i);
      }
      // We add the arbitrary 0.5 sec value that we chose in the Indexe service.
      if(currentTime>this.fullTranscription[0].content[this.fullTranscription[0].content.length-1].start+0.5){
        this.message="ASH transcription is finished. It start at ";
  		this.clickableMessage=this.fullTranscription[0].content[0].start+" sec.";
      }
      else if(currentTime<this.fullTranscription[0].content[0].start){
        this.message="ASH transcription has not started yet. It start at ";
  		this.clickableMessage=this.fullTranscription[0].content[0].start+" sec.";
      }
      else{
        this.message="";
  		this.clickableMessage="";
      }    
    } 
  }
  //Update the display when seeking in the media
  this.seekingUpdateDisplay = function(seekingTime){
    for(var i=0;i<this.displayedTranscriptionS.length;i++){ 
      if(typeof this.fullTranscription[i] !== 'undefined') {
        var nextWordPosition = BinarySearch.search(this.fullTranscription[i].content, seekingTime, function(item) { return item.start; });
        //Change page only if the next word is not currently displayed
        if(nextWordPosition < this.displayedTranscriptionS[i].currentWordStart || nextWordPosition >= this.displayedTranscriptionS[i].currentWordStart + this.displayedTranscriptionS[i].step) {
          this.displayedTranscriptionS[i].nextWordToDisplay = nextWordPosition;
          this.updateTranscription(i);
        }
      }
    }
  }
  //Init the displayed transcription
  this.initDisplay = function(timeStart){
    for(var i=0;i<this.displayedTranscriptionS.length;i++){
      this.displayedTranscriptionS[i].nextWordToDisplay = BinarySearch.search(this.fullTranscription[i].content, timeStart, function(item) { return item.start; });
      this.updateTranscription(i);
    }
  }
  //Add all the word in the complete transcription with the index transcriptionNum
  this.addWords=function(wordsToAddInTranscription){
    for(var i=1;i<this.fullTranscription.length;i++){
  		var wordsToAdd=wordsToAddInTranscription[i];
  		var shift=0;
  		for(var a=0;a<wordsToAdd.length;a++){
  	  	  this.fullTranscription[i].content.splice(wordsToAdd[a].position+shift, 0, wordsToAdd[a].wordStructure);
  	  	  shift++;
  	    }
  	}
  }
  //Calculates the DTW between the references and the hypothesis and insert the resulting information in the transcriptions.The segments delimit the sentences used in the DTWs
  this.updateTranscriptionsWithDtw=function(segments){
    var formerIndexEnd=new Array(this.fullTranscription.length);
    for(var i=0;i<formerIndexEnd.length;i++){
      formerIndexEnd[i]=-1;
    }
    var wordsToAddInTranscription=new Array(this.fullTranscription.length);
    for(var i=1;i<wordsToAddInTranscription.length;i++){
      wordsToAddInTranscription[i]=new Array();
    }
    for(var j=0;j<segments.length;j++){
  	  var indexStartRef = BinarySearch.search(this.fullTranscription[0].content, segments[j].start, function(item) { return item.start; });
  	  var indexEndRef   = BinarySearch.search(this.fullTranscription[0].content, segments[j].end  , function(item) { return item.start; });
      if(indexStartRef==-3 || indexStartRef==-1 || indexEndRef==-2 || indexEndRef==-1){
    	var refSlice=[];
      }
      else{
    	if(indexStartRef==-2){
    	  indexStartRef=0;
    	}
    	if(indexEndRef==-3){
    	  indexEndRef=this.fullTranscription[0].content.length-1;
    	}	
    	//We avoid index overlap
    	if(indexStartRef==formerIndexEnd[0]){
    	  indexStartRef++;
    	}
    	formerIndexEnd[0]=indexEndRef;
    	var refSlice = this.fullTranscription[0].content.slice(indexStartRef,indexEndRef+1);
      }
      for(var i=1;i<this.fullTranscription.length;i++){
    	var indexStartHyp = BinarySearch.search(this.fullTranscription[i].content, segments[j].start, function(item) { return item.start; });
    	var indexEndHyp   = BinarySearch.search(this.fullTranscription[i].content, segments[j].end  , function(item) { return item.start; });
    	if(indexStartHyp==-3 || indexStartHyp==-1 || indexEndHyp==-2 || indexEndHyp==-1){
    	  var hypSlice=[];
    	}
    	else{
    	  if(indexStartHyp==-2){
    	    indexStartHyp=0;
    	  }
    	  if(indexEndHyp==-3){
    		indexEndHyp=this.fullTranscription[i].content.length-1;
    	  }	
    	  //We avoid index overlap
    	  if(indexStartHyp==formerIndexEnd[i]){
    		indexStartHyp++;
    	  }
    	  formerIndexEnd[i]=indexEndHyp;
    	  var hypSlice= this.fullTranscription[i].content.slice(indexStartHyp,indexEndHyp+1);
    	}
    	var dtw=new DtwTranscription(hypSlice,indexStartHyp,refSlice,indexStartRef);
	  	dtw.calculate();
	  	var path=dtw.path();
	    for(var k=0;k<path.length;k++){
	      if(path[k].operation=='inser'){
	    	var word =this.fullTranscription[0].content[path[k].indexFullRef].word;
	      	var spk  =this.fullTranscription[0].content[path[k].indexFullRef].spk;
	      	var insertionIndex=path[k].indexFullHyp+1;
	      	if(insertionIndex>0){
	      	  var start=(this.fullTranscription[i].content[insertionIndex-1].start+this.fullTranscription[i].content[insertionIndex].start)/2;
	      	}
	      	else{
	      	  var start=this.fullTranscription[i].content[insertionIndex].start/2;
	      	}
	      	var wordStructure={"start":start,"word":"+"+word+"+","spk":spk,"wordClass":"inser", "corespondingWordIndex":path[k].indexFullRef};
	      	wordsToAddInTranscription[i].push(new WordToAdd(wordStructure,insertionIndex));
	      	this.fullTranscription[0].content[path[k].indexFullRef].wordClass="none";
	      }
	      else if(path[k].operation=='suppr'){
	    	var word=this.fullTranscription[i].content[path[k].indexFullHyp].word;
	    	this.fullTranscription[i].content[path[k].indexFullHyp].word="-"+word+"-";
	      	this.fullTranscription[i].content[path[k].indexFullHyp].wordClass="suppr";
	      	this.fullTranscription[0].content[path[k].indexFullRef].wordClass="none";
	      }
	      else if(path[k].operation=='subst'){
	        var current=this.fullTranscription[i].content[path[k].indexFullHyp].word;
	    	var replacement=this.fullTranscription[0].content[path[k].indexFullRef].word;
	      	this.fullTranscription[i].content[path[k].indexFullHyp].wordClass="subst";
	      	this.fullTranscription[i].content[path[k].indexFullHyp].word=current+"(->"+replacement+")";
	      	this.fullTranscription[i].content[path[k].indexFullHyp].corespondingWordIndex=path[k].indexFullRef;
	      	this.fullTranscription[0].content[path[k].indexFullRef].wordClass="none";
	      }
	      else if(path[k].operation=='none'){
	    	this.fullTranscription[i].content[path[k].indexFullHyp].wordClass="none";
	        this.fullTranscription[0].content[path[k].indexFullRef].wordClass="none";
	      }
	  	}
      }	
  	}
  	//We add all the insertion at once because of the shift it causes
  	this.addWords(wordsToAddInTranscription);
  }
  this.showCorespondingWordInReferenceWord=function(word){
    if(word.wordClass=="subst"){
      $('#content0 span[data-start="' + this.fullTranscription[0].content[word.corespondingWordIndex].start + '"]').addClass('showSubst');
    }
    else if(word.wordClass=="inser"){
      $('#content0 span[data-start="' + this.fullTranscription[0].content[word.corespondingWordIndex].start + '"]').addClass('showInser');
    }
  }
  this.hideCorespondingWordInReferenceWord=function(word){
    if(word.wordClass=="subst"){
      $('#content0 span[data-start="' + this.fullTranscription[0].content[word.corespondingWordIndex].start + '"]').removeClass('showSubst');
    }
    else if(word.wordClass=="inser"){
      $('#content0 span[data-start="' + this.fullTranscription[0].content[word.corespondingWordIndex].start + '"]').removeClass('showInser');
    }
  }
  
  // - - - - - - - - -
  
  //We add/modify information to the transcriptions
  for(var i=0;i<this.fullTranscription.length;i++){
    for(var j=0;j<this.fullTranscription[i].content.length;j++){
      this.fullTranscription[i].content[j].wordClass="untreatedDtw";
      this.fullTranscription[i].content[j].start=parseFloat(this.fullTranscription[i].content[j].start);
    }
  }
  
  //We adjust the hypothesis transcriptions to the reference
  var referenceFirstTime=this.fullTranscription[0].content[0].start;
  var referenceLastTime=this.fullTranscription[0].content[this.fullTranscription[0].content.length-1].start;
  for(var i=1;i<this.fullTranscription.length;i++){
    var hypothesisFirstIndex=BinarySearch.search(this.fullTranscription[i].content, referenceFirstTime, function(item) { return item.start; });
	var hypothesisLastIndex =BinarySearch.search(this.fullTranscription[i].content, referenceLastTime,  function(item) { return item.start; });
    // When the transcriptions doesn't overlap
    if(hypothesisFirstIndex==-3 || hypothesisFirstIndex==-1 || hypothesisLastIndex==-2 || hypothesisLastIndex==-1){
      this.fullTranscription[i].content=[];
    }
    else{
      if(hypothesisFirstIndex==-2){
	    hypothesisFirstIndex=0;
      }
      if(hypothesisLastIndex==-3){
    	hypothesisLastIndex=this.fullTranscription[i].content.length-1;
      }
      if(hypothesisLastIndex<this.fullTranscription[i].content.length-1){
    	// Generally, the BinarySearch function take the hypothesis index whose start is slightly under the start we searched
    	hypothesisLastIndex++;
      }
      //We want the transcriptions to be included in the reference plus a certain margin
      var margin=1;
      if(this.fullTranscription[i].content[hypothesisFirstIndex].start<(referenceFirstTime-margin)){
		hypothesisFirstIndex++;
      }
      if(this.fullTranscription[i].content[hypothesisLastIndex].start>(referenceLastTime+margin)){
    	hypothesisLastIndex--;
      }
      //if the indexes become incorrect because of the (++) and (--), slice will return []
      this.fullTranscription[i].content=this.fullTranscription[i].content.slice(hypothesisFirstIndex,hypothesisLastIndex+1);
    }
  }
}

function SpeakerBar(transcriptionData,transcriptionNum){
  function SpeakerData(spk,color) {
    this.spk=spk;
    this.color=color;
    this.speakingPeriods=new Array();
	
    this.totalTime=function(){
      var total=0;
	  for(var i=0;i<this.speakingPeriods.length;i++){
	    total=total+(this.speakingPeriods[i][1]-this.speakingPeriods[i][0]);
	  }
	  return total;
    }
    this.addSpeakingPeriod=function(start,end){
      var spkPeriod=new Array(2);
	  spkPeriod[0]=start;
	  spkPeriod[1]=end;
	  this.speakingPeriods.push(spkPeriod);
    }
  }

  this.transcriptionData=transcriptionData;
  this.timeStart=this.transcriptionData.content[0].start;
  this.timeEnd=this.transcriptionData.content[this.transcriptionData.content.length-1].start;
  this.canva = $('#canva'+transcriptionNum)["0"].getContext('2d');
  this.timer  = $('#progressTime'+transcriptionNum)["0"];
  this.canva.lineWidth  = "5";
  this.canvaWidth=$('#canva'+transcriptionNum)["0"].width;
  this.canvaHeight=$('#canva'+transcriptionNum)["0"].height;
  this.duration=this.timeEnd-this.timeStart;
  this.colors=new Array();
  this.colors.push('red','blue','yellow','green','orange','cyan','pink','GreenYellow');
  this.speakers = new Array();
     
  this.updateSpeakers=function(){
    var hashSpeakers=new Object();
  	var defaultColor=this.colors[this.colors.length-1];
    var wordStructures=this.transcriptionData.content;
    //NOTE: Comme on ne dispose pas de l'information de durée du dernier mot, on décide de ne pas le traiter
    for(var i=0;i<wordStructures.length-1;i++){
      if(typeof hashSpeakers[wordStructures[i].spk.id]=='undefined'){
        hashSpeakers[wordStructures[i].spk.id]=new SpeakerData(wordStructures[i].spk.id,defaultColor);
        hashSpeakers[wordStructures[i].spk.id].addSpeakingPeriod(wordStructures[i].start,wordStructures[i+1].start);
      }
      else{
        if(hashSpeakers[wordStructures[i].spk.id].speakingPeriods[hashSpeakers[wordStructures[i].spk.id].speakingPeriods.length-1][1]==wordStructures[i].start){
          hashSpeakers[wordStructures[i].spk.id].speakingPeriods[hashSpeakers[wordStructures[i].spk.id].speakingPeriods.length-1][1]=wordStructures[i+1].start;
        }
        else{
          hashSpeakers[wordStructures[i].spk.id].addSpeakingPeriod(wordStructures[i].start,wordStructures[i+1].start);
        }
      }
    }
    for(s in hashSpeakers){
      this.speakers.push(hashSpeakers[s]);
    }
    this.speakers.sort(function (a, b) {
              		  return b.totalTime()-a.totalTime();
            		});
    for(var i=0;i<this.speakers.length;i++){
      if(i<this.colors.length-1){
        this.speakers[i].color=this.colors[i];
      }
    }
  }
  this.setColor=function(color){
    this.canva.fillStyle = color;
  }
  this.drawSegment=function(start,width){
    var fractionStart=(start-this.timeStart)/this.duration;
    var fractionWidth=width/this.duration;
    this.canva.fillRect(this.canvaWidth*fractionStart, 0, this.canvaWidth*fractionWidth, this.canvaHeight);
  }
  this.drawSpeakers=function() {
    console.log(this.speakers);
    for(var i=0;i<this.speakers.length;i++){
      this.setColor(this.speakers[i].color);
      for(var j=0;j<this.speakers[i].speakingPeriods.length;j++){
        var start=this.speakers[i].speakingPeriods[j][0];
        var width=this.speakers[i].speakingPeriods[j][1]-this.speakers[i].speakingPeriods[j][0];
        this.drawSegment(start,width);
      }
    }
  }
  this.update=function(currentTime){
    var time=currentTime-this.timeStart;
    if(time<0 || time>this.duration){
      this.timer.textContent = "hors transcripiton";
    }
    else{
      this.timer.textContent = formatTime(time)+'/'+formatTime(this.duration);
	}
  }
}

/*** FUNCTIONS ***/

function startVideo(timeStart,transcriptionInfo){
  $('#mediafile')["0"].player.setCurrentTime(timeStart);
  transcriptionInfo.initDisplay(timeStart);
}

function moveVideo(eventObject) {
  var time = eventObject.currentTarget.attributes["data-start"].value;
  $('#mediafile')["0"].player.setCurrentTime(time);
}

function formatTime(time) {
  var hours = Math.floor(time / 3600);
  var mins  = Math.floor((time % 3600) / 60);
  var secs  = Math.floor(time % 60);
	
  if (secs < 10) {
    secs = "0" + secs;
  } 
  if (hours) {
    if (mins < 10) {
      mins = "0" + mins;
    }
    return hours + ":" + mins + ":" + secs; // hh:mm:ss
  } 
  else {
    return mins + ":" + secs; // mm:ss
  }
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

function TranscriptionCtrl($scope, $log, $http, Restangular, BinarySearch, Indexes, GetFile, GetSentenceBoundaries) {

  $scope.startVideo=function(timeStart){
  	startVideo(timeStart,$scope.transcriptionInfo);
  }
  
  $scope.moveVideo=function(eventObject){
  	moveVideo(eventObject);
  }
  
  //Get the transcription from the server
  Restangular.one('audiofiles.json', 2).getList('transcriptions').then(function(transcriptions) {
  	$scope.transcriptionInfo=new TranscriptionInfo(transcriptions,BinarySearch,Indexes);
    GetFile.get({fileId: 'etape.dev.g.seg'}, function(data) {
    	//We get the bounds of the sentences we will use for the DTWs
    	$scope.sentenceBounds=GetSentenceBoundaries.getSentenceBoundaries(data);	
    	$scope.transcriptionInfo.updateTranscriptionsWithDtw($scope.sentenceBounds);
    	//We make sure that the nextWordToDisplay value is correct
    	$scope.startVideo(146.39,$scope.transcriptionInfo);
    });
  });

  //Non angular events
  $("#mediafile").on("timeupdate", function (e) {
    $scope.$apply( function() {
      $scope.transcriptionInfo.timeUpdateDisplay(e.target.currentTime);
    });
  });

  $("#mediafile").on("seeking", function (e) {
    $scope.$apply( function() {
      $scope.transcriptionInfo.seekingUpdateDisplay(e.target.currentTime);
    });
  });

}

function SpeakerCtrl($scope, $log, $http, Restangular, BinarySearch, Indexes) {
  
  $scope.startVideo=function(timeStart){
  	startVideo(timeStart,$scope.transcriptionInfo);
  }
  
  $scope.moveVideo=function(eventObject){
  	moveVideo(eventObject);
  }
  
  //Get the transcription from the server
  Restangular.one('audiofiles.json', 1).getList('transcriptions').then(function(transcriptions) {
  	$scope.transcriptionInfo=new TranscriptionInfo(transcriptions,BinarySearch,Indexes);
  	$scope.speakerBar=new SpeakerBar($scope.transcriptionInfo.fullTranscription[0],0);
  	$scope.speakerBar.updateSpeakers();
  	$scope.speakerBar.drawSpeakers();
    $scope.startVideo(2406.40);
  });

  //Non angular events
  $("#mediafile").on("timeupdate", function (e) {
    $scope.$apply( function() {
      $scope.transcriptionInfo.timeUpdateDisplay(e.target.currentTime);
      $scope.speakerBar.update(e.target.currentTime);
    });
  });

  $("#mediafile").on("seeking", function (e) {
    $scope.$apply( function() {
      $scope.transcriptionInfo.seekingUpdateDisplay(e.target.currentTime);
    });
  });
  
  $("#canva0").on("seeking", function (e) {
    $scope.$apply( function() {
    	console.log("seek");
    });

  });

}





