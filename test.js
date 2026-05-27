const express = require('express');
const app = express();

app.use(express.json());

app.post('/usuarios', (req, res) => {
    res.json({ ok: true, mensaje: 'Ruta /usuarios funcionando' });
});

app.get('/test', (req, res) => {
    res.send('Ruta /test funcionando');
});

app.listen(4000, () => {
    console.log("Servidor corriendo en http://localhost:4000");
});


app.get('/categorias', (req, res) => {
    console.log("Entró a /categorias");
    res.json([{ id: 1, nombre: 'Prueba' }]);
});

app.listen(4000, () => {
    console.log("Servidor de prueba en http://localhost:4000");
});
