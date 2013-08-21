/*** CLASSES ***/
//This class contains information concerning a DTW between two transcriptions. hypothesis and reference are parts of a complete transcription. The indexes are the places where those parts start in the complete transcriptions.
function DtwTranscription(hypothesis,indexStartHyp,reference,indexStartRef) {

  //This sub-class regroups the information of a point in the DTW matrix
  function PointDtwTranscription(dtw,cost,operation,matrixLine,matrixCol){
    this.cost = cost;
    this.operation = operation;
    //We substract 1 because the hypothesis and the reference begin at line and column 1 in the DTW matrix (not 0)
    this.indexFullHyp = dtw.indexStartHyp+matrixLine-1;
    this.indexFullRef = dtw.indexStartRef+matrixCol -1;
  }

  //Instance Variables:
  this.indexStartHyp=indexStartHyp;
  this.indexStartRef=indexStartRef;
  //We use slice(0) to copy those value and not modified them
  this.hypothesis = hypothesis.slice(0);
  this.reference = reference.slice(0);
  //The hypothesis and the reference begin at line and column 1 in the DTW matrix so we use unshift to add an empty object at the reference start and the hypothesis start (to be aligned with the [0,0] point). unshift returns the resulting size of the new table.
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
    for (var i = 1 ; i < this.iM ; i++) {
      this.matrix[i][0]=new PointDtwTranscription(this,i,'suppr',i,0);
    }
    for (var j = 1 ; j < this.jM ; j++) {
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
		//We keep the cheapest origin
        origins.sort(function (a, b) {
              		  return a.cost-b.cost;
            		});
        this.matrix[i][j]=origins[0];
      }
    }
  }
  //Return the shortest path           
  this.givePath=function(){
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

//This class contains information concerning the transcriptions. transcriptionTable is an array which contains the words json data of the different transcriptions.
function TranscriptionsData(transcriptionTable,BinarySearch,Indexes){

  //This sub-class regroups the information of a displayed part of a transcription. The step is the number of words currently displayed.
  function DisplayedTranscription(step) {
	this.nextWordToDisplay=0; 						//in the complete transcription
	this.currentHighlightedIndex=0;					//in the displayed part
	this.currentWordStart=0;						//in the complete transcription
	this.currentWordEnd=this.currentWordEnd+step;	//in the complete transcription
	this.step=step;
	this.nextTimeToDisplay=0;
	this.transcription=[];							//the words to display
  }
  //This sub-class represents a word object that will have to be inserted in a transcription (they are inserted at the end because of the shift).
  function WordToAdd(wordObject,position){
	this.wordObject=wordObject;
	this.position=position;
  }
  
  //Instance Variables:
  this.fullTranscription = transcriptionTable; //We admit that the first transcription(index 0) is the reference. The other (if there is) are hypothesis
  this.globalStep=50;
  this.displayedTranscriptions =new Array(this.fullTranscription.length);
  for(var i=0;i<this.displayedTranscriptions.length;i++){
    this.displayedTranscriptions[i]=new DisplayedTranscription(this.globalStep);
  }
  this.calculationMessage="-> Still calculating...";
  this.message="";
  this.clickableMessage="";
  
  //Methods:
  //Update the content of the displayed transcription n°transcriptionNum.
  this.updateDisplayedTranscription = function(transcriptionNum) {
    var nextWords = Indexes.getNextWords(this.fullTranscription[transcriptionNum], this.displayedTranscriptions[transcriptionNum].nextWordToDisplay, this.displayedTranscriptions[transcriptionNum].step);
    this.displayedTranscriptions[transcriptionNum].transcription = nextWords.words;
    this.displayedTranscriptions[transcriptionNum].currentWordEnd = nextWords.currentWordEnd;
    this.displayedTranscriptions[transcriptionNum].currentWordStart = nextWords.currentWordStart;
    this.displayedTranscriptions[transcriptionNum].nextWordToDisplay = nextWords.nextWordToDisplay;
    this.displayedTranscriptions[transcriptionNum].nextTimeToDisplay = nextWords.nextTimeToDisplay;
  }
  //Update the display of the transcriptions at a specific time (currentTime)
  this.timeUpdateDisplay = function(currentTime) {
    for(var i=0;i<this.displayedTranscriptions.length;i++){ 
	  //Search the word through the words that are displayed
      var currentDisplayedWordIndex = BinarySearch.search(this.displayedTranscriptions[i].transcription, currentTime, function(item) { return item.start; });
      //This check makes currentDisplayedWordIndex reach the last word because the binary search don't find the last index.
      if(currentDisplayedWordIndex== -3){
        currentDisplayedWordIndex=this.displayedTranscriptions[i].transcription.length - 1;
      }
      //Check boundaries
      if(currentDisplayedWordIndex >= 0 && currentDisplayedWordIndex < this.displayedTranscriptions[i].transcription.length) {
        if (currentDisplayedWordIndex == this.displayedTranscriptions[i].transcription.length - 1) {
          $('#content'+i+' span').addClass('current');
        } else {
          var currentWord = this.displayedTranscriptions[i].transcription[currentDisplayedWordIndex + 1];
          $('#content'+i+' span').removeClass('current');
          $('#content'+i+' span[data-start="' + currentWord.start + '"]').prevAll().addClass('current');
        }
      }
      //Next page
      if(this.displayedTranscriptions[i].nextTimeToDisplay != 0 && currentTime > this.displayedTranscriptions[i].nextTimeToDisplay && this.displayedTranscriptions[i].nextTimeToDisplay!=-1) {
        this.updateDisplayedTranscription(i);
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
    for(var i=0;i<this.displayedTranscriptions.length;i++){ 
      if(typeof this.fullTranscription[i] !== 'undefined') {
        var nextWordPosition = BinarySearch.search(this.fullTranscription[i].content, seekingTime, function(item) { return item.start; });
        //Change page only if the next word is not currently displayed
        if(nextWordPosition < this.displayedTranscriptions[i].currentWordStart || nextWordPosition >= this.displayedTranscriptions[i].currentWordStart + this.displayedTranscriptions[i].step) {
          this.displayedTranscriptions[i].nextWordToDisplay = nextWordPosition;
          this.updateDisplayedTranscription(i);
        }
      }
    }
  }
  //Init the displayed transcription
  this.initDisplay = function(timeStart){
    for(var i=0;i<this.displayedTranscriptions.length;i++){
      this.displayedTranscriptions[i].nextWordToDisplay = BinarySearch.search(this.fullTranscription[i].content, timeStart, function(item) { return item.start; });
      this.updateDisplayedTranscription(i);
    }
  }
  //Add all the word in the complete transcriptions with the index transcriptionNum
  this.addWords=function(wordsToAddInTranscriptions){
    for(var i=1;i<this.fullTranscription.length;i++){
  		var wordsToAdd=wordsToAddInTranscriptions[i];
  		var shift=0;
  		for(var a=0;a<wordsToAdd.length;a++){
  	  	  this.fullTranscription[i].content.splice(wordsToAdd[a].position+shift, 0, wordsToAdd[a].wordObject);
  	  	  shift++;
  	    }
  	}
  }
  //Calculates the DTW between the references and the hypothesis and insert the resulting information in the transcriptions.The segments delimit the sentences used in the DTWs
  this.updateTranscriptionsWithDtw=function(segments){
    //This array will be used for further checks.
    var formerIndexEnd=new Array(this.fullTranscription.length);
    for(var i=0;i<formerIndexEnd.length;i++){
      formerIndexEnd[i]=-1;
    }
    //The insertions will all be done at the end because of the shift produced.
    var wordsToAddInTranscriptions=new Array(this.fullTranscription.length);
    for(var i=1;i<wordsToAddInTranscriptions.length;i++){
      wordsToAddInTranscriptions[i]=new Array();
    }
    
    var j=0;
    var limit=segments.length-1;
    var busy=false;
    
    
    
    var self = this;
    //We use this methods to avoid the script to freeze the browser.
    var processor = setInterval(function(){
      if(!busy){
        var indexStartRef = BinarySearch.search(self.fullTranscription[0].content, segments[j].start, function(item) { return item.start; });
  	    var indexEndRef   = BinarySearch.search(self.fullTranscription[0].content, segments[j].end  , function(item) { return item.start; });
  	    //Check if the sentence is outside the reference.
        if(indexStartRef==-3 || indexStartRef==-1 || indexEndRef==-2 || indexEndRef==-1){
    	  var refSlice=[];
        }
        else{
          //Check if a part of the sentence is before the reference.
    	  if(indexStartRef==-2){
    	    indexStartRef=0;
    	  }
    	  //Check if a part of the sentence is after the reference.
    	  if(indexEndRef==-3){
    	    indexEndRef=self.fullTranscription[0].content.length-1;
    	  }	
    	  //We avoid index overlap
    	  if(indexStartRef==formerIndexEnd[0]){
    	    indexStartRef++;
    	  }
    	  formerIndexEnd[0]=indexEndRef;
    	  var refSlice = self.fullTranscription[0].content.slice(indexStartRef,indexEndRef+1);
        }
        //We repeat the previous operations for the sentence cutting for each hypothesis 
        for(var i=1;i<self.fullTranscription.length;i++){
    	  var indexStartHyp = BinarySearch.search(self.fullTranscription[i].content, segments[j].start, function(item) { return item.start; });
    	  var indexEndHyp   = BinarySearch.search(self.fullTranscription[i].content, segments[j].end  , function(item) { return item.start; });
    	  if(indexStartHyp==-3 || indexStartHyp==-1 || indexEndHyp==-2 || indexEndHyp==-1){
    	    var hypSlice=[];
    	  }
    	  else{
    	    if(indexStartHyp==-2){
    	      indexStartHyp=0;
    	    }
    	    if(indexEndHyp==-3){
     	      indexEndHyp=self.fullTranscription[i].content.length-1;
    	    }	
    	    if(indexStartHyp==formerIndexEnd[i]){
    		  indexStartHyp++;
    	    }
    	    formerIndexEnd[i]=indexEndHyp;
    	    var hypSlice= self.fullTranscription[i].content.slice(indexStartHyp,indexEndHyp+1);
    	  }
    	  //We make a dtw for each sentence in each hypothesis
    	  var dtw=new DtwTranscription(hypSlice,indexStartHyp,refSlice,indexStartRef);
	  	  dtw.calculate();
	  	  var path=dtw.givePath();
	  	  //We add the resulting information to our json data making the correspondence betwin hypothesis and reference.
	      for(var k=0;k<path.length;k++){
	        if(path[k].operation=='inser'){
	    	  var word =self.fullTranscription[0].content[path[k].indexFullRef].word;
	      	  var spk  =self.fullTranscription[0].content[path[k].indexFullRef].spk;
	      	  var insertionIndex=path[k].indexFullHyp+1;
	      	  if(insertionIndex>0){
	      	    var start=(self.fullTranscription[i].content[insertionIndex-1].start+self.fullTranscription[i].content[insertionIndex].start)/2;
	      	  }
	      	  else{
	      	    var start=self.fullTranscription[i].content[insertionIndex].start/2;
	      	  }
	      	  var wordObject={"start":start,"word":"+"+word+"+","spk":spk,"wordClass":"inser", "corespondingWordIndex":path[k].indexFullRef};
	      	  //We store the words to add in the end.
	      	  wordsToAddInTranscriptions[i].push(new WordToAdd(wordObject,insertionIndex));
	      	  self.fullTranscription[0].content[path[k].indexFullRef].wordClass="none";
	        }
	        else if(path[k].operation=='suppr'){
	    	  var word=self.fullTranscription[i].content[path[k].indexFullHyp].word;
	    	  self.fullTranscription[i].content[path[k].indexFullHyp].word="-"+word+"-";
	      	  self.fullTranscription[i].content[path[k].indexFullHyp].wordClass="suppr";
	      	  self.fullTranscription[0].content[path[k].indexFullRef].wordClass="none";
	        }
	        else if(path[k].operation=='subst'){
	          var current=self.fullTranscription[i].content[path[k].indexFullHyp].word;
	    	  var replacement=self.fullTranscription[0].content[path[k].indexFullRef].word;
	      	  self.fullTranscription[i].content[path[k].indexFullHyp].wordClass="subst";
	      	  self.fullTranscription[i].content[path[k].indexFullHyp].word=current+"(->"+replacement+")";
	      	  self.fullTranscription[i].content[path[k].indexFullHyp].corespondingWordIndex=path[k].indexFullRef;
	      	  self.fullTranscription[0].content[path[k].indexFullRef].wordClass="none";
	        }
	        else if(path[k].operation=='none'){
	    	  self.fullTranscription[i].content[path[k].indexFullHyp].wordClass="none";
	          self.fullTranscription[0].content[path[k].indexFullRef].wordClass="none";
	        }
	  	  }
        }
        
        if(++j==limit){ 
      	  clearInterval(processor);  	
      	  //We add all the insertion at once because of the shift it causes
          self.addWords(wordsToAddInTranscriptions);
          self.calculationMessage="";
        }
        busy=false;	
      }
  	}, 100);
  	
  }
  //Change the style of a word when the user point his mouse on it(if it's a case of substitution or insertion).
  this.showCorespondingWordInReferenceWord=function(word){
    if(word.wordClass=="subst"){
      $('#content0 span[data-start="' + this.fullTranscription[0].content[word.corespondingWordIndex].start + '"]').addClass('showSubst');
    }
    else if(word.wordClass=="inser"){
      $('#content0 span[data-start="' + this.fullTranscription[0].content[word.corespondingWordIndex].start + '"]').addClass('showInser');
    }
  }
  //Restore the style of a word when the user point his mouse on it(if it's a case of substitution or insertion).
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
      //The untreatedDtw style show the text but indicate the user that it could not have been treated and compared whith the other transcriptions.
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
    var wordObjects=this.transcriptionData.content;
    //NOTE: Comme on ne dispose pas de l'information de durée du dernier mot, on décide de ne pas le traiter
    for(var i=0;i<wordObjects.length-1;i++){
      if(typeof hashSpeakers[wordObjects[i].spk.id]=='undefined'){
        hashSpeakers[wordObjects[i].spk.id]=new SpeakerData(wordObjects[i].spk.id,defaultColor);
        hashSpeakers[wordObjects[i].spk.id].addSpeakingPeriod(wordObjects[i].start,wordObjects[i+1].start);
      }
      else{
        if(hashSpeakers[wordObjects[i].spk.id].speakingPeriods[hashSpeakers[wordObjects[i].spk.id].speakingPeriods.length-1][1]==wordObjects[i].start){
          hashSpeakers[wordObjects[i].spk.id].speakingPeriods[hashSpeakers[wordObjects[i].spk.id].speakingPeriods.length-1][1]=wordObjects[i+1].start;
        }
        else{
          hashSpeakers[wordObjects[i].spk.id].addSpeakingPeriod(wordObjects[i].start,wordObjects[i+1].start);
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
function startVideo(timeStart,transcriptionsData){
  $('#mediafile')["0"].player.setCurrentTime(timeStart);
  transcriptionsData.initDisplay(timeStart);
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
  	startVideo(timeStart,$scope.transcriptionsData);
  }
  
  $scope.moveVideo=function(eventObject){
  	moveVideo(eventObject);
  }
  
  //Get the transcription from the server
  Restangular.one('audiofiles.json', 2).getList('transcriptions').then(function(transcriptions) {
  	$scope.transcriptionsData=new TranscriptionsData(transcriptions,BinarySearch,Indexes);
    GetFile.get({fileId: 'etape.dev.g.seg'}, function(data) {
    	//We get the bounds of the sentences we will use for the DTWs
    	$scope.sentenceBounds=GetSentenceBoundaries.getSentenceBoundaries(data);	
    	$scope.transcriptionsData.updateTranscriptionsWithDtw($scope.sentenceBounds);
    	//We make sure that the nextWordToDisplay value is correct
    	$scope.startVideo(146.39,$scope.transcriptionsData);
    });
  });

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

function SpeakerCtrl($scope, $log, $http, Restangular, BinarySearch, Indexes) {
  
  $scope.startVideo=function(timeStart){
  	startVideo(timeStart,$scope.transcriptionsData);
  }
  
  $scope.moveVideo=function(eventObject){
  	moveVideo(eventObject);
  }
  
  //Get the transcription from the server
  Restangular.one('audiofiles.json', 1).getList('transcriptions').then(function(transcriptions) {
  	$scope.transcriptionsData=new TranscriptionsData(transcriptions,BinarySearch,Indexes);
  	$scope.speakerBar=new SpeakerBar($scope.transcriptionsData.fullTranscription[0],0);
  	$scope.speakerBar.updateSpeakers();
  	$scope.speakerBar.drawSpeakers();
    $scope.startVideo(2406.40);
  });

  //Non angular events
  $("#mediafile").on("timeupdate", function (e) {
    $scope.$apply( function() {
      $scope.transcriptionsData.timeUpdateDisplay(e.target.currentTime);
      $scope.speakerBar.update(e.target.currentTime);
    });
  });

  $("#mediafile").on("seeking", function (e) {
    $scope.$apply( function() {
      $scope.transcriptionsData.seekingUpdateDisplay(e.target.currentTime);
    });
  });
  
  $("#canva0").on("seeking", function (e) {
    $scope.$apply( function() {
    	console.log("seek");
    });

  });

}
