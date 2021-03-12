import path from 'path'
import { remote, ipcRenderer } from 'electron'
console.log(remote)
const db = remote.getGlobal('db')
const defaultList = { name: 'default' }

export async function getPlaylistItems ({ state, commit }) {
  let items
  if (state.playlist.length > 0) {
    if (!state.playlistIndex) {
      commit('updatePlaylistIndex', 0)
    }
    const playlistName = state.playlist[state.playlistIndex]
    items = await db.items.find({ playlist: playlistName.name })
      .sort({ createdAt: 1 })
    commit('updatePlaylistItems', items)
  } else {
    const result = await db.list.insert(defaultList)
    if (result) {
      const list = await db.list.find({})
        .sort({ createdAt: 1 })
      commit('updatePlaylistItems', list)
    }
  }
  ipcRenderer.send('playlist', {
    list: items,
    index: state.playlistIndex
  })
}

export async function getPlaylist ({ commit }) {
  let list = await db.list.find({})
    .sort({ createdAt: 1 })
  if (list.length > 0) {
    commit('updatePlaylist', list)
  } else {
    await db.list.insert(defaultList)
    list = await db.list.find({})
      .sort({ createdAt: 1 })
    commit('updatePlaylist', list)
  }
}

export async function addPlaylistItems ({ getters, dispatch }, payload) {
  console.log(getters.playlistName)
  payload.forEach(file => {
    db.items.insert({
      file: file,
      basename: path.basename(file),
      dirname: path.dirname(file),
      playlist: getters.playlistName
    })
  })
  dispatch('getPlaylistItems')
}

export async function deletePlaylistItem ({ dispatch }, payload) {
  await db.items.remove({ _id: payload._id })
  dispatch('getPlaylistItems')
}

export async function deletePlaylistItems ({ getters, dispatch }) {
  await db.list.remove({ playlist: getters.playlistName }, { multi: true })
  dispatch('getPlaylistItems')
}

export async function deletePlaylist ({ state, commit, dispatch }, payload) {
  dispatch('deletePlaylistItems')
  await db.list.remove({ _id: payload._id })
  if (state.playlistIndex >= state.playlist.length) {
    commit('updatePlaylistIndex', state.playlistIndex - 1)
  }
  dispatch('getPlaylist')
  dispatch('getPlaylistItems')
}

export async function deleteAll ({ commit, dispatch }) {
  await db.items.remove({}, { multi: true })
  await db.list.remove({}, { multi: true })
  dispatch('getPlaylist')
  dispatch('getPlaylistItems')
  commit('playlist/updatePlaylistItemIndex', 0)
}

export function openFile ({ state, commit }, idx) {
  commit('updatePlaylistItemIndex', idx)
  console.log(state.playlistItems[idx].file)
  ipcRenderer.send('control', {
    control: 'openFile',
    value: state.playlistItems[idx].file
  })
}

export async function addPlaylist ({ dispatch }, payload) {
  await db.list.insert({ name: payload })
  dispatch('getPlaylist')
}

export async function playNext ({ state, commit, dispatch }) {
  commit('updatePlaylistItemIndex', state.playlistItemIndex + 1)
  if (state.playlistItemIndex >= state.playlistItems.length) {
    commit('updatePlaylistItemIndex', 0)
  }
  dispatch('openFile', state.playlistItemIndex)
}

export async function playPrevious ({ state, commit, dispatch }) {
  commit('updatePlaylistItemIndex', state.playlistItemIndex - 1)
  if (state.playlistItemIndex < 0) {
    commit('updatePlaylistItemIndex', state.playlistItems.length - 1)
  }
  dispatch('openFile', state.playlistItemIndex)
}
