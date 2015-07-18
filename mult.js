/**
 * Config variables
 */
var teachStepTime = 350,
	minMultiplier = 0,
	maxMultiplier = 12,
	streakCycle = 5;

var current = {
	first: false,
	second: false
};

var numInRow = 0;

var deck = [];

function buildDeck ( min, max ) {
	deck = [];
	for ( var f = min; f <= max; f++ ) {
		for ( var s = min; s <= max; s++ ) {
			deck[ deck.length ] = { first: f, second: s };
		}
	}
}

function pullFromDeck () {
	if ( deck.length === 0 ) {
		notify( "success", "No more in deck. Great job! Starting over.", 3000 );
		buildDeck( minMultiplier, maxMultiplier );
		return pullFromDeck();
	}
	else if ( deck.length === 1 ) {
		return deck[0];
	}
	var deckIndex = getRandomInt( deck.length - 1 );
	return deck[ deckIndex ];
}

function removeFromDeck (m) {
	for ( var i = 0; i < deck.length; i++ ) {
		if ( deck[i].first === m.first && deck[i].second === m.second ) {
			deck.splice( i, 1 );
		}
	}
	// $("#fake-console").text( deck.length );
}

function setupQuestion ( max ) {
	// var max = max || 12;
	current = pullFromDeck();
	// current.first = getRandomInt( max );
	// current.second = getRandomInt( max );
	$("#num-1").text( current.first );
	$("#num-2").text( current.second );
	$("#answer").val("");
	refocus();
}

function getRandomInt ( max ) {
	if ( max === 0 ) return 0;
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
			removeFromDeck( current );
			handleStreak();
			setupQuestion();
		});
	}
	else {
		clearNotify();
		clearStreak();
		$("#answer").effect("highlight", { color: "#a94442" }, 1000, function() {
			$("#question-answer-input").fadeOut( 200, function() {
				teachCurrent();
			});
		});
	}

}

function notify ( type, msg, duration ) {
	var duration = duration || 0;
	$("#notifications").html(
		'<div class="alert alert-' + type + '" role="alert">' + msg + '</div>'
	);
	if ( duration ) {
		setTimeout( function(){
			$("#notifications").children().fadeOut( 300, function() {
				$("#notifications").empty();
			});
		}, duration);
	}
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
	var teach =
		"<p><span id='teach-first'>" + current.first + "</span>"
		+ "<span id='teach-times-symbol'> &times; </span>"
		+ "<span id='teach-second'>" + current.second + "</span>"
		+ "<span id='teach-equals-symbol'> = </span>"
		+ "<span id='teach-product'>" + (current.first * current.second) + "</span></p>";

	$("#question-answer-teacher").html( teach ).fadeIn( 1000 );
	setTimeout( function() {
		fadeInList(
			["teach-first", "teach-times-symbol", "teach-second", "teach-equals-symbol", "teach-product"],
			function () {
				$("#question-answer-teacher").append(
					$('<button type="button" class="btn btn-success">Next <span class="glyphicon glyphicon-chevron-right"></span></button>')
						.click( function() {
							$("body").unbind( "keypress" );
							clearTeachCurrent();
						})
				);

				$("body").keypress( function(e) {
					e.preventDefault();
					$("body").unbind( "keypress" );
					clearTeachCurrent();
				});
				// setTimeout( function() {
				// 	$("#question-answer-teacher").fadeOut( 1000, function() {
				// 	});
				// }, 3000);
			}
		);
	}, 200 );

}

function clearTeachCurrent () {
	$("#question-answer-teacher").empty();
	setupQuestion();
	$("#question-answer-input").fadeIn( 1000 );
	refocus();
}

function fadeInList ( items, completeFn ) {
	if ( items.length > 0 ) {
		$("#"+items[0]).fadeIn( 300 );
		items.shift();
		setTimeout( function() {
			fadeInList( items, completeFn );
		}, teachStepTime );
	}
	else {
		completeFn();
	}
}

function refocus () {
	$("#answer").focus();
}

function clearStreak () {
	numInRow = 0;
}

function handleStreak () {
	numInRow++;
	var messages = [
		"Great job!",
		"Keep up the good work!",
		"Amazing!",
		"You are awesome!",
		"Super duper!",
		"Go brag to your parents!",
		"You're on fire!",
		"Boom!"
	];
	if ( numInRow % streakCycle === 0 ) {
		var msgIndex = ( numInRow / streakCycle ) - 1;
		var msg = messages[ msgIndex ] || messages[ messages.length - 1 ];
		notify( "success", "<strong>" + numInRow + " in a row!</strong> " + msg, 4000 );
	}
}

buildDeck( minMultiplier, maxMultiplier );
setupQuestion();

// removed button so no need for this unless i bring it back
// $("#answer-button").click( function() {
// 	checkAnswer();
// });

$("#answer").keydown( function(e){ 
    var code = e.which; // recommended to use e.which, it's normalized across browsers
    if ( code==13 || code==9 ) {
    	e.preventDefault();
    }
    // $("#fake-console").text( code );
    //   value isn't blank       tab        ???         enter       ???          ???
    if ( $(this).val() != "" && (code==9 || code==32 || code==13 || code==188 || code==186) ) {
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