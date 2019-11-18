angular.module("topiclist.controllers", ["topiclist.services"])
.controller("topicListController", ["$scope", "topiclistSvc", function($scope, topiclistSvc) {

	//////////////////////////////////////////////////
	// General functions.
	//////////////////////////////////////////////////

	function handleApiError(err) {
		alert("Error: " + err.message);
	}

	function fetchTopics() {
		topiclistSvc.queryTopics().then(function(resp_data) {
			$scope.topics = resp_data.topics;
		})
		["catch"](function(error) {
			handleApiError(error);
		});
	}

	function init() {
		fetchTopics();
	}


	//////////////////////////////////////////////////
	// Scope functions.
	//////////////////////////////////////////////////

	$scope.add = function() {
		// Create new topic.
		var new_topic = {
			name: $scope.new_topic_name,
		};
		topiclistSvc.addTopic(new_topic).then(function(resp_data) {
			fetchTopics();
		}).catch((error) => {
			handleApiError(error);
		});

		// Clear input.
		$scope.new_topic_name = "";
	};

	$scope.remove = function(topic_id) {
		topiclistSvc.removeTopic(topic_id).then(function(resp_data) {
			fetchTopics();
		})
		["catch"](function(error) {
			handleApiError(error);
		});
	};

	$scope.onTopicClicked = function(topic_id) {
		window.location = `#!/topics/${topic_id}/cards`;
		// TODO: we probably want to use $location.path("/...");
	};


	//////////////////////////////////////////////////
	// Initialization.
	//////////////////////////////////////////////////

	init();

}]);
