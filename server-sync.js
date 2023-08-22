const mysql = require('mysql');
const MySQLEvents = require('@rodrigogs/mysql-events');
const ora = require('ora'); // cool spinner
const fs = require('fs');
const axios = require('axios');

// const spinner = ora('Loading\n').start();

let rawdata = fs.readFileSync('config_hosxp.json');
let data_config = JSON.parse(rawdata);

var connection = mysql.createConnection({
    host: '192.168.80.253',
    user: 'sa',
    password: 'sa',
    port: 3306,
    database: 'hos',
    charset: 'utf8'
});

// const connection = mysql.createConnection({
//     host: '127.0.0.1',
//     user: 'root',
//     password: '123132123',
//     port: 3306,
//     database: 'hos',
//     charset: 'utf8'
// });

connection.connect((error) => {
    if (error) {
        console.log('Error connecting to MySQL:', error);
        setTimeout(connectToDatabase, 1000); // Wait for 2 seconds and then try again
    } else {
        console.log('Connected to MySQL');
        program(connection);
    }
});

const connectToDatabase = () => {
    connection = mysql.createConnection({
        host: '192.168.80.253',
        user: 'sa',
        password: 'sa',
        port: 3306,
        database: 'hos',
        charset: 'utf8'
    });
    connection.connect((error) => {
        if (error) {
            // console.log('Error connecting to MySQL:', error);
            console.log("MySQL connection lost")
            setTimeout(connectToDatabase, 3000); // Wait for 2 seconds and then try again
        } else {
            console.log('Connected to MySQL');
            program(connection);
        }
    });
}

function get_data(param, data, set_index = false, str_index = null, is_arr = false, set_null = true) {
    let new_data = [];
    if (set_index) {
        new_data = {};
    }
    let index = null;

    if (data) {
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
    } else {
        console.log("No Data!!");
    }
    // console.log(new_data)
    // break;
    return new_data;
}

function send_data(structure, data) {
    let { endpoint, method, header, body } = structure;
    let new_data = get_data(body, data);
    console.log("Data ===> ", new_data);
    console.log(new_data.length)

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
                // res.status(200).json({ "message": JSON.stringify(response.data) });
            })
            .catch(function (error) {
                console.log(error);
            });
    }
}

async function send_transaction_data(structure, param, body) {
    let { sql_param_id, sql_body_id } = structure;
    let { endpoint, method, header } = structure;
    // console.log(param, body);
    let param_data = get_data(structure.param, param, true, sql_param_id, false, false);
    let body_data = get_data(structure.body, body, true, sql_body_id, true);
    // console.log("example param data", param_data);
    // console.log("example param body", body_data)

    let json_res = [];

    // console.log(body_data[6069])

    for (const [key, value] of Object.entries(param_data)) {
        let json_obj = {};
        console.log(key, value)
        console.log(key, body_data[key])
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
                const response = await axios(config)
                // .then(function (response) {
                //   console.log(JSON.stringify(response.data));
                // res.status(200).json({"message":JSON.stringify(response.data)});
                // })
                // .catch(function (error) {
                //   console.log(error);
                // });
                console.log(response.data)
                // json_res.push(response.data)
            } catch (error) {
                // Handle errors
                console.log(error.message)
                // json_res.push(error.message)
            }

        }
        // break;
    }
    // res.status(200).json(json_res);
}

async function query_data(structure, data) {
    let { sql_body, sql_body_id, sql_body_name, sql_param_other } = structure;

    try {
        let where_id = data[sql_body_id];
        let full_sql = sql_body + " where " + sql_body_name + "=" + where_id;
        if (sql_param_other) {
            full_sql += " " + full_sql;
        }
        console.log("full query ===> ", full_sql);
        connection.query(full_sql, function (error, results, fields) {
            if (error) console.log(error);
            // console.log('The solution is: ', results);
            // console.log(results)
            send_data(structure, results);
        });
    } catch (error) {
        console.log("don't have body id")
    }
}

async function query_transaction_data(structure, data) {
    let { sql_param, sql_param_other, sql_body, sql_body_id, sql_body_name, sql_param_id, sql_param_name } = structure;

    try {

        let where_param_id = data[sql_param_id];
        console.log(sql_param + " where " + sql_param_name + "=" + where_param_id)
        let full_sql_param = sql_param + " where " + sql_param_name + "=" + where_param_id;
        if (sql_param_other) {
            full_sql_param += " " + sql_param_other;
        }
        let full_sql_body = sql_body + " where " + sql_body_name + "=" + where_param_id;
        console.log("full sql param query ===> ", full_sql_param);
        console.log("full sql body query ===> ", full_sql_body);

        connection.query(full_sql_param, function (error, param, fields) {
            connection.query(full_sql_body, function (e, body, fields) {
                send_transaction_data(structure, param, body)
                // console.log(param, body)
            })
        })

        // let where_id = data[sql_body_id];
        // con.query(sql+" where "+sql_body_name+"="+where_id, function (error, results, fields) {
        //   if (error) throw error;
        //   // console.log('The solution is: ', results);
        //   // console.log(results)
        //   send_data(structure, results);
        // });
    } catch (error) {
        console.log("don't have body or param id")
    }
}

function send_delete_operation(operation_id){
    let data = JSON.stringify({
        "table": "operation_list",
        "pk": operation_id
      });
      
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://dss-face.whsse.net/api/collections/delete_operation_set/records',
        headers: { 
          'Content-Type': 'application/json'
        },
        data : data
      };
      
      axios.request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log(error);
      });      
}

const program = async (connection) => {
    const instance = new MySQLEvents(connection, {
        startAtEnd: true
    });

    await instance.start();

    instance.addTrigger({
        name: 'monitoring all statements',
        expression: 'hos.*',
        statement: MySQLEvents.STATEMENTS.ALL,
        onEvent: e => {
            let event = (e.type).toLowerCase();
            let table = e.table;

            const now = new Date();
            const options = {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
                timeZone: 'Asia/Bangkok'
            };

            const formattedDate = now.toLocaleString('th-TH', options).replace(/[/]/g, '-');
            console.log("TABLE ", table, " (" + formattedDate + ")");


            let data = null;
            let structure = null;
            try {
                if (event == "insert") {
                    data = e.affectedRows[0].after;
                    structure = data_config[table][event];
                    console.log(event, data);
                    let { param } = structure;
                    if (param) {
                        query_transaction_data(structure, data);
                    } else {
                        send_data(structure, [data]);
                    }
                } else if (event == "update") {
                    data = e.affectedRows[0].after;
                    structure = data_config[table][event];
                    console.log("UPDATE", data);
                    let { param } = structure;
                    console.log(param)
                    if (param) {
                        query_transaction_data(structure, data);
                    } else {
                        query_data(structure, data);
                    }
                } else if (event == "delete") {
                    data = e.affectedRows[0].before;
                    console.log("DELETE", "No Action !!!");
                    console.log(data);
                    if(table == 'operation_list'){
                        send_delete_operation(data.operation_id);
                    }
                } else {
                    // console.log("No Action !!!");
                }
            } catch (error) {
                // console.log("No Table name !!!");
            }
        }
    });

    instance.on(MySQLEvents.EVENTS.CONNECTION_ERROR, () => {
        console.error('MySQL connection lost');
        connectToDatabase();
    });
    instance.on(MySQLEvents.EVENTS.ZONGJI_ERROR, () => {
        // console.error('')   
        console.log("error");
        // connectToDatabase();
    });
};

