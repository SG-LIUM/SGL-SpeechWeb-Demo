'use strict';

/* Services */

angular.module('transcriptionServices', [])
	.factory('Indexes', function(){
        return {
            //Get the next list of words to display on the screen
            getNextWords : function(transcription, nextWordToDisplay, step) {
                var newWords = {};
                newWords.currentWordEnd = nextWordToDisplay + step;
                newWords.currentWordStart = nextWordToDisplay;

                // Try to avoid out of bounds exception 
                //NOTE: La displayedTransciption contient plus d'info qu'un simple tableau vide -> fait planter si on passe dedans. En revanche si les paramètres sont invalides, le slice renvoi []
                //if (newWords.currentWordStart > transcription.content.length -1) {
                //  return [];
                //}

                // Same here
                if (newWords.currentWordEnd > transcription.content.length -1) {
                  newWords.currentWordEnd = transcription.content.length;
                }
				
                //Get the words
                //return [] if newWords.currentWordStart<0 (if nextWordToDisplay<0 ie if the BinarySearch failed) or the parameters are invalid
                newWords.words = transcription.content.slice(newWords.currentWordStart, newWords.currentWordEnd);
		
                //Reset the counters
                //NOTE: rajout d'une gestion différente quand on est en dehors de la vidéo.
                //There are different managements when we are outside of the video.
                //Before:
                if(nextWordToDisplay==-2){
                  newWords.nextWordToDisplay = 0;
                  newWords.nextTimeToDisplay = transcription.content[0].start;
                }
                //After:
            	else if(nextWordToDisplay==-3){
            	  newWords.nextWordToDisplay = transcription.length -1;
                  newWords.nextTimeToDisplay = -1;
                }
                //Else we are in the video.
                else{
                  newWords.nextWordToDisplay = newWords.currentWordEnd;
                  if(newWords.nextWordToDisplay < transcription.content.length) {
                    newWords.nextTimeToDisplay = transcription.content[newWords.nextWordToDisplay].start;
                  }
                  else {
                    //NOTE: valeur de 0.5 sec choisie arbitrairement car on ne dispose pas de la longueur de temps des mots (et on ne peut pas du coup déduire celle du dernier de la transcription)
                  	//We decide that the last word will be displayed for 0.5 seconds
                  	newWords.nextTimeToDisplay = transcription.content[transcription.content.length-1].start+0.5;
                  }
                }

                return newWords;
            }
        }
	})
	//This class contains information concerning a DTW between two transcriptions. hypothesis and reference are parts of a complete transcription. The indexes are the places where those parts start in the complete transcriptions.        
	.factory('DtwTranscription', function(){
      return {
          instance : function(hypothesis,indexStartHyp,reference,indexStartRef) {
          	
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
              
              
              //Fills the matrix with points 
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
                      //cost=this.giveDistance(this.hypothesis[i].word,this.reference[j].word);
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
              //Returns the shortest path           
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
      }
    })
    //This class contains information concerning the transcriptions. transcriptionTable is an array which contains the words json data of the different transcriptions.
    .factory('TranscriptionsData', function(BinarySearch,Indexes,DtwTranscription,Video,Time){
      return {
        instance : function(transcriptionTable,globalStep){
            //This sub-class regroups the information of a displayed part of a transcription. The step is the number of words currently displayed.
            function DisplayedTranscription(step,id) {
            	this.id=id;
            	this.nextWordToDisplay=0;             //in the complete transcription
            	this.currentHighlightedIndex=0;         //in the displayed part
            	this.currentWordStart=0;            //in the complete transcription
            	this.currentWordEnd=this.currentWordStart+step; //in the complete transcription
            	this.step=step;
            	this.nextTimeToDisplay=0;
            	this.transcription=[];              //the words to display
            }
            //This sub-class represents a word object that will have to be inserted in a transcription (they are inserted at the end because of the shift).
            function WordToAdd(wordObject,position){
            	this.wordObject=wordObject;
            	this.position=position;
            }
            
            //Instance Variables:
            this.fullTranscription = transcriptionTable; //We admit that the first transcription(index 0) is the reference. The other (if there is) are hypothesis
            this.globalStep=globalStep;
            this.displayedTranscriptions =new Array(this.fullTranscription.length);
            for(var i=0;i<this.displayedTranscriptions.length;i++){
              this.displayedTranscriptions[i]=new DisplayedTranscription(this.globalStep,this.fullTranscription[i].system);
            }
            
            this.message="";
            this.clickableMessage="";
            this.progressBarContent=$('#progressBarContent');
        	this.insertionStyle="label label-success";
            this.suppressionStyle="label label-important";
            this.substitutionStyle="label label-info";
            this.showStyle="label label-inverse";
            
            
            
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
                  this.clickableMessage=Time.format(this.fullTranscription[0].content[0].start)+".";
                  $('#outTranscriptionAlert').show();
                }
                else if(currentTime<this.fullTranscription[0].content[0].start){
                  this.message="ASH transcription has not started yet. It start at ";
                  this.clickableMessage=Time.format(this.fullTranscription[0].content[0].start)+".";
                  $('#outTranscriptionAlert').show();
                }
                else{
                  this.message="";
                  this.clickableMessage="";
                  $('#outTranscriptionAlert').hide();
                } 
              } 
            }
            //Update the display when seeking in the media
            this.seekingUpdateDisplay = function(seekingTime){
              for(var i=0;i<this.displayedTranscriptions.length;i++){ 
                if(typeof this.fullTranscription[i] !== 'undefined') {
                  var nextWordPosition = BinarySearch.search(this.fullTranscription[i].content, seekingTime, function(item) { return item.start; });
                  //Change page only if the next word is not currently displayed
    			  if(nextWordPosition < this.displayedTranscriptions[i].currentWordStart || nextWordPosition >= this.displayedTranscriptions[i].currentWordStart + this.displayedTranscriptions[i].step || nextWordPosition>this.displayedTranscriptions[i].nextWordToDisplay) {
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
            //Add all the word in the complete transcriptions 
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
            //Calculates the DTW between the references and the hypothesis and put the resulting information in the transcriptions.The segments delimit the sentences used in the DTWs
            this.updateTranscriptionsWithDtw=function(segments,refresh){
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
              
              $('#progressBar').show();
              var j=0;
              var limit=segments.length-1;
              var busy=false;
              var self = this;
              //We use this methods to avoid the script to freeze the browser.
              var processor = setInterval(function(){
                if(!busy){
                  var calculationPercent=(j/limit)*100;
                  calculationPercent=Math.round(calculationPercent*100)/100
                  self.progressBarContent.css("width", calculationPercent + "%");
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
                  var dtw=new DtwTranscription.instance(hypSlice,indexStartHyp,refSlice,indexStartRef,Indexes);
                  dtw.calculate();
                  var path=dtw.givePath();
                  //We add the resulting information to our json data making the correspondence betwin hypothesis and reference.
                  for(var k=0;k<path.length;k++){
                    if(path[k].operation=='inser'){
                      var word =self.fullTranscription[0].content[path[k].indexFullRef].word;
                      var spk  =self.fullTranscription[0].content[path[k].indexFullRef].spk;
                      var insertionIndex=path[k].indexFullHyp+1;
                      //We take the start of the inserted word in the reference
                      var start=self.fullTranscription[0].content[path[k].indexFullRef].start;
                      if(insertionIndex>0){
                        //If the resulted starts in the hypothesis are not ordered
                      	if(!(start>=self.fullTranscription[i].content[insertionIndex-1].start && start<=self.fullTranscription[i].content[insertionIndex].start)){
                      		start=self.fullTranscription[i].content[insertionIndex-1].start;
                      	}
                      }
                      else{
                      	//Same thing
                        if(!(start<=self.fullTranscription[i].content[insertionIndex].start)){
                      		start=self.fullTranscription[i].content[insertionIndex].start;
                      	}
                      }
                      var wordObject={"start":start,"word":word,"spk":spk,"wordClass":self.insertionStyle, "corespondingWordIndex":path[k].indexFullRef};
                      //We store the words to add in the end.
                      wordsToAddInTranscriptions[i].push(new WordToAdd(wordObject,insertionIndex));
                      self.fullTranscription[0].content[path[k].indexFullRef].wordClass="none";
                    }
                    else if(path[k].operation=='suppr'){
                      var word=self.fullTranscription[i].content[path[k].indexFullHyp].word;
                      self.fullTranscription[i].content[path[k].indexFullHyp].word=word;
                      self.fullTranscription[i].content[path[k].indexFullHyp].wordClass=self.suppressionStyle;
                      self.fullTranscription[0].content[path[k].indexFullRef].wordClass="none";
                    }
                    else if(path[k].operation=='subst'){
                      var current=self.fullTranscription[i].content[path[k].indexFullHyp].word;
                      var replacement=self.fullTranscription[0].content[path[k].indexFullRef].word;
                      self.fullTranscription[i].content[path[k].indexFullHyp].wordClass=self.substitutionStyle;
                      self.fullTranscription[i].content[path[k].indexFullHyp].word=current+"(>>"+replacement+")";
                      self.fullTranscription[i].content[path[k].indexFullHyp].corespondingWordIndex=path[k].indexFullRef;
                      self.fullTranscription[0].content[path[k].indexFullRef].wordClass="none";
                    }
                    else if(path[k].operation=='none'){
                    self.fullTranscription[i].content[path[k].indexFullHyp].wordClass="none";
                      self.fullTranscription[0].content[path[k].indexFullRef].wordClass="none";
                    }
                  }
                  }
                  //refresh the page
                  refresh(); //refresh the content
                  self.timeUpdateDisplay($('#mediafile')["0"].currentTime); //refresh the highlighting
                  
                  if(++j==limit){ 
                    clearInterval(processor);   
                    //We add all the insertion at once because of the shift it causes
                    self.addWords(wordsToAddInTranscriptions);
                    $('#calculationOverAlert').show();
                    //last refresh
                    var timeToUpdate=$('#mediafile')["0"].currentTime; //currentTime
                    Video.startVideo(self.displayedTranscriptions[0].transcription[self.displayedTranscriptions[0].currentHighlightedIndex].start,self); //reset the video to include the insertion
                 	Video.moveVideoTo(timeToUpdate); //place the video at the ancien place 
                 	$('#progressBar').hide();
                  }
                  busy=false; 
                }
              }, 100);
              
            }
            //Change the style of a word when the user point his mouse on it(if it's a case of substitution or insertion).
            this.showCorespondingWordInReferenceWord=function(word){
              if(word.wordClass==this.substitutionStyle || word.wordClass==this.insertionStyle){
                $('#content0 span[data-start="' + this.fullTranscription[0].content[word.corespondingWordIndex].start + '"]').addClass(this.showStyle);
              }
            }
            //Restore the style of a word when the user point his mouse on it(if it's a case of substitution or insertion).
            this.hideCorespondingWordInReferenceWord=function(word){
              if(word.wordClass==this.substitutionStyle || word.wordClass==this.insertionStyle){
                $('#content0 span[data-start="' + this.fullTranscription[0].content[word.corespondingWordIndex].start + '"]').removeClass(this.showStyle);
              }
            }
            //Add/modify information to the transcriptions and adjust the hypothesis transcriptions to the reference.
            this.adjustTranscriptions=function(){
              for(var i=0;i<this.fullTranscription.length;i++){
                for(var j=0;j<this.fullTranscription[i].content.length;j++){
                  //The untreatedDtw style show the text but indicate the user that it could not have been treated and compared whith the other transcriptions.
                  this.fullTranscription[i].content[j].wordClass="untreatedDtw";
                  this.fullTranscription[i].content[j].start=parseFloat(this.fullTranscription[i].content[j].start);
                }
              }
              
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
            this.copyTranscription=function(){
            	window.prompt ("Transcription with Dtw informations: Copy to clipboard: Ctrl+C (cmd+C), Enter", JSON.stringify(this.fullTranscription));
            }
        }
      }
    })
    //This class contains information concerning the speaker bar for the Diarization. the constructor needs the complete transcription that the bar will describe and the id of this transcription to identify the bar elements in the page.
    .factory('SpeakerBar', function(Time,Position,BinarySearch){
      return {
        instance : function(transcription,transcriptionNum,colors){
            //This sub-class regroups the information of a single speaker.
            function SpeakerData(spk,color) {
              this.spkId=spk.id;
              if(spk.gender=="m"){
                this.gender="male";
              }
              else if(spk.gender=="f"){
                this.gender="female";
              }
              else{
                this.gender=spk.gender;
              }
              this.color=color;
              this.speakingPeriods=new Array();
              this.speakingStatus="none";
            
              //Returns the sum of his speaking periods.
              this.totalTime=function(){
                var total=0;
              for(var i=0;i<this.speakingPeriods.length;i++){
                total=total+(this.speakingPeriods[i][1]-this.speakingPeriods[i][0]);
              }
              return total;
              }
              //Gives a string representing the total time of speech.
              this.totalTimeString=function(){
                return Time.format(this.totalTime());
              }
              //Add a new speaking period.
              this.addSpeakingPeriod=function(start,end){
                var spkPeriod=new Array(2);
                spkPeriod[0]=start;
                spkPeriod[1]=end;
                this.speakingPeriods.push(spkPeriod);
              }
              this.giveFirstSpeechTimeString=function(){
              	return Time.format(this.speakingPeriods[0][0]);
              }
              //Set the video to the moment when the speaker speaks for the first time.
              this.moveVideoToSpeechStart=function(){
                var firstSpeechStart=this.speakingPeriods[0][0];
                $('#mediafile')["0"].player.setCurrentTime(firstSpeechStart);
              }
            }

            //Instance Variables:
            this.transcriptionNum=transcriptionNum;
            this.transcription=transcription;
            this.timeStart=this.transcription.content[0].start;
            this.timeEnd=this.transcription.content[this.transcription.content.length-1].start;
            this.context = $('#canvas'+transcriptionNum)["0"].getContext('2d');
            this.timer  = $('#progressTime'+transcriptionNum)["0"];
            this.context.lineWidth  = "5";
            this.contextWidth=$('#canvas'+transcriptionNum)["0"].width;
            this.contextHeight=$('#canvas'+transcriptionNum)["0"].height;
            this.duration=this.timeEnd-this.timeStart;
            this.colors=colors;
            this.speakers=new Array();
            this.mainSpeakers;
            this.secondarySpeakers;
            this.secondarySpeakersTitle="";
            this.mainSpeakersTitle="";
			// Create gradient
			this.grd=this.context.createLinearGradient(this.contextWidth/2,0,this.contextWidth/2,this.contextHeight*1.8);
			this.context.fillStyle=this.grd;
			this.grd.addColorStop(1,"grey");
			this.contextCopy=null;
			this.popoverText="";
               
            //Methods:
            //Fills the speaker array with SpeakerData objects.
            this.updateSpeakers=function(){
              var hashSpeakers=new Object();
              var defaultColor=this.colors[this.colors.length-1];
              var wordObjects=this.transcription.content;
              //NOTE: On ne dispose pas de l'information de durée du dernier mot.
              //We don't treat the last word because we need the start of the following word to deduce the word duration.
              for(var i=0;i<wordObjects.length-1;i++){
              	if(wordObjects[i].spk!=null){
					if(typeof hashSpeakers[wordObjects[i].spk.id]=='undefined'){
					  hashSpeakers[wordObjects[i].spk.id]=new SpeakerData(wordObjects[i].spk,defaultColor);
					  hashSpeakers[wordObjects[i].spk.id].addSpeakingPeriod(wordObjects[i].start,wordObjects[i+1].start);
					}
					else{
					  //We merge the consecutive speaking periods so the bar is not so that the bar is not hatched.
					  if(hashSpeakers[wordObjects[i].spk.id].speakingPeriods[hashSpeakers[wordObjects[i].spk.id].speakingPeriods.length-1][1]==wordObjects[i].start){
						hashSpeakers[wordObjects[i].spk.id].speakingPeriods[hashSpeakers[wordObjects[i].spk.id].speakingPeriods.length-1][1]=wordObjects[i+1].start;
					  }
					  else{
						hashSpeakers[wordObjects[i].spk.id].addSpeakingPeriod(wordObjects[i].start,wordObjects[i+1].start);
					  }
					}
				}
              }
              var s;
              for(s in hashSpeakers){
                this.speakers.push(hashSpeakers[s]);
              }
              //We sort the speakers so the first one are those who talk the most.
              this.speakers.sort(function (a, b) {
                              return b.totalTime()-a.totalTime();
                          });
              for(var i=0;i<this.speakers.length;i++){
                //If we don't have enough colors for all the speakers, the last speakers(who talk the less) will keep the default color.
                if(i<this.colors.length-1){
                  this.speakers[i].color=this.colors[i];
                }
              }
              
              if(this.speakers.length>this.colors.length){
			  	var indLim=0;
				for(var i=0;i<this.speakers.length;i++){
					if(this.speakers[i].color==this.colors[this.colors.length-1]){
						indLim=i;
						break;
					}
				}
				this.mainSpeakers=this.speakers.slice(0,indLim);
			  }
			  else{
			  	this.mainSpeakers=this.speakers;
			  }
			  
			  if(this.speakers.length>this.colors.length){
              	indLim=0;
				for(var i=0;i<this.speakers.length;i++){
					if(this.speakers[i].color==this.colors[this.colors.length-1]){
						indLim=i;
						break;
					}
				}
				this.secondarySpeakers=this.speakers.slice(indLim,this.speakers.length);
              }
			  else{
				this.secondarySpeakers=[];
			  }
            	
              this.mainSpeakersTitle=" Principal speakers ["+this.mainSpeakers.length+"]";
              if(this.speakers.length>this.colors.length){
                this.secondarySpeakersTitle=" Secondary speakers (who talk the less) ["+this.secondarySpeakers.length+"]";
              }
              
            }
            //Sets the current color to fill the canvas.
            this.setColor=function(color){         
				// Fill with gradient
				this.grd.addColorStop(0,color);
            }
            //Draws a segment in the canvas.
            this.drawSegment=function(start,width){
              var fractionStart=(start-this.timeStart)/this.duration;
              var fractionWidth=width/this.duration;
              this.context.fillRect(this.contextWidth*fractionStart, 0, this.contextWidth*fractionWidth, this.contextHeight);
            }
            //Draws all the speakers in the bar.
            this.drawSpeakers=function() {
              for(var i=0;i<this.speakers.length;i++){
                this.setColor(this.speakers[i].color);
                for(var j=0;j<this.speakers[i].speakingPeriods.length;j++){
                  var start=this.speakers[i].speakingPeriods[j][0];
                  var width=this.speakers[i].speakingPeriods[j][1]-this.speakers[i].speakingPeriods[j][0];
                  this.drawSegment(start,width);
                }
              }
            }
            //Updates the bar corresponding to a specific time.
            this.timeUpdate=function(currentTime){
              this.timer.textContent = Time.format(currentTime)+'/'+Time.format($('#mediafile')[0].duration);
              if(currentTime<this.timeStart || currentTime>this.timeEnd){
                this.timer.textContent+= " - OUTSIDE TRANSCRIPTION";
              }
              //We have to draw all the speakers again because if we draw the transparent progressBar over the former one, it will become opaque. It is also useful if the currentTime updated is inferior to the forme time updated.
              this.context.putImageData(this.contextCopy,0,0);
              this.setColor("rgba(161, 161, 161, 0.8)");
              this.drawSegment(this.timeStart,currentTime-this.timeStart);
              var currentSpeakerIndex=BinarySearch.search(this.transcription.content, currentTime, function(item) { return item.start; });
              if(currentSpeakerIndex>=0 && this.transcription.content[currentSpeakerIndex].spk!=null){
              	var currentSpeakerId=this.transcription.content[currentSpeakerIndex].spk.id;
              	for(var i=0;i<this.speakers.length;i++){
					if(this.speakers[i].spkId==currentSpeakerId){
						this.speakers[i].speakingStatus="active";
					}
					else{
						this.speakers[i].speakingStatus="none";
					}
              	}
              }
              else{
              	for(var i=0;i<this.speakers.length;i++){
					this.speakers[i].speakingStatus="none";
              	}
              }
              
            }
            //Update the video in terms of the spot we clicked on the bar
            this.clickUpdate=function(event) {
              var parent = Position.getElementPosition($('#canvas'+this.transcriptionNum)["0"]);  
              var target = Position.getMousePosition(event); 
              
              var x = target.x - parent.x;
              var y = target.y - parent.y;
              
              var wrapperWidth = $('#canvas'+this.transcriptionNum)["0"].offsetWidth;
              
              var percent  = Math.ceil((x / wrapperWidth) * 100);
              
              $('#mediafile')["0"].player.setCurrentTime(((this.duration * percent) / 100)+this.timeStart);
            }
            this.initialize=function(){
            	this.updateSpeakers();
            	this.drawSpeakers();
            	this.contextCopy = this.context.getImageData(0,0,this.contextWidth,this.contextHeight);
            }
            
            this.openPopover=function (event) {
              var parent = Position.getElementPosition($('#canvas'+this.transcriptionNum)["0"]);  
              var target = Position.getMousePosition(event); 
              var x = target.x - parent.x;
              var y = target.y - parent.y;
              var wrapperWidth = $('#canvas'+this.transcriptionNum)["0"].offsetWidth;
              var percent  = Math.ceil((x / wrapperWidth) * 100);
              var time=((this.duration * percent) / 100)+this.timeStart;
              var timeString=Time.format(time);
              var currentSpeakerIndex=BinarySearch.search(this.transcription.content, time, function(item) { return item.start; });
              var currentSpeakerId=this.transcription.content[currentSpeakerIndex].spk.id;
              
              this.popoverText="speaker: "+currentSpeakerId+", time: "+timeString;
              
			  var left = event.pageX;
			  var top = event.pageY;
			  var theHeight = $('#popover').height();
		      $('#popover').show();
			  $('#popover').css('left', (left+10) + 'px');
		      $('#popover').css('top', (top-(theHeight/2)-10) + 'px');
			}
			this.closePopover=function () {
				$('#popover').hide();
			}
        }
      }
    });


angular.module('searchServices', []).
    factory('BinarySearch', function(){
      //Work derived from
      //http://www.nczonline.net/blog/2009/09/01/computer-science-in-javascript-binary-search/
      //Copyright 2009 Nicholas C. Zakas, MIT-Licensed
      return {
        search : function binarySearch(items, value, accessFunction){

          accessFunction = typeof accessFunction !== 'undefined' ? accessFunction : function(b) { return b; };

          var startIndex  = 0,
              stopIndex   = items.length - 1,
              middle      = Math.floor((stopIndex + startIndex)/2);

          var found = function(index, collection, toFind) {
            if (index <= 0 || index >= collection.length -1) {
              return true;
            }

            var value = accessFunction(collection[index]);

            //NOTE: rajout d'un if pour gérer le cas où 2 items se suivant ont la même valeur(même start) et que l'on cherche cette valeur (ce qui génère une boucle infinie dans la suite)
            if(toFind==accessFunction(collection[index+1])){
            	return value==toFind;
            }
            else{
            	if(toFind >= value && toFind < accessFunction(collection[index+1])) {
                  return true;
                } else {
                  return false;
                }
            }
            
          }

          //No items or the value is out of range, return not found
          //We return different values to determine if we are searching before or after the items (ie if we click outside of the video, we want to know if it's before or after).
          //NOTE: rajout de différentes sorties
          if(items.length == 0) {
            return -1;
          }
          else if(value < accessFunction(items[0])){
            return -2;
          }
          else if(value > accessFunction(items[items.length - 1])){
            return -3;
          }

          while(!found(middle, items, value) && startIndex < stopIndex){
              //adjust search area
              if (value < accessFunction(items[middle])){
                  stopIndex = middle - 1;
              } else if (value > accessFunction(items[middle])){
                  startIndex = middle + 1;
              } else if (value != accessFunction(items[middle])) {
                  //value is not < or > and is not equal: we are comparing apples and bananas
                  return -1;
              }

              //recalculate middle
              middle = Math.floor((stopIndex + startIndex)/2);
          }

          return middle;
        }
    }
});


angular.module('fileServices', ['ngResource'])
	.factory('File', function($resource){
        return $resource('/assets/files/:fileId',{},{get  : {method:'GET', isArray: true}}  );
    })
    .factory('SentenceBoundaries', function(){
        //Extracts the sentence boundaries from the content of a .seg file and returns it in an array.
        return {
        	get : function(segfileContent){
   				var s="";
   				var bounds=new Array();
    			for(var i=0;i<segfileContent.length;i++){
    	 			s=s+segfileContent[i][0];
    			}
    			var reg=new RegExp("\n+", "g");
    			var reg2=new RegExp(" +", "g");
    			var tab=s.split(reg);
    			
    			for(var i=0;i<tab.length;i++){
    	 			var tab2=tab[i].split(reg2);
    	 			bounds.push({"start":parseInt(tab2[1])/100,"end":parseInt(tab2[2])/100});
    			}
    			
    			bounds.sort(function (a, b) {
              		return a.start-b.start;
            	});
    			
    			return bounds;
        	}
        }
});

angular.module('videoServices', [])
    .factory('Video', function(){
        return {
            //Starts the video at a specific time. We give the corresponding transcriptionsData to init its display.
        	startVideo : function(timeStart,transcriptionsData){
        		$('#mediafile')["0"].player.setCurrentTime(timeStart); //The video have to exist with this id
  				transcriptionsData.initDisplay(timeStart);
        	},
        	//Move the video at the time corresponding to the word(event) we click on.
        	moveVideo : function(eventObject){
        		var time = eventObject.currentTarget.attributes["data-start"].value;
  				$('#mediafile')["0"].player.setCurrentTime(time);
        	},
        	//Move the video at a specific time.
        	moveVideoTo : function(time){
  				$('#mediafile')["0"].player.setCurrentTime(time);
        	}
        }
	})
	.factory('Time', function(){
		return {
			//Gives a string representation of a time in second. Rounded to the lower value.
			format : function(time) {
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
		}
	
	});
	
angular.module('positionServices', []).
	factory('Position', function(){
        return {
            //Gives the absolute position of the element in the page.
        	getElementPosition : function(element){
  				var top = 0, left = 0;
    
  				while (element) {
   	 				left   += element.offsetLeft;
    				top    += element.offsetTop;
    				element = element.offsetParent;
  				}
  				return { x: left, y: top };
			},
			//Gives the coordinates of the mouse position.
			getMousePosition : function(event) {
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
        }
	});
	
angular.module('controllerServices', []).
	factory('Controller', function(Video, File, Restangular, SentenceBoundaries, TranscriptionsData, SpeakerBar){
        return {
        	initializeTranscriptionComparisonCtrl : function(scope,globalStep,colors){
                scope.startVideo=function(timeStart){
                	Video.startVideo(timeStart,scope.transcriptionsData);
                }
                
                scope.moveVideo=function(eventObject){
                	Video.moveVideo(eventObject);
                }
                
                scope.clickUpdate=function(event) {
              		scope.speakerBar.clickUpdate(event);
            	}
                
                var refresh=function(){
                	scope.$apply();
                }
                
                $('#calculationOverAlert').hide();
                $('#outTranscriptionAlert').hide();
                $('#progressBar').hide();
                //Get the transcription from the server: if the transcription enhanced with the dtw exist, we use it. Otherwise we make the calculation.
                File.get({fileId: 'en hanced-transcription.json'}, 
                    function(transcriptions) {
                  	scope.transcriptionsData=new TranscriptionsData.instance(transcriptions,globalStep);
                  	
                  	scope.speakerBar=new SpeakerBar.instance(scope.transcriptionsData.fullTranscription[0],0,colors);
            		scope.speakerBar.initialize();
                  	
                  	//We make sure that the nextWordToDisplay value is correct
                  	scope.startVideo(scope.transcriptionsData.fullTranscription[0].content[0].start);
                    },
                    function(){
                      Restangular.one('audiofiles.json', 2).getList('transcriptions').then(function(transcriptions) {
                	      scope.transcriptionsData=new TranscriptionsData.instance(transcriptions,globalStep);
                	      scope.transcriptionsData.adjustTranscriptions();
                	      
                	      scope.speakerBar=new SpeakerBar.instance(scope.transcriptionsData.fullTranscription[0],0,colors);
            			  scope.speakerBar.initialize();
                	      
                        File.get({fileId: 'sentence_bounds.seg'}, 
                          function(data) {
                  	      //We get the bounds of the sentences we will use for the DTWs
                  	      scope.sentenceBounds=SentenceBoundaries.get(data);	
                  	      scope.transcriptionsData.updateTranscriptionsWithDtw(scope.sentenceBounds,refresh);
                  	      //We make sure that the nextWordToDisplay value is correct
                  	      scope.startVideo(scope.transcriptionsData.fullTranscription[0].content[0].start);
                          }
                        );
                      });
                    }
                );

                //Non angular events
                $("#mediafile").on("timeupdate", function (e) {
                  scope.$apply( function() {
                    scope.transcriptionsData.timeUpdateDisplay(e.target.currentTime);
                    scope.speakerBar.timeUpdate(e.target.currentTime);
                  });
                });

                $("#mediafile").on("seeking", function (e) {
                  scope.$apply( function() {
                    scope.transcriptionsData.seekingUpdateDisplay(e.target.currentTime);
                  });
                });
			},
			initializeDiarizationCtrl : function(scope,globalStep,transcriptionNum,colors) {
            	scope.startVideo=function(timeStart){
            		Video.startVideo(timeStart,scope.transcriptionsData);
            	}
            
            	scope.moveVideo=function(eventObject){
            		Video.moveVideo(eventObject);
            	}
            
            	scope.clickUpdate=function(event) {
              		scope.speakerBar.clickUpdate(event);
            	}
            
            	//Get the transcription from the server
            	Restangular.one('audiofiles.json', 1).getList('transcriptions').then(function(transcriptions) {
            		scope.transcriptionsData=new TranscriptionsData.instance(transcriptions,globalStep);
            		scope.transcriptionsData.adjustTranscriptions();
            		scope.speakerBar=new SpeakerBar.instance(scope.transcriptionsData.fullTranscription[transcriptionNum],transcriptionNum,colors);
            		scope.speakerBar.initialize();
              		scope.startVideo(scope.transcriptionsData.fullTranscription[transcriptionNum].content[transcriptionNum].start);
            	});

            	//Non angular events
            	$("#mediafile").on("timeupdate", function (e) {
              		scope.$apply( function() {
                		scope.transcriptionsData.timeUpdateDisplay(e.target.currentTime);
                		scope.speakerBar.timeUpdate(e.target.currentTime);
              		});
            	});

            	$("#mediafile").on("seeking", function (e) {
              		scope.$apply( function() {
                		scope.transcriptionsData.seekingUpdateDisplay(e.target.currentTime);
              		});
            	});
			}
    	}
	});
