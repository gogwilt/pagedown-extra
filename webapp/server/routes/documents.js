var express = require("express");
var request = require("request");
var DocumentCollectionService = require("../documents/DocumentCollectionService")

var router = express.Router();

router.get('/', function (req, res) {
  DocumentCollectionService.getCollections()
  .then(function(collections) {
    res.status(200).json(collections);
  })
  .caught(function(err) {
    console.error(err);
    res.status(404).send(err);
  });
});

router.get('/:collectionName/', function(req, res) {
  DocumentCollectionService.getDocuments(req.params.collectionName)
  .then(function(documents) {
    res.status(200).json(documents);    
  })
  .caught(function(err) {
    console.error(err);
    res.status(404).send(err);
  });
});

router.get('/:collectionName/:documentName', function(req, res) {
  DocumentCollectionService.getDocumentContents(req.params.collectionName, req.params.documentName)
  .then(function(contents) {
    res.status(200).send(contents);
  })
  .caught(function(err) {
    console.error(err);
    res.status(404).send(err);
  });
});

module.exports = router;
