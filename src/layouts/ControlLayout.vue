<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <router-view
        :status = "status"
        :playlist = "playlist"
      />
    </q-page-container>

    <q-dialog v-model="alert">
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Alert</div>
          </q-card-section>
          <q-card-section>
            {{ alertMsg }}
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="OK" color="teal" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>

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
      playlist: [],
      alert: false,
      alertMsg: ''
    }
  },
  async mounted () {
    this.status = await ipcRenderer.sendSync('getStatus')
    this.playlist = await ipcRenderer.sendSync('getPlaylist')
    this.updateStatus()
    this.updatePlaylist()
    this.reciveAlert()
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
    },
    reciveAlert () {
      ipcRenderer.on('alert', (event, msg) => {
        this.alertMsg = msg
        this.alert = true
      })
    }
  }
}
</script>
