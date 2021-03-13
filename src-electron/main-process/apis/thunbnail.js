const os = require('os')
import path from 'path'
import fs from 'fs'

import { sendToWindow } from './function'

const arch = os.arch()
console.log('Archtect ', arch)

const tempFolder = path.join(__dirname, 'tmp')
let ffmpegPath
let ffprobePath
let ffmpeg

if (arch !== 'arm64') {
  ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
  ffprobePath = require('@ffprobe-installer/ffprobe').path
  ffmpeg = require('fluent-ffmpeg')
  ffmpeg.setFfmpegPath(ffmpegPath)
  ffmpeg.setFfprobePath(ffprobePath)
}

export default async function genThumb (status) {
  const filename = `${path.basename(status.file.file).split('.')[0]}.png`.replaceAll('%', '')
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
  return status
}
