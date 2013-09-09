'use strict';

/* App Module */
angular.module('liumsg', ['restangular', 'searchServices', 'transcriptionServices', 'ngUpload','fileServices','videoServices','positionServices','controllerServices'])
  .config(function(RestangularProvider) {
    RestangularProvider.setBaseUrl("http://localhost\\:9000");
})
/* Allows tooltips */
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
