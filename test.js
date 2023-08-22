const express = require("express");
const mysql = require('mysql');
const app = express();
const port = 3003;
const axios = require('axios');
const fs = require('fs');

const con = mysql.createConnection({
    host: '192.168.80.253',
    user: 'sa',
    password: 'sa',
    port: 3306,
    // charset: 'tis620_bin',
    database: "hos"
});


con.connect(function (err) {
    if (err) throw err;
    console.log("connected");
});

app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.get("/stock_subdraw", async (req, res) => {
    let rawdata = fs.readFileSync('stock_subdraw.json');
    let data_config = JSON.parse(rawdata);
    // console.log(data_config);
    con.query(data_config.sql_param, function (error, param, fields) {
        con.query(data_config.sql_body, function (e, body, fields) {
            console.log(param[0]);
            console.log(body[0])
        });
    });
});

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});