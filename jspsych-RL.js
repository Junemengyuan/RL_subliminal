/**
* jspsych-RL
* Mengyuan Liu
*
* plugin for displaying coins and questions
*
**/

jsPsych.plugins["RL"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('RL', 'stimuli', 'image');

  plugin.info = {
    name: 'RL',
    description: '',
    parameters: {
      chioces: {
      	type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'chioces',
        default: jsPsych.ALL_KEYS,
        array: true,
        description: 'Chioces for the question.'
      },
      repetition: {
      	type: jsPsych.plugins.parameterType.INT,
      	pretty_name: 'repetition',
      	default: 1,
      	description: 'repetition of trials'
      },
      practice_experiment: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'practice_experiment',
        default: 0,
        description: 'whether this is a practice or experiment trial; 0 is practice and 1 is experiment'
      },
      rate_array11: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'rate_array',
        default: undefined,
        array: true,
        description: 'the rate of quarter for the 1_1'
      },
      rate_array12: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'rate_array',
        default: undefined,
        array: true,
        description: 'the rate of quarter for the 1_2'
      }
    }
  }


plugin.trial = function(display_element,trial) {

  var trial_data_RL = {};
  //data of each trial
  var new_data_RL = {};
  var trial_rep = 1;
  var group_choice = -1;
  var group_location = -1;
  var picture_choice = -1;
  var rate1 = 0.5;
  var random_rate = -1;
  //coin show time
  var coin_flash_time = -1;
  //post-mask time
  var post_mask_time = -1;
  //coin shown
  var show_coin = 'NA';
  //reward subject wins in one trial
  var reward = -1;
  //culmulative reward
  var overall_reward = 0;
  //bonus
  var bonus = 0;
  var show_number;
  var first_choice = 'NA';
  var key_pressed = 'NA';
  //key for first choice
  var keyboard_handle;
  //key for first warning
  var keyboard_handle1;
  //key for the second choice
  var keyboard_handle2;
  //key for the second warning
  var keyboard_handle3;
  //key for the final exist
  var keyboard_handle4;
  var reaction_time1 = -1;
  var reaction_time2 = -1;
  var wt1;
  var wt2;
  var warning_text1 = '<p style="text-align:center;color:white;font-size: 200%;width:80%;top:150px;left:10%;position:relative;">Too slow! Please press SPACE to enter the next trial</p>';
  var warning_text2 = '<p style="text-align:center;color:white;font-size: 200%;width:80%;top:150px;left:10%;position:relative;">Too slow! Please press space to enter the next trial</p>';
  var instr_text1 = '<p style="text-align:center;color:white;font-size: 200%;width:80%;top:500px;left:10%;position:relative;">Please choose between two pictures using left and right keys in 2 seconds</p>';
  var instr_text2 = '<p style="text-align:center;color:white;font-size: 200%;width:80%;top:600px;left:10%;position:relative;">Please press space</p>';
  var result_text = '';

  var rep_RL_function = function() {
    //decide whether practice or experiment
    //decide whether supraliminal or subliminal
    if (trial.practice_experiment) {
      //experiment
      if (Math.ceil(trial_rep/20)%2==0) {
        //subliminal
        coin_flash_time = threshold_time;
        post_mask_time = 600-coin_flash_time;
      }
      else {
        //supraliminal
        coin_flash_time = 583;
        post_mask_time = 600-coin_flash_time;
      }
    }
    else {
      //practice
      if (trial_rep>3) {
        //subliminal
        coin_flash_time = threshold_time;
        post_mask_time = 600-coin_flash_time;
      }
      else {
        //supraliminal
        coin_flash_time = 583;
        post_mask_time = 600-coin_flash_time;
      }
    }

    //**choose one of pink/blue picture

    //randomly choose pink(1) or blue(0) group
    group_choice = Math.round(Math.random());

    //randomly choose two pictures' location: odd left(1) or odd right(0)
    group_location = Math.round(Math.random());

    //if using more than 2 seconds in the first chioce
    var warning_time1 = function(){
      wt1 = jsPsych.pluginAPI.setTimeout(function(){
      display_element.innerHTML = warning_text1;
      jsPsych.pluginAPI.cancelKeyboardResponse(keyboard_handle);
      keyboard_handle1 = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: collect_data,
        valid_responses: ['space'],
        rt_method: 'performance',
        persist: false,
        allow_held_key: false
      })
    },2000);
    //warning_time1
    };

    //show pictures
    if(group_choice) {
      if (group_location) {
        picture_choice = 1;
        display_element.innerHTML = '<img src="2_1.png" style="position:absolute;top:25%;left:22%;"></img>'+
        '<img src="2_2.png" style="position:absolute;top:25%;left:58%;"></img>'+instr_text1
        warning_time1();
      }
      else {
        picture_choice = 2;
        display_element.innerHTML = '<img src="2_2.png" style="position:absolute;top:25%;left:22%;"></img>'+
        '<img src="2_1.png" style="position:absolute;top:25%;left:58%;"></img>'+instr_text1
        warning_time1();
      }
    }
    else {
      if (group_location) {
        picture_choice = 3;
        display_element.innerHTML = '<img src="2_3.png" style="position:absolute;top:25%;left:22%;"></img>'+
        '<img src="2_4.png" style="position:absolute;top:25%;left:58%;"></img>'+instr_text1
        warning_time1();
      }
      else {
        picture_choice = 4;
        display_element.innerHTML = '<img src="2_4.png" style="position:absolute;top:25%;left:22%;"></img>'+
        '<img src="2_3.png" style="position:absolute;top:25%;left:58%;"></img>'+instr_text1
        warning_time1();
      }
    }

    //**show choose accept coin
    var accept_picture = function(info) {
      //record key_pressed and which the participant chooses
      key_pressed = jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(info.key);
      reaction_time1 = info.rt
      if (key_pressed=='leftarrow') {
        clearTimeout(wt1);
        if (picture_choice==1) {
          first_choice = '2_1';
          display_element.innerHTML = '<img src="2_1.png" style="width:10%;position:absolute;top:10%;left:45%;"></img>' +
          '<img src="1_1.png" style="width:20%;position:absolute;top:40%;left:40%;"></img>'+instr_text2
          accept_green();
        }
        else if (picture_choice==2) {
          first_choice = '2_2';
          display_element.innerHTML = '<img src="2_2.png" style="width:10%;position:absolute;top:10%;left:45%;"></img>' +
          '<img src="1_2.png" style="width:20%;position:absolute;top:40%;left:40%;"></img>'+instr_text2
          accept_green();
        }
        else if (picture_choice==3) {
          first_choice = '2_3';
          display_element.innerHTML = '<img src="2_3.png" style="width:10%;position:absolute;top:10%;left:45%;"></img>' +
          '<img src="1_1.png" style="width:20%;position:absolute;top:40%;left:40%;"></img>'+instr_text2
          accept_green();
        }
        else if (picture_choice==4) {
          first_choice = '2_4';
          display_element.innerHTML = '<img src="2_4.png" style="width:10%;position:absolute;top:10%;left:45%;"></img>' +
          '<img src="1_2.png" style="width:20%;position:absolute;top:40%;left:40%;"></img>'+instr_text2
          accept_green();
        }
      }
      else if (key_pressed=='rightarrow') {
        clearTimeout(wt1);
        if (picture_choice==1) {
          first_choice = '2_2';
          display_element.innerHTML = '<img src="2_2.png" style="width:10%;position:absolute;top:10%;left:45%;"></img>' +
          '<img src="1_2.png" style="width:20%;position:absolute;top:40%;left:40%;"></img>'+instr_text2
          accept_green();
        }
        else if (picture_choice==2) {
          first_choice = '2_1';
          display_element.innerHTML = '<img src="2_1.png" style="width:10%;position:absolute;top:10%;left:45%;"></img>' +
          '<img src="1_1.png" style="width:20%;position:absolute;top:40%;left:40%;"></img>'+instr_text2
          accept_green();
        }
        else if (picture_choice==3) {
          first_choice = '2_4';
          display_element.innerHTML = '<img src="2_4.png" style="width:10%;position:absolute;top:10%;left:45%;"></img>' +
          '<img src="1_2.png" style="width:20%;position:absolute;top:40%;left:40%;"></img>'+instr_text2
          accept_green();
        }
        else if (picture_choice==4) {
          first_choice = '2_3';
          display_element.innerHTML = '<img src="2_3.png" style="width:10%;position:absolute;top:10%;left:45%;"></img>' +
          '<img src="1_1.png" style="width:20%;position:absolute;top:40%;left:40%;"></img>'+instr_text2
          accept_green();
      }
    }

  };

    //make choices
     keyboard_handle = jsPsych.pluginAPI.getKeyboardResponse({
      valid_responses: trial.choices,
      callback_function:accept_picture,
      rt_method: 'performance',
      persist: false,
      allow_held_key: false
    });

  //accept green
    var accept_green = function(){
      jsPsych.pluginAPI.cancelKeyboardResponse(keyboard_handle1);
      warning_time2();
      keyboard_handle2 = jsPsych.pluginAPI.getKeyboardResponse({
      valid_responses: ['space'],
      callback_function:result,
      rt_method: 'performance',
      persist: false,
      allow_held_key: false
    });
  };

  //calculate the result
    var result = function(info){
      reaction_time2 = info.rt;
      clearTimeout(wt2);
      random_rate = Math.random();
      if (first_choice== '2_1'|| first_choice== '2_3') {
        rate1 = trial.rate_array11[trial_rep-1];
      }
      else {
        rate1 = trial.rate_array12[trial_rep-1];
      }
    //rate1 = value in the column of the file of the Quarter
    if (random_rate<=rate1) {
      show_coin = 'Quarter.jpg'
      reward = 1
      overall_reward += reward
      bonus = overall_reward*0.025
    }
    else {
      show_coin = 'Nickel.jpg'
      reward = 0
      overall_reward += reward
      bonus = overall_reward*0.025
    }
    
    rep_function_rl();
    //collect_data();
  };

  //if using more than 2 seconds in the second chioce
    var warning_time2 = function(){
      wt2 = jsPsych.pluginAPI.setTimeout(function(){
      display_element.innerHTML = warning_text2;
      jsPsych.pluginAPI.cancelKeyboardResponse(keyboard_handle2);
      keyboard_handle3 = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: collect_data,
        valid_responses: ['space'],
        rt_method: 'performance',
        persist: false,
        allow_held_key: false
      })
    },2000);
    };

    //rep1 is for showing Quarter
    var rep_function_rl = function(){

    display_element.innerHTML = '<img class="jspsych-pre-coin" id="jspsych-pre-coin1" src="'+'plus.jpg'+'"></img>';

    //show different images
    //if (trial.duration[show_number]!=undefined) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-pre-coin1').style.visibility = 'hidden';
        display_element.innerHTML = '<img id="jspsych-pre-coin2" class="jspsych-pre-coin" src="'+'mask.jpg'+'"></img>';
        second_change();
      }, 1000);
    //}

    var second_change = function() {
      //if (trial.duration[show_number+1]!=undefined) {
        jsPsych.pluginAPI.setTimeout(function() {
          display_element.querySelector('#jspsych-pre-coin2').style.visibility = 'hidden';
          display_element.innerHTML = '<img id="jspsych-pre-coin3" class="jspsych-pre-coin" src="'+show_coin+'"></img>';
          third_change();
        }, 400);
      //}
    };

    var third_change = function() {
      //if (trial.duration[show_number+2]!=undefined) {
        jsPsych.pluginAPI.setTimeout(function() {
          display_element.querySelector('#jspsych-pre-coin3').style.visibility = 'hidden';
          display_element.innerHTML = '<img id="jspsych-pre-coin4" class="jspsych-pre-coin" src="'+'mask.jpg'+'"></img>';
          fourth_change();
          //change this into the threshold time
        }, coin_flash_time);
      //}
    };

    var fourth_change = function() {
      //if (trial.duration[show_number+3]!=undefined) {
        jsPsych.pluginAPI.setTimeout(function() {
          display_element.querySelector('#jspsych-pre-coin4').style.visibility = 'hidden';
          fifth_change();
          //change this into the 600-threshold time
        },post_mask_time);
      //}
    };

    var fifth_change = function() {
      //if (trial.duration[show_number+3]!=undefined) {
        jsPsych.pluginAPI.setTimeout(function() {
          sixth_change();
          //change this into the 600-threshold time
        },500);
      //}
    };

    var sixth_change = function() {
      //if (trial.duration[show_number+3]!=undefined) {
      if(trial.practice_experiment){
        if (trial_rep<trial.repetition) {
          display_element.innerHTML = '<p style="text-align:center;color:white;font-size: 200%;width:80%;top:150px;left:10%;position:relative;">Please press space to enter the next trial</p>'
        }
        else {
          display_element.innerHTML = '<p style="text-align:center;color:white;font-size: 200%;width:80%;top:150px;left:10%;position:relative;">Thank you for participation! This is the end of experiment</p>'+
          '<p style="text-align:center;color:white;font-size: 200%;width:80%;top:150px;left:10%;position:relative;">Please press space to exist</p>'
        }
      }
      else {
        if (trial_rep<trial.repetition) {
          display_element.innerHTML = '<p style="text-align:center;color:white;font-size: 200%;width:80%;top:150px;left:10%;position:relative;">Please press space to enter the next trial</p>'
        }
        else {
          display_element.innerHTML = '<p style="text-align:center;color:white;font-size: 200%;width:80%;top:150px;left:10%;position:relative;">This is the end of practice trials</p>'+
          '<p style="text-align:center;color:white;font-size: 200%;width:80%;top:150px;left:10%;position:relative;">Please press space to enter experiment trials</p>'
        }
      }
        
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboard_handle3);
        keyboard_handle4 = jsPsych.pluginAPI.getKeyboardResponse({
        valid_responses: ['space'],
        callback_function:collect_data,
        rt_method: 'performance',
        persist: false,
        allow_held_key: false
        });
      //}
    };

//for rep_function_rl show coin
  };

  }
    

  var collect_data = function(){
      trial_data_RL = {
        "stimulus": JSON.stringify(show_coin),
        "key_press": key_pressed,
        "first_choice": first_choice,
        "picture_choosing_rt": reaction_time1,
        "accept_choosing_rt": reaction_time2,
        "threshold":threshold_time,
        "coin_flash":coin_flash_time,
        "reward":reward,
        "culmulative reward":overall_reward,
        "bonus":bonus,
        "Qrate":rate1
      }
      jsPsych.data.get().push(trial_data_RL);
    endTrial();
  };

  var endTrial = function() {
    if (trial_rep<trial.repetition) {
        trial_rep++;
        rep_RL_function();
      }
      else {
        display_element.innerHTML = '<p style="font-size:50px;color:white;">Hello</p>'
        jsPsych.pluginAPI.clearAllTimeouts(); //clearTimeout
        jsPsych.pluginAPI.cancelAllKeyboardResponses();
        jsPsych.finishTrial(trial_data_RL);
      }
    };

  rep_RL_function();

//for plugin.trial
}
	return plugin;

})();
