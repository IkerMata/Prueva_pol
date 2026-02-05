require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = process.env.APP_PORT || 4000;

// Configurem una constant amb nom db que guarda els camps per a la connexió amb la base de dades
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'room_booking'
});



// Permet llegir el cos de les peticions en format JSON
app.use(express.json());

// Funcionalitat LLEGIR (READ)
app.get('/api/rooms', (req, res) => {
    db.query('SELECT * FROM rooms ORDER BY id ASC')
        .then(([results]) => {
            res.json(results);
        })
        .catch(err => { console.error(err); res.status(500).json({ error: err.message }); });
});


app.get('/api/bookings', (req, res) => {
    db.query('SELECT * FROM bookings ORDER BY id ASC')
        .then(([results]) => {
            res.json(results);
        })
        .catch(err => { console.error(err); res.status(500).json({ error: err.message }); });
});



app.get('/api/rooms/:id', (req, res) => {
    const { id } = req.params;
    // Executem la query per eliminar la tasca
    db.query('SELECT * FROM rooms WHERE id = ?', [id])
        .then(([results]) => {
            if (results.length === 0) {
                return res.status(404).json({ error: 'Room not found' });
            }
            // Enviem el resultat en format JSON
            res.json(results[0]);
        })
        .catch(err => { console.error(err); res.status(500).json({ error: err.message }); });
});


app.get('/api/bookings/:id', (req, res) => {
    const { id } = req.params;
    // Executem la query per eliminar la tasca
    db.query('SELECT * FROM bookings WHERE id = ?', [id])
        .then(([results]) => {
            if (results.length === 0) {
                return res.status(404).json({ error: 'Booking not found' });
            }
            // Enviem el resultat en format JSON
            res.json(results[0]);
        })
        .catch(err => { console.error(err); res.status(500).json({ error: err.message }); });
});

app.post('/api/rooms', (req, res) => {
    const { name, capacity, location } = req.body;  // Agafem la nova tasca del JSON enviat

    db.query('INSERT INTO rooms (name, capacity, location) VALUES (?, ?, ?)', [name, capacity, location])
        .then(([result]) => {
            // Retornem l'objecte creat amb el ID correcte
            res.status(201).json({ id: result.insertId, name, capacity, location });
        })
        .catch(err => { console.error(err); res.status(500).json({ error: err.message }); });
});


app.post('/api/bookings', (req, res) => {
    const { room_id, reserved_by, start_time, end_time } = req.body;  // Agafem la nova tasca del JSON enviat

    db.query('INSERT INTO bookings (room_id, reserved_by, start_time, end_time) VALUES (?, ?, ?, ?)', [room_id, reserved_by, start_time, end_time])
        .then(([result]) => {
            // Retornem l'objecte creat amb el ID correcte
            res.status(201).json({ id: result.insertId, room_id, reserved_by, start_time, end_time });
        })
        .catch(err => { console.error(err); res.status(500).json({ error: err.message }); });
});

app.put('/api/rooms/:id', (req, res) => {
    const { id } = req.params;
    const { name, capacity, location } = req.body; // Els valors que envia el client

    // Actualitzem la tasca amb el nou estat
    db.query('UPDATE rooms SET name = ?, capacity = ?, location = ? WHERE id = ?', [name, capacity, location, id])
        .then(([result]) => {
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Room not found' });
            }
            // Enviem el resultat en format JSON
            res.json({ id: Number(id), name, capacity, location });
        })
        .catch(err => { console.error(err); res.status(500).json({ error: err.message }); });
});

app.put('/api/bookings/:id', (req, res) => {
    const { id } = req.params;
    const { room_id, reserved_by, start_time, end_time } = req.body; // Els valors que envia el client

    // Actualitzem la tasca amb el nou estat
    db.query('UPDATE bookings SET room_id = ?, reserved_by = ?, start_time = ?, end_time = ? WHERE  id = ?', [room_id, reserved_by, start_time, end_time, id])
        .then(([result]) => {
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Booking not found' });
            }
            // Enviem el resultat en format JSON
            res.json({ id: Number(id), room_id, reserved_by, start_time, end_time });
        })
        .catch(err => { console.error(err); res.status(500).json({ error: err.message }); });
});

app.delete('/api/rooms/:id', (req, res) => {
    const { id } = req.params;
    // Executem la query per eliminar la tasca
    db.query('DELETE FROM rooms WHERE id = ?', [id])
        .then(([result]) => {
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Room not found' });
            }
            // Enviem el resultat en format JSON strict message
            res.json({ message: 'Room deleted' });
        })
        .catch(err => { console.error(err); res.status(500).json({ error: err.message }); });
});

app.delete('/api/bookings/:id', (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM bookings WHERE id = ?', [id])
        .then(([result]) => {
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Booking not found' });
            }
            // Enviem el resultat en format JSON
            res.json({ message: 'Booking deleted' });
        })
        .catch(err => { console.error(err); res.status(500).json({ error: err.message }); });
});


app.get('/api/rooms/:id/bookings', (req, res) => {
    const { id } = req.params;

    // 1. Buscamos la sala
    db.query('SELECT * FROM rooms WHERE id = ?', [id])
        .then(([rooms]) => {
            if (rooms.length === 0) {
                return res.status(404).json({ error: 'Room not found' });
            }
            const room = rooms[0]; // Sacamos la sala del array

            // 2. Buscamos las reservas de esa sala
            return db.query('SELECT * FROM bookings WHERE room_id = ?', [id])
                .then(([bookings]) => {
                    // 3. Devolvemos todo junto
                    res.json({ room, bookings });
                });
        })
        .catch(err => { console.error(err); res.status(500).json({ error: err.message }); });
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});