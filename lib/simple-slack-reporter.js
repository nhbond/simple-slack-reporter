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
  var slack = [];
  var results = [];
  var header = '';
  var currentTitle = '';
  const indent = '    ';

  //create a node-slack object for each hook
  for (hook of options.reporterOptions.hook_urls) {
    slack[hook.run_title] = new NodeSlack(hook.hook_url);
  }

  runner
    .on(EVENT_SUITE_BEGIN, function(suite) {
      results = [];
      header = '';
      if (!results[suite.title]) results[suite.title] = '';
      if (suite.fullTitle() != currentTitle){
        currentTitle = suite.fullTitle();
        header += `*${currentTitle}*:\n`;
      }
    })
    .on(EVENT_TEST_FAIL, function (test, err) {
      // FAIL - [X] [with(out) Y] [should Z]
      results[test.parent.title] += `> *_FAIL_ - * *${test.title}*\n>${indent.repeat(2)}:x: ${err}\n`;
    })
    .on(EVENT_TEST_PASS, function (test, err) {
      // evaluate minimal as both boolean and string => reporter-options entered on cli register as strings
      if (!options.reporterOptions.failOnly || options.reporterOptions.failOnly == 'false') {
        results[test.parent.title] += `> *_PASS_ - * *${test.title}*\n${err?`>${indent.repeat(2)}:x: ${err}\n`:''}`;
      }})
    .on(EVENT_SUITE_END, function(suite_end) {
      if (results[suite_end.title]) slack[suite_end.parent.title].send({text: header + results[suite_end.title]});
    })
    .once(EVENT_RUN_END, function () {
      console.log("Test Complete!\n\n");
    });
}

module.exports = SlackReporter;