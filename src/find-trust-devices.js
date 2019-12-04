// npm run find-trust-devices
//

import '@babel/polyfill'
import BPromise from 'bluebird'

const execAsync = BPromise.promisify(require('child_process').exec, { multiArgs: true })

async function listNeededTrustDevices() {
  console.log('Listing out all devices that need to hit trust popup...')

  const udids = await getConnectedUDIDs()
  if (!udids) return

  console.log(`\n* There are ${udids.length} connected devices: ${JSON.stringify(udids)}`)

  let needTrustDevices = []
  for (let i = 0; i < udids.length; i++) {
    const udid = udids[i]

    if (await isNeedTrust(udid)) {
      needTrustDevices.push(udid)
    }
  }

  if (needTrustDevices.length === 0) {
    console.log('\n\t* No devices need to hit trust popup')
  }
  else {
    console.log(`\n\t* ${needTrustDevices.length} devices need trust: ${JSON.stringify(needTrustDevices)}`)
  }
}

async function main() {
  await test()
  return listNeededTrustDevices()
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

async function isNeedTrust(udid) {
  try {
    // eslint-disable-next-line no-unused-vars
    const [stdout, stderr] = await execAsync(`/usr/local/bin/ideviceinfo -u ${udid} -q com.apple.mobile.battery`)

    if (stderr) {
      // console.log(stderr)
      if (stderr.includes('Could not connect to lockdownd')) {
        return true
      }
    }
  }
  catch (err) {
    if (err.message.includes('Could not connect to lockdownd')) {
      return true
    }
  }

  return false
}

async function test() {
  const a = [100, 101, 102, 103, 104, 105]

  await BPromise.map(a, (value, index) => {
    console.log(`a[${index}] = ${value}`)
  })
}

main()
  .then(() => console.log('Finished.'))
  .catch((err) => console.log(err))
