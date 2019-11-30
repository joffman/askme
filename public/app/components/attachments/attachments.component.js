function AttachmentsCtrl($scope, $routeParams, Attachment, Upload) {

	var self = this;

	// Fetch attachments.
	self.questionImage = null;
	self.answerImage = null;
	Attachment.query({card_id: $routeParams.card_id}).$promise.then((resp_data) => {
		for (var att of resp_data.attachments) {
			if (att.belongs_to == "Q")
				self.questionImage = att;
			else if (att.belongs_to == "A")
				self.answerImage = att;
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

	self.upload = async function(file, belongs_to) {
		const attachment = {card_id: $routeParams.card_id, file: file,
			belongs_to: belongs_to};
		try {
			// Store attachment at backend.
			var response = await Attachment.addAttachment(attachment);
			if (!response.data.success)
				throw(Error("addAttachment was not successful"));

			// Set question or answer image.
			var att = response.data.attachment;
			if (belongs_to == "Q")
				$scope.$apply(() => {self.questionImage = att; });
			else if (belongs_to == "A")
				$scope.$apply(() => {self.answerImage = att; });
			else
				console.log("Attachment with unknown 'belongs_to' property:", att);

			alert("Successfully uploaded attachment!");
		} catch (err) {
			alert("Upload failed: " + err);
		}
	};

	self.remove = async function(attachment) {
		try {
			// Do we need await? Can't we just remove it and the '$promise'?
			await Attachment.remove({card_id: attachment.card_id, attachment_id: attachment.id}).$promise;
			if (attachment.belongs_to == "Q")
				$scope.$apply(() => { self.questionImage = null; });
			else if (attachment.belongs_to == "A")
				$scope.$apply(() => { self.answerImage = null; });
		} catch (err) {
			alert("Removing attachment failed:", err);
		}
	};

}

angular.module("attachments")
.component("attachments", {
	templateUrl: "app/components/attachments/attachments.html",
	controller: ["$scope", "$routeParams", "Attachment", "Upload", AttachmentsCtrl]
});
