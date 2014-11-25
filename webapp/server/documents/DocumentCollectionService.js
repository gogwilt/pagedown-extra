var Promise = require("bluebird");
var request = Promise.promisifyAll(require("request"));
var path = require("path");
var fs = Promise.promisifyAll(require("fs"));
var _ = require('lodash');

var DocumentCollectionService = {};

var docsPath = path.resolve('.', 'form-documents');

DocumentCollectionService.getCollections = function() {
  return fs.readdirAsync(docsPath)
  .then(function(fileNames) {
    return Promise.all(_.map(fileNames, function(fileName) {
      return fs.lstatAsync(path.resolve(docsPath, fileName))
      .then(function(stat) {
        if (stat.isDirectory()) {
          return fileName;
        } else {
          return null;
        }
      });
    }));
  })
  .then(function(files) {
    return _.reject(files, _.isNull);
  });

  // return request.getAsync({
  //   headers: {
  //     "User-Agent": "legaldown web app"
  //   },
  //   url: "https://api.github.com/repos/gogwilt/pagedown-extra/contents/"
  // });
}

DocumentCollectionService.getDocuments = function(collectionName) {
  return fs.readdirAsync(path.resolve(docsPath, collectionName));
}

DocumentCollectionService.getDocumentContents = function(collectionName, documentName) {
  return fs.readFileAsync(path.resolve(docsPath, collectionName, documentName));
}

module.exports = DocumentCollectionService;
