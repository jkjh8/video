export function updatePlaylist (state, payload) {
  state.playlist = payload
}

export function updatePlaylistItems (state, payload) {
  state.playlistItems = payload
}

export function updatePlaylistIndex (state, payload) {
  state.playlistIndex = payload
}

export function updatePlaylistItemIndex (state, payload) {
  state.playlistItemIndex = payload
}
