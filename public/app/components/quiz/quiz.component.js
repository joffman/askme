function QuizCtrl($scope, $location, $routeParams, Card, Attachment) {

	var self = this;

	//////////////////////////////////////////////////
	// Private state.
	//////////////////////////////////////////////////

	self.current_card = {};
	self.quiz_is_over = false;
	self.num_correct_answers = 0;
	self.cards_per_quiz = 3;
	self.results = {};

	var cards_left = self.cards_per_quiz;
	var cards = [];
	var used_card_indices = [];


	//////////////////////////////////////////////////
	// Private functions.
	//////////////////////////////////////////////////

	function getRandomInt(max) {
		  return Math.floor(Math.random() * (max + 1) );
	}

	function getNextCardIndex() {
		if (used_card_indices.length == self.cards_per_quiz)
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
		// Fetch next card and its attachments and put them in self.current_card.
		try {
			var responses = await Promise.all([Card.get({id: card_id}).$promise,
					Attachment.query({card_id: card_id}).$promise]);
			var card_response = responses[0];
			var attachments_response = responses[1];

			if (!card_response.success)
				throw(Error(card_response.error_msg));
			if (!attachments_response.success)
				throw(Error(attachments_response.error_msg));

			$scope.$apply(() => {self.current_card = card_response.card;});
			var attachments = attachments_response.attachments;
			var question_image;
			var answer_image;
			for (var att of attachments) {
				switch (att.belongs_to) {
					case "Q":
						$scope.$apply(() => {self.current_card.question_image = att.path;});
						break;
					case "A":
						$scope.$apply(() => {self.current_card.answer_image = att.path;});
						break;
					default:
						console.log("Unknown belongs_to property:", att.belongs_to);
				}
			}
		} catch (err) {
			alert("Error fetching next card: " + err.data.error_msg);
		}
	}

	function computeResults() {
		const percentage_correct = self.num_correct_answers / self.cards_per_quiz;
		if (percentage_correct < 0.4) {
			self.results.class = "failure";
			self.results.text = "That is bad. Work harder!";
		} else if (percentage_correct < 0.8) {
			self.results.class = "mediocre";
			self.results.text = "That was mediocre. Keep going!";
		} else {
			self.results.class = "success";
			self.results.text = "Well done!";
		}
	}

	function advance() {
		if (cards_left-- > 0) {
			self.answer_is_visible = false;
			var index = getNextCardIndex();
			var card_id = cards[index].id;
			fetchNextCard(card_id);
		} else {
			computeResults();
			self.quiz_is_over = true;
		}
	}


	//////////////////////////////////////////////////
	// Initialization.
	//////////////////////////////////////////////////

	Card.query({collection_id: $routeParams.collection_id}).$promise.then((resp) => {
		if (resp.success) {
			cards = resp.cards;
			if (cards.length < self.cards_per_quiz) {
				alert(`Collection has only ${cards.length} cards.`
						+ ` Quiz requires at least ${self.cards_per_quiz} cards.`);
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

	self.showAnswer = function() {
		self.answer_is_visible = true;
	};

	self.processAnswer = function(correct) {
		if (correct)
			++self.num_correct_answers;
		advance();
	};

	self.quitQuiz = function() {
		// todo use confirmation-dialog (modal window)
		$location.url(`/collections/${$routeParams.collection_id}/cards`);
	};

}

angular.module("quiz")
.component("quiz", {
	templateUrl: "app/components/quiz/quiz.html",
	controller: ["$scope", "$location", "$routeParams", "Card", "Attachment", QuizCtrl]
});
