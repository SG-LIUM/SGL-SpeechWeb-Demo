'use strict';

/* Services */

angular.module('transcriptionServices', []).
    factory('Indexes', function(){
        return {
            //Get the next list of words to display on the screen
            getNextWords : function(transcription, nextWordToDisplay, step) {
                var newWords = {};
                newWords.currentWordEnd = nextWordToDisplay + step;
                newWords.currentWordStart = nextWordToDisplay;

                // Try to avoid out of bounds exception 
                //NOTE: La displayedTransciption contient plus d'info qu'un simple tableau vide -> fait planter si on passe dedans. En revanche si les paramètres sont invalid, le slice renvoi []
                //if (newWords.currentWordStart > transcription.content.length -1) {
                //  return [];
                //}

                // Same here
                if (newWords.currentWordEnd > transcription.content.length -1) {
                  newWords.currentWordEnd = transcription.content.length;
                }
				
                //Get the words
                //return [] if newWords.currentWordStart<0 (if nextWordToDisplay<0 >> if the BinarySearch failed) or the parameters are invalid
                newWords.words = transcription.content.slice(newWords.currentWordStart, newWords.currentWordEnd);
		
                //Reset the counters
                if(nextWordToDisplay==-2){
                  newWords.nextWordToDisplay = 0;
                  newWords.nextTimeToDisplay = transcription.content[0].start;
                }
            	else if(nextWordToDisplay==-3){
            	  newWords.nextWordToDisplay = transcription.length -1;
                  newWords.nextTimeToDisplay = -1;
                }
                else{
                  newWords.nextWordToDisplay = newWords.currentWordEnd;
                  if(newWords.nextWordToDisplay < transcription.content.length) {
                    newWords.nextTimeToDisplay = transcription.content[newWords.nextWordToDisplay].start;
                  }
                  else {
                  	// We decide that the last word will be displayed for 0.5 sec
                  	newWords.nextTimeToDisplay = transcription.content[transcription.content.length-1].start+0.5;
                  }
                }

                return newWords;
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

            //NOTE: rajout d'un if pour gérer le cas où 2 items se suivant ont le même 'start' (qui génère une boucle infini)
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
          //NOTE: rajout de différentes sorties pour différencier quand on clique en dehors de la vidéo (avant ou après -> gestion différente)
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


angular.module('fileParsing', ['ngResource'])
	.factory('GetFile', function($resource){
        return $resource('/assets/file/:fileId',{},{get  : {method:'GET', isArray: true}}  );
    })
    .factory('GetSentenceBoundaries', function(){
        return {
        	getSentenceBoundaries : function (segfileContent){
        	
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


angular.module('dtwServices', []).
	factory('Dtw', function(){
        return {
            //DTW for full transcriptions
  			dtwTranscription : function (hypothesis,indexStartHyp,reference,indexStartRef) {
  				this.indexStartHyp=indexStartHyp;
  				this.indexStartRef=indexStartRef;
    			this.hypothesis = hypothesis.slice(0);;
        		this.reference = reference.slice(0);;
        		this.iM=this.hypothesis.unshift({});
        		this.jM=this.reference.unshift({});
        		this.matrix=new Array(this.iM);
        		for (var i = 0; i < this.iM; i++){
        			this.matrix[i]=new Array(this.jM);
        		}
        		
        		//Point in the DTW
        		this.PointDtwTranscription=function (dtw,cost,operation,matrixLine,matrixCol){
        	    	this.cost = cost;
    				this.operation = operation;
    				this.indexFullHyp = dtw.indexStartHyp+matrixLine-1;
    				this.indexFullRef = dtw.indexStartRef+matrixCol -1;
        		}
        	
                this.calculate=function(){
              		this.matrix[0][0]=new this.PointDtwTranscription(this,0,'',0,0);
              		for (var i = 1 ; i < this.iM ;  i++) {
              			this.matrix[i][0]=new this.PointDtwTranscription(this,i,'suppr',i,0);
          		  	}
          		  	for (var j = 1 ; j < this.jM ;  j++) {
              			this.matrix[0][j]=new this.PointDtwTranscription(this,j,'inser',0,j);
          		  	}	
          		
          			var origins=new Array(3);
              		var cost;
              		var ope;
            		for (var i = 1 ; i < this.iM ;  i++) {
            			for (var j = 1 ; j < this.jM ; j++) {	
                			if(this.hypothesis[i].word==this.reference[j].word){
                				cost=0;
                				ope='none';
                			}
                			else{
                				cost=1;
                				ope='subst'
                			}
                			origins[0]=new this.PointDtwTranscription(this,this.matrix[i-1][j].cost+1,'suppr',i,j);
                			origins[1]=new this.PointDtwTranscription(this,this.matrix[i-1][j-1].cost+cost,ope,i,j);
                			origins[2]=new this.PointDtwTranscription(this,this.matrix[i][j-1].cost+1,'inser',i,j);
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
    }
});
