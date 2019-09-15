angular.module("cardlist.controllers", [])
.controller("cardListController", ["$scope", "$routeParams", function($scope, $routeParams) {

	$scope.topicName = $routeParams.topicId;	// todo: get name from backend

	// Data. todo: Get this from backend, using the topic-id.
	$scope.cards = [
	{
		id: 1,
		title: "First card"
	},
	{
		id: 2,
		title: "Second card"
	}
	];

//	$scope.add = function() {
//		// todo: Send new card-data to backend and receive id.
//		var new_card = {
//			id: 0,
//			name: $scope.new_card_name,
//			card_count: 0
//		};
//
//		$scope.cards.push(new_card);
//
//		// Clear input.
//		$scope.new_card_name = "";
//	};

	$scope.remove = function(card_id) {
		// todo: send request to backend.
		$scope.cards = $scope.cards.filter(function(elem, index, arr) {
			return elem.id != card_id;
		});
	};

	$scope.onCardClicked = function(card_id) {
		window.location = `#!/topics/${$routeParams.topicId}/cards/${card_id}`;
	};

	$scope.onAddCardClicked = function() {
		window.location = `#!/topics/${$routeParams.topicId}/cards/0`;
	};

}]);
