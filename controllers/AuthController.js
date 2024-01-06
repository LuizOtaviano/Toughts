const bcrypt = require('bcryptjs')
const User = require('../models/User.js')


module.exports = class AuthController {
  static login(req, res) {
    res.render('auth/login')
  }

  static async loginPost(req, res) {
    const {email, password} = req.body

    // find user
    const user = await User.findOne({where: {email: email}})

    if(!user) {
      req.flash('message', 'Usuário não encontrado')
      res.render('auth/login')

      return
    }
    
    // check if user password match
    const passwordMatch = bcrypt.compareSync(password, user.password)

    if(!passwordMatch) {
      req.flash('message', 'Senha incorreta tente novamente')
      res.render('auth/login')

      return
    }

    // initialize session
    req.session.userid = user.id

    req.flash('message', 'Login efetuado com sucesso')

    req.session.save(() => {
      res.redirect('/')
    })
  }

  static register(req, res) {
    res.render('auth/register')
  }

  static async registerPost(req, res) {

    const { name, email, password, confirmpassword } = req.body

    // password match validation
    if(password != confirmpassword) {
      req.flash('message', 'As senhas não conferem, tente novamente!')
      res.render('auth/register')

      return
    }

    // check if user exists
    const checkIfUserExist = await User.findOne({raw: true, where: {email: email}})

    if(checkIfUserExist) {
      req.flash("message", "O email já está em uso")
      res.render("auth/register")

      return
    }

    // create a passaword
    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(password, salt)

    const user = {
      name,
      email,
      password: hashedPassword
    } 

    try {

      const createUser = await User.create(user)

      // Inicializar session
      req.session.userid = createUser.id

      req.flash('message', 'Cadastro realizado com sucesso!')

      req.session.save(() => {
        res.redirect('/')
      })

    } catch (err){
      console.log(err)
    }

  }

  static logout(req, res) {
    req.session.destroy()
    res.redirect('/')
  }
}