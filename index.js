var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

// Create connection to database
var config = {
  server: 'localhost',
  authentication: {
    type: 'default',
    options: {
      userName: 'SA', // update me
      password: '<abc@12345678>' // update me
    }
  },
  options: {
    database: 'SampleDB'
  }
}
var connection = new Connection(config);

// Attempt to connect and execute queries if connection goes through
connection.on('connect', function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log('Connected');
  }
});