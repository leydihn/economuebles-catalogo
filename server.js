require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Conectado a MongoDB Atlas"))
    .catch(err => console.error("Error de conexión:", err));

// Modelos
const Producto = mongoose.model('Producto', new mongoose.Schema({
    nombre: String, categoria: String, descripcion: String,
    imagen: String, en_oferta: Boolean, envio_gratis: Boolean
}));
const Categoria = mongoose.model('Categoria', new mongoose.Schema({ nombre: String }));
const Usuario = mongoose.model('Usuario', new mongoose.Schema({
    usuario: { type: String, unique: true },
    password: { type: String },
    esRepuesto: { type: Boolean, default: false }
}));

// Multer configurado para soportar hasta 20 MB
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/images'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 } // 20 MB de límite
});

// =========================================================================
// RUTAS DE SEGURIDAD (LIMPIAS)
// =========================================================================

app.post('/login', async (req, res) => {
    const { usuario, password } = req.body;
    const user = await Usuario.findOne({ usuario });
    if (user && await bcrypt.compare(password, user.password)) {
        res.json({ ok: true, mensaje: "Login exitoso" });
    } else {
        res.status(401).json({ ok: false, mensaje: "Usuario o contraseña incorrectos" });
    }
});

// Esta ruta inicializa los usuarios con las contraseñas nuevas y seguras
app.get('/inicializar-usuarios', async (req, res) => {
    const pass1 = await bcrypt.hash('Econo12M29', 10);
    const pass2 = await bcrypt.hash('Econo836L', 10);

    await Usuario.deleteMany({});
    await Usuario.insertMany([
        { usuario: 'adEconoM', password: pass1, esRepuesto: false },
        { usuario: 'EconoM', password: pass2, esRepuesto: true }
    ]);
    res.send("<h1>Usuarios configurados correctamente con credenciales nuevas.</h1>");
});

app.post('/cambiar-password', async (req, res) => {
    const { nuevoPassword } = req.body;
    const hashedPassword = await bcrypt.hash(nuevoPassword, 10);
    await Usuario.updateOne({ usuario: 'adEconoM' }, { password: hashedPassword });
    res.json({ ok: true, mensaje: "Contraseña actualizada" });
});

// Ruta de emergencia eliminada o actualizada para no usar la contraseña vieja
app.get('/restablecer-sistema-muebles-2026-seguro', async (req, res) => {
    const hashedPassword = await bcrypt.hash('Econo12M29', 10);
    await Usuario.updateOne({ usuario: 'adEconoM' }, { password: hashedPassword });
    res.send("<h1>Sistema restablecido con contraseña principal.</h1>");
});

// =========================================================================
// RUTAS DE INVENTARIO (SE MANTIENEN IGUAL)
// =========================================================================
app.get('/productos', async (req, res) => { res.json(await Producto.find().sort({ _id: -1 })); });
app.get('/productos/:id', async (req, res) => { res.json(await Producto.findById(req.params.id)); });
app.post('/upload', upload.single('imagen'), (req, res) => { res.json({ path: 'images/' + req.file.filename }); });
app.post('/productos', async (req, res) => { await new Producto(req.body).save(); res.json("Producto agregado"); });
app.put('/productos/:id', async (req, res) => { await Producto.findByIdAndUpdate(req.params.id, req.body); res.json("Producto actualizado"); });
app.delete('/productos/:id', async (req, res) => { await Producto.findByIdAndDelete(req.params.id); res.json("Eliminado"); });

app.get('/categorias', async (req, res) => { res.json(await Categoria.find().sort({ _id: -1 })); });
app.post('/categorias', async (req, res) => { await new Categoria(req.body).save(); res.json("Categoría agregada"); });
app.put('/categorias/:id', async (req, res) => {
    const cat = await Categoria.findById(req.params.id);
    const nombreAnterior = cat.nombre;
    await Categoria.findByIdAndUpdate(req.params.id, { nombre: req.body.nombre });
    await Producto.updateMany({ categoria: nombreAnterior }, { categoria: req.body.nombre });
    res.json("Ok");
});
app.delete('/categorias/:id', async (req, res) => { await Categoria.findByIdAndDelete(req.params.id); res.json("Categoría eliminada"); });
app.get('/buscar', async (req, res) => {
    const regex = new RegExp(req.query.q, 'i');
    const data = await Producto.find({ $or: [{ nombre: regex }, { categoria: regex }] });
    res.json(data);
});

app.listen(4000, () => console.log("Servidor en puerto 4000"));