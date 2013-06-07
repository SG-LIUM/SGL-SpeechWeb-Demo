'use strict';

/* App Module */
angular.module('liumsg', ['restangular', 'searchServices'])
  .config(function(RestangularProvider) {
    RestangularProvider.setBaseUrl("http://localhost\\:9000");
  });
