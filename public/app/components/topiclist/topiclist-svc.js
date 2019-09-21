angular.module("topiclist.services", [])
.factory("topiclistSvc", ["$resource", function($resource) {
	var topiclistResource = $resource("api1/topics/:topic_id", {}, {});

	function queryTopics() {
		return topiclistResource.get().$promise;
	}

	function removeTopic(topic_id) {
		return topiclistResource.remove({topic_id: topic_id}).$promise;
	}

	function addTopic(topic_data) {
		return topiclistResource.save(topic_data).$promise;
	}

	return {
		queryTopics: queryTopics,
		removeTopic: removeTopic,
		addTopic: addTopic
	};
}]);
