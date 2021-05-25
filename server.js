'use strict'
const cors = require('cors')
const morgan = require('morgan')
const compression = require('compression')
const serverless = require('serverless-http');
const bodyParser = require('body-parser')
const express = require('express')
const GithubWebHook = require('express-github-webhook')
const connect = require('./controller/connect')
const encrypt = require('./controller/encrypt')
const auth = require('./controller/auth')
const handlePR = require('./controller/handlePR')
const home = require('./controller/home')
const process = require('./controller/process')
const github = require('./controller/github')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))
const corsOptions = {
  origin: '*',
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions))
const router = express.Router()
router.use(compression())

router.get(
  '/v:version/connect/:username/:repository',
  connect
)

router.post(
  '/v:version/entry/:username/:repository/:branch',
  process
)

router.post(
  '/v:version/custom/:username/:repository/:branch/:property/:code',
  github(process)
)
router.post(
  '/v:version/entry/:username/:repository/:branch/:property',
  process
)
router.post(
  '/v:version/entry/:service/:username/:repository/:branch/:property',
  process
)
router.get(
  '/v:version/encrypt/:text',
  encrypt
)
router.get(
  '/v:version/auth/:service/:username/:repository/:branch/:property',
  auth
)
router.get(
  '/',
  home
)

const webhookHandler = GithubWebHook({
  path: '/v1/webhook'
})
webhookHandler.on('pull_request', handlePR)
app.use(webhookHandler)

const customLogger = (tokens, req, res) => {
  const log = [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ].join(' ')
  console.log(log)
  return log
}

app.use(morgan(customLogger))
app.use('/.netlify/functions/server', router);
router.use(cors())
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

module.exports = app;
module.exports.handler = serverless(app);
