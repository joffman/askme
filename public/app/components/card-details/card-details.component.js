function CardDetailsCtrl($routeParams, $location, Card, Collection) {

	var self = this;

	// Set self.card.
	if ($routeParams.card_id == 0) {	// new card
		self.card = {
			id: 0,
			collection_id: $routeParams.collection_id
		};
	} else {						// existing card
		Card.get({id: $routeParams.card_id}).$promise.then((resp_data) => {
			self.card = resp_data.card;
		}).catch((err) => {
			handleApiError(err);
		});
	}

	// Fetch collections.
	Collection.query().$promise.then((resp_data) => {
		self.collections = resp_data.collections;
	}).catch((error) => {
		handleApiError(error);
	});


	//////////////////////////////////////////////////
	// Private functions.
	//////////////////////////////////////////////////

	function handleApiError(err) {
		alert("Error: " + err.data.error_msg);
	}


	//////////////////////////////////////////////////
	// Scope functions.
	//////////////////////////////////////////////////

	self.openAttachments = function() {
		$location.url(`/collections/${$routeParams.collection_id}/cards/${self.card.id}/attachments`);
	};

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
	controller: ["$routeParams", "$location", "Card", "Collection", CardDetailsCtrl]
});
