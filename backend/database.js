const sqlite3 = require("sqlite3").verbose();

const winston_logger = require("./config/winston.js");

// TODO Rework error handling.

class Database {
    constructor() {
        this.db = new sqlite3.Database("askme.db", sqlite3.OPEN_READWRITE);

        this.db.run("PRAGMA foreign_keys = ON", [], function(err) {
            if (err) throw err;
        });

        //////////////////////////////////////////////////
        // Define async functions.
        //////////////////////////////////////////////////

        this.db.getAsync = function(sql, params) {
            var that = this;
            return new Promise(function(resolve, reject) {
                that.get(sql, params, function(err, row) {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
        };

        this.db.runAsync = function(sql, params) {
            var that = this;
            return new Promise(function(resolve, reject) {
                that.run(sql, params, function(err) {
                    if (err) reject(err);
                    else resolve();
                });
            });
        };

        this.db.allAsync = function(sql, params) {
            var that = this;
            return new Promise(function(resolve, reject) {
                that.all(sql, params, function(err, rows) {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
        };

        this.db.deleteAsync = function(sql, params) {
            var that = this;
            return new Promise(function(resolve, reject) {
                that.run(sql, params, function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                });
            });
        };

        this.db.updateAsync = function(sql, params) {
            var that = this;
            return new Promise(function(resolve, reject) {
                that.run(sql, params, function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                });
            });
        };

        this.db.insertAsync = function(sql, params) {
            var that = this;
            return new Promise(function(resolve, reject) {
                that.run(sql, params, function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                });
            });
        };
    }

    //////////////////////////////////////////////////
    // Users API.
    //////////////////////////////////////////////////

    // Return all users.
    getUsers() {
        winston_logger.debug("database.getUsers entered.");
        const sql = "SELECT id, username, email, isAdmin FROM user";
        return this.db.allAsync(sql, []);
    }

    getUserFromId(userid) {
        winston_logger.debug(
            `database.getUserFromId entered for id ${userid}.`
        );
        const sql = "SELECT * FROM user WHERE id = ?";
        return this.db.getAsync(sql, [userid]);
    }

    getUserFromUsername(username) {
        winston_logger.debug(
            `database.getUserFromUsername entered for user ${username}.`
        );
        const sql = "SELECT * FROM user WHERE username = ?";
        return this.db.getAsync(sql, [username]);
    }

    addUser(user) {
        winston_logger.debug(
            `database.addUser entered for user ${user.username}.`
        );
        const sql =
            "INSERT INTO user (username, email, password, isAdmin) VALUES (?, ?, ?, ?)";
        return this.db.insertAsync(sql, [
            user.username,
            user.email,
            user.password,
            user.isAdmin
        ]);
    }

    //////////////////////////////////////////////////
    // Categories API.
    //////////////////////////////////////////////////

    getCategories() {
        winston_logger.debug(`database.getCategories entered.`);
        const sql = "SELECT * FROM category";
        return this.db.allAsync(sql, []);
    }

    addCategory(category) {
        winston_logger.debug(
            "database.addCategory entered. Category: %o.",
            category
        );
        // TODO: Can't we just let the database do the validation?
        if ("name" in category) {
            const sql = "INSERT INTO category (name) VALUES (?)";
            return this.db.insertAsync(sql, [category.name]);
        } else {
            return Promise.reject({
                message: "invalid category-data passed to addCategory"
            });
        }
    }

    deleteCategory(categoryId) {
        winston_logger.debug(
            `database.deleteCategory entered for categoryId {$categoryId}.`
        );
        // TODO Make sure that deletion is not possible if collectionCategory table
        //   contains corresponding entries.
        const sql = "DELETE FROM category WHERE id = ?";
        return this.db.deleteAsync(sql, categoryId);
    }

    //////////////////////////////////////////////////
    // Collections API.
    //////////////////////////////////////////////////

    getCollections(filter) {
        winston_logger.debug(
            "database.getCollections entered with filter: %o",
            filter
        );
        // todo: Create temporary table for namedCollectionCategories
        // to improve readability.
        var sql =
            "SELECT *, " +
            "(SELECT user.username FROM user WHERE user.id = collection.userId) username, " +
            "(SELECT group_concat(namedCollectionCategories.name, ',') categoryNames " +
            "FROM (SELECT collectionCategory.collectionId, category.name from collectionCategory INNER JOIN category ON collectionCategory.categoryId = category.id) " +
            "AS namedCollectionCategories WHERE namedCollectionCategories.collectionId = collection.id) categoryNames, " +
            "(SELECT COUNT(*) FROM card WHERE card.collectionId = collection.id) numCards " +
            "FROM collection";
        var values = [];
        if (filter) {
            sql += " WHERE";
            const validKeys = ["userId", "public"];
            var first = true;
            for (var key in filter) {
                if (!validKeys.includes(key))
                    throw Error("Invalid filter key: " + key);
                if (!first) sql += " AND";
                sql += " " + key + " = ?";
                values.push(filter[key]);
                first = false;
            }
        }
        winston_logger.debug(
            `database.getCollections: Using sql '${sql}' with values: %o`,
            values
        );
        return this.db.allAsync(sql, values);
    }

    getCollection(id) {
        winston_logger.debug(
            `database.getCollection entered with collectionId ${id}.`
        );

        // Get collection-promise.
        const collSql = "SELECT * FROM collection WHERE id = ?";
        var collProm = this.db.getAsync(collSql, [id]);

        // Get category-ids-promise.
        const catSql =
            "SELECT categoryId FROM collectionCategory " +
            "WHERE collectionId = ?";
        var catProm = this.db.allAsync(catSql, [id]);

        return Promise.all([collProm, catProm]).then(values => {
            var coll = values[0];
            if (!coll) {
                winston_logger.debug(
                    `database.getCollection: No collection found for collectionId ${id}.`
                );
                return null;
            }

            // Merge collection and categories.
            var cats = values[1];
            winston_logger.debug(
                "database.getCollection: Found collection: %o\n " +
                    "with categories %o:",
                coll,
                cats
            );
            coll.categoryIds = cats.map(elem => {
                return elem.categoryId;
            });
            return coll;
        });
    }

    async addCollection(collection, userId) {
        winston_logger.debug(
            `database.addCollection entered for user-id ${userId} and collection: %o`,
            collection
        );
        try {
            await this.db.runAsync("BEGIN TRANSACTION");

            // Insert collection.
            winston_logger.debug(
                `database.addCollection: Creating collection ${collection.name} for user-id ${userId}...`
            );
            const collSql =
                "INSERT INTO collection (name, description, userId, public) VALUES (?, ?, ?, ?)";
            const collId = await this.db.insertAsync(collSql, [
                collection.name,
                collection.description,
                userId,
                0
            ]);

            if (!collection.categoryIds || collection.categoryIds.length == 0) {
                winston_logger.debug(
                    `database.addCollection: No category-ids given for collection '${collection.name}'. Committing...`
                );
                return this.db.runAsync("COMMIT").then(() => {
                    return collId;
                });
            }

            // Create promises for inserting the collection-categories.
            var collCatPromises = [];
            winston_logger.debug(
                `database.addCollection: Creating collectionCategory-entries for collection '${collection.name}'...`
            );
            for (var catId of collection.categoryIds) {
                const collCatSql =
                    "INSERT INTO collectionCategory " +
                    "(collectionId, categoryId) VALUES (?, ?)";
                collCatPromises.push(
                    this.db.insertAsync(collCatSql, [collId, catId])
                );
            }
            return Promise.all(collCatPromises)
                .then(async values => {
                    // We successfully inserted the collection and all
                    // collection-categories.
                    // Commit the transaction and return the ID of the new collection.
                    winston_logger.debug(
                        `database.addCollection: Collection '${collection.name}' and corresponding ` +
                            "collectionCategory-entries successfully created. Committing..."
                    );
                    await this.db.runAsync("COMMIT");
                    return collId;
                })
                .catch(async err => {
                    winston_logger.warn(
                        `database.addCollection: Error when creating collection '${collection.name}': %o\nRolling back...`,
                        err
                    );
                    await this.db.runAsync("ROLLBACK");
                    return Promise.reject(err);
                });
        } catch (err) {
            winston_logger.warn(
                `database.addCollection: Error when creating collection '${collection.name}': %o\nRolling back...`,
                err
            );
            await this.db.runAsync("ROLLBACK");
            return Promise.reject(err);
        }
    }

    async publishCollection(collId, userId) {
        winston_logger.debug(
            `database.publishCollection entered for collection-id ${collId} and user-id ${userId}.`
        );

        // Only the owner of a collection is allowed to publish it.
        const userSql = "SELECT userId FROM collection WHERE id = ?";
        const userResult = await this.db.getAsync(userSql, [collId]);
        if (userResult.userId !== userId) {
            winston_logger.warn(
                `database.publishCollection: Non-owner with user-id ${userId} trying to publish collection ${collId}. Aborting...`
            );
            throw Error(
                "Only the owner of the collection is allowed to " +
                    "publish it."
            );
        }

        // Return promise for publishing the collection.
        winston_logger.debug(
            `database.publishCollection: Trying to publish collection with id ${collId}...`
        );
        const publishSql = "UPDATE collection SET public = 1 WHERE id = ?";
        return this.db.runAsync(publishSql, [collId]);
    }

    async updateCollection(collId, collection, userId) {
        winston_logger.debug(
            `database.updateCollection entered for collection-id ${collId}, user-id ${userId} and collection: %o`,
            collection
        );

        // Only the owner of a collection is allowed to update it.
        const userSql = "SELECT userId FROM collection WHERE id = ?";
        const userResult = await this.db.getAsync(userSql, [collId]);
        if (userResult.userId !== userId) {
            winston_logger.warn(
                `database.updateCollection (collection-id: ${collId}): Non-owner with user-id ${userId} trying to update collection. Aborting...`
            );
            throw Error(
                "Only the owner of the collection is allowed to " + "update it."
            );
        }
        try {
            // Start updating the database.
            await this.db.runAsync("BEGIN TRANSACTION");

            // Create update-collection promise.
            const collSql =
                "UPDATE collection SET name = ?, description = ? WHERE id = ?";
            var collProm = this.db
                .updateAsync(collSql, [
                    collection.name,
                    collection.description,
                    collId
                ])
                .then(changes => {
                    if (changes == 0) {
                        winston_logger.warn(
                            `database.updateCollection (collection-id: ${collId}): Updating collection failed. No collection with given id.`
                        );
                        return Promise.reject(
                            Error(`No collection with given id ${collId}.`)
                        );
                    } else {
                        return changes;
                    }
                });

            // Remove all categories from this collection.
            const deleteCollCatsSql =
                "DELETE FROM collectionCategory WHERE collectionId = ?";
            await this.db.deleteAsync(deleteCollCatsSql, [collId]);

            // Create promises to insert categories for this collection.
            var promises = [];
            if (collection.categoryIds) {
                for (var catId of collection.categoryIds) {
                    // TODO Create function for insert into collectionCategory.
                    const sql =
                        "INSERT INTO collectionCategory " +
                        "(collectionId, categoryId) VALUES (?, ?)";
                    promises.push(this.db.insertAsync(sql, [collId, catId]));
                }
            }

            // Collect all promises and check their outcome.
            promises.push(collProm);
            return Promise.all(promises)
                .then(values => {
                    winston_logger.debug(
                        `database.updateCollection (collection-id: ${collId}): All promises fulfilled. Committing...`
                    );
                    return this.db.runAsync("COMMIT");
                })
                .catch(err => {
                    winston_logger.warn(
                        `database.updateCollection (collection-id: ${collId}): Unfulfilled promise. Error: %o\nRolling back...`,
                        err
                    );
                    return this.db.runAsync("ROLLBACK").then(() => {
                        return Promise.reject(err);
                    });
                });
        } catch (err) {
            winston_logger.warn(
                `database.updateCollection (collection-id: ${collId}): Error on async operation: %o\nRolling back...`,
                err
            );
            await this.db.runAsync("ROLLBACK");
            return Promise.reject(err);
        }
    }

    deleteCollection(collectionId) {
        // TODO Assert user-id == owner-id.
        winston_logger.debug(
            `database.deleteCollection entered for collection-id ${collectionId}.`
        );
        const sql = "DELETE FROM collection WHERE id = ?";
        return this.db.deleteAsync(sql, collectionId);
    }

    //////////////////////////////////////////////////
    // Cards API.
    //////////////////////////////////////////////////

    getUserCards(collectionId, userId) {
        winston_logger.debug(
            `database.getUserCards entered for collection-id ${collectionId} and user-id ${userId}.`
        );
        const sql =
            "SELECT id, title FROM card" +
            " WHERE collectionId = ? AND userId = ?";
        return this.db.allAsync(sql, [collectionId, userId]);
    }

    getCard(cardId) {
        winston_logger.debug(`database.getCard entered for card-id ${cardId}.`);
        const sql = "SELECT * FROM card WHERE id = ?";
        return this.db.getAsync(sql, [cardId]);
    }

    addCard(card, userId) {
        winston_logger.debug(
            `database.addCard entered for user-id ${userId} with card: %o`,
            card
        );
        // The database does the validation.
        const sql =
            "INSERT INTO card (title, question, answer, collectionId, userId)" +
            " VALUES (?, ?, ?, ?, ?)";
        return this.db.insertAsync(sql, [
            card.title,
            card.question,
            card.answer,
            card.collectionId,
            userId
        ]);
    }

    updateCard(cardId, card) {
        winston_logger.debug(
            `database.updateCard entered for card-id ${cardId} with card: %o`,
            card
        );
        // The database does the validation.
        const sql =
            "UPDATE card SET title=?, question=?, answer=?, collectionId=? " +
            "WHERE id=?";
        return this.db.updateAsync(sql, [
            card.title,
            card.question,
            card.answer,
            card.collectionId,
            cardId
        ]);
    }

    deleteCard(cardId) {
        winston_logger.debug(
            `database.deleteCard entered for card-id ${cardId}.`
        );
        const sql = "DELETE FROM card WHERE id = ?";
        return this.db.deleteAsync(sql, [cardId]);
    }

    //////////////////////////////////////////////////
    // Attachments API.
    //////////////////////////////////////////////////

    getAttachment(attachmentId) {
        winston_logger.debug(
            `database.getAttachment entered for attachment-id ${attachmentId}.`
        );
        const sql = "SELECT * FROM attachment WHERE id = ?";
        return this.db.getAsync(sql, [attachmentId]);
    }

    getAttachments(cardId) {
        winston_logger.debug(
            `database.getAttachments entered for card-id ${cardId}.`
        );
        const sql = "SELECT * FROM attachment WHERE cardId = ?";
        return this.db.allAsync(sql, [cardId]);
    }

    addAttachment(urlPath, cardId, belongsTo) {
        winston_logger.debug(
            `database.addAttachment entered for path ${urlPath}, card-id ${cardId}, belonging to ${belongsTo}.`
        );
        const sql =
            "INSERT INTO attachment (path, cardId, belongsTo)" +
            " VALUES (?, ?, ?)";
        return this.db.insertAsync(sql, [urlPath, cardId, belongsTo]);
    }

    deleteAttachment(attachmentId) {
        winston_logger.debug(
            `database.deleteAttachment entered for attachment-id ${attachmentId}.`
        );
        const sql = "DELETE FROM attachment WHERE id = ?";
        return this.db.deleteAsync(sql, [attachmentId]);
    }

    // TODO Can't we just use ON DELETE CASCADE?
    deleteAttachments(cardId) {
        winston_logger.debug(
            `database.deleteAttachments entered for card-id ${cardId}.`
        );
        const sql = "DELETE FROM attachment WHERE cardId = ?";
        return this.db.deleteAsync(sql, [cardId]);
    }

    //////////////////////////////////////////////////
    // Collection-Ratings API.
    //////////////////////////////////////////////////

    getCollectionRatings(collectionId) {
        winston_logger.debug(
            `database.getCollectionRatings entered for collection-id ${collectionId}.`
        );
        const sql = "SELECT * FROM collectionRating WHERE collectionId = ?";
        return this.db.allAsync(sql, [collectionId]);
    }

    findCollectionRating(collectionId, userId) {
        winston_logger.debug(
            `database.findCollectionRating entered for collection-id ${collectionId} and user-id ${userId}.`
        );
        const sql =
            "SELECT COUNT(*) > 0 as found FROM collectionRating WHERE collectionId = ? AND userId = ?";
        return this.db.getAsync(sql, [collectionId, userId]);
    }

    addCollectionRating(rating, collectionId, userId) {
        winston_logger.debug(
            `database.addCollectionRating entered for collection-id ${collectionId} and user-id ${userId}. Rating: %o`,
            rating
        );
        // The owner of the collection is not allowed to rate the collection.
        const collSql = "SELECT userId FROM collection WHERE id = ?";
        return this.db.getAsync(collSql, [collectionId]).then(collUserIdRes => {
            if (collUserIdRes.userId == userId) {
                winston_logger.warn(
                    `database.addCollectionRating: Owner ${userId} tries to rate his own collection ${collectionId}.`
                );
                throw Error("Owner is not allowed to rate his own collection.");
            }

            const ratingSql =
                "INSERT INTO collectionRating (rating, comment, timestamp, collectionId, userId)" +
                " VALUES (?, ?, strftime('%s', 'now'), ?, ?)";
            return this.db.insertAsync(ratingSql, [
                rating.rating,
                rating.comment,
                collectionId,
                userId
            ]);
        });
    }

    updateCollectionRating(rating, collectionId, userId) {
        winston_logger.debug(
            `database.updateCollectionRating entered for collection-id ${collectionId} and user-id ${userId}. Rating: %o`,
            rating
        );
        const sql =
            "UPDATE collectionRating SET rating = ?, comment = ?, timestamp = strftime('%s', 'now')" +
            " WHERE collectionId = ? AND userId = ?";
        return this.db.updateAsync(sql, [
            rating.rating,
            rating.comment,
            collectionId,
            userId
        ]);
    }

    // todo: where to call db.close()?
}

module.exports = Database;
