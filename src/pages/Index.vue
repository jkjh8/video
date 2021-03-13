<template>
  <q-page class="flex flex-center">
    <div>
      <q-media-player
        type="video"
        ref="mediaplayer"
        :muted="status.mute"
        :background-color="setup.bgColor"
        :loop="status.loop"
        :volume="status.volume"
        :autoplay="videoOptions.autoplay"
        :sources="videoOptions.sources"
        :show-big-play-button="false"
        :no-controls="!videoOptions.controls"
        :show-spinner="false"
        preload="auto"
        track-language="Korean"
        @timeupdate="updateCurrentTime"
        @duration="updateDuraton"
        @play="playing"
        @playing="playing"
        @paused ="paused"
        @ended="ended"
        @ready="ready"
      >
        <template v-if="!status.file && setup.logo" v-slot:overlay>
          <div class="full-width full-height row wrap justify-center content-center">
            <q-img
              style="width: 100px;"
              src="http://localhost:8089/static/default/logo_2_320.png"
            />
          </div>
        </template>
      </q-media-player>
    </div>
  </q-page>
</template>

<script>
import { ipcRenderer, remote } from 'electron'

export default {
  name: 'PageIndex',
  computed: {
    player () {
      return this.$refs.mediaplayer
    }
  },
  async created () {
    this.status = await ipcRenderer.sendSync('getStatus')
    this.playlist = await ipcRenderer.sendSync('getPlaylist')
  },
  async mounted () {
    await this.player.setFullscreen()
    this.window = remote.getCurrentWindow()
    this.loadFileCallback()
    this.controlCallback()
    this.updateStatus()
  },
  data () {
    return {
      window: null,
      volume: 100,
      status: '',
      playlist: null,
      playlistItems: null,
      videoOptions: {
        autoplay: false,
        controls: false,
        sources: [],
        preload: 'auto'
      },
      setup: {
        bgColor: 'white',
        logo: true
      }
    }
  },
  methods: {
    loadFileCallback () {
      ipcRenderer.on('file', (event, file) => {
        this.openFile(file)
        this.status.isPlaying = false
      })
    },
    updateStatus () {
      ipcRenderer.on('status', (event, status) => {
        this.status = status
      })
    },
    controlCallback () {
      ipcRenderer.on('control', (event, control) => {
        switch (control.control) {
          case 'play':
            if (this.status.isPlaying) {
              this.player.pause()
            } else {
              this.player.play()
            }
            break
          case 'changeTime':
            this.player.setCurrentTime(control.value)
            break
        }
      })
    },
    openFile (file) {
      let fileObj
      if (!file) {
        this.videoOptions.sources = [{}]
      } else {
        fileObj = {
          src: `http://localhost:8089/stream?file=${encodeURIComponent(file.file)}&type=${file.type}`,
          type: file.type
        }
        this.videoOptions.sources = [fileObj]
      }
    },
    updateDuraton (time) {
      ipcRenderer.send('control', { control: 'duration', value: time })
    },
    updateCurrentTime (time, remain) {
      ipcRenderer.send('control', { control: 'currentTime', value: time })
    },
    playing () {
      ipcRenderer.send('control', { control: 'isPlaying', value: true })
    },
    paused () {
      ipcRenderer.send('control', { control: 'isPlaying', value: false })
    },
    ended () {
      console.log('ended')
      this.player.setCurrentTime(0)
      if (this.status.mode === 'playlist') {
        ipcRenderer.send('playlist', { control: 'next' })
      } else {
        ipcRenderer.send('control', { control: 'ended' })
      }
    },
    ready () {
      if (this.status.mode === 'playlist' && this.status.playBtn) {
        this.player.play()
      }
    }
  }
}
</script>

<style>
.q-media {
  pointer-events: none;
}
</style>
