const router = require('express').Router()
module.exports = router

router.use('/processing', require('./processing'))
// router.use('/python', require('./python'))

router.use((req, res, next) => {
  const error = new Error('Not Found')
  error.status = 404
  next(error)
})
