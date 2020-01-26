const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;

const winston_logger = require("./config/winston.js");
const Database = require("./database.js");
const database = new Database();

function initialize(passport) {
	winston_logger.debug("Initializing passport...");
    const authenticateUser = async function(username, password, done) {
		winston_logger.debug(`authenticateUser entered for user ${username}.`);
        var user;

        // Get user from database and check if he exists.
        try {
            user = await database.getUserFromUsername(username);
        } catch (err) {
            winston_logger.error(`authenticateUser: Getting user ${username} failed. Error: %o`, err);
            done(err);
        }
        if (!user) {
			winston_logger.debug(`authenticateUser: No user with username ${username}. Authentication failed.`);
            return done(null, false, {
                message: "No user with given email."
            });
        }

        // Compare password-hashes.
        try {
			winston_logger.debug(`authenticateUser: Checking password for user ${username}.`);
            if (await bcrypt.compare(password, user.password)) {
				winston_logger.debug(`authenticateUser: Successfully authenticated user ${username}.`);
                return done(null, user);
			} else {
				winston_logger.debug(`authenticateUser: Authentcation of user ${username} failed. `
						+ "Password is incorrect.");
                return done(null, false, {
                    message: "Password is incorrect."
                });
			}
        } catch (err) {
			winston_logger.error(`authenticateUser: Error when comparing hashes for user ${username}. `
					+ "Error: %o", err);
            done(err);
        }
    };

    passport.use(
        new LocalStrategy({ usernameField: "username" }, authenticateUser)
    );

    // Store the complete user in the session.
    // XXX Is this a good idea?
    // 	See https://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((user, done) => done(null, user));
    // Alternative:
    //    passport.serializeUser((user, done) => done(null, user.username));
    //    passport.deserializeUser((username, done) => {
    //		database.getUserFromUsername(username).then(user => {
    //			done(null, user);
    //		}).catch(err => {
    //			done(err, null);
    //		});
    //	});
}

module.exports = initialize;
