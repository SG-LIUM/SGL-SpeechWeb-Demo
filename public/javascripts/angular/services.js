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
                //NOTE: Est-t-il possible d'aller dans ce if sachant que nextWordToDisplay==-1/-2/-3 si clique en dehors
                if (newWords.currentWordStart > transcription.content.length -1) {
                  return [];
                }

                // Same here
                if (newWords.currentWordEnd > transcription.content.length -1) {
                  newWords.currentWordEnd = transcription.content.length -1;
                }
				
                //Get the words
                //return [] if newWords.currentWordStart<0 (if nextWordToDisplay<0 >> if the BinarySearch failed)
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
                  if(transcription.content.length >= newWords.nextWordToDisplay) {
                    newWords.nextTimeToDisplay = transcription.content[newWords.nextWordToDisplay].start;
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

            //NOTE: rajout d'un if pour gérer le cas ou 2 item se suivant on le même start (qui génère une boucle infini)
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
          //NOTE: rajout de différente sortie pour différencier quand on clique en dehors de la vidéo (avant ou après -> gestion différente)
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
    	 			bounds.push({"start":tab2[1],"end":tab2[2]});
    			}
    			return bounds;
        	}
        }
});


angular.module('dtwServices', []).
	factory('Dtw', function(){
        return {
          //Point in the DTW
        	pointDtwTranscription : function (cost,operation,matrixLine,matrixCol){
        	    this.cost = cost;
    			    this.operation = operation;
    			    this.indexHyp = matrixLine-1;
    			    this.indexRef = matrixCol-1;	
        	},
          //DTW for full transcriptions
  			  dtwTranscription : function (hypothesis,reference) {
    				  this.hypothesis = hypothesis.content;
        			this.reference = reference.content;
        			this.iM=this.hypothesis.unshift({});
        			this.jM=this.reference.unshift({});
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
        }
});
