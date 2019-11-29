angular.module("quiz.controllers", ["common.card", "card.services", "attachments.services"])
.controller("quizController", ["$scope", "$location", "$routeParams", "Card",
		"cardSvc", "attachmentsSvc",
		function($scope, $location, $routeParams, Card, cardSvc, attachmentsSvc) {

	//////////////////////////////////////////////////
	// Private state.
	//////////////////////////////////////////////////

	$scope.current_card = {};
	$scope.quiz_is_over = false;
	$scope.num_correct_answers = 0;
	$scope.cards_per_quiz = 3;
	$scope.results = {};

	var cards_left = $scope.cards_per_quiz;
	var cards = [];
	var used_card_indices = [];


	//////////////////////////////////////////////////
	// Private functions.
	//////////////////////////////////////////////////

	function getRandomInt(max) {
		  return Math.floor(Math.random() * (max + 1) );
	}

	function getNextCardIndex() {
		if (used_card_indices.length == $scope.cards_per_quiz)
			throw(Error("no more cards"));

		// Compute (random) index of next card.
		var index = -1;
		while (index == -1) {
			var i = getRandomInt(cards.length - 1);
			if (!used_card_indices.includes(i))
				index = i;
		}
		used_card_indices.push(index);
		return index;
	}

	async function fetchNextCard(card_id) {
		// Fetch next card and its attachments and put them in $scope.current_card.
		try {
			var responses = await Promise.all([cardSvc.getCard(card_id), attachmentsSvc.queryAttachments(card_id)]);
			var card_response = responses[0];
			var attachments_response = responses[1];

			if (!card_response.success)
				throw(Error(card_response.error_msg));
			if (!attachments_response.success)
				throw(Error(attachments_response.error_msg));

			$scope.$apply(() => {$scope.current_card = card_response.card;});
			var attachments = attachments_response.attachments;
			var question_image;
			var answer_image;
			for (var att of attachments) {
				switch (att.belongs_to) {
					case "Q":
						$scope.$apply(() => {$scope.current_card.question_image = att.path;});
						break;
					case "A":
						$scope.$apply(() => {$scope.current_card.answer_image = att.path;});
						break;
					default:
						console.log("Unknown belongs_to property:", att.belongs_to);
				}
			}
		} catch (err) {
			alert("Error fetching next card: " + err);
		}
	}

	function computeResults() {
		const percentage_correct = $scope.num_correct_answers / $scope.cards_per_quiz;
		if (percentage_correct < 0.4) {
			$scope.results.class = "failure";
			$scope.results.text = "That is bad. Work harder!";
		} else if (percentage_correct < 0.8) {
			$scope.results.class = "mediocre";
			$scope.results.text = "That was mediocre. Keep going!";
		} else {
			$scope.results.class = "success";
			$scope.results.text = "Well done!";
		}
	}

	function advance() {
		if (cards_left-- > 0) {
			$scope.answer_is_visible = false;
			var index = getNextCardIndex();
			var card_id = cards[index].id;
			fetchNextCard(card_id);
		} else {
			computeResults();
			$scope.quiz_is_over = true;
		}
	}


	//////////////////////////////////////////////////
	// Initialization.
	//////////////////////////////////////////////////

	Card.query({collection_id: $routeParams.collection_id}).$promise.then((resp) => {
		if (resp.success) {
			cards = resp.cards;
			if (cards.length < $scope.cards_per_quiz) {
				alert(`Collection has only ${cards.length} cards.`
						+ ` Quiz requires at least ${$scope.cards_per_quiz} cards.`);
				return;
			}
			advance();
		} else {
			throw(Error(resp.error_msg));
		}
	}).catch((err) => {
		alert(`Cannot fetch cards of collection with id '${$routeParams.collection_id}': ${err}`);
	});


	//////////////////////////////////////////////////
	// Scope functions.
	//////////////////////////////////////////////////

	$scope.showAnswer = function() {
		$scope.answer_is_visible = true;
	};

	$scope.processAnswer = function(correct) {
		if (correct)
			++$scope.num_correct_answers;
		advance();
	};

	$scope.quitQuiz = function() {
		// todo use confirmation-dialog (modal window)
		$location.url(`/collections/${$routeParams.collection_id}/cards`);
	};

		}
]);
