function apiWrapper(controller, apiEndpoint) {
  var controllerEndpoint = `${apiEndpoint}/${controller}`

  return {
    get: () => fetch(controllerEndpoint),
    post: (body, action) => fetch(action ? `${controllerEndpoint}/${action}` : controllerEndpoint, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }),
    patch: (id, body, action) => fetch(action ? `${controllerEndpoint}/${action}` : controllerEndpoint, {
      method: 'PATCH',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }),
    delete: (id) => fetch(`${controllerEndpoint}/${id}`, {
      method: 'DELETE',
      headers: { "Content-Type": "application/json" }
    })
  }
}

function setup(apiEndpoint) {
  // List of endpoints as methods attached to the "client.api" object
  return {
    status: apiWrapper('api/Status', apiEndpoint),
    guild: apiWrapper('api/Listing', apiEndpoint),
    search: apiWrapper('api/Search', apiEndpoint)
  };
}

module.exports = {
  setup: setup
}