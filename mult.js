/**
 * Config variables
 */
var teachStepTime = 350,
	minMultiplier = 0,
	maxMultiplier = 12,
	streakCycle = 5,
	correctInRowRequired = 3;

// basic form of the "current" multiplication object...as of this writing this
// object gets overwritten on each new question, so really this just acts as a
// description of the object (for now)
var current = {
	first: false,
	second: false
};

// temp i18n var
var i18n = {
	"deck-empty": "No more in deck. Great job! Starting over.",
	"next-question": "Next ",
	"correct-streak-messages": [
		"<strong>$1 in a row!</strong> Great job!",
		"<strong>$1 in a row!</strong> Keep up the good work!",
		"Seriously?! <strong>$1 in a row?!</strong> Amazing!",
		"<strong>$1 in a row!</strong> You are awesome!",
		"<strong>$1 in a row!</strong> Super duper!",
		"<strong>$1 in a row!</strong> Go brag to your parents!",
		"<strong>$1 in a row!</strong> You're on fire!",
		"<strong>$1 in a row!</strong> Boom!"
	],
	"teach-explanation-zero": "Remember: anything times zero equals zero",
	"teach-explanation-one": "Remember: anything times one equals itself",
	"teach-explanation-ten": "Remember: when you multiply anything times ten, just add a zero on the end",
	"question-removed-from-deck": "You've gotten $1 x $2 correct $3 times in a row! We won't ask you that one anymore. Great job!"
};

var msg = {

	getI18n: function ( msgId ) {
		if ( i18n[ msgId ] ) {
			return i18n[ msgId ];
		}
		else {
			var errMsg = "<" + msgId + ">";
			console.log( "Error: missing message ID " + errMsg );
			return errMsg;
		}
	},

	get: function ( msgId ) {
		return this.msgParse( this.getI18n(msgId), this.removeArgsFront(arguments, 1) );
	},

	getFromList: function ( msgId, msgIndex ) {
		var list = this.getI18n( msgId );
		if ( typeof list == 'string' ) {
			return list; // not giving an object because msg doesn't exist, return string
		}
		if ( ! list[ msgIndex ] ) {
			msgIndex = list.length - 1;
		}
		return this.msgParse( list[msgIndex], this.removeArgsFront(arguments, 2) );
	},

	msgParse: function ( msgText, params ) {
		if ( params.length > 0 ) {
			for ( var i = 0; i < params.length; i++ ) {
				var re = new RegExp("\\$" + (i+1), "ig");
				msgText = msgText.replace( re, params[i] );
			}
		}
		return msgText;
	},

	removeArgsFront: function ( args, startIndex ) {
		var outArgs = [];
		for( var i = startIndex; i < args.length; i++ ) {
			outArgs.push( args[i] );
		}
		return outArgs;
	}

}; // end msg object

var numInRow = 0;


var deck = {

	unasked: [], // questions that haven't been asked yet
	asked: [],

	// @todo: make a "no duplicates" option
	// @todo: for early stages maybe have no duplicates, but do a "teach"
	// method that shows commutative property
	build: function ( min, max ) {
		this.unasked = [];
		for ( var f = min; f <= max; f++ ) {
			for ( var s = min; s <= max; s++ ) {
				this.unasked[ this.unasked.length ] = {
					first: f,
					second: s,
					attempts: 0,
					correct: 0,
					totalCorrect: 0
				};
			}
		}
	},

	selectQuestion: function () {
		var groupIndex;
		var group;

		if ( this.unasked.length > 0 ) {
			group = this.unasked;
		}
		else if ( this.asked.length > 0 ) {
			group = this.asked;
		}
		else {
			notify( "success", msg.get( "deck-empty" ), 3000 );
			this.build( minMultiplier, maxMultiplier );
			return this.selectQuestion();
		}

		groupIndex = getRandomInt( 0, group.length - 1 );
		return group[ groupIndex ];
	},

	getItemAndLocationFromDeck: function ( m ) {
		var deck;

		if ( m.attempts === 0 ) {
			deck = this.unasked;
		}
		else {
			deck = this.asked;
		}

		for ( var i = 0; i < deck.length; i++ ) {
			if ( deck[i].first === m.first && deck[i].second === m.second ) {
				return {
					question: deck[i], // return reference to item in deck
					index: i
				}
			}
		}
	},

	handleCorrect: function ( newQuestionState ) {
		// var deck;

		// if ( m.attempts === 0 ) {
		// 	deck = this.unasked;
		// }
		// else {
		// 	deck = this.asked;
		// }

		// for ( var i = 0; i < deck.length; i++ ) {
		// 	if ( deck[i].first === m.first && deck[i].second === m.second ) {
				
		// 		// first time asked (and correct)
		// 		if ( m.attempts === 1 ) {
		// 			deck.splice( i, 1 ); // remove from unasked
		// 			this.asked.push( m ); // add to asked
		// 		}

		// 		// asked before, but not enough times correct in a row to remove entirely
		// 		else if ( m.correct < correctInRowRequired ) {
		// 			deck[i] = m; // overwrite existing m with new attempts/correct
		// 		}

		// 		// asked before, correct enough times in a row not to ask again
		// 		else {
		// 			deck.splice( i, 1 );
		// 			notify(
		// 				"success",
		// 				msg.get(
		// 					"question-removed-from-deck",
		// 					m.first,
		// 					m.second,
		// 					correctInRowRequired 
		// 				),
		// 				4000
		// 			);
		// 		}
		// 	}
		// }

		var questionFromDeck = this.getItemAndLocationFromDeck( newQuestionState );

		newQuestionState.attempts++;
		newQuestionState.correct++;
		newQuestionState.totalCorrect++;

		this.handleQuestionChange( newQuestionState, questionFromDeck );

	},

	handleIncorrect: function ( newQuestionState ) {
		var questionFromDeck = this.getItemAndLocationFromDeck( newQuestionState );

		newQuestionState.attempts++;
		newQuestionState.correct = 0;

		this.handleQuestionChange( newQuestionState, questionFromDeck );

	},

	handleQuestionChange: function ( newQuestionState, questionFromDeck ) {

		// first time asked (and correct)
		if ( newQuestionState.attempts === 1 ) {
			this.unasked.splice( questionFromDeck.index, 1 ); // remove from unasked
			this.asked.push( newQuestionState ); // add to asked
		}

		// asked before, but not enough times correct in a row to remove entirely
		else if ( newQuestionState.correct < correctInRowRequired ) {
			// overwrite existing m with new attempts and num correct
			this.asked[ questionFromDeck.index ] = newQuestionState;
		}

		// asked before, correct enough times in a row not to ask again
		else {
			this.asked.splice( questionFromDeck.index, 1 );
			notify(
				"success",
				msg.get(
					"question-removed-from-deck",
					newQuestionState.first,
					newQuestionState.second,
					correctInRowRequired 
				),
				4000
			);
		}

	}

};

