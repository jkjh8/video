<template>
  <q-dialog
    v-model="dialog"
  >
    <q-card
      style="min-width: 350px"
    >
      <q-card-section>
        <div
          class="text-h6"
        >
          {{ contents.name }}
        </div>
      </q-card-section>

      <q-card-section>
        <span class="q-ml-sm">
          {{ contents.text }}
        </span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn flat label="OK" color="primary" @click="$emit('confirm')" v-close-popup />
      </q-card-actions>
    </q-card>

  </q-dialog>
</template>

<script>
export default {
  props: ['contents'],
  data () {
    return {
      dialog: false
    }
  }
}
</script>
