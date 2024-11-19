const express = require('express');
const path = require('path');
const multer = require('multer');
const db = require('./database');
const sha256 = require('js-sha256');

const app = express();

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
            }, 3000);
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
    });}
    else {
        res.set('WWW-Authenticate', 'Basic realm="401"');
        res.status(401).send('Authentication required.');
    }
};

// Route per servire upload.html
app.get('/admin', protectWithPassword, (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'upload.html'));
});

// Route per avviare il 3D viewer sul file richiesto
app.get('/:filePath', (req, res) => {
    res.sendFile(path.join(__dirname, 'index_flask.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on localhost:${PORT}`);
});
