function client(endpoint, customConfig = {}) {
  const fullURL = `${process.env.REACT_APP_API_URL}/${endpoint}`

  const config = {
    method: 'GET',
    ...customConfig,
  }

  return window.fetch(fullURL, config).then(async res => {
    const data = await res.json()
    if (res.ok) {
      return data
    } else {
      return Promise.reject(data)
    }
  })
}

export {client}
