const sqlite3 = require("sqlite3").verbose();

// TODO Rework error handling.

class Database {
	constructor() {
		this.db = new sqlite3.Database("askme.db");
		this.db.run("PRAGMA foreign_keys = ON", [], function(err) {
			if (err)
				throw err;
		});
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

	addTopic(topic, callback) {
		if ("name" in topic) {
			const sql = "INSERT INTO topic (name) VALUES (?)";
			this.db.run(sql, [topic.name], function(err) {
				if (err) {
					callback(err, null);
				} else {
					callback(null, this.lastID);
				}
			});
		} else {
			callback({message: "invalid topic-data passed to addTopic"}, null);
		}
	}

	deleteTopic(topic_id, callback) {
		const sql = "DELETE FROM topic WHERE id = ?";
		this.db.run(sql, [topic_id], function(err) {
			if (err) {
				callback(err, null);
			} else {
				if (this.changes === 0) {
					callback(null, null);
				} else if (this.changes === 1) {
					callback(null, topic_id);
				} else {
					console.log("Strange number of changes when deleting topic:", this.changes);
					callback({message: "number of changes is not equal to 1"}, null);
				}
			}
		});	
	}

	// todo: where to call db.close()?
}

module.exports = Database;
