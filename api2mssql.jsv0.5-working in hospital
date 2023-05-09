// API: 啟德身高體重計呼叫，直接寫入 MS SQL Database
// Date: 2023/04/24
// Author: Paul Kang
// Email: paul.kang@ucaremedi.com, paul@paul-kang.com


var version = "Charder 身高體重機 API V0.5";
var customerName = process.env.NAME || "北榮新竹分院";
var charderAPIKEY = "xG0y3ziAPN";
console.log("\n客戶名稱：", customerName, "，", version);

var fs = require('fs');             // for log files

const args = require('yargs').argv; // for command line arguments

const instructions = `
Please secify the following parameters:

Usage: node api2mssql.js
 --s: SQL Server
 --d: SQL Database
 --u: SQL Username
 --p: SQL Password
`;

// 檢查 command line arguments, --test 使用 預設參數 
if ((args.s == undefined || args.d == undefined || args.u == undefined || args.p == undefined) && !args.test) {
  console.log(instructions);
  return;
}

var inputParam; // API 參數

// SQL database settings
var sql_username = args.u || 'SA';
var sql_password = args.p || '<abc@12345678>';
var sql_server = args.s || 'localhost';
var sql_database = args.d || 'VitalSign';
// End of SQL database settings

// express 宣告 
var express = require('express');
var app = express();
var port = process.env.PORT || 80; //給 身高體重計 呼叫
// express 宣告結束 

