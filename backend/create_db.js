const sqlite3 = require("sqlite3");

var db = new sqlite3.Database("askme.db");

db.serialize(function() {
    db.run("PRAGMA foreign_keys = ON");

	console.log("Creating user table...");
    db.run(
        "CREATE TABLE IF NOT EXISTS user (\n" +
            "\tid INTEGER PRIMARY KEY NOT NULL,\n" +
            "\tusername TEXT UNIQUE NOT NULL CHECK(username <> ''),\n" +
            "\temail TEXT UNIQUE NOT NULL CHECK(email <> ''),\n" +
            "\tpassword TEXT NOT NULL CHECK(password <> ''),\n" +
            "\tisAdmin INTEGER NOT NULL DEFAULT 0 CHECK( isAdmin in (0, 1) )\n" +
            ")" // TODO: Add 'active' flag.
        //	The user has to activate his account, clicking a link in email.
    );

	console.log("Creating category table...");
    db.run(
        "CREATE TABLE IF NOT EXISTS category (\n" +
            "\tid INTEGER PRIMARY KEY NOT NULL,\n" +
            "\tname TEXT UNIQUE NOT NULL\n" +
            ")"
    );

	console.log("Creating collection table...");
    db.run(
        "CREATE TABLE IF NOT EXISTS collection (\n" +
            "\tid INTEGER PRIMARY KEY NOT NULL,\n" +
            "\tname TEXT UNIQUE NOT NULL,\n" +
            "\tdescription TEXT,\n" +
            "\tuserId INTEGER NOT NULL,\n" +
            "\tpublic INTEGER NOT NULL DEFAULT 0 CHECK( public in (0, 1) ),\n" +
            "\tFOREIGN KEY(userId) REFERENCES user(id) ON DELETE CASCADE\n" +
            ")"
    );

	console.log("Creating collectionCategory table...");
    db.run(
        "CREATE TABLE IF NOT EXISTS collectionCategory (\n" +
            "\tcollectionId INTEGER NOT NULL,\n" +
            "\tcategoryId INTEGER NOT NULL,\n" +
            "\tFOREIGN KEY(collectionId) REFERENCES collection(id) ON DELETE CASCADE,\n" +
            "\tFOREIGN KEY(categoryId) REFERENCES category(id),\n" +
            "\tPRIMARY KEY(collectionId, categoryId)\n" +
            ")"
    );

	console.log("Creating card table...");
    db.run(
        "CREATE TABLE IF NOT EXISTS card (\n" +
            "\tid INTEGER PRIMARY KEY NOT NULL,\n" +
            "\ttitle TEXT UNIQUE NOT NULL,\n" +
            "\tquestion TEXT,\n" +
            "\tanswer TEXT,\n" +
            "\tcollectionId INTEGER NOT NULL,\n" +
            "\tuserId INTEGER NOT NULL,\n" +
            "\tFOREIGN KEY(collectionId) REFERENCES collection(id),\n" +
            "\tFOREIGN KEY(userId) REFERENCES user(id) ON DELETE CASCADE\n" +
            ")"
    );

	console.log("Creating attachment table...");
    db.run(
        "CREATE TABLE IF NOT EXISTS attachment (\n" +
            "\tid INTEGER PRIMARY KEY NOT NULL,\n" +
            "\tpath TEXT UNIQUE NOT NULL CHECK(path <> ''),		-- path within user-app\n" +
            "\tcardId INTEGER NOT NULL,\n" +
            "\tbelongsTo TEXT NOT NULL CHECK( belongsTo in ('Q', 'A') ),\n" +
            "\tFOREIGN KEY(cardId) REFERENCES card(id)\n" +
            ")"
    );

	console.log("Creating collectionRating table...");
    db.run(
        "CREATE TABLE IF NOT EXISTS collectionRating (\n" +
            "\tid INTEGER PRIMARY KEY NOT NULL,\n" +
            "\trating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),\n" +
            "\tcomment TEXT NOT NULL CHECK(comment <> ''),\n" +
            "\ttimestamp INTEGER NOT NULL,\n" +
            "\tcollectionId INTEGER NOT NULL,	-- rated collection\n" +
            "\tuserId INTEGER NOT NULL,			-- author\n" +
            "\tFOREIGN KEY(userId) REFERENCES user(id) ON DELETE CASCADE,\n" +
            "\tFOREIGN KEY(collectionId) REFERENCES collection(id) ON DELETE CASCADE,\n" +
            "\tCONSTRAINT oneRatingPerUser UNIQUE(collectionId, userId)\n" +
            ")"
    );

	console.log("Closing database connection...");
    db.close(function(err) {
        if (err) console.log("Error when closing db-connection:", err);
    });
});
