const express = require("express");
const passport = require("passport");
const router = express.Router();

router.post("/", function(req, res) {
    console.log("Request to /logout.");
    req.logout();
    res.status(200).json({
        success: true
    });
});

module.exports = router;
