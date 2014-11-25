describe("MarkdownVariables", function() {
  describe("#getVariablesFromMarkdown", function() {
    describe("when there are two simple variables", function() {
      var variableString;
      var variables;

      beforeEach(function() {
        variableString = "[Company Name] is recognized to be valued at [Company Value]";
        variables = MarkdownVariables.getVariablesFromMarkdown(variableString);
      });

      it("should recognize two variables", function() {
        expect(variables.length).toEqual(2);
      });
    });
  })
});