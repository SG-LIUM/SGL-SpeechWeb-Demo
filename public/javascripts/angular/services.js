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
                if (newWords.currentWordStart > transcription.length -1) {
                return [];
                }

                // Same here
                if (newWords.currentWordEnd > transcription.length -1) {
                newWords.currentWordEnd = transcription.length -1;
                }

                //Get the words
                newWords.words = transcription.content.slice(newWords.currentWordStart, newWords.currentWordEnd);

                //Reset the counters
                newWords.nextWordToDisplay = newWords.currentWordEnd;
                if(transcription.content.length >= newWords.nextWordToDisplay) {
                newWords.nextTimeToDisplay = transcription.content[newWords.nextWordToDisplay].start;
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

            if(toFind >= value && toFind < accessFunction(collection[index+1])) {
              return true;
            } else {
              return false;
            }

          }

          //No items or the value is out of range, return not found
          if(items.length == 0 || value < accessFunction(items[0]) || value > accessFunction(items[items.length - 1])) {
            return -1;
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

