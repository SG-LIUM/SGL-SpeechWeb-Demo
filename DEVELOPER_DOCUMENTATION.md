# Developer Documentation

This documentation presents tools developed to construct a web demonstrator of multiple transcription systems.    
The user must be able to see in real-time the transcriptions synchronized with the original video (it can also be an audio recording) and the differences between the transcriptions highlighted. The comparison is made between one transcription (the first given) chosen as a reference and the other that are called hypothesis. Therefore the first transcription is shown unmodified but the other have information added in their content which help the user to distinguish the words in each hypothesis that have to be inserted, substituted by an other word (which comes from the reference) or simply deleted so this hypothesis matches with the reference. The comparison is made with an adaptation of the DTW algorithm which calculates the best alignment between each hypothesis and the reference.    
A plugin is also available to show the distribution of the speaking time between the speakers (diarization viewer), with an interactive colored bar. The developer have to provide the transcription files and the video for the demonstration.    
Every time given is in second except the contrary is said.    

## I) How to use the tools

### A) Installing the plugins

The plugins are implemented in javascript using the ["AngularJs" framework](http://angularjs.org). They also use the ["Restangular" service](https://github.com/mgonto/restangular). Some element of the page use the ["Bootstrap" framework](http://getbootstrap.com/2.3.2/).    
Two files are provided to make them work: "services.js" and "main.css".     
To use those plugins, the developer has to insert the services contained in "services.js" to his services and to insert (or adapt) the styles contained in "main.css" to his css styles.   

### B) Elements required

To work, the plugins need several transcription files (.ctm) for each transcription system, a segment file (.seg) for the analyze of the transcriptions and a video or audio file (from which the transcriptions were made) to synchronize the transcription displays in real-time with.   
The structures which have to be employed are described bellow:   

#### 1) ctm files

TODO: decription of a ctm file and where they have to be placed by the developer

The information extracted from the ctm files will be stored in a json format. Here is a description of the resulting json data:   

* data in the json file:

		[ transcription_0, transcription_1, … ,  transcription_n ]
		
	They must be at least one transcription (but at least two is necessary to start a comparison)

* transcription:

		{system,content}
		
	`system` is the name of the transcription system (string)

* content:

		[wordObject_0, wordObject_1, … ,wordObject_n]

* wordObject:

		{start,word,spk}
		
	`start` is the time when the word begins. It can be a string as well as a float (it will be parsed anyway).   
	`word` is the actual word (string).

* spk:

		{id,gender}	
		
	`id` is the name of the speaker (string).   
	`gender` have the value "m" for male and "f" for female.

Here is an example of the json file content:

	[
		{"system": “SYST1” ,"content":[{"start":"0","word":"Hello","spk": {"id":"S1","gender":"m"}},{"start":"0.3","word":"World","spk": {"id":"S1","gender":"m"}}, … ]},
		{"system": “SYST2” ,"content":[{"start":"0","word":"Cello","spk":{"id":"S1","gender":"m"}},{"start":"0.2","word":"Word","spk":	{"id":"S1","gender":"m"}}, … ]}
	]

#### 2) seg file

The segment file (.seg) is a text document which contain the sentences' time delimitations that were used during the transcription process. They are necessary to make the comparison between the transcriptions. The segment file has to be named "sentence_bounds.seg" and to be stored in "/assets/files".     
It has the following structure:

	video_title sentence0_start sentence0_end concatenation_of_title_and_start_and_end
	video_title sentence1_start sentence1_end concatenation_of_title_and_start_and_end
	video_title sentence2_start sentence2_end concatenation_of_title_and_start_and_end
	…

The times are in centiseconds

Here is an example:

	myVideo 12500 12730 myVideo-125.00-127.30-other-informations
	myVideo 12731 12945 myVideo-127.31-129.45-other-informations
	…

What matters for the comparison are the second and third value for each line (the times in centiseconds).

First of all, the plugin put the json data in an object to use them. Then, when the comparison is made, it simply add other information to this json object concerning the words that are different between the first transcriptions (reference: index 0) and the others (hypothesis: index>0). 

The computation of the comparison can be long. The plugin is made so it will not freeze the browser but if the enhanced json data are get back by the developer and put on the server, they can be directly used and the user will not have to waste time in computation. The enhanced json data have to be recovered and saved in "/assets/files" with the name "enhanced-transcription.json". When the user visit the web page, if the file is found on the server, the results appear directly, if not , the calculation is made.

### C) Elements to insert in your code

#### 1) Initializing the controllers

Two different controllers are necessary for the transcription comparator and for the diarization viewer. The service `Controller` from the `controllerServices` is dedicated to the controllers initialization. They will attach specific instances to a root scope as well as useful functions that are then available in the html pages.     
The instances manipulated are `transcriptionData` which contains the important information built from the seg and ctm files given by the developer and `speakerBar` which contain the information built from `transcriptionData` and which permits to handle the interactive bar.

The transcription comparator has to call the service :

	Controller.initializeTranscriptionComparisonCtrl($scope,step,colors);

`step` is the integer value representing the number of word displayed at the same time.
`colors` is an array of color names. One color is attributed to one speaker on the bar: they will be given in the order of the array to the speakers sorted (decreasing) by their speaking time. Nevertheless, if they are less speakers in the transcriptions than colors given, only the first colors will be used. And if they are more speakers than colors given, the last color will be used several time for the speakers whose talk the less.    
The speaker bar will automatically represent the first transcription (index 0 in the json data array).

The diarization viewer has to call the service :

	Controller.initializeDiarizationCtrl($scope,step,numTranscription,colors);

`step` has the same signification as previously.    
As we have seen before, the json data are an array of transcription. A diarization viewer's controller handle one transcription only (its goal his to give a graphical representation of the different stakeholders for one transcription). `numTranscription` is the index in the array of the transcription that will be used.    
`colors` represents the same thing that before.   

#### 2) Allowing tooltips

Allow the tooltips in your web pages by inserting this directive in your project:

	.directive('tooltip', function () {
	    return {
	        restrict:'A',
	        link: function(scope, element, attrs)
	        {
	            $(element)
	                .attr('title',scope.$eval(attrs.tooltip));
	        }
	    }
	});

#### 3) Elements to use in the html pages

Here is the description of the different tags to dispose in the pages.

##### i. Transcription Comparator:

* remember to indicate the right controller:

	example: 

		<div ng-controller="YourTranscriptionCtrl">

* User messages:

	Some messages are provided to inform the user on what is happening.

		<div id="progressBar">
		  <div class="progress progress-striped active">
			<div id="progressBarContent" class="bar"></div>
		  </div>
		  <p>Dtw Calculation ({{transcriptionsData.progressBarContent[0].style.width}})</p>
		</div>
		<div id="calculationOverAlert" class="alert alert-success">
		  <button type="button" class="close" data-dismiss="alert">&times;</button>
		  <h4>Calculation Over!</h4>
		  You can <button class=" btn btn-success  btn-large" ng-click="transcriptionsData.copyTranscription()">get the get the transcriptions json data</button> (with the comparison information added) .
		</div>
		<div id="outTranscriptionAlert" class="alert alert-error">
		  <button type="button" class="close" data-dismiss="alert">&times;</button>
		  <h4>Warning, you are out of the {{transcriptionsData.displayedTranscriptions[0].id}} transcription !</h4>
		  {{transcriptionsData.message}} <button class=" btn btn-danger  btn-large" ng-click="startVideo(transcriptionsData.fullTranscription[0].content[0].start)">{{transcriptionsData.clickableMessage}}</button>
		</div>

`transcriptionsData.calculationMessage` is a message indicating if there are still comparison calculation in progress. If not, the message is empty.   
`transcriptionsData.message` and `transcriptionsData.clickableMessage` compose a complete message indicating if the video is outside of the transcribed part (taking the first transcription as a reference too for the limits). `transcriptionsData.clickableMessage` contains the time when the transcription start and is dedicated to be bounded to the action: `startVideo(transcriptionsData.fullTranscription[0].content[0].start)` which set video to the start of the transcription. The start chosen here is the one of the reference.   
`transcriptionsData.fullTranscription` is the array extracted from the json file.

* Title:

	The developer can access the transcription system n°i name like this:
	
		<h2>{{transcriptionsData.displayedTranscriptions[i].id}} Transcription</h2>


* Displayed Transcription:

	The transcriptions are displayed part by part in synchronization with the video (a whole transcription is too big to be displayed at once). The developer can access these transcription pieces with `transcriptionsData.displayedTranscriptions[i]` (for the transcription n°i). Here is an example to show the displayed part of the reference:

		<article id="content0">
			<p>
				<span 
				ng-repeat="jsonWord in transcriptionsData.displayedTranscriptions[0].transcription"
	 			ngModel="transcriptionsData.displayedTranscriptions[0].transcription"
				data-start="{{jsonWord.start}}"
				ng-click="moveVideo($event)"
				class="{{jsonWord.wordClass}}">
					{{jsonWord.word}} 
				</span>
			</p>
		</article>

	And here is an example to show the displayed part of the hypothesis (transcription n°i with i>0) which is slightly different because of the  `ng-mouseenter` and `ng-mouseleave` fields:

		<article class="last" id="contenti">
			<p>
				<span 
				ng-repeat="jsonWord in transcriptionsData.displayedTranscriptions[i].transcription" 				
				ngModel="transcriptionsData.displayedTranscriptions[i].transcription" 
				data-start="{{jsonWord.start}}" 
				ng-click="moveVideo($event)" 
				ng-mouseenter="transcriptionsData.showCorespondingWordInReferenceWord(jsonWord)" 
				ng-mouseleave="transcriptionsData.hideCorespondingWordInReferenceWord(jsonWord)" 			
				class="{{jsonWord.wordClass}}">
					{{jsonWord.word}} 
				</span>
			</p>
		</article>

	The code of the displayed transcription must be inside of a container having the id "contenti" where i is the index of the transcription (content0 for the transcription n°0).   
	`transcriptionsData.displayedTranscriptions` is an array of `displayedTranscription` objects which regroups the information of the displayed part of a transcription (one for each complete transcription). The word objects (same structure as those of the original json file) are accessible via `transcriptionsData.displayedTranscriptions[i].transcription`.   
	`data-start="{{jsonWord.start}}"` and `ng-click="moveVideo($event)"` are important because they allow the user to click on a word to set the video at the start of this word.   
	Two more field are presents in the hypothesis displays. As it was told before, information has been added to word if they are word to delete, insert (word that comes from the reference) or substitute (by a word from the reference). In the insert and substitute case, it could be interesting for the user to see to which word it correspond in the reference. That what the `transcriptionsData.showCorespondingWordInReferenceWord(jsonWord)` and `transcriptionsData.hideCorespondingWordInReferenceWord(jsonWord)` functions are for. When the user points his mouse on a inserted or substituted word in a hypothesis, it will change the style or the corresponding word in the reference. When his mouse leaves it, the original style is restituted.

* Video:

	The developer must place his video somewhere in the page like this

		<video width="512" height="288" id="mediafile" controls preload>
			<!-- MP4 for Safari, IE9, iPhone, iPad, Android, and Windows Phone 7 -->
			<source type="video/mp4" src="http://your-video.mp4" />
			<!-- WebM/VP8 for Firefox4, Opera, and Chrome -->
			<source type="video/webm" src="http://your-video .webm" />
		</video>

	It is important that the video (or audio) has the id "mediafile" otherwise the functions used by the controller will not be able to detect it.

* Caption:

	It could be interesting to give some explanation to the users. The developer can use something like this if he brought four transcription systems for example:

		<h3>Caption</h3>
 		<p>
			We choose the {{transcriptionsData.displayedTranscriptions[0].id}} system as a reference for the comparison.
		</p>
 		<p>
			<span class="substCaption">hypothesisWord(->referenceWord) </span>
			: the hypothesisWord({{transcriptionsData.displayedTranscriptions[3].id}}, {{transcriptionsData.displayedTranscriptions[1].id}} or {{transcriptionsData.displayedTranscriptions[2].id}}) must be substituted with the referenceWord to match with the reference({{transcriptionsData.displayedTranscriptions[0].id}}).
			<br>
    		<span class="supprCaption">-hypothesisWord- </span>
			: the hypothesisWord({{transcriptionsData.displayedTranscriptions[3].id}}, {{transcriptionsData.displayedTranscriptions[1].id}} or {{transcriptionsData.displayedTranscriptions[2].id}}) must be deleted to match with the reference({{transcriptionsData.displayedTranscriptions[0].id}}).
			<br>
    		<span class="inserCaption">+referenceWord+</span>
			: the referenceWord({{transcriptionsData.displayedTranscriptions[0].id}}) must be inserted into the hypothesis({{transcriptionsData.displayedTranscriptions[3].id}}, {{transcriptionsData.displayedTranscriptions[1].id}} or {{transcriptionsData.displayedTranscriptions[2].id}}) to match with the reference({{transcriptionsData.displayedTranscriptions[0].id}}).
		</p>

##### ii. Diarization Viewer:

* remember to indicate the right controller again:

	example:

 		<div ng-controller="YourSpeakerCtrl">

* User messages:

	`transcriptionsData.message` and `transcriptionData.clickableMessage` are still present in this controller.

* Title:

	Same thing too.

* Video:

	Same thing too.

* transcriptionsData:

	The `transcriptionsData` object is the same as previously and can be use in the same way (to display the transcription) except that the comparison information have not been calculated and therefore are not present in this object.

* Displayed Transcription: 

	Quite the same thing except that the developer should not place the `class="{{jsonWord.wordClass}}"` attribute in the span tag where `ng-repeat` is. Indeed this `wordClass` is a part of the information added by the comparison. It is different depending if the word must be substituted, inserted, deleted. Beside if a part of a transcription have not been treated by the Dtw (if it is outside of any sentence bounds) then the corresponding word will have the wordClass "untreatedDtw" (should appear as grey text). Or as we seen before the comparison is not made in the diarization controller so the developer should not place the class attribute if he do not want to see the all text appear in grey. However he may use the "none" class (a default style).   
	The `ng-mouseenter` and `ng-mouseleave` are not necessary too.

* Interactive bar:

	The interactive bar is composed of a clickable bar to navigate in the video (this bar also show the repartition of the speakers) and a timer. Here is the way the developer should insert the bar in his page (for the transcription n°i):

		<canvas width="1125" height="70" class="canvas" id="canvasi" ng-click="clickUpdate($event)">
          		<p>updates are necessary</p>
		</canvas>
 		<p><span id="progressTimei">--:--</span></p>	

	As before, the canvas tag must have the id "canvasi" and the timer the id "progressTimei" where i is the index of the transcription. The canvas must be bounded to the `clickUpdate` function.   
	The message "updates are necessary" is useful to inform if the browser does not support canvas.

* Caption:

	A interactive caption is available. The user can see the different speakers and their respective color but it also display the speaker that is currently talking. Beside if the user click on the colored rectangle of a speaker, the video will be settled on the first time when the speaker talks. Here is the way the caption can be made:

		<h3>Caption</h3>
		<p>Click on the <span class="bold">colored rectangles</span> to start the video at the first speech of the corresponding speaker. <p>

		<p class="bold"> Principal speakers [{{speakerBar.mainSpeakers().length}}]<p>
		<ul>
			<li ng-repeat="speaker in speakerBar.mainSpeakers()" ngModel="speakerBar.mainSpeakers()" class="{{speaker.speakingStatus}}" >
				<span style="background:white;padding:2px 10px 2px;">   </span>
				<span style="cursor:pointer;color:{{speaker.color}};background:	{{speaker.color}};padding:2px 10px 2px;" ng-click="speaker.moveVideoToSpeechStart()">________</span>
				<span style="background:white;padding:2px 10px 2px;">   </span>
				name: <span class="bold">{{speaker.spkId}}</span>,
				gender: <span class="bold">{{speaker.gender}}</span>, 
				total time of speech=<span class="bold">{{speaker.totalTimeString()}}</span>
			</li>
		</ul>
        	
		<p class="bold">{{speakerBar.secondarySpeakersTitle}}<p>
		<ul>
			<li ng-repeat="speaker in speakerBar.secondarySpeakers()" ngModel="speakerBar.secondarySpeakers()" class="{{speaker.speakingStatus}}" >
				<span style="background:white;padding:2px 10px 2px;">   </span>
				<span style="cursor:pointer;color:{{speaker.color}};background: {{speaker.color}};padding:2px 10px 2px;" ng-click="speaker.moveVideoToSpeechStart()">________</span>
				<span style="background:white;padding:2px 10px 2px;">   </span>	
				name: <span class="bold">{{speaker.spkId}}</span>, 
				gender: <span class="bold">{{speaker.gender}}</span>, 
				total time of speech=<span class="bold">{{speaker.totalTimeString()}}</span> 
			</li>
		</ul>

	The developer can access the data of the different speaker (their color, id, gender, speaking periods, speaking status) via `speakerBar.speakers` which is an array of `speakerData` objects. But here, it is more interesting to use the functions `speakerBar.mainSpeakers()` and `speakerBar.secondarySpeakers()` which return a subset of the `speakerBar.speakers` array. `speakerBar.mainSpeakers()` will return the speakers who talk the most and have their own color while `speakerBar.secondarySpeakers()` will return the speakers who talk the less and share the same color. It all depends of the colors the developer gave in first time when he initialized the controller. Now it is possible to separate the main speakers from the others in the caption.   
	`speaker.speakingStatus` correspond to a css style different if the speaker is currently speaking or not and it is frequently updated.    
	The colored rectangle has to be bounded to the function `speaker.moveVideoToSpeechStart()` which set the video to the moment when the speaker talk for the first time.

## II) Detailed code documentation

### A) css file

The css file contains styles used by the plugins.

#### 1) Styles for displayed words

current : The displayed part of one transcription is progressively highlighted as the video is read. This style is given to a word highlighted.

suppr : This style is given to a word that should be suppressed from a hypothesis transcription if we want it to match with the reference transcription.

inser : This style is given to a word that should be inserted in a hypothesis transcription if we want tit to match with the reference transcription.

subst : This style is given to a word that should be substituted in a hypothesis transcription with an other one from the reference transcription if we want the hypothesis to match with the reference.

supprCaption : A style to represent what a suppressed word looks like in the caption (practically the same as suppr  style except some details: like the cursor that must not be transformed into a pointer when it is over).

InserCaption : same thing that supprCaption. 

substCaption : same thing that supprCaption. 

ShowInser : This style is given to a word in the reference transcription that correspond to a word inserted somewhere in a hypothesis transcription.

ShowSubst : This style is given to a word in the reference transcription that has substituted a word somewhere in a hypothesis transcription.

none : This style is given for words that have not to be modified (but it means they have been treated by the Dtw).

untreatedDtw : This style is given for words that have not been treated in the Dtw (grey text).

#### 2) Styles for user messages

message: A style for visible user message.

clickableMessage : A style for the part of the message that can be clicked.

bold : Bold style.

#### 3) Styles for speaker diarization bar

canvas : The style of the speaker bar (form, shadows...)

speaking : A style to distinguish which speaker is currently speaking.

notSpeaking : A style for every other speakers not speaking.

### B) service.js

The service file is composed of several modules.

#### 1) transcriptionServices

##### i. Indexes

_ function getNextWords: returns the next list of words to display on the screen

* *parameters*

	**transcription:** the complete transcription concerned  
	**nextWordToDisplay:** the index of the next word to display in this transcription (in the array transcription.content)  
	**step:** the number of word displayed at a time  

* *return*
	 
		{
			“words”: an array of wordObject,  
			“currentWordEnd”: the index of the last word to display,   
			“currentWordStart”: the index of the first word to display,   
			“nextWordToDisplay” the index of the first word in the next display,   
			“nextTimeToDisplay”: the start of the first word in the next display  
		}

##### ii. DtwTranscription

_ function instance: It returns an instance of the DtwTranscription class. This class contains information concerning a DTW between two transcriptions. 

* *parameters*
	
	**hypothesis:** a subset of the hypothesis complete transcription content  
	**indexStartHyp:** the index of the first word in the complete transcription content  
	**reference:**  a subset of the hypothesis complete transcription content  
	**indexStartRef:** the index of the first word in the complete transcription content  
	 
* *sub-class*

	**PointDtwTranscription:** regroups the information of a point in the DTW matrix
	
	* *parameters*

		**dtw:** the corresponding DtwTranscription  
		**cost:** the cost calculated by the Dtw on this point  
		**operation:** the corresponding operation (substitution, suppression, insertion)  
		**matrixLine:** The line of the point  
		**matrixCol:** The column of the point  
			
	* *instance variables*
	
		**cost:** the cost calculated by the Dtw on this point  
		**operation:** the corresponding operation (substitution, suppression, insertion)  
		**indexFullHyp:** the index of the corresponding word in the complete hypothesis transcription  
		**indexFullRef:** the index of the corresponding word in the complete reference transcription  

* *instance variables*

	**indexStartHyp:** the index of the first word in the complete transcription content  
	**indexStartRef:** the index of the first word in the complete transcription content  
	**hypothesis:** a subset of the hypothesis complete transcription content  
	**reference:** a subset of the reference complete transcription content  
	**iM:** the maximum line index of the Dtw matrix  
	**jM:** the maximum column index of the Dtw matrix  
	**matrix:** the Dtw matrix  

* *methods*

	**calculate:** fills the matrix with points   
	**givePath:** returns the shortest path  
	
	* *return:* an array of PointDtwTranscription

##### iii. TranscriptionsData (use the services BinarySearch,Indexes and DtwTranscription)

_ function instance: It returns an instance of the TranscriptionData class. This class contains information concerning the transcriptions.

* *parameters*

	**transcriptionTable:**  an array which contains the json data of the different transcriptions (extracted from the json data file)  
	**globalStep:** a step that will be used for each displayed transcription  

* *sub-class*

	**DisplayedTranscription:** regroups the information of a displayed part of a transcription
	
	* *parameters*
	
		**step:**  the number of words currently displayed  
		**id:** the name of the transcription system  
		
	* *instance variables*
	
		**nextWordToDisplay:** the index of the next word to display in the complete transcription   
		**this.currentHighlightedIndex:** the index of the currently highlighted word in the displayed part  
		**this.currentWordStart:** the index of the first word displayed in the complete transcription  
		**this.currentWordEnd:** the index of the last word displayed in the complete transcription  
		**this.step:** the number of word displayed at a time  
		**this.nextTimeToDisplay:** the start of the next word to display  
		**this.transcription:** an array of wordObject to display  
	
	**WordToAdd:** represents a word object that will have to be inserted in a transcription (they are inserted at the end because of the shift)
	
	* *parameters*
	
		**wordObject:**  the wordObject to insert  
		**position:** the index where it should be inserted  
		
	* *instance variables*
	
		**wordObject:**  the wordObject to insert   
		**position:** the index where it should be inserted  

* *instance variables*

	*fullTranscription:** the array of complete transcriptions issued from the json file  
	**globalStep:** the step for all the displayedTranscription  
	**displayedTranscriptions:** an array of DisplayedTranscription (one for each complete transcription)  
	**calculationMessage:** a message about the calculation state of the plugin  
	**message:** a message to inform the user if he is outside the transcription  
	**clickableMessage:** the clickable part of the message  

* *methods*

	**updateDisplayedTranscription:**  updates the content of a displayed transcription
	
	*  *parameter*
	
		**transcriptionNum:** the number of the displayed transcription to update
		
	**timeUpdateDisplay:** updates the display of the transcriptions at a specific time 	
	
	*  *parameter*
		
		**currentTime:** the time for the update
		
	**seekingUpdateDisplay:** updates the display when seeking in the media
	
	* *parameter*
		
		**seekingTime:** the time sought
		
	**initDisplay:** inits the displayed transcriptions
	
	* *parameter*
		
		**timeStart:** the time when the video is started
		
	**addWords:** adds all the word in the complete hypothesis transcriptions
	 
	* *parameter*
		
		**wordsToAddInTranscriptions:** an array of array(one for each transcription except the reference) of WordToAdd objects
		
	**updateTranscriptionsWithDtw:** calculates the DTW between the references and the hypothesis and put the resulting information in the transcriptions
	
	* *parameter*
		
		**segments:** an array of bounds that delimit the sentences used in the DTWs. Each bounds is an size 2 array which contain the start and the end of a sentence
		
	**showCorespondingWordInReferenceWord:** changes the style of a word in the reference (function used when the user point his mouse on a substituted or inserted word in the hypothesis)

	* *parameter*

		**word:** a wordObject which belong to one of the hypothesis

	**hideCorespondingWordInReferenceWord:** restores the style of the reference word when the user's mouse leave the  substituted or inserted word in the hypothesis

	* *parameter*

		**word:** a wordObject which belong to one of the hypothesis

	**adjustTranscriptions:** adds/modifies information to the transcriptions and adjust the hypothesis transcriptions to the reference before anything starts

##### iv. SpeakerBar (use the services Time and Position)

_ function instance: It returns an instance of the SpeakerBar class. This class contains information concerning the speaker bar for the diarization.   

* *parameters*

	**transcription:**  the complete transcription that the bar will describe   
	**transcriptionNum:**  the number of this transcription to identify the bar elements in the page.   
	**colors:** an array of colors that will be used to identify the speakers  

* *sub-class*

	**SpeakerData:** regroups the information of a single speaker
	
	* *parameters*
	
		**spk:** a spk object  
		**color:** the color (string) attributed to this speaker  
		
	* *instance variables*
	
		**spkId:** the id of the speaker  
		**gender:** the gender of the speaker (string)  
		**color:** the color to identify the speaker  
		**speakingPeriods:** an array of size 2 arrays that contains start and ends of a speaking period  
		**speakingStatus:** a string determining if the speaker is actually speaking or not  
		
	* *methods*
	
		**totalTime:** gives the sum of the speaker speech
		
		* *return:* the total amount of time cumulated in speakingPeriods
		
		**totalTimeString:** gives a string representing the sum of the speaker speech
		
		* *return:* a string representing the total time of speech
		
		**addSpeakingPeriod:** add a new speaking period 
	
		* *parameters:*
		
			**start:** the start of the period
			**end:** the end of the period
		
		**moveVideoToSpeechStart:** moves the video to the moment when the speaker speaks for the first time  
		**updateSpeakingStatus:** sets the status to 'speaking' or 'notSpeaking'
	
		* *parameter*
		
			**time:** the time of the update

* *instance variables*

	**transcriptionNum:** the number of the transcription  
	**transcription:** the  complete transcription  
	**timeStart:** the moment when the video start  
	**timeEnd:** the moment when the video end  
	**canvas:** the canvas found in the html page  
	**timer:** the timer found in the html page  
	**canvasWidth:** the width of the canvas  
	**canvasHeight:** the height of the canvas  
	**duration:** the duration of the transcription  
	**colors:** the array of color  
	**speakers:** an array of SpeakerData object  
	**secondarySpeakersTitle:** a title used only if there is secondary speakers (those who share the same color)  

* *methods*

	**mainSpeakers:** gives a sub-array of the principal speakers (those who have their own color)
	
	* *return:* a sub-array of speakers array
		
	**secondarySpeakers:** gives a sub-array of the secondary speakers (those who share the same color)
	
	* *return:* a sub-array of speakers array
		
	**updateSpeakers:** fills the speakers array with SpeakerData objects corresponding to the transcription  
	**setColor:** sets the current color to fill the canvas
	
	* *parameter*
	
		**color:** the color to use
		
	**drawSegment:**  draws a segment in the canvas
	
	* *parameters*
	
		**start:** the moment when when the period to draw begin  
		**width:** the time length of the period to draw  
		
	**drawSpeakers:**  draws all the speakers in the bar  
	**timeUpdate:**  updates the bar corresponding to a specific time  
	
	* *parameter*
	
		**currentTime:** the time to update
		
	**clickUpdate:** updates the video with time corresponding to the spot the user clicked on the bar
	
	* *parameter*
		
		**event:** an $event object

#### 2) searchServices

##### i. BinarySearch

_ function search: perform a binary search

* *parameters*

	**items:** an array in which we search something
	**value:** the value to find
	**accessFunction:** the function to apply on each item to extract the values we search on

* *return:* the index of the value if found. Otherwise an error is returned. -2 is returned if the value we search is inferior to the items given. -3 if it is superior. -1 is returned for the other cases.

#### 3) fileServices

##### i. File (use the service $resource)

- function get: gets a file from assets/files

* *parameter*

	**fileId:**  the object {fileId: 'your.file'} to access assets/files/your.file

* *return:* the file

##### ii. SentenceBoundaries

_ function get: parses the content of a seg file in assets/files into an exploitable array

* *parameter*

	**segfileContent:**  the content of the seg file obtained with File.get

* *return:* an array of {“start”:moment when sentence starts, “end”:moment when sentence ends} objects

#### 4) videoServices

##### i. Video

_ function startVideo: starts the video at at specific time

* *parameters*

	**timeStart:** time to start the video
	**transcriptionsData:** a TranscriptionsData object to init

_ function moveVideo: moves the video at the time corresponding to the word the user clicked on in the page

* *parameter*

	**event:** an $event object

##### ii. Time

_ function format: gives a string representation of a time in second (rounded to the lower value)

* parameter

	**time:** the time to represent

* *return:* a string representation

#### 5) positionServices

##### i. Position

_ function getElementPosition: gives the absolute position of an element in the page

* *parameter*

	**element:** the element in the page

* *return:* an { “x”: abscissa, “y”: ordinate } object giving the coordinates of the left top of the element

_ getMousePosition: gives the coordinates of the mouse position

* *parameter*
	**event:** an $event object

* *return:* an { “x”: abscissa, “y”: ordinate } object giving the coordinates of the left top of the mouse

#### 6) controllerServices

##### i. Controller (uses the services Video, File, Restangular, SentenceBoundaries, TranscriptionsData and SpeakerBar)

_ function initializeTranscriptionComparisonCtrl: initializes the controller for the transcription comparator

* *parameters*

	**scope:** a $scope object  
	**globalStep:** the step used for every displayed transcription  

_ function initializeDiarizationCtrl: initializes the controller for the diarization viewer

* *parameters*

	**scope:** a $scope object  
	**globalStep:** the step used for every displayed transcription  
	**transcriptionNum:** the number of the transcription used for this bar  
	**colors:** an array of the colors used to represent the speakers  

