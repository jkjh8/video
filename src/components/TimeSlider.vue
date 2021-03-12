<template>
  <div>
    <q-slider
      :value="status.currentTime"
      :min="0"
      :max="status.duration"
      color="teal"
      label
      :label-value="`${msToHms(status.currentTime * 1000)}/${msToHms(status.duration * 1000)}`"
      @input="changeTime"
    />
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import { msToHms } from '../mixins/msToHMS'

export default {
  name: 'TimeSlider',
  mixins: [msToHms],
  props: ['status'],
  data () {
    return {
      time: 0
    }
  },
  mounted () {
    ipcRenderer.on('time', (event, time) => {
      this.time = time
    })
  },
  methods: {
    changeTime (value) {
      ipcRenderer.send('control', { control: 'changeTime', value: value })
    }
  }
}
</script>
