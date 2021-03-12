import { app } from 'electron'
import Datastore from 'nedb-promises'

export default class DbElectron {
  constructor (filename) {
    this.db = new Datastore({
      filename: `${app.getPath('userData')}/db/${filename}`,
      timestampData: true,
      autoload: true
    })
  }

  async get (item) {
    if (!item) {
      item = {}
    }
    return await this.db.find(item).sort({ createdAt: 1 })
  }

  async add (item) {
    return await this.db.insert(item)
  }

  async del (item) {
    return await this.db.remove({ _id: item._id })
  }

  async delItem (item) {
    return await this.db.remove(item, { multi: true })
  }

  async delAll () {
    return await this.db.remove({}, { multi: true })
  }
}
