const { exec } = require("child_process");
exec("sqlcmd -S 192.168.2.86 -U sa -P '<abc@12345678>' -Q 'USE SampleDB; SELECT * FROM Employees;'", (error, stdout, stderr) => {
  if (error) {
    console.log(`error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`stderr: ${stderr}`);
    return;
  }
  //console.log(`stdout: ${stdout}`);
  result = stdout.split("\n");
  console.log("0:", result[0]);
  console.log("1:", result[1]);
  console.log("2:", result[2]);
  console.log("3:", result[3]);
});




