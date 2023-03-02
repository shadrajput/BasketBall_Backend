const {MONGODB_URL, POSTGRE_USER, POSTGRE_PASSWORD} = require('../../constant')
const {Pool} = require('pg')

const pool = new Pool({
  user: POSTGRE_USER,
  password: POSTGRE_PASSWORD,
  host: 'localhost',
  post: 5432,
  database: 'CBL'
})
async function startDatabase(){
  pool.connect((err)=>{
    if(err) console.log(err)
    else console.log('Connected to database')
  })
}

module.exports = {startDatabase};
  