// 設定 mssql configuration
const sql = require('mssql');
const config = {
  user: sql_username,
  password: sql_password,
  server: sql_server,
  database: sql_database,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

console.log("\n資料庫 config:");
console.log(config);
// 設定 mssql configuration 結束


app.disable('x-powered-by'); // to pass ZAP active scan test

// 設定 headers 和 post data 連結
app.use(function (req, res, next) {
  //res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader("Content-Security-Policy", "default-src 'self'; font-src 'self'; img-src 'self'; script-src 'self'; style-src 'self'; frame-src 'self'; frame-ancestors 'self'; form-action 'self'");
  if (req.method === 'OPTIONS') {
    var headers = {};
    //headers["Access-Control-Allow-Origin"] = "*";
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
// 設定 headers 和 post data 連結 結束

// API GET，並無實際作用，可用作 VM keep-alive 使用
app.get('/', async function (req, res) {

  //res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader["Content-Security-Policy"] = "default-src 'self'";

  //console.log(req.query);
  inputParam = req.query;
  var response = res; // use local variable 避免重入衝突

  // 若無 API 參數，無效退出
  if (typeof inputParam.API == "undefined") {
    //console.log(req.headers);

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

app.get('/robots.txt', async function (req, res) {

  //res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader["Content-Security-Policy"] = "default-src 'self'";

  //console.log(req.query);
  inputParam = req.query;
  var response = res; // use local variable 避免重入衝突

  // 若無 API 參數，無效退出
  if (typeof inputParam.API == "undefined") {
    //console.log(req.headers);

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

app.get('/sitemap.xml', async function (req, res) {

  //res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader["Content-Security-Policy"] = "default-src 'self'";

  //console.log(req.query);
  inputParam = req.query;
  var response = res; // use local variable 避免重入衝突

  // 若無 API 參數，無效退出
  if (typeof inputParam.API == "undefined") {
    //console.log(req.headers);

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

// API GET 結束

// API POST for Charder Height/Weight/BMI(hwBMI) machine POST ?XAPIKEY=xG0y3ziAPN
// 協議由啟德和宇康科技共同訂定
app.post('/status', async function (req, res) {
  //console.log(req.query);
  inputParam = req.query;
  await postData(req, res);
});
// API POST 結束


// API starts on port 
app.listen(port, function () {
  console.log('\nAPI listening on port: ', port);
  log_info("API starts at " + new Date());
  log_event("API starts at " + new Date());
});
// API 結束


// 以下為 functions 定義

// API:00 keepAlive
function keepAlive() {
  return ("API:00 KeepAlive OK");
}
// API:00 結束

// // 檢查上傳資料正確性
// function check_data(record) {
//   console.log("id", typeof record.id);
//   console.log("nid", typeof record.nid);
//   console.log("net_weight", typeof record.net_weight);
//   console.log("height", typeof record.height);
//   console.log("measure_time", typeof record.measure_time);

//   var errCode = 0;
//   // id 對應北榮新竹分院的 MedNo，一般是 8 碼，但在護家(7,8,9,10,11 村)會用 10碼身分證號，先不轉換，使用 8碼
//   if (record.id.length != 8) errCode += 1; //hex 01 "id 長度錯誤";   

//   // nid 對應北榮新竹分院的 UserNo，一般是 5 碼，若 12 碼 NN0457000002 則轉成 ５碼 N0457
//   if (record.nid.length == 12) {
//     record.nid = record.nid.substr(1, 5); // NN0457000002 => N0457
//   }
//   if (record.nid.length != 5) errCode += 2; //hex 10 "nid 長度錯誤";

//   //if (record.net_weight.length < 3) return "net_weight 長度錯誤";
//   //if (record.height.length < 3) return "height 長度錯誤";
//   //if (record.measure_time.length == 0) return "measure_time 長度錯誤";

//   if (errCode == 0)
//     return "OK";
//   else
//     return errCode;
// }
// 檢查上傳資料正確性 結束

// 處理上傳資料
async function postData(req, response) {

  // verify X-API-KEY
  var XAPIKEY = inputParam.XAPIKEY;

  if (XAPIKEY != charderAPIKEY) {
    console.log("XAPIKEY not correct, Error:6");
    var errResponse = {
      "Timestamp": Date.now(),
      "Error": 6
    }
    response.send(JSON.stringify(errResponse));
    return 1;
  }

  try {
    var measurements = JSON.parse(req.data)
    //console.log(measurements);

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
      //console.log(record);

      var errCode = 0;
      // id 對應北榮新竹分院的 MedNo，一般是 8 碼，但在護家(7,8,9,10,11 村)會用 10碼身分證號，先不轉換，使用 8碼
      if (record.id.length != 8) errCode += 1; //hex 01 "id 長度錯誤";   

      // nid 對應北榮新竹分院的 UserNo，一般是 5 碼，若 12 碼 NN0457000002 則轉成 ５碼 N0457
      if (record.nid.length == 12) {
        record.nid = record.nid.substr(1, 5); // NN0457000002 => N0457
      }
      if (record.nid.length != 5) errCode += 2; //hex 10 "nid 長度錯誤";

      if (record.height != '0') {
        if ((errCode & 1) == 1) {
          log_event("[E] " + new Date() + ": MedNo 長度錯誤，必須為 8 位");
          log_event("    Record: " + record.id + " " + record.nid + " " + record.measure_time + " " + record.height);
        } else if ((errCode & 2) == 2) {
          log_event("[E] " + new Date() + ": UserNo 長度錯誤，必須為 5 或 12 位");
          log_event("    Record: " + record.id + " " + record.nid + " " + record.measure_time + " " + record.height);
        } else {
          var height_str = record.height.substr(0, record.height.length - 2);
          if (height_str != "0") {
            var takeType = "01";
            var dataUnit = "cm";
            // Inject to SQL
            //console.log(record.id, record.nid, record.measure_time, takeType, height_str, dataUnit);
            insert_rec_to_sql(record.id, record.nid, record.measure_time, takeType, height_str, dataUnit);
          }
        }
      }

      if (record.net_weight != '0') {
        if ((errCode & 1) == 1) {
          log_event("[E] " + new Date() + ": MedNo 長度錯誤，必須為 8 位");
          log_event("    Record: " + record.id + " " + record.nid + " " + record.measure_time + " " + record.net_weight);
        } else if ((errCode & 2) == 2) {
          log_event("[E] " + new Date() + ": UserNo 長度錯誤，必須為 5 或 12 位");
          log_event("    Record: " + record.id + " " + record.nid + " " + record.measure_time + " " + record.net_weight);
        } else {
          var weight_str = record.net_weight.substr(0, record.net_weight.length - 2);
          if (weight_str != "0") {
            var takeType = "02";
            var dataUnit = "kg";
            // Inject to SQL
            //console.log(record.id, record.nid, record.measure_time, takeType, weight_str, dataUnit);
            insert_rec_to_sql(record.id, record.nid, record.measure_time, takeType, weight_str, dataUnit);
          }
        }
      }

    }

  } catch (err) {
    console.log(err)
    log_event("[E] " + new Date() + ": Error: " + err.message);
  }

  var errResponse = { // Error=0 means no error
    "Timestamp": Date.now(),
    "Error": 0
  }
  response.send(JSON.stringify(errResponse));
}

async function insert_rec_to_sql(medId, userId, takeTime, takeType, takeValue, dataUnit) {
  var memo = "NULL";
  try {
    await sql.connect(config);
    const sql_command = `INSERT INTO VitalSignM (MedNo, UserNo, TakeTime, TakeType, TakeValue, Memo, DataUnit, AllowSync, SyncStatus, SyncTime) VALUES ('${medId}', '${userId}', '${takeTime}', '${takeType}', '${takeValue}', '${memo}', '${dataUnit}', 'Y', 'N', NULL)`;
    //console.log(sql_command);
    const result = await sql.query(sql_command);
    //console.log("sql result", result);

    log_event("[I] " + new Date() + ": Write record into the database OK");
    log_event("    Record: " + medId + " " + userId + " " + takeTime + " " + takeType + " " + takeValue + " " + dataUnit);
  } catch (err) {
    console.log(err)
    log_event("[E] " + new Date() + ": Error: " + err.message);
  }
}

function log_info(message) {
  console.log("log_info message:" + message);

  var logfile_name = "log_information.txt";
  // Check if the file exists
  if (!fs.existsSync(logfile_name)) {
    // Create the file if it doesn't exist
    fs.writeFileSync(logfile_name, 'Information:\n');
  }

  // Append message to the file
  fs.appendFileSync(logfile_name, message + "\n");

  // Close the file
  fs.closeSync(fs.openSync(logfile_name, 'a'));

}

function log_event(message) {
  console.log("log_event message:" + message);

  var logfile_name = "log_" + new Date().toISOString().substr(0, 10) + ".txt";
  // Check if the file exists
  if (!fs.existsSync(logfile_name)) {
    // Create the file if it doesn't exist
    fs.writeFileSync(logfile_name, 'Event log:\n');
  }

  // Append message to the file
  fs.appendFileSync(logfile_name, message + "\n");

  // Close the file
  fs.closeSync(fs.openSync(logfile_name, 'a'));

}


