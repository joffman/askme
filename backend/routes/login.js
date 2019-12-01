const bcrypt = require("bcrypt");
const express = require("express");
const passport = require("passport");
const router = express.Router();

const Database = require("../database.js");
var database = new Database();

router.get("/", function(req, res) {
	console.log("GET-request to login.");
	console.log("User:", req.user);
	res.render("../../public/login.ejs");
});

router.post("/", passport.authenticate("local", {
	successRedirect: "/index.html",
	failureRedirect: "/login",
	failureFlash: true
}));

module.exports = router;
