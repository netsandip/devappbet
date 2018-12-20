var async =  require('async');
async.waterfall([
  function firstStep(done) {
    console.log('start!');

    done(null, 'Value from step 1'); // <- set value to passed to step 2
  },
  function secondStep(step1Result, done) {
    console.log(step1Result);

    done(null, 'Value from step 2'); // <- set value to passed to step 3
  },
  function thirdStep (step2Result, done) {
    console.log(step2Result);

    done(null, "I am from 3"); // <- no value set for the next step.
  },
  function fourthStep(step3Result, done) {
      console.log(step3Result);

      done(null);
  }
],
function (err) {
  if (err) {
    throw new Error(err);
  } else {
    console.log('No error happened in any steps, operation done!');
  }
});