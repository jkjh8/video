<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <router-view
        :status = "status"
        :playlist = "playlist"
      />
    </q-page-container>

    <q-footer bordered class="bg-white text-black">
      <Control
        class="q-mb-md"
        :status = "status"
        :playlist = "playlist"
      />
    </q-footer>
  </q-layout>
</template>

<script>
import { ipcRenderer } from 'electron'
import Control from '../components/ControlFn'

export default {
  name: 'MainLayout',
  components: { Control },
  data () {
    return {
      status: {},
      playlist: []
    }
  },
  async mounted () {
    this.status = await ipcRenderer.sendSync('getStatus')
    this.playlist = await ipcRenderer.sendSync('getPlaylist')
    this.updateStatus()
    this.updatePlaylist()
  },
  methods: {
    updateStatus () {
      ipcRenderer.on('status', (event, status) => {
        this.status = status
      })
    },
    updatePlaylist () {
      ipcRenderer.on('playlist', (event, playlist) => {
        this.playlist = playlist
      })
    }
  }
}
</script>
