const mysql = require("mysql")

// Create a connection to the database
const connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "social_web",
  port: "3306",
  multipleStatements: true
});

// open the MySQL connection
connection.connect(error => {
  if (error) throw error;
  console.log("Successfully connected to the database.")
});

module.exports = connection
