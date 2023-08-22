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
    charset: 'utf8',
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

function get_data(param, data, set_index = false, str_index = null, is_arr = false, set_null = true) {
    let new_data = [];
    if (set_index) {
        new_data = {};
    }
    let index = null;

    for (let i = 0; i < data.length; i++) {
        const e = data[i];
        let data_object = {};
        index = i;
        if (set_index) {
            // console.log(value)
            index = e[str_index].toString()
        }
        for (const [key, value] of Object.entries(param)) {
            //   console.log(`${key}: ${value}`);
            //   console.log(typeof value == "object")
            // console.log(set_index && value == str_index)
            // console.log(e[value])

            if (Object.prototype.toString.call(e[value]) === "[object Date]") {
                console.log("date");
                var date = new Date(e[value]);
                var dateStr =
                    date.getFullYear() + "-" +
                    ("00" + (date.getMonth() + 1)).slice(-2) + "-" +
                    ("00" + date.getDate()).slice(-2)
                //  + " " +
                // ("00" + date.getHours()).slice(-2) + ":" +
                // ("00" + date.getMinutes()).slice(-2) + ":" +
                // ("00" + date.getSeconds()).slice(-2);
                // console.log(dateStr);
                e[value] = dateStr
            }

            if (typeof value == "object") {
                // console.log("One")
                if (set_null) {
                    data_object[key] = value.value;
                } else {
                    if (value.value == null) {
                        data_object[key] = '';
                    } else {
                        data_object[key] = value.value;
                    }
                }
            } else if (e[value] == null || e[value] == undefined) {
                // console.log("Two")
                if (!set_null) {
                    if (key == "vatamount" || key == "discountamount") {
                        data_object[key] = 0;
                    } else {
                        data_object[key] = '';
                    }
                } else {
                    data_object[key] = e[value];
                }
            } else {
                // console.log("Three")
                if (key == "wh_status" || key == "categorystatus") {
                    let temp = null;
                    if (e[value] == "Y") {
                        temp = true;
                    } else if (e[value] == "N") {
                        temp = false;
                    }
                    data_object[key] = temp;
                } else {
                    if (key == "orderno" || key == "sku" || key == 'pono') {
                        data_object[key] = e[value].toString();
                    } else {
                        data_object[key] = e[value];
                    }
                }
            }
            if (key == "description") {
                // console.log()
                if (e[value] == null) {
                    data_object[key] = "";
                }
            }

            if (data_object[key] == undefined) {
                data_object[key] = '';
            }
        }

        // console.log(data_object); 
        if (is_arr) {
            if (typeof new_data[index] === 'undefined') {
                new_data[index] = [];
            }
            (new_data[index]).push(data_object)
        } else {
            new_data[index] = data_object
        }
    }
    // console.log(new_data)
    // break;
    return new_data;
}

function send_data(structure, data, res) {
    let { endpoint, method, header, body } = structure;
    let new_data = get_data(body, data);
    // console.log(new_data);
    // console.log(new_data.length)

    if (method == "POST") {
        let str_data = JSON.stringify(new_data);
        var config = {
            method: 'post',
            url: endpoint,
            headers: header,
            data: str_data
        };

        console.log({ body: new_data});
        res.status(200).json({ body: new_data});

        // axios(config)
        //     .then(function (response) {
        //         console.log(JSON.stringify(response.data));
        //         res.status(200).json({ "message": JSON.stringify(response.data) });
        //     })
        //     .catch(function (error) {
        //         console.log(error);
        //     });
    }
}

