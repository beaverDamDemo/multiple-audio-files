( function() {
  "use strict";
  let audioFiles = [], backgroundImage, headingText, instructions_audio;
  window.audioCurrentlyPlaying = false;

  /* ***************************** LOADER handle begin ***********************************************/
  var now = new Date().getTime();
  var page_load_time = now - performance.timing.navigationStart;
  console.warn("User-perceived page loading time: " + page_load_time);
  var width = 5.5,
    perfData = window.performance.timing,
    EstimatedTime = -(perfData.loadEventEnd - perfData.navigationStart),
    time = parseInt((EstimatedTime/1000)%60)*100;
    console.log("estimated time: ", time)
  $('.loadbar').animate({
    'width': width
  }, time)

  $.getJSON('data.json')
    .done(onDataJsonComplete)
    .fail( function(error) {
      console.warn("Request failed: ", error)
    })

  $.getJSON('files.json')
    .done(onFilesJsonComplete)
    .fail( function(error) {
      console.warn("Request failed: ", error)
    })

  function onDataJsonComplete(data) {
    try {
      document.title = data.texts.page_title[0].written;
    } catch(e) {
      console.warn("Error: ", e)
    }
  }

  function onFilesJsonComplete(data) {
    try {
      console.log("audioFiles: ", data.sounds)
      $.each( data.sounds, function(index, value) {
        audioFiles.push(value);
      })
      populateTracks();
    } catch(e) {
      console.warn("Error: ", e)
    }

    $.when( loadAudio() ).done(()=>{
      $('button').removeClass('disabled');
      $('.preloader-wrapper').removeClass('active');
    })
  }

  let instances = [];
  window.instances = [];

  function populateTracks() {
    for( let i=0; i<audioFiles.length; i++ ) {
      let appendString = '<div class="track" id="track_'+i+'">';
      appendString += '<div class="letterlr left">L</div>';
      appendString += '<div class="ui-slider ui-slider-horizontal"></div>';
      appendString += '<div class="letterlr right">R</div>';
      appendString += "<div class='stepladder'></div>";
      appendString += "<div class='ui-slider ui-slider-vertical'></div>";
      appendString += "<div class='show-value-wrapper'><div class='show-value'><div class='bgr'></div></div></div>";
      appendString += "<label>track "+i+"</label>";
      appendString += '</div>';
      $('section#track-wrapper').append(appendString)
    }

    $('#slider-top').slider({
      value: '50',
      slide: function( event, ui ) {
        for( let i=0; i<audioFiles.length; i++ ) {
          $('#track_'+i).find('.ui-slider-vertical').slider('value', ui.value)
          $('#track_'+i).find('.show-value').css({
            'height': +ui.value+'%'
          })
          if( window.stage[i] != undefined ) {
            window.stage[i].instance.volume = ui.value/100;
          }
        }
      }
    });
    $('.track .ui-slider-horizontal').slider({
      orientation: 'horizontal', value: '50',
      slide: function( event, ui ) {
        console.warn( ui.value, parseInt($(event.target).parent().attr('id').split('_')[1] ));
        window.stage[parseInt($(event.target).parent().attr('id').split('_')[1] )].instance.pan = -1 + parseFloat(ui.value*2);
      }
    });
    $('.track .ui-slider-vertical').slider({
      orientation: 'vertical', value: '50',
      create: function( event, ui) {
        let _id = parseInt($(event.target).parent().attr('id').split('_')[1]);
        $('#track_'+_id).find('.show-value').css({
          'height': '50%'
        })
      },
      slide: function( event, ui ) {
        let _id = parseInt($(event.target).parent().attr('id').split('_')[1]);
        if( window.stage[_id] != undefined ) {
          window.stage[_id].instance.volume = ui.value/100;
        }
        $('#track_'+_id).find('.show-value').css({
          'height': +ui.value+'%'
        })
      }
    });
  }

  function loadAudio() {
    let queue = new createjs.LoadQueue();
    createjs.Sound.alternateExtensions = ["mp3"];
    queue.installPlugin(createjs.Sound);

    for( let i=0; i<audioFiles.length; i++) {
      queue.loadFile({id:"audio-"+i, src:audioFiles[i].url });
    }
    queue.on("fileload", handleFileLoad, this);
    queue.on("complete", handleCompleteAudio, this);
    window.audioFiles = audioFiles;
    let dfd = $.Deferred();

    function handleCompleteAudio(e) {
      dfd.resolve('sounds ready');
    }
    let diffTime = 0;
    let totalTime = 0;
    let prevTime = 0;
    var t0 = performance.now();
    let totalLoadbarWidth = 21.25;
    let numOfLoadedFiles = 0;

    function handleFileLoad(e) {
      numOfLoadedFiles++;
      // $('.preloader-wrapper').append("<p>loaded audio: "+e.item.src+"</p>")
      var t1 = performance.now();
      diffTime = t1 - prevTime;
      totalTime = t1-t0;
      prevTime = t1;

      $('.loadbar').animate({
        'width': (totalLoadbarWidth+15.75)+"%"
      }, diffTime)

      if( numOfLoadedFiles == 5 ) {
        $('.loadbar').animate({
          'width': "100%",
          "easing": "linear"
        }, 300)
      }
      totalLoadbarWidth += 15.75;
    }
    return dfd.promise();
  }

  window.stage = [];

  window.handleAudio = function(audioFile, index) {
    if( window.stage[index] == undefined )
    {
      // at first load
      let _vol = $('#track_'+index).find('.ui-slider-vertical').slider('value')/100;
      window.stage[index] = {
        instance: createjs.Sound.play(audioFile, { loop:-1, volume:_vol, pan: 0 }),
        index: index
      }
    } else {
      $.each( window.stage, function(index, value) {
        value.instance.paused = false;
      })
      console.log("Trying to continue audio")
    }
  };

  function onAudioComplete(e) {
    audioPlayer.off("complete");
  };
  function handleErrorAudio(e) {
    console.warn("Error handling audio: ", e);
  }
  function handleComplete(e) {
    window.audioCurrentlyPlaying = false;
  }
})();