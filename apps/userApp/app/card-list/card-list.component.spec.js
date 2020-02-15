"use strict;"

describe("cardList", function() {

	// Mock $window.
	beforeEach(function() {
		$window = {
			alert: jasmine.createSpy(),
			confirm: jasmine.createSpy().and.callFake(function() { return true; })
		};

		module(function($provide) {
			$provide.value("$window", $window);
		});
	});

	beforeEach(module("cardList"));

	describe("CardListCtrl", function() {

		var $componentController;
		beforeEach(inject(function(_$componentController_) {
			$componentController = _$componentController_;
		}));

		var $httpBackend;
		beforeEach(inject(function(_$httpBackend_) {
			$httpBackend = _$httpBackend_;
		}));

		afterEach(function() {
			$httpBackend.verifyNoOutstandingExpectation();
			$httpBackend.verifyNoOutstandingRequest();
		});

		it("should load the cards of the collection with the given id on init", function() {
			const collectionId = 33;

			// Init http-backend.
			const collectionCards = [
			{
				id: 7,
				title: "First collection card"
			},
			{
				id: 9,
				title: "Second collection card"
			},
			{
				id: 13,
				title: "Second collection card"
			}];
			const cardsResponse = {
				success: true,
				cards: collectionCards
			};
			$httpBackend.expectGET("/api1/cards?collectionId=" + collectionId).respond(cardsResponse);

			// Create controller.
			const bindings = {
				collectionId: collectionId
			};
			var ctrl = $componentController("cardList", null, bindings);
			ctrl.$onInit();
			expect(ctrl.cards).toEqual([]);

			// Flush backend and check successful reception of card.
			$httpBackend.flush();
			expect(ctrl.cards).toEqual(collectionCards);
		});

		it("should remove a card when clicking the Remove-button", function() {
			const collectionId = 34;
			const deleteCardId = 2;

			// Set up http-backend for initial fetch.
			const initialCards = [
			{
				id: 1,
				title: "a"
			},
			{
				id: deleteCardId,
				title: "b"
			},
			{
				id: 3,
				title: "c"
			}];
			const initialGetResponse = {
				success: true,
				cards: initialCards
			};
			$httpBackend.expectGET("/api1/cards?collectionId=" + collectionId).respond(initialGetResponse);

			// Create controller and fetch initial cards.
			const bindings = {
				collectionId: collectionId
			};
			var ctrl = $componentController("cardList", null, bindings);
			ctrl.$onInit();
			$httpBackend.flush();

			// Setup http-backend for delete-operation.
			const deleteResponse = {
				success: true
			};
			$httpBackend.expectDELETE("/api1/cards/" + deleteCardId).respond(deleteResponse);

			// Setup http-backend for subsequent fetch operation.
			const updatedCards = initialCards.filter(function(value, index, arr) {
					return value.id != deleteCardId;
			});
			const getResponse = {
				success: true,
				cards: updatedCards
			};
			$httpBackend.expectGET("/api1/cards?collectionId=" + collectionId).respond(getResponse);

			// Call remove function and check that the card has actually been removed.
			ctrl.remove(deleteCardId);
			$httpBackend.flush();
			expect($window.confirm).toHaveBeenCalledWith("Do you really want to remove this card?");
			expect($window.alert).toHaveBeenCalledWith("Card removed successfully!");
			expect(ctrl.cards).toEqual(updatedCards);
		});

	});

});
