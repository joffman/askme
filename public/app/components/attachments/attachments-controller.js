angular.module("attachments.controllers", ["attachments.services", "ngFileUpload"])
.controller("attachmentsController", ["$scope", "$routeParams", "attachmentsSvc", "Upload",
		function($scope, $routeParams, attachmentsSvc, Upload) {

	// Fetch attachments.
	attachmentsSvc.queryAttachments($routeParams.cardId).then(function(resp_data) {
		$scope.attachments = resp_data.attachments;
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
		const attachment = {card_id: $routeParams.cardId, file: file,
			belongs_to: belongs_to};
		try {
			var response = await attachmentsSvc.addAttachment(attachment);
			if (!response.data.success)
				throw(Error("addAttachment was not successful"));
			$scope.attachments.push(response.data.attachment);
			alert("Successfully uploaded attachment!");
		} catch (err) {
			alert("Upload failed: " + err);
		}
	};

		}
]);
