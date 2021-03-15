<template>
  <div class="row no-warp">
    <q-btn
      flat
      round
      :color="playMode ? 'orange' : 'teal'"
      :icon="playMode ? 'playlist_play' : 'play_circle_fill'"
      @click="mode"
    >
      <q-tooltip>Play Mode</q-tooltip>
    </q-btn>

    <q-separator class="q-mx-sm" vertical inset />

    <q-btn
      v-show="playMode"
      flat
      round
      icon="skip_previous"
      @click="previous"
    >
      <q-tooltip>Privious</q-tooltip>
    </q-btn>
    <q-btn
      flat
      round
      :color="status.isPlaying ? 'green' : ''"
      :icon="status.isPlaying ? 'pause' : 'play_arrow'"
      @click="play"
    >
      <q-tooltip>Play</q-tooltip>
    </q-btn>
    <q-btn
       v-show="playMode"
      flat
      round
      icon="skip_next"
      @click="next"
    >
      <q-tooltip>Next</q-tooltip>
    </q-btn>
    <q-btn
      :color="status.loop ? 'yellow' : ''"
      flat
      round
      icon="repeat_one"
      @click="loop"
    >
      <q-tooltip>Repeat One</q-tooltip>
    </q-btn>
    <q-btn
      v-show="playMode"
      flat
      round
      :color="status.loopAll ? 'orange' : ''"
      icon="repeat"
      @click="loopAll"
    >
      <q-tooltip>Repeat All</q-tooltip>
    </q-btn>
    <q-btn
      flat
      round
      icon="flip_to_front"
      @click="flipFront"
    >
      <q-tooltip>Window Get Front</q-tooltip>
    </q-btn>
    <q-btn
      flat
      round
      icon="file_upload"
      @click="open"
    >
      <q-tooltip>Open File</q-tooltip>
    </q-btn>
    <q-btn
      flat
      round
      icon="cancel_presentation"
      @click="clearSource"
    >
      <q-tooltip>Clear Source</q-tooltip>
    </q-btn>
    <q-btn
      flat
      round
      :icon="status.mute ? 'volume_off' : 'volume_up'"
    >
      <q-menu
        content-style="background: rgba( 255, 255, 255, 0.1); border-radius: 30px;"
        transition-show="scale"
        transition-hide="scale"
      >
        <div
          class="row no-wrap items-center q-px-md q-py-sm"
          style="border-radius: 30px; min-width: 250px; min-height: 20px"
        >
          <q-btn
            class="q-mr-sm"
            flat
            round
            :icon="status.mute ? 'volume_off' : 'volume_up'"
            :color="status.mute ? 'red' : ''"
            @click="mute"
          />
          <q-slider
            v-model="volume"
            :min="0"
            :max="100"
            @input="changeVolume"
          />
          <div class="q-ml-lg q-mr-sm">{{ volume }}%</div>
        </div>
      </q-menu>
    </q-btn>
    <q-btn
      flat
      round
      :color="status.fullscreen ? 'red' : ''"
      :icon="status.fullscreen ? 'fullscreen_exit' : 'fullscreen'"
      @click="fullscreen"
    >
      <q-tooltip>Fullscreen</q-tooltip>
    </q-btn>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
  props: ['status'],
  computed: {
    playMode () {
      if (this.status.mode === 'playlist') {
        return true
      } else {
        return false
      }
    }
  },
  // watch: {
  //   status: function (newVal, oldVal) {
  //     if (newVal.volume !== oldVal.volume) {
  //       this.volume = newVal.volume
  //     }
  //   }
  // },
  data () {
    return {
      volume: 100
    }
  },
  methods: {
    mode () { ipcRenderer.send('control', { control: 'mode' }) },
    play () { ipcRenderer.send('control', { control: 'playBtn' }) },
    loop () { ipcRenderer.send('control', { control: 'loop' }) },
    flipFront () { ipcRenderer.send('control', { control: 'flip' }) },
    open () { ipcRenderer.send('control', { control: 'open' }) },
    fullscreen () { ipcRenderer.send('control', { control: 'fullscreen' }) },
    loopAll () { ipcRenderer.send('control', { control: 'loopAll' }) },
    previous () { ipcRenderer.send('control', { control: 'previous' }) },
    next () { ipcRenderer.send('control', { control: 'next' }) },
    mute () { ipcRenderer.send('control', { control: 'mute' }) },
    clearSource () { ipcRenderer.send('control', { control: 'clear' }) },
    changeVolume (vol) { ipcRenderer.send('control', { control: 'volume', value: vol }) }
  }
}
</script>

<style>
.volPop {
  background: blue;
}
</style>
