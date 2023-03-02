require("dotenv").config();
const {startDatabase} = require('./database/databaseConn')

const http = require("http");
const app = require("./app.js");

const server = http.createServer(app);

startDatabase() 

async function startServer() {
  server.listen(4000, () => {
    console.log(`Server is Listening on port: ${4000}`);
  });
}



startServer();
