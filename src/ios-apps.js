// UDID=<device's udid> yarn uninstall-ios-apps
//
//

import '@babel/polyfill'
import BPromise from 'bluebird'
// import API from './api'

const execAsync = BPromise.promisify(require('child_process').exec, { multiArgs: true })
const UNINSTALL = process.env.UNINSTALL

async function uninstallApps(udid) {
  console.log(`Uninstalling apps on ${udid} device...`)

  const apps = await getInstalledApps(udid)
  console.log(`There are ${apps.length} apps: ${JSON.stringify(apps)}\n`)

  await BPromise.mapSeries(apps, (app) => {
    const appId = app[0]
    console.log(`Uninstalling app ${appId}`)
    return execAsync(`/usr/local/bin/ideviceinstaller -u ${udid} -U ${appId}`, { timeout: 2 * 60 * 1000 })
  }).catch((err) => console.log(err))
}

async function uninstallAppsInOnlineDevices() {
  console.log('Uninstalled apps in all connected iOS devices in this mac...')

  const connectedUDIDs = await getConnectedUDIDs()
  if (!connectedUDIDs) return

  // const onlineIosDevices = await API.getOnlineIosDevices()
  // console.log(`\n* ${onlineIosDevices.length} online iOS devices in Kobiton: ${JSON.stringify(onlineIosDevices)}`)
  //
  // const onlineUDIDs = connectedUDIDs.filter((udid) => {
  //   let online = false
  //
  //   for (let i = 0; i < onlineIosDevices.length; i++) {
  //     if (onlineIosDevices[i].udid === udid) {
  //       online = true
  //       break
  //     }
  //   }
  //
  //   console.log(`Is ${udid} online? ${online}`)
  //
  //   return online
  // })

  console.log(`\n* ${connectedUDIDs.length} connected devices in this mac: ${JSON.stringify(connectedUDIDs)}`)
  if (connectedUDIDs.length > 0) {
    console.log('\nUninstalling...')

    for (let i = 0; i < connectedUDIDs.length; i++) {
      const udid = connectedUDIDs[i]

      console.log(`\n* [${i + 1}] Device ${udid}:`)
      await uninstallApps(udid)
    }
  }
}

async function listInstalledAppsInConnectedDevices() {
  console.log('Listing out all installed apps in all connected iOS devices...')

  const udids = await getConnectedUDIDs()
  if (!udids) return

  console.log(`* There are ${udids.length} connected devices: ${JSON.stringify(udids)}`)

  const getApps = async (udid) => {
    try {
      const apps = await getInstalledApps(udid)
      if (!apps || apps.length < 1) {
        console.log(`\t** is not installed any apps`)
        return
      }

      console.log(`\t** is installed ${apps.length} apps: ${JSON.stringify(apps)}`)
    }
    catch (err) {
      console.log(err)
    }
  }

  for (let i = 0; i < udids.length; i++) {
    const udid = udids[i]

    console.log(`\n* [${i + 1}] Device ${udid}:`)
    await getApps(udid)
  }
}

async function main() {
  if (UNINSTALL) {
    if (UNINSTALL === 'all') {
      return uninstallAppsInOnlineDevices()
    }

    return uninstallApps(UNINSTALL)
  }

  return listInstalledAppsInConnectedDevices()
}

async function getConnectedUDIDs() {
  const [stdout, stderr] = await execAsync('/usr/local/bin/idevice_id -l')
  if (stderr) {
    console.log(stderr)
    return null
  }

  if (!stdout) return null

  const udids = stdout
    .split('\n')
    .filter((line) => !!line)

  return udids
}

async function getInstalledApps(udid) {
  const [stdout, stderr] = await execAsync(`/usr/local/bin/ideviceinstaller -u ${udid} -l -o list_user`)

  if (stderr) {
    console.log(stderr)
    return null
  }

  if (!stdout) return null

  const appInfos = stdout
    .split('\n')
    .map((line) => line.split(','))

  const apps = appInfos && appInfos.filter((info) => {
    if (info.length === 3) {
      const name = (info[0] && info[0].trim()).toLowerCase()
      return (name && name !== 'cfbundleidentifier' &&
        !name.includes('kobiton') && !name.includes('webdriveragent'))
    }

    return false
  })

  return apps
}

main()
  .then(() => console.log('Finished.'))
  .catch((err) => console.log(err))
