angular.module("common.attachment")
.factory("Attachment", ["$resource", "Upload", function($resource, Upload) {

	// We use the standard resource but add a function for the upload.

	var svc = $resource("api1/cards/:card_id/attachments/:attachment_id", {}, {
		query: { method: "GET", isArray: false },
	});

	svc.addAttachment = function (attachment) {
		return Upload.upload({
			url: `api1/cards/${attachment.card_id}/attachments`,
			data: {questionImage: attachment.file,
				belongs_to: attachment.belongs_to}
		});
	}

	return svc;
}]);
