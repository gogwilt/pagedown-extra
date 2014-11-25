var MarkdownVariables;

if (typeof exports === "object" && typeof require === "function")
  MarkdownVariables = exports;
else
  MarkdownVariables = {};

(function() {
  MarkdownVariables.getVariablesFromMarkdown = function (contents) {
    return contents.match(/\[(.*?)\]/g);
  };

  MarkdownVariables.setVariableValues = function(values, contents) {
    for (var varName in values) {
      contents = contents.replace(varName, values[varName]);
    }
    return contents;
  };
})();
