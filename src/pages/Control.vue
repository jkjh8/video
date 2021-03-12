<template>
  <q-page>
    <div>
      <q-card flat>
        <q-card-section class="flex nowarp">
          <div class="text-h6">
            <q-icon
              class="text-teal"
              size="md"
              name="play_circle_filled"
            />
            Playlist
          </div>
        </q-card-section>
        <q-card-section class="row">
          <div class="col-8">
            <PlaylistItems
              :status="status"
              :playlist="playlist"
            />
          </div>
          <div class="col-4">
            <Playlist
              :status="status"
              :playlist="playlist"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import PlaylistItems from '../components/PlaylistItems'
import Playlist from '../components/Playlist'

export default {
  name: 'PageControl',
  components: { PlaylistItems, Playlist },
  props: ['status', 'playlist']
}
</script>
