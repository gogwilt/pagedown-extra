'use strict';

var anchorSafeVariableName = function(name) {
  return name.replace(/\s/g, '-').replace(/\[(.*)\]/, "$1");
}

/**
 * @ngdoc function
 * @name webappApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the webappApp
 */
angular.module('webappApp')
  .controller('MainCtrl', function ($scope, $http) {
    $scope.variables = {};
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
          $scope.variables.names = _.chain($scope.documents)
          .map(function(doc) {
            return MarkdownVariables.getVariablesFromMarkdown(doc.contents);
          })
          .flatten()
          .uniq()
          .value();
        }
      }
    };

    var scrollToVariable = function(variableName) {
      var variableId = 'ld-variable-'+anchorSafeVariableName(variableName);
      var elt = $('#'+variableId);
      var scroller = $('#ld-document-collection-preview');
      scroller.animate({scrollTop: elt.offset().top + scroller.scrollTop() - scroller.offset().top}, 500);
    };

    $scope.focusVariable = function(variableName) {
      scrollToVariable(variableName);
      $scope.variables.focusedVariable = variableName;
    }
  })
  .controller('ldRenderedMarkdownCtrl', function($scope, $sce) {
    var converter = Markdown.getSanitizingConverter();
    var contentCache = {}
    Markdown.Extra.init(converter, {extensions: "all"});

    var insertVariableAnchors = function(html, focusedVariable) {
      var variableNames = $scope.variables.names;
      if (!variableNames) {
        variableNames = [];
      }
      for (var i=0; i < variableNames.length; i++) {
        var variableName = variableNames[i];
        var spanTag = '<span id="ld-variable-' + anchorSafeVariableName(variableName) + '"' +
          ' class="ld-variable';
        if (focusedVariable === variableName) {
          spanTag += ' ld-focused-variable'
        }
        spanTag += '">'
        html = html.replace(variableName,
          spanTag + variableNames[i] + '</span>');
      }
      return html;
    }

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
        var interpolatedContents = contentCache[contents];
        interpolatedContents = insertVariableAnchors(interpolatedContents, $scope.variables.focusedVariable);
        interpolatedContents = MarkdownVariables.setVariableValues(variableValues, interpolatedContents);
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
        variableValues: '=variableValues',
        variables: '=variables'
      }
    }
  });
