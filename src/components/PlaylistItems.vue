<template>
  <q-card
    class="q-mr-sm"
    bordered
    flat
  >
    <q-card-section
      class="row no-warp items-center"
    >
      <div
        class="text-body1"
      >
        Playlist items
      </div>
      <q-space />
      <div>
        <q-btn
          flat
          round
          icon="add_circle"
          @click="callFileDialog"
        >
        </q-btn>
        <q-btn
          flat
          round
          icon="remove_circle"
          @click="$refs.dialog.dialog = true"
        >
        </q-btn>
      </div>
    </q-card-section>

    <q-card-section
      class="q-pa-none">
      <q-list>
        <q-item
          v-for="(item, idx) in playlist.items"
          :key="idx"
          :active="playlist.itemIdx === idx"
          @click.native.prevent="clickItem(idx)"
          clickable
        >
          <q-item-section top>
            <div>{{ item.basename }}</div>
            <div
              class="text-caption text-blue-grey"
            >
              {{ item.dirname }}
            </div>
          </q-item-section>

          <q-item-section top side>
            <q-btn
              flat
              round
              color="red"
              icon="delete"
              @click.capture.stop="deleteItem(item)"
            >
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
    <ConfirmDialog
      ref="dialog"
      :contents="contents"
      @confirm="deleteAllItems"
    />
  </q-card>
</template>

<script>
import { ipcRenderer } from 'electron'
import ConfirmDialog from './Confirm'

export default {
  name: 'PlaylistItems',
  components: { ConfirmDialog },
  props: ['playlist'],
  data () {
    return {
      contents: {
        name: 'Delete All Items',
        text: 'Do you want to delete all items?'
      }
    }
  },
  methods: {
    callFileDialog () {
      ipcRenderer.send('playlist', { control: 'getItems' })
    },
    clickItem (idx) {
      ipcRenderer.send('playlist', { control: 'itemIdx', value: idx })
    },
    deleteItem (item) {
      ipcRenderer.send('playlist', { control: 'delItem', value: item })
    },
    deleteAllItems () {
      ipcRenderer.send('playlist', { control: 'delItems' })
    }
  }
}
</script>
