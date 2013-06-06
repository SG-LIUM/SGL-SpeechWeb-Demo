function TranscriptionCtrl($scope, Restangular) {
  $scope.transcriptions = Restangular.one('audiofiles.json', 6).getList('transcriptions')
}
