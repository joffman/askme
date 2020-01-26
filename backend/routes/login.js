const bcrypt = require("bcrypt");
const express = require("express");
const passport = require("passport");
const router = express.Router();

const winston_logger = require("../config/winston.js");
const Database = require("../database.js");
var database = new Database();

router.get("/", function(req, res) {
    res.render("../../apps/login.ejs");
});

router.post("/", function(req, res, next) {
    passport.authenticate("local", function(err, user, info) {
        if (err) {
            winston_logger.error(`Error on authentication: ${err.message}`);
            return next(err);
        }

        if (!user) {
            winston_logger.info(
                "User authentication failed. Redirecting to login..."
            );
            return res.redirect("/login");
            // TODO Set flash message.
        }

        // Establish a session.
        winston_logger.debug(`Establishing session for user ${user}...`);
        req.login(user, function(err) {
            if (err) {
                winston_logger.error(
                    `Error on establishing session for user ${user}.`
                );
                return next(err);
            }

            if (user.isAdmin) {
                winston_logger.debug(
                    `Redirecting admin ${user} to admin-app...`
                );
                return res.redirect("/adminApp/index.html");
            } else {
                winston_logger.error(`Redirecting user ${user} to user-app...`);
                return res.redirect("/userApp/index.html");
            }
        });
    })(req, res, next);
});
//		{
//        successRedirect: "/index.html",
//        failureRedirect: "/login",
//        failureFlash: true
//    }

module.exports = router;
