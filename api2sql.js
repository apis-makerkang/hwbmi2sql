// Charder Height/Weight/BMI(hwBMI) machine API 

var version = "Charder 身高體重機 API V0.2a"; // 配合北榮案直連 SQL 資料庫
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

const { exec } = require("child_process");

//https 需求，因為改為直接呼叫 IP address，應該不需要了
// var options = {
//   //key: fs.readFileSync('./ssl/privatekey.pem'),
//   //cert: fs.readFileSync('./ssl/certificate.pem'),
//   key: fs.readFileSync('/etc/letsencrypt/live/makerkang.com/privkey.pem'),
//   cert: fs.readFileSync('/etc/letsencrypt/live/makerkang.com/fullchain.pem'),
// };


// 金機((goldenfound) Firebase 宣告 =========================
// 北榮案不傳雲端，所以 firebase 也不需要
// var admin = require("firebase-admin");
// var goldebFoundAccount = require("./goldenfound-7ecb8-firebase-adminsdk-uuev4-2ec52d0607.json");

// var app_golden = admin.initializeApp({
//   credential: admin.credential.cert(goldebFoundAccount),
//   databaseURL: "https://goldenfound-7ecb8-default-rtdb.firebaseio.com/"
// }, "app_golden");

// var golden_found_DB = admin.database(app_golden); 

// var database;

// var 量測記錄筆數=0;

// Firebase 宣告結束 ======================

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

// var server = https.createServer(options, app).listen(port, function(){
//   console.log("Express server listening on port " + port);
// });

// express 設定結束 ======================================

// Program starts here
var sleep = require('system-sleep')
console.log("Version:", version);

var inputParam;

//test
//insert_rec_to_sql("12345678", "abcde", "2023-03-21 18:57:30", "02", "80", "kg");

function chack_data(record) {
  console.log("id", typeof record.id);
  console.log("nid", typeof record.nid);
  console.log("net_weight", typeof record.net_weight);
  console.log("height", typeof record.height);
  console.log("measure_time", typeof record.measure_time);

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

      if (chack_data(record) != "OK") {
        console.log(chack_data(record));
      } else {
        console.log("Data is OK");

        var height_str = record.height.substr(0, record.height.length - 2);
        if (height_str != "0") {
          var takeType = "01";
          var dataUnit = "cm";
          // Inject to SQL
          insert_rec_to_sql(record.id, record.nid, record.measure_time, takeType, height_str, dataUnit);
        }

        var weight_str = record.net_weight.substr(0, record.net_weight.length - 2);
        if (weight_str != "0") {
          var takeType = "02";
          var dataUnit = "kg";
          // Inject to SQL
          insert_rec_to_sql(record.id, record.nid, record.measure_time, takeType, weight_str, dataUnit);
        }
      }


    }

  } catch (e) {
    console.log(e)
    var errResponse = { // Error=0 means no error
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



function insert_rec_to_sql(medId, userId, takeTime, takeType, takeValue, dataUnit) {
  var memo = "memo";
  // var medId = "12345678";
  // var userId = "abcde";
  // var takeTime = "2023-03-21 16:57:30";
  // var takeType = "02"; //"01";
  // var takeValue = "85"; //"170";
  // var memo = "memo";
  // var dataUnit = "kg"; //"cm";

  // var sql_cmd = "SELECT * FROM VitalSignM;";
  var sql_cmd = 'insert into VitalSignM values ("12345678", "abcde", "2023-03-18 16:57:30", "01", "175", "memo", "cm", "Y", "N", "");';
  var insert_rec = 'insert into VitalSignM values ("'
    + medId + '", "'
    + userId + '", "'
    + takeTime + '", "'
    + takeType + '", "'
    + takeValue + '", "'
    + memo + '", "'
    + dataUnit + '",  "Y", "N", "");';

  console.log(insert_rec);

  exec("sqlcmd -S localhost -U sa -P '<abc@12345678>' -Q 'USE VitalSign; " + insert_rec + "'", (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
}

// API:00
function keepAlive() {
  return ("API:00 KeepAlive OK");
}
