require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
const port = process.env.APP_PORT || 4001;

// Configurem una constant amb nom db que guarda els camps per a la connexió amb la base de dades
const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "library_db",
});

// Permet llegir el cos de les peticions en format JSON
app.use(express.json());

app.get("/api/books", (req, res) => {
    db.query("SELECT * FROM books ORDER BY id ASC")
        .then(([results]) => {
            res.json(results);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err.message });
        });
});

app.get("/api/loans", (req, res) => {
    db.query("SELECT * FROM loans ORDER BY id ASC")
        .then(([results]) => {
            res.json(results);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err.message });
        });
});

app.post("/api/books", (req, res) => {
    const { title, author, published_year } = req.body; // Agafem la nova tasca del JSON enviat

    db.query(
        "INSERT INTO books (title, author, published_year) VALUES (?, ?, ?)",
        [title, author, published_year],
    )
        .then(([result]) => {
            // Retornem l'objecte creat amb el ID correcte
            res
                .status(201)
                .json({ id: result.insertId, title, author, published_year });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err.message });
        });
});

app.post("/api/loans", (req, res) => {
    const { book_id, student_name, loan_date } = req.body; // Agafem la nova tasca del JSON enviat

    db.query("INSERT INTO loans (book_id,student_name, loan_date) VALUES (?, ?, ?)", [book_id, student_name, loan_date])
        .then(([result]) => {
            // Retornem l'objecte creat amb el ID correcte
            res
                .status(201)
                .json({ id: result.insertId, book_id, student_name, loan_date });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err.message });
        });
});


app.put('/api/books/:id', (req, res) => {
    const { id } = req.params;
    const { title, author, published_year } = req.body; // Els valors que envia el client

    // Actualitzem la tasca amb el nou estat
    db.query('UPDATE books SET title = ?, author = ?, published_year = ? WHERE id = ?', [title, author, published_year, id])
        .then(([result]) => {
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Book not found' });
            }
            // Enviem el resultat en format JSON
            res.json({ id: Number(id), title, author, published_year });
        })
        .catch(err => { console.error(err); res.status(500).json({ error: err.message }); });
});

app.delete('/api/books/:id', (req, res) => {
    const { id } = req.params;
    // Executem la query per eliminar la tasca
    db.query('DELETE FROM books WHERE id = ?', [id])
        .then(([result]) => {
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Book not found' });
            }
            // Enviem el resultat en format JSON strict message
            res.json({ message: 'Book deleted' });
        })
        .catch(err => { console.error(err); res.status(500).json({ error: err.message }); });
});

app.get('/api/books/:id/loans', (req, res) => {
    const { id } = req.params;

    // 1. Buscamos la sala
    db.query('SELECT * FROM books WHERE id = ?', [id])
        .then(([books]) => {
            if (books.length === 0) {
                return res.status(404).json({ error: 'Book not found' });
            }
            const book = books[0]; // Sacamos la sala del array

            // 2. Buscamos las reservas de esa sala
            return db.query('SELECT * FROM loans WHERE book_id = ?', [id])
                .then(([loans]) => {
                    // 3. Devolvemos todo junto
                    res.json({ book, loans });
                });
        })
        .catch(err => { console.error(err); res.status(500).json({ error: err.message }); });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
