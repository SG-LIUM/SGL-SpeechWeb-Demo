function UploadCtrl($scope) {
  $scope.uploadComplete = function (content, completed) {
    if (completed) {
        console.log(content);
        $scope.response = content; // Presumed content is a json string!
    }
  };
}

function TranscriptionCtrl($scope, $log, $http, Controller) {
    Controller.initialize($scope);
}

