require("dotenv").config()
const http = require('http');
const fs = require('fs');
const express = require("express")
const cors = require('cors');
const mysql = require("mysql2")

const app = express()
const PORT = 81;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors())

const conPool = mysql.createPool({
    user: "root",
    password: "",
    host: "localhost",
    database: "htth",
    port: 3306,
    connectTimeout: 30,
    waitForConnections: true,
    connectionLimit: 3,
})

conPool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.');
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.');
        }
    }

    if (connection) {
        console.log('Connected to the database.');

        connection.release(); // Release the connection back to the pool
    } else {
        console.log("Cannot connect to the database");
    }
});


// // Middleware to parse JSON data
app.use(express.json());
app.use(express.static('public'));

app.get("/", (req, res) => {
    return res.sendFile('../public/index.html');
})



app.post("/api/register", (req, res) => {
    const form = req.body;
    // console.log(form, form?.username, form?.password)
    if (form && form?.username && form?.password) {
        const username = form?.username;
        const password = form?.password;
        const sql = `INSERT INTO \`accounts\` (\`id\`, \`user\`, \`pass\`, \`char\`, \`onl\`, \`lock\`, \`note\`, \`status\`, \`coin\`, \`vip\`) VALUES (NULL, '${username}', '${password}', '["${username}"]', '0', '0', NULL, '0', '0', '0');`;

        conPool.query(sql, (err, result, fields) => {
            // console.log(result)
            if (err) {
                switch (err?.errno) {
                    case 1062:
                        return res.status(400).json({ message: "Tài khoản trùng lặp" });
                    default:
                        return res.status(500).json({ message: "Internal server error" });
                }
            }

            return res.status(201).json({ message: "Đăng kí thành công" });
        })
    } else {
        return res.status(400).json({
            message: "Lỗi đăng kí"
        })
    }
})


app.listen(PORT, () => {
    console.log("Listening on " + PORT + ".")
})
