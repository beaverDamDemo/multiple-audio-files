'use strict';

$('.btn-vertical').on('click', (e)=>{
  $('.btn-vertical').removeClass('active');
  $(e.currentTarget).addClass('active');
})

$('#button_stop').on('click', function(e) {
  e.preventDefault();
  $.each( window.stage, function(index, value) {
    if( value != undefined ) {
      value.instance.paused = true;      
    }
  })
  window.stage = [];
})

$('#button_play').on('click', function(e) {
  e.preventDefault();
  $.each( window.audioFiles, function(index, value) {
    handleAudio(value.url, index); 
  })
})

$('#button_pause').on('click', function(e) {
  e.preventDefault();
  for( let i=0; i<window.stage.length; i++) {
    window.stage[i].instance.paused = true;
  }
})

function getLastDigit(tanja) {
  var matches = tanja.match(/\d+$/);
  let _id;
  if( matches ) {
    _id = matches[0];
  }
  _id = parseInt( _id, 10); 
  return _id;
}