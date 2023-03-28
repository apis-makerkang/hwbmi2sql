// Charder Height/Weight/BMI(hwBMI) machine API 

var version = "Charder 身高體重機 API V0.2b"; // 配合北榮案直連 SQL 資料庫
var charderAPIKEY = "xG0y3ziAPN";

var customerName = process.env.NAME || "北榮新竹分院";

console.log(customerName);

// express 宣告 =========================
var fs = require('fs');
var https = require("https");
var express = require('express');
var request = require("request");
var app = express();
var port = process.env.PORT || 80; //給 身高體重計 呼叫
// express 宣告結束 ======================

// const { exec } = require("child_process");
const sql = require('mssql');
const config = {
  user: 'SA',
  password: '<abc@12345678>',
  server: 'localhost',
  database: 'VitalSign',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    var headers = {};
    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Headers"] = "Origin, X-Requested-With, Content-Type, Accept";
    headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
    headers["Access-Control-Allow-Credentials"] = false;
    headers["Access-Control-Max-Age"] = '86400'; // 24 hours
    res.writeHead(200, headers);
    res.end();
  } else if (req.is('json') || req.is('text/*')) { // 將 POST 的 data 串 起來
    req.data = '';
    req.setEncoding('utf8');
    req.on('data', function (chunk) { req.data += chunk });
    req.on('end', next);
  } else {
    next();
  }
});


app.get('/', async function (req, res) {
  //console.log(req.query);
  inputParam = req.query;
  var response = res; // use local variable 避免重入衝突

  // 若無 API 參數，無效退出
  if (typeof inputParam.API == "undefined") {
    console.log(req.headers);

    console.log("Error: No API");
    response.send("No API. 北榮新竹分院 API");
    return 0;
  }

  switch (inputParam.API) {
    // API 0x membership management
    case "00":
      console.log("呼叫 API:00 Keep Alive");
      response.send(keepAlive());
      break;
    default:
      console.log("呼叫 未知API:" + inputParam.API);
      response.send("呼叫 未知API:" + inputParam.API);
  }

});

// APIs for Charder Height/Weight/BMI(hwBMI) machine POST ?XAPIKEY=xG0y3ziAPN
app.post('/status', async function (req, res) {
  //console.log(req.query);
  inputParam = req.query;
  await postData(req, res);
});

app.listen(port, function () {
  console.log('App listening on port: ', port);
});


//var sleep = require('system-sleep')
console.log("Version:", version);

var inputParam;

function check_data(record) {
  console.log("id", typeof record.id);
  console.log("nid", typeof record.nid);
  console.log("net_weight", typeof record.net_weight);
  console.log("height", typeof record.height);
  console.log("measure_time", typeof record.measure_time);

  // id: 北榮新竹分院一般是 8 碼，但在護家(7,8,9,10,11 村)會用 10碼身分證號
  // 先不轉換，使用 8碼

  // 轉換 nid: 若 12 碼則轉成 ５碼
  if (record.nid.length == 12) {
    record.nid = record.nid.substr(1, 5); // NN0457000002 => N0457
  }

  if (record.id.length != 8) return "id 長度錯誤";
  if (record.nid.length != 5) return "nid 長度錯誤";
  if (record.net_weight.length < 3) return "net_weight 長度錯誤";
  if (record.height.length < 3) return "height 長度錯誤";
  if (record.measure_time.length == 0) return "measure_time 長度錯誤";

  return "OK";
}

