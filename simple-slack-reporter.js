(function () {
  const NodeSlack = require('node-slack');
  const SlackReporter = (function () {
    function SlackReporter(runner, options) {
      const slack = new NodeSlack(options.reporterOptions.hook_url);
      var errors = '';
      runner.on("fail", function (test, err) {
        errors+=`*_FAIL_ - * *${test.parent.parent.title} ${test.parent.title} ${test.title}*\n>${err}\n`;
      });
      // evaluate minimal as both boolean and string => reporter-options entered on cli register as strings
      if (!options.reporterOptions.minimal || options.reporterOptions.minimal == 'false') {
        runner.on("pass", function (test, err) {
          errors+=`*_PASS_ - * *${test.parent.parent.title} ${test.parent.title} ${test.title}*\n>${err?err:''}\n`;
        });
      }
      runner.once("end", function () {
        slack.send({text: errors});
      });
    }
    return SlackReporter;
  })();
  module.exports = SlackReporter;
}).call(this);