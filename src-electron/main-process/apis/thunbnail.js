const os = require('os')

const arch = os.arch()
console.log('Archtect ', arch)

if (arch !== 'arm64') {
    const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
    const ffprobePath = require('@ffprobe-installer/ffprobe').path
    const ffmpeg = require('fluent-ffmpeg')
    ffmpeg.setFfmpegPath(ffmpegPath)
    ffmpeg.setFfprobePath(ffprobePath)
}

export default async function genThumb (file) {
    const filename = `${path.basename(file).split('.')[0]}.png`.replaceAll('%', '')
    const result = fs.existsSync(path.join(tempFolder, filename))
    if (result) {
      status.thumbnail = `http://localhost:8089/static/${encodeURIComponent(filename)}`
      sendToWindow('status', status)
    } else {
      ffmpeg(file)
        .on('end', () => {
          status.thumbnail = `http://localhost:8089/static/${encodeURIComponent(filename)}`
          sendToWindow('status', status)
        })
        .screenshot({
          timestamps: ['00:00:02'],
          filename: filename,
          folder: path.join(__dirname, 'public'),
          size: '640x360'
        })
    }
  }