async function send_transaction_data(structure, param, body, res, filename) {
    let { sql_param_id, sql_body_id } = structure;
    let { endpoint, method, header } = structure;
    // console.log(sql_param_id, sql_body_id);
    let param_data = get_data(structure.param, param, true, sql_param_id, false, false);
    let body_data = get_data(structure.body, body, true, sql_body_id, true);
    // console.log("example param data", param_data);
    // console.log("example param body", body_data)

    let json_res = [];

    // console.log(body_data[6069])

    for (const [key, value] of Object.entries(param_data)) {
        // console.log(key, value)
        // console.log(key, body_data[key])
        let extend_url = new URLSearchParams(value).toString();
        let new_data = body_data[key];

        if (method == "POST") {
            console.log(endpoint + "?" + extend_url)

            let str_data = JSON.stringify(new_data);
            var config = {
                method: 'post',
                url: endpoint + "?" + extend_url,
                headers: header,
                data: str_data
            };

            
            try {
                let param = value;
                let body = new_data;
                console.log(body.length);

                // if(!body){

                    
                // }

                // const response = (config)
                // .then(function (response) {
                //   console.log(JSON.stringify(response.data));
                // res.status(200).json({"message":JSON.stringify(response.data)});
                // })
                // .catch(function (error) {
                //   console.log(error);
                // });
                // console.log(response.data)

                console.log({
                    param: param_data,
                    body: new_data
                });

                // console.log(body.length);

                json_res.push({
                    param: param_data,
                    body: new_data
                })
            } catch (error) {
                // Handle errors
                console.log(error.message)

                const filePath = 'json/'+filename;

                // Load existing data from the file (if any)
                let existing_data = [];
                try {
                    const fileContent = fs.readFileSync(filePath, 'utf-8');
                    existing_data = JSON.parse(fileContent);
                } catch (error) {
                    // File doesn't exist or is empty
                }

                // Append new_data to existing_data
                existing_data.push(value);

                // Write back the combined data to the file
                fs.writeFileSync(filePath, JSON.stringify(existing_data, null, 4));

                json_res.push(error.message)
            }

        }
        // break;
    }
    res.status(200).json(json_res);
}

app.get("/stock_supplier/:action", (req, res) => {
    let rawdata = fs.readFileSync('stock_supplier.json');
    let data_config = JSON.parse(rawdata);
    console.log(data_config);
    let action = req.params.action;
    data_config.endpoint += action;
    con.query('SELECT * from stock_supplier', function (error, results, fields) {
        if (error) throw error;
        // console.log('The solution is: ', results);
        send_data(data_config, results, res);
    });
});

app.get("/stock_department/:action", (req, res) => {
    let rawdata = fs.readFileSync('stock_department.json');
    let data_config = JSON.parse(rawdata);
    console.log(data_config);
    let action = req.params.action;
    data_config.endpoint += action;
    con.query('SELECT * from stock_department', function (error, results, fields) {
        if (error) throw error;
        // console.log('The solution is: ', results);
        send_data(data_config, results, res);
    });
});

app.get("/stock_item_type/:action", (req, res) => {
    let rawdata = fs.readFileSync('stock_item_type.json');
    let data_config = JSON.parse(rawdata);
    console.log(data_config);
    let action = req.params.action;
    data_config.endpoint += action;
    con.query(data_config.sql, function (error, results, fields) {
        if (error) throw error;
        // console.log('The solution is: ', results);
        send_data(data_config, results, res);
    });
});

app.get("/stock_item/:action", (req, res) => {
    let rawdata = fs.readFileSync('stock_item.json');
    let data_config = JSON.parse(rawdata);
    console.log(data_config);
    let action = req.params.action;
    data_config.endpoint += action;
    con.query(data_config.sql_body, function (error, results, fields) {
        if (error) throw error;
        // console.log('The solution is: ', results);
        send_data(data_config, results, res);
    });
});

/*app.get("/stock_request", (req, res) => {
    let rawdata = fs.readFileSync('stock_request.json');
    let data_config = JSON.parse(rawdata);
    console.log(data_config);
    con.query(data_config.sql, function (error, results, fields) {
        if (error) throw error;
        // console.log('The solution is: ', results);
        send_data(data_config, results, res);
    });
});
*/

app.get("/stock_request/:action", async (req, res) => {
    let rawdata = fs.readFileSync('stock_request.json');
    let data_config = JSON.parse(rawdata);
    // console.log(data_config);
    let action = req.params.action;
    data_config.endpoint += action;
    con.query(data_config.sql_param, function (error, param, fields) {
        con.query(data_config.sql_body, function (e, body, fields) {
            console.log(data_config.sql_param);
            console.log(data_config.sql_body)
            send_transaction_data(data_config, param, body, res, 'stock_request.json')
        });
    });
});

/*app.get("/stock_po", (req, res) => {
    let rawdata = fs.readFileSync('stock_po.json');
    let data_config = JSON.parse(rawdata);
    console.log(data_config);
    con.query(data_config.sql, function (error, results, fields) {
        if (error) throw error;
        // console.log('The solution is: ', results);
        send_data(data_config, results, res);
    });
});
*/

// success
app.get("/stock_po/:action", async (req, res) => {
    let rawdata = fs.readFileSync('stock_po.json');
    let data_config = JSON.parse(rawdata);
    // console.log(data_config);
    let action = req.params.action;
    data_config.endpoint += action;
    con.query(data_config.sql_param, function (error, param, fields) {
        con.query(data_config.sql_body, function (e, body, fields) {
            console.log(param[0]);
            console.log(body[0])
            send_transaction_data(data_config, param, body, res, 'stock_po.json')
        });
    });
});


