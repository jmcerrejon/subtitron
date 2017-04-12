// Declare some variables
const {app, BrowserWindow, Menu} = require('electron')
const OpenSubtitles = require('opensubtitles-api')
const storage = require('electron-json-storage')
const helper = require('./helper.js')
const i18next = require('i18next')
const Backend = require('i18next-sync-fs-backend')
// userAgent change constantly. Check out: http://trac.opensubtitles.org/projects/opensubtitles/wiki/DevReadFirst
const userAgent = 'OSTestUserAgentTemp'
const OS = new OpenSubtitles(userAgent)
let mainWindow
let user

/*
 *  Init System
 */

// Menu
let menu = Menu.buildFromTemplate([{
  label: app.getName(),
  submenu: [{
    role: 'quit'
  }]
}])

// Localization
i18next
  .use(Backend)
  .init({
    lng: app.getLocale().substring(0, 2),
    fallbackLng: 'en',
    initImmediate: false,
    'backend': {
      'loadPath': 'locales/{{lng}}/{{ns}}.json'
    }
  })

exports.L = (key) => {
  return i18next.t(key)
}

// Testing
if (process.platform === 'darwin') {
  require('electron-reload')(__dirname)
}

// End Testing

// User settings
exports.setUserLang = (lang) => {
  user.lang = lang
}

storage.has('user', (error, hasKey) => {
  if (error) {
    storage.set('user', {
      lang: app.getLocale().substring(0, 2)
    }, (error) => {
      if (error) throw error
    })
    return
  }

  if (hasKey) {
    storage.get('user', (error, data) => {
      if (error) throw error
      user = data
    })
  }
})

app.on('window-all-closed', app.quit)

app.on('ready', () => {
  let bwOptions = {
    title: 'SubtiTron',
    center: true,
    width: 360,
    height: process.platform === 'win32' ? 240 : 212,
    useContentSize: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    titleBarStyle: 'hidden-inset',
    // frame: false, // Disable frame on Win, Mac (tested) in opposite of titleBarStyle
    alwaysOnTop: true,
    icon: 'assets/icons/defaultIcon.ico',
    show: false,
    webPreferences: {
      defaultFontSize: 25
    }
  }
  process.platform === 'darwin' ? bwOptions.vibrancy = 'dark' : bwOptions.backgroundColor = '#292934'

  mainWindow = new BrowserWindow(bwOptions)

  // Menu according to the OS
  if (process.platform === 'darwin') {
    Menu.setApplicationMenu(menu)
  } else {
    mainWindow.setMenu(null)
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Prevent external resources from being loaded (like images)
  // when dropping them on the WebView.
  mainWindow.webContents.on('will-navigate', event => event.preventDefault())

  // mainWindow.webContents.openDevTools()

  // arguments
  process.argv.forEach((arg) => {
    console.dir('arg:' + arg)
  })

  mainWindow.loadURL(`file://${__dirname}/index.html`)

  // Settings
  exports.openSettings = () => {
    // var file = 'arrow.512.hdtv-lol'
    var file = 'Supergirl.S02E12.720p.HDTV.X264-DIMENSION.mkv'
    // var file = 'The.Newsroom.2012.S02E06.720p.HDTV.x264-KILLERS.mkv'
    // var file = 'Homeland.6x07.Riesgo.inminente.mkv'
    console.log(helper.infoFromTVShow(file))
  }

  exports.getSubtitle = (fullFile, fileName) => {
    if (!helper.isVideo(fullFile)) {
      return
    }
    let result = helper.infoFromTVShow(fileName)
    console.log('Show', result)
    if (result === null) {
      // TODO: not a show, so search for a movie
    }
    let dir = fullFile.match(/(.*)[\\/\\]/)[1] || ''
    let destFile = fileName.replace(/\.[^/.]+$/, '') + '.srt'

    // Search the subtitle. Best in a file apart when it's done
    let querySearch = {
      query: result.show,
      sublanguageid: helper.getIsoLanguage(user.lang),
      season: result.season,
      episode: result.episode,
      limit: '1'                 // Can be 'best', 'all' or a number
    }
    console.log('Querying...', querySearch)

    OS.search(querySearch).then(subtitles => {
      console.log(subtitles)
      if (Object.keys(subtitles).length === 0) {
        console.log('No result')
        return
      }
      const url = subtitles[user.lang][0].url
      helper.downloadFile({
        remoteFile: url,
        localFile: `${dir}/${destFile}`
      }).then(function () {
        console.log('File succesfully downloaded.')
      })
    })
  // End search subtitle
  }
})
