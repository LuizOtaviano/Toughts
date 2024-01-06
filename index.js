const express = require('express')
const exphbs = require('express-handlebars')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const toughtsRoutes = require('./routes/toughtsRouters.js')
const ToughtController = require('./controllers/ToughtController.js')
const authRoutes = require('./routes/authRoutes.js')
const AuthController = require('./controllers/AuthController.js')
const flash = require('express-flash')
const conn = require('./db/conn.js')
const path = require('path')
const os = require('os')
const app = express()
const port = 3000

// Models
const Tought = require('./models/Tought.js')
const User = require('./models/User.js')

// setup handlebars ( template engine )
app.engine('handlebars', exphbs.engine())
app.set('view engine', 'handlebars')

// receber resposta do body
app.use(express.urlencoded({
  extended: true
}))
app.use(express.json())

// public path
app.use(express.static('public'))


// session middleware
app.use(
  session({
    name: "session",
    secret: "nosso_secret", // segurança da sessão
    resave: false,
    saveUninitialized: false,
    store: new FileStore({
      logFn: function() {},
      path: path.join(os.tmpdir(), "sessions")
    }),
    cookie: {
      secure: false,
      maxAge: 360000, // deixa de ser valido em um dia
      expires: new Date(Date.now() + 360000), // expira em um dia
      httpOnly: true
    }
  })
  )
  
  // set session to response
  app.use((req, res, next) => {
    if(req.session.userid) {
      res.locals.session = req.session // passa os dados da requisisão para o resposta do server
    }
    
    next()
  })
  
  // flash messages
  app.use(flash())

  // Routes
  app.use('/toughts', toughtsRoutes)
  app.use('/', authRoutes)
  app.get('/', ToughtController.showToughts)
  
  // conectando do banco de dados e no server
  conn.sync().then(() => {
    app.listen(port, () => {
      console.log(`Server is running at port ${port}`)
    })
  }).catch(err => {
    console.log(err)
  })
  