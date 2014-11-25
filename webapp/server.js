var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var path = require('path')

var app = express();

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({type: 'application/vnd.api+json'}));
app.use(methodOverride());

app.use(express.static(path.resolve(__dirname, '.tmp')));
app.use('/bower_components', express.static(path.resolve(__dirname, 'bower_components')));
app.use(express.static(path.resolve(__dirname, 'app')));
app.use('/pagedown', express.static(path.resolve(__dirname, '../pagedown')))
app.use('/pagedown', express.static(path.resolve(__dirname, '..')))

module.exports = app;

var documentRoutes = require('./server/routes/documents');
app.use('/documents', documentRoutes);
