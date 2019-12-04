// UDID=<device's udid> yarn uninstall-ios-apps
//
//

import '@babel/polyfill'
import BPromise from 'bluebird'

const execAsync = BPromise.promisify(require('child_process').exec, { multiArgs: true })
const UDID = process.env.UDID

async function uninstallApps(udid) {
  console.log(`Uninstalling apps on ${udid} device...`)

  const apps = await getInstalledApps(udid)
  console.log(`There are ${apps.length} apps: ${JSON.stringify(apps)}\n`)

  await BPromise.mapSeries(apps, (app) => {
    const appId = app[0]
    console.log(`Uninstall app ${appId}`)
    return execAsync(`/usr/local/bin/ideviceinstaller -u ${udid} -U ${appId}`, { timeout: 2 * 60 * 1000 })
  }).catch((err) => console.log(err))
}

async function uninstallAppsInConnectedDevices() {
  console.log('Uninstalled apps in all connected iOS devices...')

  const udids = await getUDIDs()
  if (!udids) return

  console.log(`* There are ${udids.length} connected devices: ${JSON.stringify(udids)}`)

  for (let i = 0; i < udids.length; i++) {
    const udid = udids[i]

    console.log(`\n* [${i + 1}] Device ${udid}:`)
    await uninstallApps(udid)
  }
}

async function listInstalledAppsInConnectedDevices() {
  console.log('Listing out all installed apps in all connected iOS devices...')

  const udids = await getUDIDs()
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
  if (UDID) {
    if (UDID === 'all') {
      return uninstallAppsInConnectedDevices()
    }

    return uninstallApps(UDID)
  }
  return listInstalledAppsInConnectedDevices()
}

async function getUDIDs() {
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
      return (name && !name.includes('kobiton') && name !== 'cfbundleidentifier')
    }

    return false
  })

  return apps
}

main()
  .then(() => console.log('Finished.'))
  .catch((err) => console.log(err))
