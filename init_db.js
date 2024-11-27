const db = require('./database');
const sha256 = require('js-sha256');

db.serialize(() => {
    /*db.run(`
        CREATE TABLE IF NOT EXISTS user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    `); */

    // Inserisci un utente
    const insert = 'INSERT INTO user (username, password) VALUES (?, ?)';
    db.run(insert, ['admin', sha256.sha256('admin')], (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('A row has been inserted');
    });

    /*const query_delete = 'DELETE FROM user';
    db.run(query_delete); */
    /*db.each("SELECT id, username, password FROM user", (err, row) => {
        console.log(row.id + " " + row.username + ": " + row.password);
    }); */
});

db.close((err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Close the database connection.');
});
