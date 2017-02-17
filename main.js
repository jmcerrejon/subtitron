const {app, BrowserWindow} = require('electron')
const OS = require('opensubtitles-api')
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

  // test
  exports.getSubtitle = (fullFile) => {
    console.log('Getting subtitle: ' + fullFile)
    OpenSubtitles.search({
      sublanguageid: 'spa',
      filename: 'Mechanic Resurrection.mp4',  // The video file name. Better if extension is included.
      // season: '2',
      // episode: '3',
      limit: '3'                 // Can be 'best', 'all' or an
      // imdbid: '528809',           // 'tt528809' is fine too.
    }).then(subtitles => {
      console.log(subtitles)
      const url = subtitles['es'][0].url
      console.log('url:' + url)

      const helper = require('./helper.js')
      helper.downloadFile({
        remoteFile: url,
        localFile: '/Volumes/osx/Users/ulysess/Downloads/Mechanic Resurrection.srt'
      }).then(function () {
        console.log('File succesfully downloaded')
      })
    })
  }
})
