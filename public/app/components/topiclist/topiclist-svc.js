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
		// TODO: Better validation.
		var topic = {};
		if ("name" in topic_data) {
			topic.name = topic_data.name;
			return topiclistResource.save(topic).$promise;
		} else {	// todo: error handling
			throw { error: "addTopic: Invalid topic-data" };
		}
	}

	return {
		queryTopics: queryTopics,
		removeTopic: removeTopic,
		addTopic: addTopic
	};
}]);
