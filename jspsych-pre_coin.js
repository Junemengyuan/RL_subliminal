/**
* jspsych-pre_coin
* Mengyuan Liu
*
* plugin for displaying coins and questions
*
**/

jsPsych.plugins["pre_coin"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('pre_coin', 'stimuli', 'image');

  plugin.info = {
    name: 'pre_coin',
    description: '',
    parameters: {
     practice_experiment: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'practice_experiment',
        default: 0,
        description: 'whether this is a practice or experiment trial; 0 is practice and 1 is experiment'
      },
      chioce: {
      	type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'chioce',
        default: jsPsych.ALL_KEYS,
        array: true,
        description: 'Chioces for the question.'
      },
      question_text: {
      	type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'question_text',
        default: null,
        description: 'Any content here will be displayed after pictures.'
      },
      repetition: {
      	type: jsPsych.plugins.parameterType.INT,
      	pretty_name: 'repetition',
      	default: 1,
      	description: 'repetition of trials'
      }
  }
}


plugin.trial = function(display_element,trial) {

	var trial_rep = 0;
  var keyboard_answer;
  var exit_pre_coin;
  var trial_data_pre;
  var coin_correct = null;
  var key_pressed;
  var per_data_pre;
  var saw_coin;
  var coin_duration = -1;
  var post_mask_duration = -1;

  var rep_function = function() {

    if (trial.practice_experiment) {
      //experiment
      if (Math.ceil((trial_rep+1)/20)==1) {
        //51ms
        coin_duration = 51;
        post_mask_duration = 600-coin_duration;
      }
      else if (Math.ceil((trial_rep+1)/20)==2) {
        //34ms
        coin_duration = 34;
        post_mask_duration = 600-coin_duration;
      }
      else if (Math.ceil((trial_rep+1)/20)==3) {
        //17ms
        coin_duration = 17;
        post_mask_duration = 600-coin_duration;
      }
    }
    else {
      //practice
      if (trial_rep==0) {
        //51ms
        coin_duration = 51;
        post_mask_duration = 600-coin_duration;
      }
      else if (trial_rep==2) {
        //34ms
        coin_duration = 34;
        post_mask_duration = 600-coin_duration;
      }
      else if (trial_rep==4) {
        //17ms
        coin_duration = 17;
        post_mask_duration = 600-coin_duration;
      }
    }

    display_element.innerHTML = '<img class="jspsych-pre-coin" id="jspsych-pre-coin1" src="plus.jpg"></img>';

    jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-pre-coin1').style.visibility = 'hidden';
        display_element.innerHTML = '<img id="jspsych-pre-coin2" class="jspsych-pre-coin" src="'+show_coin+'"></img>';
      }, 17);
  };

    //show different images
    	jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-pre-coin1').style.visibility = 'hidden';
        display_element.innerHTML = '<img id="jspsych-pre-coin2" class="jspsych-pre-coin" src="mask.jpg"></img>';
        second_change();
      }, 1000);
  };

    var second_change = function() {
    		jsPsych.pluginAPI.setTimeout(function() {
    			display_element.querySelector('#jspsych-pre-coin2').style.visibility = 'hidden';
    			display_element.innerHTML = '<img id="jspsych-pre-coin3" class="jspsych-pre-coin" src="'+coin_sequence[picture_coin]+'"></img>';
    			third_change();
    		}, 400);
    };

    var third_change = function() {
    		jsPsych.pluginAPI.setTimeout(function() {
    			display_element.querySelector('#jspsych-pre-coin3').style.visibility = 'hidden';
    			display_element.innerHTML = '<img id="jspsych-pre-coin4" class="jspsych-pre-coin" src="mask.jpg"></img>';
    			fourth_change();
    		},coin_duration);
    };

    var fourth_change = function() {
    		jsPsych.pluginAPI.setTimeout(function() {
    			display_element.querySelector('#jspsych-pre-coin4').style.visibility = 'hidden';
    			fifth_change();
    		},post_mask_duration);
    };

    //stop for a while and then show the question
    //the getKeyboard is for response
    var fifth_change = function() {
    	jsPsych.pluginAPI.setTimeout(function() {
    		display_element.innerHTML += trial.question_text;

        //get participant's response
        keyboard_answer = jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: question_invisible,
          valid_responses: trial.choice,
          rt_method: 'performance',
          persist: false,
          allow_held_key: false
        });

    	},1000);
    };

    //let all clean up
    var question_invisible = function(info) {
      display_element.innerHTML = '';
      picture_coin++;
      trial_rep++;
      key_pressed = jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(info.key);

      //analyze whether coin is saw or guessed
      if (key_pressed=='d' || key_pressed=='f') {
          saw_coin=1;
      }
      else {
          saw_coin=0;
      }

      //analyze whether the answer is right
      if (coin_sequence[picture_coin-1]=='Nickel.jpg') {
        if (key_pressed=='a'||key_pressed=='d') {
          coin_correct=1;
        }
        else{
          coin_correct=0;
        }
      }
      else {
        if (key_pressed=='s'||key_pressed=='f') {
          coin_correct=1;
        }
        else{
          coin_correct=0;
        }
      }

      //collect data
      trial_data_pre = {
        "practice_experiment":trial.practice_experiment,
        "trial": trial_rep,
        "duration":coin_duration,
        "stimulus": JSON.stringify(coin_sequence[picture_coin-1]),
        "rt": info.rt,
        "correct": coin_correct,
        "saw":saw_coin,
        "key_press": key_pressed
      }
      jsPsych.data.get().push(trial_data_pre);

      if (trial_rep<trial.repetition) {
        rep_function();
      }
      else {
        //analyze to find the threshold time
        //detect whether it is 17ms
        if (trial.practice_experiment){
          var done_data = jsPsych.data.get().filterCustom(function(trial){
         if ((trial.correct==0)||(trial.correct==1)){
          if (trial.trial_index!=4) {
            return true;
          }
          else {
            return false;
          }
         }
         else {
            return false;
          }
        });
          var correct_data = done_data.select('saw').mean();
        if (correct_data>0.5) {
          threshold_time = -1
          display_element.innerHTML = '<p style="text-align:center;color:white;font-size: 200%;width:80%;top:150px;left:10%;position:relative;">We are sorry that you are not eligible for following tasks</p>'+
          '<p style="text-align:center;color:white;font-size: 200%;width:80%;top:150px;left:10%;position:relative;">Please press space to exit the pre-test</p>'
          jsPsych.pluginAPI.cancelKeyboardResponse(keyboard_answer);
          exit_pre_coin = jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: endTrial,
          valid_responses: ['space'],
          rt_method: 'performance',
          persist: false,
          allow_held_key: false
        });
        }
        else {
          done_data = jsPsych.data.get().filter([{correct:1,duration:34},{correct:0,duration:34}]);
          correct_data = done_data.select('saw').mean();
          if (correct_data>0.5) {
            threshold_time = 17
            display_element.innerHTML = '<p style="text-align:center;color:white;font-size: 200%;width:80%;top:150px;left:10%;position:relative;">This is the end of pre-test</p>'+
            '<p style="text-align:center;color:white;font-size: 200%;width:80%;top:150px;left:10%;position:relative;">Please press space to enter the next task</p>'
            jsPsych.pluginAPI.cancelKeyboardResponse(keyboard_answer);
            exit_pre_coin = jsPsych.pluginAPI.getKeyboardResponse({
            callback_function: endTrial,
            valid_responses: ['space'],
            rt_method: 'performance',
            persist: false,
            allow_held_key: false
            });
          }
          else {
            done_data = jsPsych.data.get().filter([{correct:1,duration:51},{correct:0,duration:51}]);
            correct_data = done_data.select('saw').mean();
            if (correct_data>0.5) {
            threshold_time = 34
            display_element.innerHTML = '<p style="text-align:center;color:white;font-size: 200%;width:80%;top:150px;left:10%;position:relative;">This is the end of pre-test</p>'+
            '<p style="text-align:center;color:white;font-size: 200%;width:80%;top:150px;left:10%;position:relative;">Please press space to enter the next task</p>'
            jsPsych.pluginAPI.cancelKeyboardResponse(keyboard_answer);
            exit_pre_coin = jsPsych.pluginAPI.getKeyboardResponse({
            callback_function: endTrial,
            valid_responses: ['space'],
            rt_method: 'performance',
            persist: false,
            allow_held_key: false
            });
          }
          else {
              threshold_time = -1
            display_element.innerHTML = '<p style="text-align:center;color:white;font-size: 200%;width:80%;top:150px;left:10%;position:relative;">We are sorry that you are not eligible for following tasks</p>'+
            '<p style="text-align:center;color:white;font-size: 200%;width:80%;top:150px;left:10%;position:relative;">Please press space to exit the pre-test</p>'
            jsPsych.pluginAPI.cancelKeyboardResponse(keyboard_answer);
            exit_pre_coin = jsPsych.pluginAPI.getKeyboardResponse({
              callback_function: endTrial,
              valid_responses: ['space'],
              rt_method: 'performance',
              persist: false,
              allow_held_key: false
            });
          }
          }
        }
        }
        else {
          endTrial();
        }
        
      
       // endTrial();
      }
    };
    

    //end the whole trial
    function endTrial() {
      display_element.innerHTML = ''
      jsPsych.pluginAPI.clearAllTimeouts(); //clearTimeout
      jsPsych.pluginAPI.cancelAllKeyboardResponses();
      jsPsych.finishTrial(trial_data_pre);
    }

    rep_function();
}
	return plugin;

})();
