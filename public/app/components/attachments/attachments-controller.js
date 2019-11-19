angular.module("attachments.controllers", ["attachments.services", "ngFileUpload"])
.controller("attachmentsController", ["$scope", "$routeParams", "attachmentsSvc", "Upload",
		function($scope, $routeParams, attachmentsSvc, Upload) {

	// Fetch attachments.
	$scope.questionImage = null;
	$scope.answerImage = null;
	attachmentsSvc.queryAttachments($routeParams.card_id).then(function(resp_data) {
		for (var att of resp_data.attachments) {
			if (att.belongs_to == "Q")
				$scope.questionImage = att;
			else if (att.belongs_to == "A")
				$scope.answerImage = att;
			else
				console.log("Attachment with unknown 'belongs_to' property:", att);
		}
	}).catch((err) => {
		handleApiError(err);
	});


	//////////////////////////////////////////////////
	// Private functions.
	//////////////////////////////////////////////////

	function handleApiError(err) {
		alert("Error: " + err.message);
	}


	//////////////////////////////////////////////////
	// Scope functions.
	//////////////////////////////////////////////////

	$scope.upload = async function(file, belongs_to) {
		const attachment = {card_id: $routeParams.card_id, file: file,
			belongs_to: belongs_to};
		try {
			// Store attachment at backend.
			var response = await attachmentsSvc.addAttachment(attachment);
			if (!response.data.success)
				throw(Error("addAttachment was not successful"));

			// Set question or answer image.
			var att = response.data.attachment;
			if (belongs_to == "Q")
				$scope.$apply(() => {$scope.questionImage = att; });
			else if (belongs_to == "A")
				$scope.$apply(() => {$scope.answerImage = att; });
			else
				console.log("Attachment with unknown 'belongs_to' property:", att);

			alert("Successfully uploaded attachment!");
		} catch (err) {
			alert("Upload failed: " + err);
		}
	};

	$scope.remove = async function(attachment) {
		try {
			await attachmentsSvc.removeAttachment(attachment.card_id, attachment.id);
			if (attachment.belongs_to == "Q")
				$scope.$apply(() => { $scope.questionImage = null; });
			else if (attachment.belongs_to == "A")
				$scope.$apply(() => { $scope.answerImage = null; });
		} catch (err) {
			alert("Removing attachment failed:", err);
		}
	};

		}
]);
