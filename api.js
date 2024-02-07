const auth = require('./auth.json');

function apiWrapper(controller, apiEndpoint, cookie) {
  var controllerEndpoint = `${apiEndpoint}/${controller}`

  return {
    get: () => fetch(controllerEndpoint),
    post: (body, action) => fetch(action ? `${controllerEndpoint}/${action}` : controllerEndpoint, {
      method: 'POST',
      headers: { "Content-Type": "application/json", "Cookie": cookie },
      body: JSON.stringify(body)
    }),
    patch: (id, body, action) => fetch(action ? `${controllerEndpoint}/${action}` : controllerEndpoint, {
      method: 'PATCH',
      headers: { "Content-Type": "application/json", "Cookie": cookie },
      body: JSON.stringify(body)
    }),
    delete: (id) => fetch(`${controllerEndpoint}/${id}`, {
      method: 'DELETE',
      headers: { "Content-Type": "application/json", "Cookie": cookie }
    })
  }
}

function setup(apiEndpoint) {
  // List of endpoints as methods attached to the "client.api" object
  return {
    status: apiWrapper('api/Status', apiEndpoint),
    guild: apiWrapper('api/Listing', apiEndpoint, `auth._token.discord=${auth.discord};auth._token.type=bot`),
    search: apiWrapper('api/Search', apiEndpoint)
  };
}

module.exports = {
  setup: setup
}