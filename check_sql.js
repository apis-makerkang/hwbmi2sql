const { exec } = require("child_process");

var medId = "12345678";
var userId = "abcde";
var takeTime = "2023-03-21 16:57:30";
var takeType = "02"; //"01";
var takeValue = "85"; //"170";
var memo = "memo";
var dataUnit = "kg"; //"cm";

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
