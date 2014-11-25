'use strict';

/**
 * @ngdoc function
 * @name webappApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the webappApp
 */
angular.module('webappApp')
  .controller('MainCtrl', function ($scope, $http) {
    $http.get('/documents/')
    .success(function(data, status) {
      $scope.projects = data;
    });

    $scope.selectCollection = function(collectionName) {
      // On collection change, read all the documents and their contents.
      $http.get('/documents/' + collectionName)
      .success(function(data, status) {
        $scope.documents = _.map(data, function(docName) {
          return {docName: docName};
        });
        var docMap = {};
        _.each($scope.documents, function(doc) {
          docMap[doc.docName] = doc;
        });
        _.each($scope.documents, function(doc) {
          $http.get('/documents/' + collectionName + '/' + doc.docName)
          .success(function(data, status) {
            docMap[doc.docName].contents = data;
          });
        });
      });
    };
  })
  .controller('ldRenderedMarkdownCtrl', function($scope, $sce) {
    var converter = Markdown.getSanitizingConverter();
    Markdown.Extra.init(converter, {extensions: "all"});
    $scope.computeHtmlContents = function(contents) {
      if (contents) {
        return $sce.trustAsHtml(converter.makeHtml(contents));
      } else {
        return null;
      }
    };
  })
  .directive('ldRenderedMarkdown', function() {
    return {
      restrict: 'A',
      controller: 'ldRenderedMarkdownCtrl',
      transclude: true,
      template: '<div class="ld-preview" data-ng-bind-html="computeHtmlContents(contents)"></div>',
      scope: {
        contents: '=contents'
      }
    }
  });
