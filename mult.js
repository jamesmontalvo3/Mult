
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
		//notify( 'success', '<strong>Correct!</strong> ' + QnA );
		// $("#answer").css(
		$("#answer").effect("highlight", { color: "#3c763d" }, 1000, function() { // #d6e9c6
			setupQuestion();
		});
	}
	else {
		clearNotify();
		$("#question-answer-input").fadeOut( 1000, function() {
			teachCurrent();
		});
	}

}

function notify ( type, msg ) {
	$("#notifications").html(
		'<div class="alert alert-' + type + '" role="alert">' + msg + '</div>'
	);
}

function clearNotify () {
	$("#notifications").empty();
}

/**
 * Make it say:
 * <alert>Actually...</alert>
 * A x B = <green>C</green>
 */
function teachCurrent () {
	var teach = "Actually..."
		+ "<p><span id='teach-first'>" + current.first + "</span>"
		+ "<span id='teach-times-symbol'> &times; </span>"
		+ "<span id='teach-second'>" + current.second + "</span>"
		+ "<span id='teach-equals-symbol'> = </span>"
		+ "<span id='teach-product'>" + (current.first * current.second) + "</span></p>";

	$("#question-answer-teacher").html( teach ).fadeIn( 1000 );
	setTimeout( function() {
		fadeInList(
			["teach-first", "teach-times-symbol", "teach-second", "teach-equals-symbol", "teach-product"],
			function () {
				setTimeout( function() {
					$("#question-answer-teacher").fadeOut( 1000, function() {
						$(this).empty();
						setupQuestion();
						$("#question-answer-input").fadeIn( 1000 );
					});
				}, 3000);
			}
		);
	}, 1000 );

}

function fadeInList ( items, completeFn ) {
	if ( items.length > 0 ) {
		$("#"+items[0]).fadeIn( 300 );
		items.shift();
		setTimeout( function() {
			fadeInList( items, completeFn );
		}, 500 );
	}
	else {
		completeFn();
	}
}

setupQuestion();

// removed button so no need for this unless i bring it back
// $("#answer-button").click( function() {
// 	checkAnswer();
// });


$("#answer").keyup( function(e){ 
    var code = e.which; // recommended to use e.which, it's normalized across browsers
    if (code==13) {
    	e.preventDefault();
    }
    if ( code==32 || code==13 || code==188 || code==186 ){
        checkAnswer();
    }
});

$("#brand-button").click( function() {
	if ( $(".jumbotron").size() ) {
		$(".jumbotron").fadeOut( 200, function(){ $(this).remove() } );
	}
	else {
		$("#jumbotron-container").html( $("#jumbotron-template").html() );
		$(".jumbotron").fadeIn( 200 );
		$("#close-jumbotron").click( function() {
			$(".jumbotron").fadeOut( 200, function(){ $(this).remove() } );
		});
	}
});