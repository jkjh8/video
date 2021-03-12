<template>
  <q-card flat>
    <q-card-section class="q-pa-none">
      <TimeSlider class="q-mx-md" :status="status" />
    </q-card-section>
    <q-card-section class="row no-warp items-center q-mx-lg q-pt-sm">
      <NameTag :status="status" />
      <q-space />
      <Buttons :status="status" />
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
