"use strict;"

describe("cardDetails", function() {

	// Mock $window.
	beforeEach(function() {
		$window = {alert: jasmine.createSpy()};

		module(function($provide) {
			$provide.value("$window", $window);
		});
	});

	beforeEach(module("cardDetails"));

	describe("CardDetailsCtrl", function() {

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

		it("should use an empty card if given a card-id of 0", function() {
			// Create controller.
			const collectionId = 5;
			const bindings = {
				cardId: 0,
				collectionId: collectionId
			};
			var ctrl = $componentController("cardDetails", null, bindings);
			ctrl.$onInit();

			// Check initial state.
			expect(ctrl.card).toEqual({
                id: 0,
                collectionId: collectionId
            });
		});

		it("should load the card with the given id on init", function() {
			const testCard = {
				id: 3,
				collectionId: 4,
				title: "test title",
				question: "test question",
				answer: "test answer",
				userId: 77
			};
			const testResponse = {
				success: true,
				card: testCard
			};

			// Init http-backend.
			$httpBackend.expectGET("/api1/cards/" + testCard.id).respond(testResponse);

			// Create controller.
			const bindings = {
				cardId: 3,
				collectionId: 4
			};
			var ctrl = $componentController("cardDetails", null, bindings);
			ctrl.$onInit();
			expect(ctrl.card).toEqual({});

			// Flush backend and check successful reception of card.
			$httpBackend.flush();
			expect(ctrl.card).toEqual(testCard);
		});

		it("should create a new card on submit", function() {
			// Create controller.
			const bindings = {
				cardId: 0,
				collectionId: 4
			};
			var ctrl = $componentController("cardDetails", null, bindings);
			ctrl.$onInit();

			// Define test card and set details of controller-card (fill-out the form).
			var testCard = {
				id: 0,
				collectionId: 4,
				title: "new title",
				question: "new question",
				answer: "new answer"
			};
			ctrl.card = testCard;

			// Init http-backend.
			const testResponse = {
				success: true,
				id: 55
			};
			$httpBackend.expectPOST("/api1/cards", testCard).respond(testResponse);

			// Update card and check that id from backend has been
			// added to controller-card and that the success-message
			// is alerted().
			ctrl.onSubmit();
			$httpBackend.flush();
			testCard.id = testResponse.id;
			expect(ctrl.card).toEqual(testCard);
			expect($window.alert).toHaveBeenCalledWith("Successfully added card.");
		});

		it("should update an existing card on submit", function() {
			// Init controller.
			var ctrl = $componentController("cardDetails");
			ctrl.card = {
				id: 3,		// this means that this is an existing card
				collectionId: 4,
				title: "test title",
				question: "test question",
				answer: "test answer",
				userId: 77
			};

			// Setup http-backend.
			const testResponse = {
				success: true
			};
			$httpBackend.expectPUT("/api1/cards/" + ctrl.card.id, ctrl.card).respond(testResponse);

			// Update card.
			ctrl.onSubmit();
			$httpBackend.flush();

			// Check expectations.
			expect($window.alert).toHaveBeenCalledWith("Successfully updated card.");
		});
	});

});