function setupQuestion ( max ) {
	// var max = max || 12;
	current = deck.selectQuestion();
	$("#num-1").text( current.first );
	$("#num-2").text( current.second );
	$("#answer").val("");
	refocus();
}

function getRandomInt ( min, max ) {
	var calcMax = max - min;
	return ( Math.ceil( Math.random() * (calcMax + 1) ) - 1 ) + min;
}

function checkAnswer () {
	var answer = parseInt( $("#answer").val() );
	var QnA = current.first + ' x ' + current.second + ' = ' + (current.first * current.second);

	if ( answer === current.first * current.second ) {
		$("#answer").effect(
			// highlight answer box green for 1 sec
			"highlight", { color: "#3c763d" }, 1000,

			function() {
				deck.handleCorrect( current ); // remove pair from deck
				handleStreak(); // if on a streak, congratulate student
				
				setupQuestion(); // setup next question
				// @todo: should this be delated after streak? Could make streaks further apart
				// and have this be a mental pause...good idea? Like every 10 in a row correct
				// give them a 10 second pause? or a "continue" button for as long a pause as
				// they want?
			}
		);
	}
	else {
		deck.handleIncorrect( current );
		clearNotify(); // remove any notifications
		clearStreak(); // streak reset to zero
		$("#answer").effect(
			// highlight answer box red for 1 sec
			"highlight", { color: "#a94442" }, 1000,

			// fade out question and answer, the do teaching routine
			function() {
				$("#question-answer-input").fadeOut( 200, function() {
					teachCurrent();
				});
			}
		);
	}

}

function notify ( type, msg, duration ) {
	var duration = duration || 0;
	var newNotif = $('<div class="alert alert-' + type + '" role="alert">' + msg + '</div>');

	$("#notifications").prepend( newNotif );
	if ( duration ) {
		setTimeout( function(){
			newNotif.fadeOut( 300, function() {
				newNotif.remove();
			});
		}, duration );
	}
}

function clearNotify () {
	$("#notifications").empty();
}

function teachCurrent () {

	var teachExplanation;
	if ( current.first === 0 || current.second === 0 ) {
		teachExplanation = msg.get( 'teach-explanation-zero' );
	}
	else if ( current.first === 1 || current.second === 1 ) {
		teachExplanation = msg.get( 'teach-explanation-one' );
	}
	else if ( current.first === 10 || current.second === 10 ) {
		teachExplanation = msg.get( 'teach-explanation-ten' );
	}
	else {
		teachExplanation = "";
	}

	if ( teachExplanation !== "" ) {
		teachExplanation = "<div id='teach-explanation'>" + teachExplanation + "</div>";
	}

	var teach =
		"<p><span id='teach-first'>" + current.first + "</span>"
		+ "<span id='teach-times-symbol'> &times; </span>"
		+ "<span id='teach-second'>" + current.second + "</span>"
		+ "<span id='teach-equals-symbol'> = </span>"
		+ "<span id='teach-product'>" + (current.first * current.second) + "</span></p>"
		+ teachExplanation;

	$("#question-answer-teacher").html( teach ).fadeIn( 1000 );
	setTimeout( function() {
		fadeInList(
			[	"teach-first",
				"teach-times-symbol",
				"teach-second",
				"teach-equals-symbol",
				"teach-product",
				"teach-explanation"
			],
			function () {
				$("#question-answer-teacher").append(
					$('<button type="button" class="btn btn-success">' + msg.get( 'next-question' ) + '<span class="glyphicon glyphicon-chevron-right"></span></button>')
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
	if ( numInRow % streakCycle === 0 ) {
		var msgIndex = ( numInRow / streakCycle ) - 1;
		notify(
			"success",
			msg.getFromList( "correct-streak-messages", msgIndex, numInRow ),
			4000 // notification length in milliseconds
		);
	}
}

deck.build( minMultiplier, maxMultiplier );
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