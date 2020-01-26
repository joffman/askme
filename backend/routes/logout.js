const express = require("express");
const passport = require("passport");
const router = express.Router();

router.post("/", function(req, res) {
    req.logout();
    res.status(200).json({
        success: true
    });
});

module.exports = router;
