const path = require('path')
const express = require('express')
const morgan = require('morgan')
const compression = require('compression')
const db = require('./db')
const PORT = process.env.PORT || 8080
const enforce = require('express-sslify')
const http = require('http')
const app = express()

module.exports = app

// This is a global Mocha hook, used for re1urce cleanup.
// Otherwise, Mocha v4+ never quits after tests.
// if (process.env.NODE_ENV === 'test') {
//   after('close the session store', () => sessionStore.stopExpiringSessions())
// }

/**
 * In your development environment, you can keep all of your
 * app's secret API keys in a file called `secrets.js`, in your project
 * root. This file is included in the .gitignore - it will NOT be tracked
 * or show up on Github. On your production server, you can add these
 * keys as environment variables, so that they can still be read by the
 * Node process on process.env
 */
if (process.env.NODE_ENV !== 'production') require('../secrets')

const createApp = () => {
  // enable SSL redirect: comment out this line to run local host and make sure it is http:/ not https:/
  if (app.get('env') === 'production') {
    app.use(enforce.HTTPS({trustProtoHeader: true}))
  }
  //app.use(enforce.HTTPS({trustProtoHeader: true}))

  // logging middleware
  app.use(morgan('dev'))

  // body parsing middleware
  app.use(express.json())
  app.use(express.urlencoded({extended: true}))

  // compression middleware
  app.use(compression())

  // api routes
  app.use('/api', require('./api'))

  // static file-serving middleware
  app.use(express.static(path.join(__dirname, '..', 'public')))

  // any remaining requests with an extension (.js, .css, etc.) send 404
  app.use((req, res, next) => {
    if (path.extname(req.path).length) {
      const err = new Error('Not found')
      err.status = 404
      next(err)
    } else {
      next()
    }
  })

  // sends index.html
  app.use('*', (req, res, next) => {
    res.sendFile(path.join(__dirname, '..', 'public/index.html'))
    // if (
    //   'https' !== req.headers['x-forwarded-proto'] &&
    //   'production' === process.env.NODE_ENV
    // ) {
    //   res.redirect('https://' + req.hostname + req.url)
    // } else {
    //   // Continue to other routes if we're not redirecting
    //   next()
    // }
  })

  // error handling endware
  app.use((err, req, res, next) => {
    console.error(err)
    console.error(err.stack)
    res.status(err.status || 500).send(err.message || 'Internal server error.')
  })
}

const startListening = () => {
  // start listening (and create a 'server' object representing our server)
  const server = http
    .createServer(app)
    .listen(PORT, () => console.log(`Mixing it up on port ${PORT}`))

  // clean exit the server and node process when one of these events occur
  const arr = [
    `exit`,
    `SIGINT`,
    `SIGUSR1`,
    `SIGUSR2`,
    `uncaughtException`,
    `SIGTERM`
  ]
  arr.forEach(event => {
    process.on(event, () => {
      server.close(() => process.exit())
    })
  })
}

const syncDb = () => db.sync()

async function bootApp() {
  // await sessionStore.sync()
  await syncDb()
  await createApp()
  await startListening()
}
// This evaluates as true when this file is run directly from the command line,
// i.e. when we say 'node server/index.js' (or 'nodemon server/index.js', or 'nodemon server', etc)
// It will evaluate false when this module is required by another module - for example,
// if we wanted to require our app in a test spec
if (require.main === module) {
  bootApp()
} else {
  createApp()
}
