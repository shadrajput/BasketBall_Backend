require("dotenv").config();
const {startDatabase} = require('./database/databaseConn')

const http = require("http");
const app = require("./app.js");

const server = http.createServer(app);

startDatabase() 

const PORT = process.env.PORT || 4000
async function startServer() {
  server.listen(PORT, () => {
    console.log(`Server is Listening on port: ${PORT}`);
  });
}



startServer();
