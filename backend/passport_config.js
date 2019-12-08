const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;

const Database = require("./database.js");
const database = new Database();

function initialize(passport) {
    const authenticateUser = async function(email, password, done) {
        var user;

        // Get user from database and check if he exists.
        try {
            user = await database.getUserFromEmail(email);
        } catch (err) {
            console.log("authenticateUser: error on getting user:", err);
            done(err);
        }
        if (!user) {
            return done(null, false, {
                message: "No user with given email."
            });
        }

        // Compare password-hashes.
        try {
            if (await bcrypt.compare(password, user.password))
                return done(null, user);
            else
                return done(null, false, {
                    message: "Password is incorrect."
                });
        } catch (err) {
            console.log("Error on hash-comparison:", err);
            done(err);
        }
    };

    passport.use(
        new LocalStrategy({ usernameField: "email" }, authenticateUser)
    );

    // Store the complete user in the session.
    // XXX Is this a good idea?
    // 	See https://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((user, done) => done(null, user));
    // Alternative:
    //    passport.serializeUser((user, done) => done(null, user.email));
    //    passport.deserializeUser((email, done) => {
    //		database.getUserFromEmail(email).then(user => {
    //			done(null, user);
    //		}).catch(err => {
    //			done(err, null);
    //		});
    //	});
}

module.exports = initialize;
