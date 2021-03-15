<template>
  <q-card
    class="q-ml-sm"
    bordered
    flat
  >
    <q-card-section
      class="row no-warp items-center"
    >
      <div class="text-body1">
        Playlist
      </div>
      <q-space />
      <div>
        <q-btn
          flat
          round
          icon="add_circle"
           @click="$refs.textedit.dialog = true"
        ></q-btn>
        <q-btn
          flat
          round
          icon="remove_circle"
          @click="$refs.dialog.dialog = true"
        ></q-btn>
      </div>
    </q-card-section>
    <q-card-section class="q-pa-none">
      <q-list>
        <q-item
          v-for="(item, idx) in status.list"
          :key="idx"
          :active="status.listIdx === idx"
          @click="clickList(idx)"
          clickable
          v-ripple
        >
          <q-item-section>
            {{ item.name }}
          </q-item-section>
          <q-item-section top side>
            <q-btn
              flat
              round
              color="red"
              icon="delete"
              @click.capture.stop="delPlaylist(item)"
            >
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
    <ConfirmDialog
      ref="dialog"
      :contents="contents"
      @confirm="delAll"
    />
    <Textfield
      ref="textedit"
      :contents="contents"
      @confirm="addPlaylist"
    />
  </q-card>
</template>

<script>
import { ipcRenderer } from 'electron'
import ConfirmDialog from './Confirm'
import Textfield from './Textfield'

export default {
  name: 'Playlist',
  components: { ConfirmDialog, Textfield },
  props: ['status'],
  data () {
    return {
      selected: 0,
      contents: {
        name: 'Delete All Playlist and Items',
        text: 'Do you want to delete all playlist and items?'
      }
    }
  },
  methods: {
    async clickList (idx) {
      ipcRenderer.send('control', { control: 'listIdx', value: idx })
    },
    addPlaylist (list) {
      ipcRenderer.send('control', { control: 'addList', value: { name: list } })
    },
    delPlaylist (list) {
      ipcRenderer.send('control', { control: 'delList', value: list })
    },
    delAll () {
      ipcRenderer.send('control', { control: 'delAll' })
    }
  }
}
</script>
