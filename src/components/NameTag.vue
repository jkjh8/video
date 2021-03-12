<template>
  <div class="q-px-md">
    <div v-if="status && status.file">
      <div class="text-body1 text-bold">{{ parceFile.name }}</div>
      <div class="text-caption">{{ parceFile.dir}}</div>
      <div class="text-overline text-uppercase">{{ status.mode }}</div>
    </div>
    <div v-else>
      None
    </div>
  </div>
</template>

<script>
import path from 'path'

export default {
  props: ['status'],
  computed: {
    parceFile: function () {
      return path.parse(this.status.file.file)
    }
  }
}
</script>
