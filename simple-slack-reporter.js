(function () {
  const NodeSlack = require('node-slack');
  const SlackReporter = (function () {
    function SlackReporter(runner, options) {
      const slack = new NodeSlack(options.reporterOptions.hook_url);
      var errors = '';
      runner.on("fail", function (test, err) {
        errors+=`*${test.parent.parent.title} ${test.parent.title} ${test.title}*\n>${err}\n`;
      });
      runner.once("end", function () {
        slack.send({text: errors});
      });
    }
    return SlackReporter;
  })();
  module.exports = SlackReporter;
}).call(this);