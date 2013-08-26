'use strict';

/* App Module */
angular.module('liumsg', ['restangular', 'searchServices', 'transcriptionServices', 'ngUpload','fileServices','videoServices','positionServices','controllerServices'])
  .config(function(RestangularProvider) {
    RestangularProvider.setBaseUrl("http://localhost\\:9000");
  });
