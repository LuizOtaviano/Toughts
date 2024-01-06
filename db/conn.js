const { Sequelize } = require('sequelize')

const conn = new Sequelize("toughts", "root", "", {
  host: "localhost",
  dialect: "mysql",
})

try {
  conn.authenticate()
  console.log('DB connection is successfully')
} catch(err) {
  console.log(err)
}

module.exports = conn