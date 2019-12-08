const sqlite3 = require("sqlite3");

var db = new sqlite3.Database("askme.db");

db.serialize(function() {
    db.run("PRAGMA foreign_keys = ON");

    db.run(
        "CREATE TABLE IF NOT EXISTS user (\n" +
            "\tid INTEGER PRIMARY KEY NOT NULL,\n" +
            "\temail TEXT UNIQUE NOT NULL CHECK(email <> ''),\n" +
            "\tpassword TEXT NOT NULL CHECK(password <> '')\n" +
            ")"	// TODO: Add 'active' flag.
				//	The user has to activate his account, clicking a link in email.
    );

    db.run(
        "CREATE TABLE IF NOT EXISTS category (\n" +
            "\tid INTEGER PRIMARY KEY NOT NULL,\n" +
            "\tname TEXT UNIQUE NOT NULL\n" +
            ")"
    );

    db.run(
        "CREATE TABLE IF NOT EXISTS collection (\n" +
            "\tid INTEGER PRIMARY KEY NOT NULL,\n" +
            "\tname TEXT UNIQUE NOT NULL\n" +
            ")"
    );

    db.run(
        "CREATE TABLE IF NOT EXISTS collectionCategory (\n" +
            "\tcollectionId INTEGER NOT NULL,\n" +
            "\tcategoryId INTEGER NOT NULL,\n" +
            "\tFOREIGN KEY(collectionId) REFERENCES collection(id) ON DELETE CASCADE,\n" +
            "\tFOREIGN KEY(categoryId) REFERENCES category(id),\n" +
            "\tPRIMARY KEY(collectionId, categoryId)\n" +
            ")"
    );

    db.run(
        "CREATE TABLE IF NOT EXISTS card (\n" +
            "\tid INTEGER PRIMARY KEY NOT NULL,\n" +
            "\ttitle TEXT UNIQUE NOT NULL,\n" +
            "\tquestion TEXT,\n" +
            "\tanswer TEXT,\n" +
            "\tcollectionId INTEGER NOT NULL,\n" +
            "\tFOREIGN KEY(collectionId) REFERENCES collection(id)\n" +
            ")"
    );

    db.run(
        "CREATE TABLE IF NOT EXISTS attachment (\n" +
            "\tid INTEGER PRIMARY KEY NOT NULL,\n" +
            "\tpath TEXT UNIQUE NOT NULL CHECK(path <> ''),\n" +
            "\tcardId INTEGER NOT NULL,\n" +
            "\tbelongsTo TEXT NOT NULL CHECK( belongsTo in ('Q', 'A') ),\n" +
            "\tFOREIGN KEY(cardId) REFERENCES card(id)\n" +
            ")"
    );

    db.close(function(err) {
        if (err) console.log("Error when closing db-connection:", err);
    });
});
