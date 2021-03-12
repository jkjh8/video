import { app } from 'electron'
import DbElectron from './db_electron'
import path from 'path'

const db = {
  list: new DbElectron('list.db'),
  items: new DbElectron('items.db'),
  setup: new DbElectron('setup.db')
}

async function getList () {
  const result = await db.list.get()
  if (result.length === 0) {
    try {
      await db.list.add({ name: 'default' })
      return await db.list.get()
    } catch (err) {
      console.log('getList', err)
    }
  }
  return result
}

async function getListItems (list) {
  return await db.items.get({ playlist: list })
}

async function addList (list) {
  try {
    const result = await db.list.get(list)
    console.log(result)
    if (result.length <= 0) {
      await db.list.add(list)
    }
  } catch (err) {
    console.log('addList', err)
  }
}

async function addListItem (list, item) {
  try {
    await db.items.add({
      file: item,
      basename: path.basename,
      dirname: path.dirname,
      playlist: list
    })
  } catch (err) {
    console.log('addListItem', err)
  }
}

async function addListItems (list, items) {
  try {
    items.forEach(async (item) => {
      await db.items.add({
        file: item,
        basename: path.basename(item),
        dirname: path.dirname(item),
        playlist: list
      })
    })
  } catch (err) {
    console.log('addListItems', err)
  }
}

async function delList (list) {
  try {
    await db.items.delItem({ playlist: list.name })
    await db.list.del({ _id: list._id })
  } catch (err) {
    console.log('delList', err)
  }
}

async function delListItem (item) {
  try {
    await db.items.del(item)
  } catch (err) {
    console.log('delListItem', err)
  }
}

async function delListItems (list) {
  try {
    await db.items.delItem({ playlist: list })
  } catch (err) {
    console.log('delListItems', err)
  }
}

async function delAll () {
  try {
    await db.list.delAll()
    await db.items.delAll()
  } catch (err) {
    console.log('delAll', err)
  }
}

const dbFn = {
  getList: getList,
  getListItems: getListItems,
  addList: addList,
  addListItem: addListItem,
  addListItems: addListItems,
  delList: delList,
  delListItem: delListItem,
  delListItems: delListItems,
  delAll: delAll
}

export default dbFn
