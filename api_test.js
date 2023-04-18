// Charder Height/Weight/BMI(hwBMI) machine API 

var version = "Charder 身高體重機 API V0.2a"; // 配合北榮案直連 SQL 資料庫
var charderAPIKEY = "xG0y3ziAPN";

var customerName = process.env.NAME || "北榮新竹分院";

console.log(customerName);

// express 宣告 =========================
var https = require("https");
var express = require('express');
var request = require("request");
var app = express();
var port = process.env.PORT || 80; //給 身高體重計 呼叫
// express 宣告結束 ======================


app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  // below are from https://ithelp.ithome.com.tw/articles/10273734
  res.header('Content-Security-Policy', 'default-src larry.com');
  res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'deny');

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

// Program starts here
var sleep = require('system-sleep')
console.log("Version:", version);

var inputParam;

function chack_data(record) {
  console.log("id", typeof record.id);
  console.log("nid", typeof record.nid);
  console.log("net_weight", typeof record.net_weight);
  console.log("height", typeof record.height, record.height, record.height.length);
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
        }

        var weight_str = record.net_weight.substr(0, record.net_weight.length - 2);
        if (weight_str != "0") {
          var takeType = "02";
          var dataUnit = "kg";
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

// API:00
function keepAlive() {
  return ("API:00 KeepAlive OK");
}
