<template>
  <q-card flat>
    <q-card-section class="q-pa-none">
      <TimeSlider class="q-mx-md" :status="status" />
    </q-card-section>
    <q-card-section
      class="row fit no-warp items-center"
      :class="$q.platform.is.mobile ? 'justify-start' : 'justify-center'"
    >
      <NameTag
        class="col-sm-grow col-xs-12"
        :status="status"
      />
      <Buttons
        class="col-md-shrink"
        :status="status" />
    </q-card-section>
  </q-card>
</template>

<script>
import Buttons from './PlayButtons'
import TimeSlider from './TimeSlider'
import NameTag from './NameTag'

export default {
  name: 'ComponentControl',
  components: { TimeSlider, NameTag, Buttons },
  props: ['status'],
  data () {
    return {
      duration: 0
    }
  }
}
</script>