/*app.get("/stock_deliver_detail", (req, res) => {
    let rawdata = fs.readFileSync('stock_deliver_detail.json');
    let data_config = JSON.parse(rawdata);
    console.log(data_config);
    con.query(data_config.sql, function (error, results, fields) {
        if (error) throw error;
        // console.log('The solution is: ', results);
        send_data(data_config, results, res);
    });
});*/

//success
app.get("/stock_deliver/:action", async (req, res) => {
    let rawdata = fs.readFileSync('stock_deliver.json');
    let data_config = JSON.parse(rawdata);
    // console.log(data_config);
    let action = req.params.action;
    data_config.endpoint += action;
    con.query(data_config.sql_param, function (error, param, fields) {
        con.query(data_config.sql_body, function (e, body, fields) {
            console.log(param[0]);
            console.log(body[0])
            send_transaction_data(data_config, param, body, res, 'stock_deliver.json')
        });
    });
});

// success
app.get("/stock_manual_head/:action", async (req, res) => {
    let rawdata = fs.readFileSync('stock_manual_head.json');
    let data_config = JSON.parse(rawdata);
    // console.log(data_config);
    let action = req.params.action;
    data_config.endpoint += action;
    con.query(data_config.sql_param, function (error, param, fields) {
        con.query(data_config.sql_body, function (e, body, fields) {
            console.log(param[0]);
            console.log(body[0])
            send_transaction_data(data_config, param, body, res, 'stock_manual_head.json')
        });
    });
});

// app.get("/stock_draw_param2", (req, res) => {
//     let rawdata = fs.readFileSync('stock_draw_param2.json');
//     let data_config = JSON.parse(rawdata);
//     console.log(data_config);
//     con.query(data_config.sql, function (error, results, fields) {
//         if (error) throw error;
//         // console.log('The solution is: ', results);
//         send_data(data_config, results, res);
//     });
// });


// app.get("/stock_subdraw_body", (req, res) => {
//     let rawdata = fs.readFileSync('stock_subdraw_body.json');
//     let data_config = JSON.parse(rawdata);
//     console.log(data_config);
//     con.query(data_config.sql, function (error, results, fields) {
//         if (error) throw error;
//         // console.log('The solution is: ', results);
//         send_data(data_config, results, res);
//     });
// });

app.get("/stock_subdraw/:action", async (req, res) => {
    let rawdata = fs.readFileSync('stock_subdraw.json');
    let data_config = JSON.parse(rawdata);
    // console.log(data_config);
    let action = req.params.action;
    data_config.endpoint += action;
    con.query(data_config.sql_param, function (error, param, fields) {
        con.query(data_config.sql_body, function (e, body, fields) {
            console.log(param[0]);
            console.log(body[0])
            send_transaction_data(data_config, param, body, res, 'stock_subdraw.json')
        });
    });
});

/*app.get("/doctor_order_print", (req, res) => {
    let rawdata = fs.readFileSync('doctor_order_print.json');
    let data_config = JSON.parse(rawdata);
    console.log(data_config);
    con.query(data_config.sql, function (error, results, fields) {
        if (error) throw error;
        // console.log('The solution is: ', results);
        send_data(data_config, results, res);
    });
});*/

/*app.get("/doctor_order_print", async (req, res) => {
    let rawdata = fs.readFileSync('doctor_order_print.json');
    let data_config = JSON.parse(rawdata);
    // console.log(data_config);
   con.query(data_config.sql_param, function (error, param, fields) {
        con.query(data_config.sql_body, function (e, body, fields) {
            console.log(param[0]);
            console.log(body[0])
            send_transaction_data(data_config, param, body, res)
        });
    });
});
*/
app.get("/doctor_order_print/:action", async (req, res) => {
    let rawdata = fs.readFileSync('doctor_order_print.json');
    let data_config = JSON.parse(rawdata);
    console.log(data_config);
    let action = req.params.action;
    data_config.endpoint += action;
    con.query(data_config.sql_param, function (error, param, fields) {
        con.query(data_config.sql_body, function (e, body, fields) {
            console.log(param[0]);
            console.log(body[0])
            send_transaction_data(data_config, param, body, res, 'doctor_order_print.json')
        });
    });
});

app.get('/index', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});