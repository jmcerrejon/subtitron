const { remote } = require('electron')
const appVersion = remote.app.getVersion()
const dialog = remote.dialog
const main = remote.require('./main.js')

document.getElementById('txtVersion').innerHTML = `Ver ${appVersion}`

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

function openSettings () {
  main.openSettings()
}
