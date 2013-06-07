basePath = '../../';

files = [
  JASMINE,
  JASMINE_ADAPTER,
  'public/javascripts/lodash.compat.min.js',
  'public/javascripts/jquery-1.10.1.min.js',
  'public/javascripts/angular/lib/angular.min.js',
  'public/javascripts/angular/lib/angular-*.js',
  'public/javascripts/angular/lib/restangular.min.js',
  'test/javascript/lib/angular/angular-mocks.js',
  'public/javascripts/angular/*.js',
  'test/javascript/unit/**/*.js'
];

autoWatch = true;

browsers = ['Firefox'];

junitReporter = {
  outputFile: 'test_out/unit.xml',
  suite: 'unit'
};
