function AttachmentsCtrl($scope, $routeParams, Utils, Attachment, Upload) {
    var self = this;

    // Fetch attachments.
    self.questionImage = null;
    self.answerImage = null;
    Attachment.query({ cardId: $routeParams.cardId })
        .$promise.then(respData => {
            for (var att of respData.attachments) {
                if (att.belongsTo == "Q") self.questionImage = att;
                else if (att.belongsTo == "A") self.answerImage = att;
                else
                    console.log(
                        "Attachment with unknown 'belongsTo' property:",
                        att
                    );
            }
        })
        .catch(err => {
            Utils.handleApiError(err);
        });

    //////////////////////////////////////////////////
    // Scope functions.
    //////////////////////////////////////////////////

    self.upload = async function(file, belongsTo) {
        const attachment = {
            cardId: $routeParams.cardId,
            file: file,
            belongsTo: belongsTo
        };
        try {
            // Store attachment at backend.
            var response = await Attachment.addAttachment(attachment);
            if (!response.data.success)
                throw Error("addAttachment was not successful");

            // Set question or answer image.
            var att = response.data.attachment;
            if (belongsTo == "Q")
                $scope.$apply(() => {
                    self.questionImage = att;
                });
            else if (belongsTo == "A")
                $scope.$apply(() => {
                    self.answerImage = att;
                });
            else
                console.log(
                    "Attachment with unknown 'belongsTo' property:",
                    att
                );

            alert("Successfully uploaded attachment!");
        } catch (err) {
            alert("Upload failed: " + err);
        }
    };

    self.remove = async function(attachment) {
        try {
            // Do we need await? Can't we just remove it and the '$promise'?
            await Attachment.remove({
                cardId: attachment.cardId,
                attachmentId: attachment.id
            }).$promise;
            if (attachment.belongsTo == "Q")
                $scope.$apply(() => {
                    self.questionImage = null;
                });
            else if (attachment.belongsTo == "A")
                $scope.$apply(() => {
                    self.answerImage = null;
                });
        } catch (err) {
            alert("Removing attachment failed:", err);
        }
    };
}

angular.module("attachments").component("attachments", {
    templateUrl: "app/attachments/attachments.html",
    controller: [
        "$scope",
        "$routeParams",
		"Utils",
        "Attachment",
        "Upload",
        AttachmentsCtrl
    ]
});
