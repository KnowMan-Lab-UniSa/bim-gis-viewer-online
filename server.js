const express = require('express');
const path = require('path');
const multer = require('multer');
const db = require('./database');
const sha256 = require('js-sha256');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json()); 

// Configura multer per salvare i file nella cartella /static/ifc
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'static', 'ifc'));
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

// Endpoints
// Per servire file statici
app.use('/static', express.static(path.join(__dirname, 'static')));

// Endpoint per l'upload dei file
app.post('/upload', upload.single('file'), (req, res) => {
    res.send(`
        <p>File uploaded successfully</p>
        <script>
            setTimeout(function() {
                window.location.href = '/admin';
            }, 2000);
        </script>
    `);
});

// Middleware per proteggere un endpoint con password
const protectWithPassword = (req, res, next) => {
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

    // Verifica le credenziali nel database
    if (password !== undefined) {
        db.get('SELECT * FROM user WHERE username = ? AND password = ?', [login, sha256.sha256(password)], (err, row) => {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
            } else if (row) {
                return next();
            } else {
                res.set('WWW-Authenticate', 'Basic realm="401"');
                res.status(401).send('Authentication required.');
            }
        });
    } else {
        res.set('WWW-Authenticate', 'Basic realm="401"');
        res.status(401).send('Authentication required.');
    }
};

app.get('/', (req, res) => {
	res.send("Homepage");
});

// Route per servire il pannello admin con lista di file ifc
app.get('/admin', protectWithPassword, (req, res) => {
    const directoryPath = path.join(__dirname, 'static', 'ifc');
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan directory: ' + err);
        }

        let fileLinks = files.map(file => {
            return `<li><a href="/${file}">${file}</a></li>`; // Lista file .ifc
        }).join('');

        res.send(`
            <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upload Files</title>
    <link rel="stylesheet" href="./static/css/upload.css">
    <script src="init_db.js"></script>
</head>
<body>
    <h1>Upload Files</h1>
    <form action="/upload" method="post" enctype="multipart/form-data">
        <input type="file" name="file">
        <button type="submit">Upload</button>
    </form>
    <h2>File List</h2>
    <ul>
        ${fileLinks}
    </ul>

    <!-- Pulsante Cambio Credenziali -->
    <button id="changeCredentialsBtn">Change Credentials</button>

    <!-- Popup per Cambio Credenziali -->
    <div id="popupOverlay" class="popup-overlay"></div>
    <div id="popup" class="popup">
        <h2>Cambio Credenziali</h2>
        <form id="credentialsForm">
            <label for="username">Old Username:</label>
            <input type="text" id="old_username" name="old_username" required>
            <br>
            <label for="username">Username:</label>
            <input type="text" id="username" name="username" required>
            <br>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>
            <br>
            <button type="submit">Change</button>
        </form>
    </div>

    <script>
        // Mostra il popup
        document.getElementById('changeCredentialsBtn').addEventListener('click', function() {
            document.getElementById('popupOverlay').style.display = 'block';
            document.getElementById('popup').style.display = 'block';
        });

        // Nascondi il popup quando si clicca fuori
        document.getElementById('popupOverlay').addEventListener('click', function() {
            document.getElementById('popupOverlay').style.display = 'none';
            document.getElementById('popup').style.display = 'none';
        });

        // Gestisci l'invio del form
        document.getElementById('credentialsForm').addEventListener('submit', function(event) {
            event.preventDefault();
            const old_username = document.getElementById('old_username').value;
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            updateCredentials(old_username, username, password);
            document.getElementById('popupOverlay').style.display = 'none';
            document.getElementById('popup').style.display = 'none';
        });

        // Funzione per inviare le credenziali al server
        function updateCredentials(old_username, username, password) {
            fetch('/update-credentials', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ old_username: old_username, username: username, password: password })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        }
    </script>
</body>
</html>

        `);
    });
});

// Route per cambiare le credenziali
app.post('/update-credentials', (req, res) => {
    const { old_username, username, password } = req.body;
    const sql = `UPDATE user SET password = ?, username = ? WHERE username = ?`;
    db.run(sql, [sha256.sha256(password), username, old_username], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: `Row(s) updated: ${this.changes}` });
    });
});

// Route per avviare il 3D viewer sul file richiesto
app.get('/:filePath', (req, res) => {
    res.sendFile(path.join(__dirname, 'index_flask.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on localhost:${PORT}`);
});
