function UploadCtrl($scope) {
  $scope.uploadComplete = function (content, completed) {
    if (completed) {
        console.log(content);
        $scope.response = content; // Presumed content is a json string!
    }
  };
}

function TranscriptionCtrl($scope, $log, $http, Controller) {
   Controller.initializeTranscriptionComparisonCtrl($scope,50,['yellow','cyan','pink','GreenYellow','orange','#FF6699','blue','red','#33CCFF','green','black','white','purple']);
}
 
function SpeakerCtrl($scope, $log, $http, Controller) {
	Controller.initializeDiarizationCtrl($scope,100,0,['yellow','cyan','pink','GreenYellow','orange','blue','red','green']);
}