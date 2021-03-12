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
          Add Playlist
        </div>
      </q-card-section>

      <q-card-section>
        <q-input
            v-model="text"
            label="add your playlist name"
            autofocus
            @keyup.enter="confirm"
          />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn flat label="OK" color="primary" @click="confirm" v-close-popup />
      </q-card-actions>
    </q-card>

  </q-dialog>
</template>

<script>
export default {
  data () {
    return {
      dialog: false,
      text: ''
    }
  },
  methods: {
    confirm () {
      this.$emit('confirm', this.text)
      this.dialog = false
    }
  }
}
</script>
