const { remote, shell } = require('electron')
const storage = require('electron-json-storage')
const appVersion = remote.app.getVersion()
const dialog = remote.dialog
const main = remote.require('./main.js')

document.getElementById('txtVersion').innerText = `Ver ${appVersion}`

// Check internet connectivity
window.addEventListener('online', () => {
  console.log('Online')
})

window.addEventListener('offline', () => {
  console.log('Offline')
  let result = dialog.showMessageBox({
    message: 'Please check your network. Internet connection needed.',
    buttons: ['Ok']
  })
  if (result === 0) {
    result = null
  }
})

/* Localize texts
 * @param {string} obj
 * @param {array} obj
 * @return none
 */
function localize (obj) {
  if (typeof obj === 'string') {
    document.getElementById(obj).innerText = main.L(obj)
    return
  }

  obj.forEach((item) => {
    document.getElementById(item).innerText = main.L(item)
  })
}
localize(['txtDrag', 'txtSelectFlag', 'closeBtn'])

// Drag file(s)
const holder = document.getElementById('holder')
holder.ondragover = holder.ondragleave = holder.ondragend = () => {
  return false
}
holder.ondrop = (e) => {
  for (let f of e.dataTransfer.files) {
    // alert('File type: ' + f.type + ', path: ' + f.path)
    main.getSubtitle(f.path, f.name)
  }
  return false
}

// Settings
function openSettings() {
  main.openSettings()
}

function changeLocale() {
  var e = document.getElementById('selFlag')
  var locale = e.options[e.selectedIndex].value
  storage.set('user', {
    lang: locale
  })
  main.setUserLang(locale)
}

function goToGithub() {
  shell.openExternal('https://github.com/jmcerrejon/subtitron')
}

storage.get('user', (error, data) => {
  if (error) return
  // set default lang
  document.getElementById(data.lang).selected = true
})
