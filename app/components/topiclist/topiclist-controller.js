angular.module("topiclist.controllers", [])
.controller("topicListController", ["$scope", function($scope) {

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

}]);
