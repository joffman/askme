const sqlite3 = require("sqlite3").verbose();

class Database {
	constructor() {
		this.db = new sqlite3.Database("askme.db");
	}

	getTopics(callback) {
		const sql = "SELECT id, name, "
			+ "(SELECT COUNT(*) FROM card WHERE card.topic_id = topic.id) num_cards "
			+ "FROM topic";
		this.db.all(sql, [], function(err, rows) {
			if (err) {
				callback(err, null);
			} else {
				callback(null, rows);
			}
		});
	}

	// todo: where to call db.close()?
}

module.exports = Database;
