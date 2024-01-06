const Tought = require('../models/Tought.js')
const User = require('../models/User.js')
const { Op } = require('sequelize')

module.exports = class ToughtsController {

  static createTought(req, res) {
    res.render('toughts/create')
  }

  static async createToughtSave(req, res) {

    const tought = {
      title: req.body.title,
      UserId: req.session.userid
    }

    try {
      await Tought.create(tought)

      req.flash('message', 'Pensamento criado sucesso!')

      req.session.save(() => {
        res.redirect('/toughts/dashboard')
      })
    } catch (err) {
      console.log(err)
    }
  }
  
  static async dashboard(req, res) {

    const id = req.session.userid
    const tought = await Tought.findAll({raw: true, where: {UserId: id}})

    let emptyToughts = false

    if(tought.length === 0) {
      emptyToughts = true
    }

    res.render('toughts/dashboard', { tought, emptyToughts })
  }

  static async showToughts(req, res) {

    let search = ''

    if(req.query.search) {
      search = req.query.search
    }

    let order = 'DESC'

    req.query.order === 'old' ? order = 'ASC' : order = 'DESC'
  
    const toughtsData = Tought.findAll({
      include: User,
      where: {
        title: {[Op.like]: `%${search}%`}
      },
      order: [['createdAt', order]]
    })

    const toughts = (await toughtsData).map((result) => result.get({ plain: true}))

    let toughtsQty = toughts.length

    if (toughtsQty === 0) {
      toughtsQty = false
    }

    res.render('toughts/home', { toughts, search, toughtsQty })
  }

  static async removeTought(req, res) {

    const id = req.body.id
    const UserId = req.session.userid

    try {
      await Tought.destroy({where: {id: id, UserId: UserId}})

      req.flash('message', 'Pensamento removido com sucesso!')

      req.session.save(() => {
        res.redirect('/toughts/dashboard')
      })
    } catch (err) {
      console.log(err)
    }
  }

  static async editTought(req, res) {

    const id = req.params.id

    try {
      const tought = await Tought.findOne({raw: true, where: {id}})
      res.render('toughts/edit', {tought})
    } catch(err) {
      console.log(err)
    }
  }

  static async editToughtSave(req, res) {
    const id = req.body.id

    const tought = {
      title: req.body.title
    }

    try {
      await Tought.update(tought, {where: {id: id}})

      req.flash('message', 'Pensamento atualizado com sucesso!')

      req.session.save(() => {
        res.redirect('/toughts/dashboard')
      })
    } catch(err) {
      console.log(err)
    }

  }
}