async function postData(req, response) {

  // verify X-API-KEY
  console.log(inputParam.XAPIKEY);
  var XAPIKEY = inputParam.XAPIKEY;
  console.log(XAPIKEY);

  if (XAPIKEY != charderAPIKEY) {
    console.log("XAPIKEY not correct, Error:6");
    var errResponse = {
      "Timestamp": Date.now(),
      "Error": 6
    }
    response.send(JSON.stringify(errResponse));
    return 1;
  }

  if (req.data == undefined) {
    console.log("POST data is undefined, Error:7");
    var errResponse = {
      "Timestamp": Date.now(),
      "Error": 7
    }
    response.send(JSON.stringify(errResponse));
    return 1;
  }

  //  if (req.data.length > 300) {
  //    console.log("收到Post data:(前300字元)", req.data.substr(0,300));
  //  } else {
  //    console.log("收到Post data: ", req.data); //, JSON.parse(req.data));
  //  }

  try {
    var measurements = JSON.parse(req.data)
    console.log(measurements);

    var record;
    for (var i = 0; i < measurements.total; i++) {
      record = {
        "model": measurements.model,
        "sn": measurements.sn,
        "index": measurements.packet[i].index,
        "id": measurements.packet[i].id,
        "nid": measurements.packet[i].nid,
        "tare_weight": measurements.packet[i].tare_weight,
        "net_weight": measurements.packet[i].net_weight,
        "height": measurements.packet[i].height,
        "bmi": measurements.packet[i].bmi,
        "measure_time": measurements.packet[i].time,
        "upload_time": Date.now()
      };
      console.log(record);
      var measure_time = new Date(measurements.packet[i].time);

      if (check_data(record) != "OK") {
        console.log(check_data(record));
        var errResponse = { // Error=8 means data error
          "Timestamp": Date.now(),
          "Error": 8
        }
        response.send(JSON.stringify(errResponse));
        return;

      } else {
        console.log("Data is OK");

        var height_str = record.height.substr(0, record.height.length - 2);
        if (height_str != "0") {
          var takeType = "01";
          var dataUnit = "cm";
          // Inject to SQL
          console.log(record.id, record.nid, record.measure_time, takeType, height_str, dataUnit);
          insert_rec_to_sql(record.id, record.nid, record.measure_time, takeType, height_str, dataUnit);
        }

        var weight_str = record.net_weight.substr(0, record.net_weight.length - 2);
        if (weight_str != "0") {
          var takeType = "02";
          var dataUnit = "kg";
          // Inject to SQL
          console.log(record.id, record.nid, record.measure_time, takeType, weight_str, dataUnit);
          insert_rec_to_sql(record.id, record.nid, record.measure_time, takeType, weight_str, dataUnit);
        }
      }


    }

  } catch (e) {
    console.log(e)
    var errResponse = {
      "Timestamp": Date.now(),
      "Error": 7
    }
    response.send(JSON.stringify(errResponse));
    return;
  }

  var errResponse = { // Error=0 means no error
    "Timestamp": Date.now(),
    "Error": 0
  }
  response.send(JSON.stringify(errResponse));
}



async function insert_rec_to_sql(medId, userId, takeTime, takeType, takeValue, dataUnit) {
  var memo = "NULL";
  // var medId = "12345678";
  // var userId = "abcde";
  // var takeTime = "2023-03-21 16:57:30";
  // var takeType = "02"; //"01";
  // var takeValue = "85"; //"170";
  // var memo = "memo";
  // var dataUnit = "kg"; //"cm";

  // var sql_cmd = "SELECT * FROM VitalSignM;";
  // var sql_cmd = 'insert into VitalSignM values ("12345678", "abcde", "2023-03-18 16:57:30", "01", "175", "memo", "cm", "Y", "N", "");';
  // var insert_rec = 'insert into VitalSignM values ("'
  //   + medId + '", "'
  //   + userId + '", "'
  //   + takeTime + '", "'
  //   + takeType + '", "'
  //   + takeValue + '", "'
  //   + memo + '", "'
  //   + dataUnit + '",  "Y", "N", " ");';

  // console.log(insert_rec);

  // exec("sqlcmd -S localhost -U sa -P '<abc@12345678>' -Q 'USE VitalSign; " + insert_rec + "'", (error, stdout, stderr) => {
  //   if (error) {
  //     console.log(`error: ${error.message}`);
  //     return;
  //   }
  //   if (stderr) {
  //     console.log(`stderr: ${stderr}`);
  //     return;
  //   }
  //   console.log(`stdout: ${stdout}`);
  // });

  try {
    await sql.connect(config);
    const sql_command = `INSERT INTO VitalSignM (MedNo, UserNo, TakeTime, TakeType, TakeValue, Memo, DataUnit, AllowSync, SyncStatus, SyncTime) VALUES ('${medId}', '${userId}', '${takeTime}', '${takeType}', '${takeValue}', '${memo}', '${dataUnit}', 'Y', 'N', NULL)`;
    console.log(sql_command);
    const result = await sql.query(sql_command);
    console.log("sql result", result);
  } catch (err) {
    console.error(err);
  }

}

// API:00
function keepAlive() {
  return ("API:00 KeepAlive OK");
}
