const express = require("express");
const router = express.Router();

const winston_logger = require("../../config/winston.js");
const Database = require("../../database.js");

var database = new Database();

router.get("/", async function(req, res) {
    try {
        // Fetch and return users.
        var usersData = await database.getUsers();
        return res.json({ success: true, users: usersData });
    } catch (err) {
        winston_logger("UserRoutes.getUsers: Error: %o", err);
        res.statusCode = 500;
        return res.json({
            success: false,
            errorMsg: err.message
        });
    }
});

router.get("/me", async function(req, res) {
    try {
        // Get session-user from database.
        var userData = await database.getUserFromId(req.user.id);
        delete userData.password;
        return res.json({ success: true, user: userData });
    } catch (err) {
        winston_logger(
            "UserRoutes.getMe (user-id: ${req.user.id}): Error: %o",
            err
        );
        res.statusCode = 500;
        res.json({
            success: false,
            errorMsg: err.message
        });
    }
});

module.exports = router;
