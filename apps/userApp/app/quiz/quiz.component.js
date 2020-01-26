function QuizCtrl($scope, $window, $location, $routeParams, Utils, Card, Attachment) {
    var self = this;

    //////////////////////////////////////////////////
    // Private variables.
    //////////////////////////////////////////////////

    const maxCardsPerQuiz = 12;

    var cards = [];
    var usedCardIndices = [];

    //////////////////////////////////////////////////
    // Public variables.
    //////////////////////////////////////////////////

    self.cardsPerQuiz = maxCardsPerQuiz;
	self.cardsLeft = null;
    self.collectionId = $routeParams.collectionId;
    self.currentCard = {};
    self.numCorrectAnswers = 0;
    self.quizIsOver = false;
    self.results = {};

    //////////////////////////////////////////////////
    // Private functions.
    //////////////////////////////////////////////////

    function getRandomInt(max) {
        return Math.floor(Math.random() * (max + 1));
    }

    function getNextCardIndex() {
        if (usedCardIndices.length == self.cardsPerQuiz)
            throw Error("no more cards");

        // Compute (random) index of next card.
        var index = -1;
        while (index == -1) {
            var i = getRandomInt(cards.length - 1);
            if (!usedCardIndices.includes(i)) index = i;
        }
        usedCardIndices.push(index);
        return index;
    }

    async function fetchNextCard(cardId) {
        // Fetch next card and its attachments and put them in self.currentCard.
        try {
            var responses = await Promise.all([
                Card.get({ id: cardId }).$promise,
                Attachment.query({ cardId: cardId }).$promise
            ]);
            var cardResponse = responses[0];
            var attachmentsResponse = responses[1];

            if (!cardResponse.success) throw Error(cardResponse.errorMsg);
            if (!attachmentsResponse.success)
                throw Error(attachmentsResponse.errorMsg);

            $scope.$apply(() => {
                self.currentCard = cardResponse.card;
            });
            var attachments = attachmentsResponse.attachments;
            var questionImage;
            var answerImage;
            for (var att of attachments) {
                switch (att.belongsTo) {
                    case "Q":
                        $scope.$apply(() => {
                            self.currentCard.questionImage = att.path;
                        });
                        break;
                    case "A":
                        $scope.$apply(() => {
                            self.currentCard.answerImage = att.path;
                        });
                        break;
                    default:
                        console.log(
                            "Unknown belongsTo property:",
                            att.belongsTo
                        );
                }
            }
        } catch (err) {
            console.log("Error fetching next card:", err);
            Utils.handleApiError(err);
        }
    }

    function computeResults() {
        const percentageCorrect = self.numCorrectAnswers / self.cardsPerQuiz;
        if (percentageCorrect < 0.4) {
            self.results.class = "failure";
            self.results.text = "This is bad. Work harder!";
        } else if (percentageCorrect < 0.8) {
            self.results.class = "mediocre";
            self.results.text = "This is mediocre. Keep going!";
        } else {
            self.results.class = "success";
            self.results.text = "Well done!";
        }
    }

    function advance() {
        if (self.cardsLeft-- > 0) {
            self.answerIsVisible = false;
            var index = getNextCardIndex();
            var cardId = cards[index].id;
            fetchNextCard(cardId);
        } else {
            computeResults();
            self.quizIsOver = true;
        }
    }

    //////////////////////////////////////////////////
    // Initialization.
    //////////////////////////////////////////////////

    Card.query({ collectionId: self.collectionId })
        .$promise.then(resp => {
            if (resp.success) {
                cards = resp.cards;
				if (cards.length == 0) {
                    $window.alert("Collection has no cards.");
					$location.path(`/collections/${self.collectionId}/details`);
                    return;
				}
				self.cardsPerQuiz = Math.min(self.cardsPerQuiz, cards.length);
				self.cardsLeft = self.cardsPerQuiz;
                advance();
            } else {
                throw Error(resp.errorMsg);
            }
        })
        .catch(err => {
            $window.alert(
                `Cannot fetch cards of collection with id '${self.collectionId}': ${err}`
            );
        });

    //////////////////////////////////////////////////
    // Scope functions.
    //////////////////////////////////////////////////

    self.showAnswer = function() {
        self.answerIsVisible = true;
    };

    self.processAnswer = function(correct) {
        if (correct) ++self.numCorrectAnswers;
        advance();
    };
}

angular.module("quiz").component("quiz", {
    templateUrl: "app/quiz/quiz.html",
    controller: [
        "$scope",
        "$window",
        "$location",
        "$routeParams",
        "Utils",
        "Card",
        "Attachment",
        QuizCtrl
    ]
});
