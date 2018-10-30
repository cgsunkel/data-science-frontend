const ssoController = require('./controllers/sso')

const {
  buildFilters,
  renderIndex,
  renderError,
} = require('./controllers/acs')

module.exports = function (express, app) {
  app.get('/login/', ssoController.authRedirect)
  app.get('/login/callback/', ssoController.callback) 
  renderError
)
  app.get('/',
    buildFilters,
    renderIndex
  )
}
