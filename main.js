const {app, BrowserWindow} = require('electron')
const OS = require('opensubtitles-api')
const isVideo = require('is-video');
const helper = require('./helper.js')
// userAgent change constantly. Check out: http://trac.opensubtitles.org/projects/opensubtitles/wiki/DevReadFirst
const userAgent = 'OSTestUserAgentTemp'
const OpenSubtitles = new OS({
  useragent: userAgent,
  ssl: true
})

let mainWindow

global.arguments = {
  args: process.argv
}

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    title: false,
    width: 360,
    height: 232,
    // resizable: false,
    maximizable: false,
    alwaysOnTop: true,
    vibrancy: 'dark',
    icon: 'assets/icons/defaultIcon.ico',

    webPreferences: {
      defaultFontSize: 25
    }
  })
  mainWindow.loadURL(`file://${__dirname}/index.html`)
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // mainWindow.webContents.openDevTools()

  // arguments
  process.argv.forEach((arg) => {
    console.dir('arg:' + arg)
  })

  // Settings
  exports.openSettings = () => {
    // var file = 'arrow.512.hdtv-lol'
    // var file = 'Supergirl.S02E12.720p.HDTV.X264-DIMENSION.mkv'
    var file = 'The.Newsroom.2012.S02E06.720p.HDTV.x264-KILLERS.mkv'
    console.log(helper.infoFromTVShow(file))
  }

  exports.getSubtitle = (fullFile, fileName) => {
    if (!isVideo(fullFile)) {
      return
    }
    let dir = fullFile.match(/(.*)[\\/\\]/)[1] || ''
    let destFile = fileName.replace(/\.[^/.]+$/, '') + '.srt'
    let osLang = app.getLocale().substring(0, 2)
    let langIso2 = helper.getIsoLanguage(osLang)
    OpenSubtitles.search({
      sublanguageid: langIso2,
      filename: fileName,  // The video file name. Better if extension is included.
      // season: '2',
      // episode: '3',
      limit: '3'                 // Can be 'best', 'all' or an
      // imdbid: '528809',           // 'tt528809' is fine too.
    }).then(subtitles => {
      console.log(subtitles)
      const url = subtitles[osLang][0].url
      helper.downloadFile({
        remoteFile: url,
        localFile: `${dir}/${destFile}`
      }).then(function () {
        console.log('File succesfully downloaded.')
      })
    })
  }
})
