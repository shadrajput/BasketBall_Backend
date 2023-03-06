const {Pool} = require('pg')

const pool = new Pool({
  user: process.env.POSTGRE_USER,
  password: process.env.POSTGRE_PASSWORD,
  host: 'localhost',
  post: 5432,
  database: 'cbl'
})
async function startDatabase(){
  pool.connect(async(err)=>{
    if(err) console.log(err)
    else {
      console.log('Connected to database');
    }
  })
}

module.exports = {startDatabase};
  
