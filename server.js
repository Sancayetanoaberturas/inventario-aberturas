const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Base de datos
const db = new sqlite3.Database('./db.sqlite3');

// Crear tabla si no existe
db.run(`
  CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    tipo TEXT CHECK(tipo IN ('puerta', 'ventana')) NOT NULL,
    precio REAL NOT NULL,
    cantidad INTEGER NOT NULL,
    mano_apertura TEXT
  )
`);

// Rutas API
app.get('/api/productos', (req, res) => {
  db.all('SELECT * FROM productos', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/productos', (req, res) => {
  const { nombre, tipo, precio, cantidad, mano_apertura } = req.body;
  db.run(
    `INSERT INTO productos (nombre, tipo, precio, cantidad, mano_apertura)
     VALUES (?, ?, ?, ?, ?)`,
    [nombre, tipo, precio, cantidad, tipo === 'puerta' ? mano_apertura : null],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

app.put('/api/productos/:id', (req, res) => {
  const { cantidad } = req.body;
  db.run(`UPDATE productos SET cantidad = ? WHERE id = ?`, [cantidad, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
