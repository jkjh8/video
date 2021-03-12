import { ms, h, m, s } from 'time-convert'

export const msToHms = {
  methods: {
    msToHms (time) {
      return ms.to(h, m, s)(time).map(n => n < 10 ? '0' + n : n.toString()).join(':')
    }
  }
}
