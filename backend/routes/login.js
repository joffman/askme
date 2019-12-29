const bcrypt = require("bcrypt");
const express = require("express");
const passport = require("passport");
const router = express.Router();

const Database = require("../database.js");
var database = new Database();

router.get("/", function(req, res) {
    console.log("GET-request to login.");
    console.log("User:", req.user);
    res.render("../../apps/login.ejs");
});

router.post("/", function(req, res, next) {
    console.log("Checking authentication...");
    passport.authenticate("local", function(err, user, info) {
        if (err) {
            console.log("Error on authentication.");
            return next(err);
        }

        if (!user) {
            console.log("User no authenticated. Redirect to login...");
            res.redirect("/login");
            // TODO Set flash message.
        }

        // Establish a session.
        console.log("Establishing session...");
        req.login(user, function(err) {
            if (err) {
                console.log("...error.");
                return next(err);
            }

            if (user.isAdmin) {
                console.log("Redirecting admin...");
                return res.redirect("/adminApp/index.html");
            } else {
                console.log("Redirecting user...");
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
