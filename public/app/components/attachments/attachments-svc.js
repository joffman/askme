angular.module("attachments.services", ["ngFileUpload"])
.factory("attachmentsSvc", ["$resource", "Upload", function($resource, Upload) {
	var attachmentsResource = $resource("api1/cards/:card_id/attachments/:attachment_id", {}, {});

	function queryAttachments(card_id) {
		return attachmentsResource.get({card_id: card_id}).$promise;
	}

	function removeAttachment(card_id, attachment_id) {
		return attachmentsResource.remove({
			card_id: card_id,
			attachment_id: attachment_id
		}).$promise;
	}

	function addAttachment(attachment) {
		return Upload.upload({
			url: `api1/cards/${attachment.card_id}/attachments`,
			data: {questionImage: attachment.file,
				belongs_to: attachment.belongs_to}
		});
	}

	return {
		queryAttachments: queryAttachments,
		removeAttachment: removeAttachment,
		addAttachment: addAttachment
	};
}]);
