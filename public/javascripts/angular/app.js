'use strict';

/* App Module */
angular.module('liumsg', ['restangular', 'searchServices', 'transcriptionServices', 'ngUpload'])
  .config(function(RestangularProvider) {
    RestangularProvider.setBaseUrl("http://localhost\\:9000");
  });
