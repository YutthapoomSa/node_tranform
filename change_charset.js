const express = require("express");
const mysql = require('mysql');
const app = express();
const port = 3001;
const axios = require('axios');
const fs = require('fs');

const con = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '123132123',
    port: 3306,
    // charset: 'utf8',
    database:"hos"
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

app.get("/change", (req, res) => {
    con.query('SHOW tables', function (error, results, fields) {
        if (error) throw error;
        // console.log('The solution is: ', results);
        // SELECT CONCAT(  'ALTER TABLE ',  `TABLE_NAME` ,  ' CHANGE `',  `COLUMN_NAME` ,  '` `',`COLUMN_NAME` ,  '` ',  `DATA_TYPE` ,  '(',  `CHARACTER_MAXIMUM_LENGTH` ,  ') CHARACTER SET utf8 COLLATE utf8_general_ci ;' ) as q from information_schema.COLUMNS WHERE TABLE_SCHEMA = 'hos'
        con.query("SELECT CONCAT(  'ALTER TABLE ',  `TABLE_NAME` ,  ' CHANGE `',  `COLUMN_NAME` ,  '` `',`COLUMN_NAME` ,  '` ',  `DATA_TYPE` ,  '(',  `CHARACTER_MAXIMUM_LENGTH` ,  ') CHARACTER SET `utf8` COLLATE `utf8_general_ci`;' ) as q from information_schema.COLUMNS WHERE TABLE_SCHEMA = 'hos' AND `COLLATION_NAME` !=  'utf8_general_ci' and DATA_TYPE not like('%longtext%')", function (e, r, f) {
            if (e) console.log(e);
            for (let i = 0; i < r.length; i++) {
                const q = r[i];
                let str = q.q;
                if(str){
                    console.log(str)
                    con.query(str, function (err, re, fie) {
                        console.log(re)
                    })
                }
            }
        })
        // for (let i = 0; i < results.length; i++) {
        //     const e = results[i];
        //     console.log(e.Tables_in_hos)
        //     let table = e.Tables_in_hos;
        //     con.query('ALTER TABLE `'+table+'` CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;', function (err, r, f) {
        //         console.log(r)
        //     })
        // }
    });
});

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});