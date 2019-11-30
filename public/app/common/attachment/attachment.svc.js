angular.module("common.attachment")
.factory("Attachment", ["$resource", "Upload", function($resource, Upload) {

	// We use the standard resource but add a function for the upload.

	var svc = $resource("api1/cards/:cardId/attachments/:attachmentId", {}, {
		query: { method: "GET", isArray: false },
	});

	svc.addAttachment = function (attachment) {
		return Upload.upload({
			url: `api1/cards/${attachment.cardId}/attachments`,
			data: {questionImage: attachment.file,
				belongsTo: attachment.belongsTo}
		});
	}

	return svc;
}]);
