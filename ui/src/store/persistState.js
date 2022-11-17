export const loadState = () => {
  try {
    const serializedState = localStorage.getItem('state')
    if (serializedState === null) {
      return undefined
    }
    return JSON.parse(serializedState)
  } catch (err) {
    return undefined
  }
}

export const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state)
    localStorage.setItem('state', serializedState)
  } catch (err) {
    // Ignore write errors
  }
}

export const getStoredQueue = async () => {
  try {
    let url = getUrl('getPlayQueue?')
    const res = await fetch(url)
    const data = await res.json()
    console.log('getStoredQueue request log:')
    console.log(data)
    return data
  } catch (err) {
    console.log(err)
    return undefined
  }
}

export const syncPlayQueue = async (queue, current) => {
  let url = getUrl('savePlayQueue.view?')
  for (let i = 0; i < queue.length; i++) {
    let song = queue[i]['trackId']
    url = `${url}&id=${song}`
  }
  if (current !== undefined || current !== null) {
    url = `${url}&current=${current.trackId}`
  }
  fetch(url, { method: 'GET' }).then((res) => {
    return res
  }).catch(err)
}

const getUrl = (request) => {
  let url = `${window.location.origin}/rest/${request}&u=${localStorage.username}&t=${localStorage['subsonic-token']}&s=${localStorage['subsonic-salt']}&c=dev&v=1.16.1&f=json&`
  return url
}