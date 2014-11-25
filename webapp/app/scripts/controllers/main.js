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
    $scope.variableValues = {};

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
            $scope.identifyVariables();
          });
        });
      });
    };

    $scope.identifyVariables = function() {
      if ($scope.documents) {
        var allContentsLoaded = _.all($scope.documents, function(doc) {
          return doc.contents;
        });
        if (allContentsLoaded) {
          $scope.variables = _.chain($scope.documents)
          .map(function(doc) {
            return MarkdownVariables.getVariablesFromMarkdown(doc.contents);
          })
          .flatten()
          .uniq()
          .value();
        }
      }
    };
  })
  .controller('ldRenderedMarkdownCtrl', function($scope, $sce) {
    var converter = Markdown.getSanitizingConverter();
    var contentCache = {}
    Markdown.Extra.init(converter, {extensions: "all"});
    $scope.computeHtmlContents = function(contents) {
      if (contents) {
        if (!contentCache[contents]) {
          contentCache[contents] = converter.makeHtml(contents);
        }
        var variableValues = {};
        _.each($scope.variableValues, function(value, key) {
          if (value && value.length !== 0) {
            variableValues[key] = value;
          }
        });
        var interpolatedContents = MarkdownVariables.setVariableValues(variableValues, contentCache[contents]);
        return $sce.trustAsHtml(interpolatedContents);
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
        contents: '=contents',
        variableValues: '=variableValues'
      }
    }
  });
