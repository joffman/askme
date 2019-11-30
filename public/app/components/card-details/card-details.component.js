function CardDetailsCtrl($routeParams, Card, Collection) {

	var self = this;

	//////////////////////////////////////////////////
	// Set properties of self.
	//////////////////////////////////////////////////

	// Fetch card.
	if ($routeParams.cardId == 0) {	// new card
		self.card = {
			id: 0,
			collectionId: $routeParams.collectionId
		};
	} else {						// existing card
		Card.get({id: $routeParams.cardId}).$promise.then((respData) => {
			self.card = respData.card;
		}).catch((err) => {
			handleApiError(err);
		});
	}

	// Fetch collections.
	Collection.query().$promise.then((respData) => {
		self.collections = respData.collections;
	}).catch((error) => {
		handleApiError(error);
	});

	// Make collectionId from routeParams visible.
	self.collectionId = $routeParams.collectionId;


	//////////////////////////////////////////////////
	// Private functions.
	//////////////////////////////////////////////////

	function handleApiError(err) {
		alert("Error: " + err.data.errorMsg);
	}


	//////////////////////////////////////////////////
	// Scope functions.
	//////////////////////////////////////////////////

	self.onSubmit = function() {

		if (self.card.id === 0) {	// new card
			Card.save(self.card).$promise.then((response) => {
				alert("Successfully added card.");
				self.card.id = response.id;
				// TODO Update url.
			}).catch((err) => {
				handleApiError(err);
			});
		} else {	// existing card
			Card.update(self.card).$promise.then((response) => {
				alert("Successfully updated card.");
			}).catch((err) => {
				handleApiError(err);
			});
		}
	};

}

angular.module("cardDetails")
.component("cardDetails", {
	templateUrl: "app/components/card-details/card-details.html",
	controller: ["$routeParams", "Card", "Collection", CardDetailsCtrl]
});
