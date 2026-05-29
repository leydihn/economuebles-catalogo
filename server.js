const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Conexión dinámica para Railway
const db = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 3306
});

db.connect((err) => {
    if (err) console.error("Error al conectar a la BD:", err);
    else console.log("Conectado con éxito a la Base de Datos");
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/images'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// Rutas
app.post('/login', (req, res) => {
    const { usuario, password } = req.body;

    // Usamos el resultado que ya sabemos que el usuario existe (basado en tus logs)
    // Vamos a comparar la contraseña enviada con la encriptada mediante la función de MySQL
    db.query("SELECT * FROM usuarios WHERE usuario = ? AND password = SHA2(?, 256)", [usuario, password], (err, result) => {
        if (err) return res.status(500).json({ ok: false });

        if (result.length > 0) {
            res.json({ ok: true });
        } else {
            // AQUÍ ESTÁ EL TRUCO: Si no coincide con SHA2, probemos si es texto plano
            db.query("SELECT * FROM usuarios WHERE usuario = ? AND password = ?", [usuario, password], (err, resultPlano) => {
                if (resultPlano.length > 0) {
                    res.json({ ok: true });
                } else {
                    res.status(401).json({ ok: false });
                }
            });
        }
    });
});
app.post('/cambiar-password', (req, res) => {
    const { nuevoPassword } = req.body;
    db.query("UPDATE usuarios SET password = SHA2(?, 256) WHERE id_usuario = 1", [nuevoPassword], (err) => {
        if (err) return res.status(500).json({ ok: false });
        res.json({ ok: true });
    });
});

app.get('/productos', (req, res) => {
    db.query("SELECT * FROM productos ORDER BY id_producto DESC", (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

app.post('/productos', (req, res) => {
    const { nombre, categoria, descripcion, imagen, en_oferta, envio_gratis } = req.body;
    db.query("INSERT INTO productos (nombre, categoria, descripcion, imagen, en_oferta, envio_gratis) VALUES (?, ?, ?, ?, ?, ?)",
        [nombre, categoria, descripcion, imagen, en_oferta ? 1 : 0, envio_gratis ? 1 : 0], (err) => {
            if (err) return res.status(500).json(err);
            res.json("Producto agregado");
        });
});

app.put('/productos/:id', (req, res) => {
    const { nombre, categoria, descripcion, imagen, en_oferta, envio_gratis } = req.body;
    db.query("UPDATE productos SET nombre=?, categoria=?, descripcion=?, imagen=?, en_oferta=?, envio_gratis=? WHERE id_producto=?",
        [nombre, categoria, descripcion, imagen, en_oferta ? 1 : 0, envio_gratis ? 1 : 0, req.params.id], (err) => {
            if (err) return res.status(500).json(err);
            res.json("Producto actualizado");
        });
});

app.delete('/productos/:id', (req, res) => {
    db.query("DELETE FROM productos WHERE id_producto = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json("Eliminado");
    });
});

// --- RUTA AGREGADA PARA EDITAR ---
app.get('/productos/:id', (req, res) => {
    db.query("SELECT * FROM productos WHERE id_producto = ?", [req.params.id], (err, data) => {
        if (err || data.length === 0) return res.status(404).json({ error: "Producto no encontrado" });
        res.json(data[0]);
    });
});

app.get('/categorias', (req, res) => {
    db.query("SELECT * FROM categorias ORDER BY id_categoria DESC", (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

app.post('/categorias', (req, res) => {
    db.query("INSERT INTO categorias (nombre) VALUES (?)", [req.body.nombre], (err) => {
        if (err) return res.status(500).json(err);
        res.json("Categoría agregada");
    });
});

app.put('/categorias/:id', (req, res) => {
    db.query("UPDATE categorias SET nombre = ? WHERE id_categoria = ?", [req.body.nombre, req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json("Ok");
    });
});

app.delete('/categorias/:id', (req, res) => {
    db.query("DELETE FROM categorias WHERE id_categoria = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json("Eliminado");
    });
});

app.get('/buscar', (req, res) => {
    const termino = `%${req.query.q}%`;
    db.query("SELECT * FROM productos WHERE nombre LIKE ? OR categoria LIKE ?", [termino, termino], (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

app.post('/upload', upload.single('imagen'), (req, res) => {
    res.json({ path: 'images/' + req.file.filename });
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(process.env.PORT || 4000, () => console.log("Servidor iniciado"));