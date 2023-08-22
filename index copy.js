const express = require("express");
const mysql = require('mysql');
const app = express();
const port = 3001;
const axios = require('axios');
const fs = require('fs');

const con = mysql.createConnection({
    host: '192.168.80.247',
    user: 'sa',
    password: 'sa',
    port: 3306,
    charset: 'utf8',
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

function send_data(structure, data, res) {
    let { endpoint, method, header, param } = structure;
    let new_data = [];
    for (let index = 0; index < data.length; index++) {
        const e = data[index];
        let data_object = {};
        for (const [key, value] of Object.entries(param)) {
          console.log(`${key}: ${value}`);
        //   console.log(typeof value == "object")
          if(typeof value == "object"){
            data_object[key] = value.value;
          }else if(e[value] == null){
              data_object[key] = null;
          }else{
            if(key == "wh_status" || key == "categorystatus"){
                let temp = null;
                if(e[value] == "Y"){
                    temp = true;
                }else if(e[value] == "N"){
                    temp = false;
                }
                data_object[key] = temp;
            }else{
                data_object[key] = e[value];
            }
          }
        }
        console.log(data_object);  
        new_data[index] =  data_object
    }

    console.log(new_data);
  
    if (method == "POST") {
      let str_data = JSON.stringify(new_data);
      var config = {
        method: 'post',
        url: endpoint,
        headers: header,
        data: str_data
      };
  
      axios(config)
        .then(function (response) {
          console.log(JSON.stringify(response.data));
          res.status(200).json({"message":JSON.stringify(response.data)});
        })
        .catch(function (error) {
          console.log(error);
        });
    }
}

app.get("/stock_supplier", (req, res) => {
    let rawdata = fs.readFileSync('stock_supplier.json');
    let data_config = JSON.parse(rawdata);
    console.log(data_config);
    con.query('SELECT * from stock_supplier', function (error, results, fields) {
        if (error) throw error;
        // console.log('The solution is: ', results);
        send_data(data_config, results, res);
    });
});

app.get("/stock_department", (req, res) => {
    let rawdata = fs.readFileSync('stock_department.json');
    let data_config = JSON.parse(rawdata);
    console.log(data_config);
    con.query('SELECT * from stock_department', function (error, results, fields) {
        if (error) throw error;
        // console.log('The solution is: ', results);
        send_data(data_config, results, res);
    });
});

app.get("/stock_item_type", (req, res) => {
    let rawdata = fs.readFileSync('stock_item_type.json');
    let data_config = JSON.parse(rawdata);
    console.log(data_config);
    con.query(data_config.sql, function (error, results, fields) {
        if (error) throw error;
        // console.log('The solution is: ', results);
        send_data(data_config, results, res);
    });
});

app.get("/stock_item", (req, res) => {
    let rawdata = fs.readFileSync('stock_item.json');
    let data_config = JSON.parse(rawdata);
    console.log(data_config);
    con.query(data_config.sql, function (error, results, fields) {
        if (error) throw error;
        // console.log('The solution is: ', results);
        send_data(data_config, results, res);
    });
});
 
app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});