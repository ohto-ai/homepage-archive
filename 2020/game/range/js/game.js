window.answer = parseInt(Math.random()*100, 10)

$(document).on('ready', begin)

function begin() {
  var range = $('.range')
  loopForTimes( 100, function(i) {
    range.append($('<div class="dot" data-number="'+ (i + 1) + '"></div>'))
  })
}

$(document).on('click', '.dot', function() {
  if($('.range.game-ended, .range.guessing').length > 0) return
  number = parseInt($(this).data('number'), 10)
  guess(number, 'you')
})

function hubotGuess () {
  $('.range').addClass('guessing')
  setTimeout(function() {
    number = parseInt( $('.dot').eq(parseInt((Math.random()*100, 10)%($('.dot').length - 1)) + 1).data('number'), 10)
    guess(number, 'bot')
    $('.range').removeClass('guessing')
  }, 1000)
}

function guess (number, role) {
  write(role + ' guessed ' + number)
  if(number == window.answer) {
    $('.dot[data-number='+ window.answer + ']').addClass('boom')
    write('boom!!! the answer is ' + window.answer + ', ' + role + ' lost!')
    $('.range').addClass('game-ended')
  } else if (number < window.answer) {
    $('.dot').filter(function(_, e) {
      return parseInt($(e).data('number') - 1, 10) < number
    }).remove()
	logRange()
    if($('.dot').length == 1) guess($('.dot').data('number'), (role == 'bot' ? 'you' : 'bot'))
  } else {
    $('.dot').filter(function(_,e) {
      return parseInt($(e).data('number') + 1, 10) > number
    }).remove()
	logRange()
    if($('.dot').length == 1) guess($('.dot').data('number'), (role == 'bot' ? 'you' : 'bot'))
  }
  if( role != 'bot' && number != window.answer && $('.dot').length != 1) {
    hubotGuess()
  }

}

function logRange() {
  write($('.dot:first').data('number') + ' to ' + $('.dot:last').data('number'))
}

function write(text) {
  $('.range').after('<p>' + text + '</p>')
}

// Because I don't like ot write for()
function loopForTimes( times, callback ) {
  for( var i=0; i < times; i++ ){
    callback(i)
  }
}
