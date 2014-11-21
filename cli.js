#! /usr/bin/env node

'use strict';

var fs = require('fs');
var path = require('path');

var Markdown = require('./pagedown/Markdown.Converter');
var Sanitizer = require('./pagedown/Markdown.Sanitizer');
var MarkdownExtra = require('./Markdown.Extra.js').Extra;

var userArgs = process.argv;
var mdFile = userArgs[2];
var targetFolder = userArgs[3];

if (userArgs.indexOf('-h') !== -1 || userArgs.indexOf('--help') !== -1 || mdFile === undefined || targetFolder === undefined) {
  return console.log('Usage: ./cli markdown_file.md folder_to_export_to');
}

if (userArgs.indexOf('-v') !== -1 || userArgs.indexOf('--version') !== -1) {
  return console.log(require('./package').version);
}

if (mdFile !== undefined && targetFolder !== undefined) {
  mdFile = absolutePath(mdFile);
  targetFolder = absolutePath(targetFolder);

  var data = fs.readFileSync(mdFile, 'utf8');
  var converter = Sanitizer.getSanitizingConverter();
  MarkdownExtra.init(converter, {extensions: "all"})
  var html = converter.makeHtml(data);
  try {
    fs.mkdirSync(targetFolder);
  } catch (err) {
    // Nothing. Probably just existed
  }
  fs.writeFileSync(path.resolve(targetFolder, 'doc.html'),
    makeFullHtml(html));
  copyCssFile(targetFolder);
  return console.log('wrote to folder', targetFolder);
}

function absolutePath(mdFile) {
  if (path.resolve(mdFile)!==mdFile) {
    mdFile = path.resolve(process.cwd(), mdFile);
  }
  return mdFile;
}

function makeFullHtml(html) {
  var cssFile = 'style.css';

  return "<html><head><link rel=\"stylesheet\" type=\"text/css\" href=\"" +
    cssFile + "\" /></head><body>" + 
    html + "</body></html>";
}

function copyCssFile(targetFolder) {
  var cssPath = path.resolve(path.dirname(userArgs[1]), 'demo', 'legaldown-styles.css');

  fs.writeFileSync(path.resolve(targetFolder, 'style.css'),
    fs.readFileSync(cssPath, 'utf8'));
}
