
var current = {
	first: false,
	second: false
};

function setupQuestion ( max ) {
	var max = max || 12;
	current.first = getRandomInt( max );
	current.second = getRandomInt( max );
	$("#num-1").text( current.first );
	$("#num-2").text( current.second );
	$("#answer").val("");
}

function getRandomInt ( max ) {
	// @todo: support min value
	// var min = min || 0;

	var max = max || 12;
	return Math.ceil( Math.random() * (max + 1) ) - 1;
}

function checkAnswer () {
	// alert( $("#answer").val() );
	var answer = parseInt( $("#answer").val() );
	var QnA = current.first + ' x ' + current.second + ' = ' + (current.first * current.second);

	if ( answer === current.first * current.second ) {
		notify( 'success', '<strong>Correct!</strong> ' + QnA );
	}
	else {
		notify( 'warning', '<strong>Nope.</strong> ' + QnA );
	}

	setupQuestion();
}

function notify ( type, msg ) {
	$("#notifications").html(
		'<div class="alert alert-' + type + '" role="alert">' + msg + '</div>'
	);
}

setupQuestion();

$("#answer-button").click( function() {
	checkAnswer();
});


$("#answer").keyup( function(e){ 
    var code = e.which; // recommended to use e.which, it's normalized across browsers
    if (code==13) {
    	e.preventDefault();
    }
    if ( code==32 || code==13 || code==188 || code==186 ){
        checkAnswer();
    }
});