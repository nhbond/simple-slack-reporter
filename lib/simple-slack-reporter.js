const Mocha = require('mocha');
const NodeSlack = require('node-slack');
const {
  EVENT_RUN_BEGIN,
  EVENT_RUN_END,
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
  EVENT_SUITE_BEGIN,
  EVENT_SUITE_END
} = Mocha.Runner.constants;

function SlackReporter(runner, options) {
  const slack = new NodeSlack(options.reporterOptions.hook_url);
  const indent = '    ';
  var results = '';
  var header = '';
  var currentTitle = '';  runner
    .on(EVENT_SUITE_BEGIN, function(suite) {
      results = ''
      header = ''
      if (suite.fullTitle != currentTitle){
        currentTitle = suite.fullTitle();
        header += `*${currentTitle}*:\n`;
      }
    })
    .on(EVENT_TEST_FAIL, function (test, err) {
      // FAIL - [X] [with(out) Y] [should Z]
      results+=`> *_FAIL_ - * *${test.parent.title} ${test.title}*\n>${indent.repeat(2)}:x: ${err}\n`;
    })
    .on(EVENT_TEST_PASS, function (test, err) {
      // evaluate minimal as both boolean and string => reporter-options entered on cli register as strings
      if (!options.reporterOptions.failOnly || options.reporterOptions.failOnly == 'false') {
        results+=`> *_PASS_ - * *${test.parent.title} ${test.title}*\n${err?`>${indent.repeat(2)}:x: ${err}\n`:''}`;
      }})
    .on(EVENT_SUITE_END, function() {
      if (results) slack.send({text: header + results});
      setTimeout({},1000);
    })
    .once(EVENT_RUN_END, function () {
      console.log("Test Complete!\n\n");
    });
}

module.exports = SlackReporter;