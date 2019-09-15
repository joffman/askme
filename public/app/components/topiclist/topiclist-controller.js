angular.module("topiclist.controllers", [])
.controller("topicListController", ["$scope", function($scope) {

	// Data. todo: Get this from backend.
	$scope.topics = [
	{
		id: 1,
		name: "C++",
		card_count: 5
	},
	{
		id: 2,
		name: "Web Development",
		card_count: 12
	}
	];

	$scope.add = function() {
		// todo: Send new topic-data to backend and receive id.
		var new_topic = {
			id: 0,
			name: $scope.new_topic_name,
			card_count: 0
		};

		$scope.topics.push(new_topic);

		// Clear input.
		$scope.new_topic_name = "";
	};

	$scope.remove = function(topic_id) {
		// todo: send request to backend.
		$scope.topics = $scope.topics.filter(function(elem, index, arr) {
			return elem.id != topic_id;
		});
	};

	$scope.onTopicClicked = function(topic_id) {
		window.location = `#!/topics/${topic_id}/cards`;
	};

}]);
