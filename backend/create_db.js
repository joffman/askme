const sqlite3 = require("sqlite3");

var db = new sqlite3.Database("askme.db");

db.serialize(function() {
	db.run("PRAGMA foreign_keys = ON");

	db.run("CREATE TABLE IF NOT EXISTS category (\n"
			+ "\tid INTEGER PRIMARY KEY NOT NULL,\n"
			+ "\tname TEXT UNIQUE NOT NULL\n"
			+ ")");

	db.run("CREATE TABLE IF NOT EXISTS collection (\n"
			+ "\tid INTEGER PRIMARY KEY NOT NULL,\n"
			+ "\tname TEXT UNIQUE NOT NULL\n"
			+ ")");

	db.run("CREATE TABLE IF NOT EXISTS collection_category (\n"
			+ "\tcollection_id INTEGER NOT NULL,\n"
			+ "\tcategory_id INTEGER NOT NULL,\n"
			+ "\tFOREIGN KEY(collection_id) REFERENCES collection(id) ON DELETE CASCADE,\n"
			+ "\tFOREIGN KEY(category_id) REFERENCES category(id),\n"
			+ "\tPRIMARY KEY(collection_id, category_id)\n"
			+ ")");

	db.run("CREATE TABLE IF NOT EXISTS card (\n"
			+ "\tid INTEGER PRIMARY KEY NOT NULL,\n"
			+ "\ttitle TEXT UNIQUE NOT NULL,\n"
			+ "\tquestion TEXT,\n"
			+ "\tanswer TEXT,\n"
			+ "\tcollection_id INTEGER NOT NULL,\n"
			+ "\tFOREIGN KEY(collection_id) REFERENCES collection(id)\n"
			+ ")");

	db.run("CREATE TABLE IF NOT EXISTS attachment (\n"
			+ "\tid INTEGER PRIMARY KEY NOT NULL,\n"
			+ "\tpath TEXT UNIQUE NOT NULL CHECK(path <> ''),\n"
			+ "\tcard_id INTEGER NOT NULL,\n"
			+ "\tbelongs_to TEXT NOT NULL CHECK( belongs_to in ('Q', 'A') ),\n"
			+ "\tFOREIGN KEY(card_id) REFERENCES card(id)\n"
			+ ")");

	db.close(function(err) {
		if (err)
			console.log("Error when closing db-connection:", err);
	});

});
