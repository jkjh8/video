const os = require('os')
import { app } from 'electron'
import path from 'path'
import fs from 'fs'

import { sendToWindow } from './function'

const arch = os.arch()
console.log('Archtect ', arch)

const tempFolder = path.join(app.getPath('userData'), 'tmp')
let ffmpegPath
let ffprobePath
let ffmpeg

if (arch !== 'arm64') {
  ffmpegPath = require('@ffmpeg-installer/ffmpeg').path.replace('app.asar', 'app.asar.unpacked')
  ffprobePath = require('@ffprobe-installer/ffprobe').path.replace('app.asar', 'app.asar.unpacked')
  ffmpeg = require('fluent-ffmpeg')
  ffmpeg.setFfmpegPath(ffmpegPath)
  ffmpeg.setFfprobePath(ffprobePath)
}

export default async function genThumb (status) {
  if (arch === 'arm64') {
    status.thumbnail = '~assets/logo_sq.png'
    return status
  }
  const filename = `${path.basename(status.file.file).split('.')[0]}.png`.replaceAll('%', '')
  console.log(filename)
  const result = fs.existsSync(path.join(tempFolder, filename))
  if (result) {
    status.thumbnail = `http://localhost:8089/static/${encodeURIComponent(filename)}`
    sendToWindow('status', status)
  } else {
    ffmpeg(status.file.file)
      .on('end', () => {
        status.thumbnail = `http://localhost:8089/static/${encodeURIComponent(filename)}`
        sendToWindow('status', status)
      })
      .screenshot({
        timestamps: ['00:00:02'],
        filename: filename,
        folder: tempFolder,
        size: '640x360'
      })
  }
  return status.thumbnail
}
