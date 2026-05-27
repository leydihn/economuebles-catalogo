const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'Muebleria'
});

db.connect((err) => {
    if (err) console.error("Error al conectar a la BD:", err);
    else console.log("Conectado con éxito a la Base de Datos 'Muebleria'");
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// =========================================================================
// RUTAS DE AUTENTICACIÓN Y SEGURIDAD
// =========================================================================

app.post('/login', (req, res) => {
    const { usuario, password } = req.body;
    const q = "SELECT * FROM usuarios WHERE usuario = ? AND password = SHA2(?, 256)";
    db.query(q, [usuario, password], (err, result) => {
        if (err) return res.status(500).json({ ok: false, mensaje: "Error en el servidor", error: err });
        if (result.length > 0) {
            res.json({ ok: true, mensaje: "Login exitoso" });
        } else {
            res.status(401).json({ ok: false, mensaje: "Usuario o contraseña incorrectos" });
        }
    });
});

app.post('/cambiar-password', (req, res) => {
    const { nuevoPassword } = req.body;
    if (!nuevoPassword || nuevoPassword.trim() === "") {
        return res.status(400).json({ ok: false, mensaje: "La contraseña no puede estar vacía" });
    }
    const q = "UPDATE usuarios SET password = SHA2(?, 256) WHERE id_usuario = 1";
    db.query(q, [nuevoPassword], (err, result) => {
        if (err) return res.status(500).json({ ok: false, mensaje: "Error al actualizar en la base de datos" });
        res.json({ ok: true, mensaje: "Contraseña actualizada correctamente" });
    });
});

app.get('/restablecer-sistema-muebles-2026-seguro', (req, res) => {
    const q = "UPDATE usuarios SET usuario = 'adEM', password = SHA2('M74E1', 256) WHERE id_usuario = 1";
    db.query(q, (err, result) => {
        if (err) return res.status(500).send("Error interno del servidor");
        res.send(`
            <div style="font-family:sans-serif; text-align:center; padding:50px; background:#f8fafc; border-radius:12px; max-width:600px; margin:0 auto; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
                <h1 style="color:#15803d;">✅ ¡Accesos de Fábrica Restablecidos!</h1>
                <p style="color:#334155; font-size:1.1rem; margin:20px 0;">Los accesos de administración han regresado a los valores de fábrica.</p>
                <div style="background:#fff; padding:15px; border:1px solid #e2e8f0; border-radius:8px; display:inline-block; text-align:left;">
                    <p><strong>Usuario principal reseteado a:</strong> adEM</p>
                    <p><strong>Contraseña provisional:</strong> M74E1</p>
                </div>
            </div>
        `);
    });
});

// =========================================================================
// RUTAS DEL SISTEMA DE INVENTARIO
// =========================================================================

app.get('/productos', (req, res) => {
    db.query("SELECT * FROM productos ORDER BY id_producto DESC", (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

app.get('/productos/:id', (req, res) => {
    db.query("SELECT * FROM productos WHERE id_producto = ?", [req.params.id], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json({ error: "No encontrado" });
        res.json(data[0]);
    });
});

app.post('/upload', upload.single('imagen'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No se subió archivo' });
    res.json({ path: 'images/' + req.file.filename });
});

app.post('/productos', (req, res) => {
    const { nombre, categoria, descripcion, imagen, en_oferta, envio_gratis } = req.body;
    const q = "INSERT INTO productos (nombre, categoria, descripcion, imagen, en_oferta, envio_gratis) VALUES (?, ?, ?, ?, ?, ?)";
    const values = [nombre, categoria, descripcion, imagen, en_oferta ? 1 : 0, envio_gratis ? 1 : 0];
    db.query(q, values, (err) => {
        if (err) return res.status(500).json(err);
        res.json("Producto agregado");
    });
});

app.put('/productos/:id', (req, res) => {
    const { nombre, categoria, descripcion, imagen, en_oferta, envio_gratis } = req.body;
    const q = "UPDATE productos SET nombre=?, categoria=?, descripcion=?, imagen=?, en_oferta=?, envio_gratis=? WHERE id_producto=?";
    const values = [nombre, categoria, descripcion, imagen, en_oferta ? 1 : 0, envio_gratis ? 1 : 0, req.params.id];
    db.query(q, values, (err) => {
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

app.get('/categorias', (req, res) => {
    db.query("SELECT * FROM categorias ORDER BY id_categoria DESC", (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

app.post('/categorias', (req, res) => {
    const { nombre } = req.body;
    db.query("INSERT INTO categorias (nombre) VALUES (?)", [nombre], (err) => {
        if (err) return res.status(500).json(err);
        res.json("Categoría agregada");
    });
});

app.put('/categorias/:id', (req, res) => {
    const { nombre } = req.body;
    const idCategoria = req.params.id;
    db.query("SELECT nombre FROM categorias WHERE id_categoria = ?", [idCategoria], (err, result) => {
        if (err || result.length === 0) return res.status(500).json(err || { error: "No encontrada" });
        const nombreAnterior = result[0].nombre;
        db.query("UPDATE categorias SET nombre = ? WHERE id_categoria = ?", [nombre, idCategoria], () => {
            db.query("UPDATE productos SET categoria = ? WHERE categoria = ?", [nombre, nombreAnterior], () => res.json("Ok"));
        });
    });
});

app.delete('/categorias/:id', (req, res) => {
    db.query("DELETE FROM categorias WHERE id_categoria = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json("Categoría eliminada");
    });
});

app.get('/buscar', (req, res) => {
    const termino = `%${req.query.q}%`;
    const q = "SELECT * FROM productos WHERE nombre LIKE ? OR categoria LIKE ?";
    db.query(q, [termino, termino], (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

app.listen(4000, () => console.log("Servidor en puerto 4000"));