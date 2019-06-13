import BPromise from 'bluebird'
import request from 'request'
import childProcess from 'child_process'
import fs from 'fs'
import gpapi from 'gpapi'
import HttpStatusCodes from 'http-status-codes'

const requestAsync = BPromise.promisify(request, {multiArgs: true})
const execAsync = BPromise.promisify(childProcess.exec, {multiArgs: true})
const VERSION_REXEG = /versionCode=(\d+)[\s\S]+?versionName=([\d\w\.\-]+)/mi

async function getUserAgents(udid) {
  let versionName, versionCode
  let res = await execAsync(
    `adb -s ${udid} shell dumpsys package com.android.vending | grep "versionCode\\|versionName"`)

  if (res[0]) {
    let match
    while ((match = VERSION_REXEG.exec(res[0])) !== null) {
      if (match && match.length === 3) {
        versionCode = match[1]
        versionName = match[2]
        break
      }
    }
  }

  let props
  res = await execAsync(
    `adb -s ${udid} shell getprop | grep "ro.build.version.sdk\\|ro.product.device\\|ro.hardware\\|ro.build.product\\|ro.build.id\\|ro.build.type\\|ro.build.version.release"`)

  if (res[0]) {
    const jsonString = `{${res[0]
      .replace(/\[|]/g, '"')
      .replace(/\n/g, ',')
      .trim().slice(0, -1)}}`
    props = JSON.parse(jsonString)
  }

  const apiUserAgent = `Android-Finsky/${versionName} (versionCode=${versionCode},sdk=${props["ro.build.version.sdk"]},device=${props["ro.product.device"]},hardware=${props["ro.hardware"]},product=${props["ro.build.product"]},build=${props["ro.build.id"]}:${props["ro.build.type"]})`
  const downloadUserAgent = `AndroidDownloadManager/${props["ro.build.version.release"]} (Linux; U; Android ${props["ro.build.version.release"]}; Build/${props["ro.build.id"]})`

  return {apiUserAgent, downloadUserAgent}
}

function createGooglePlayAPI({apiUserAgent, downloadUserAgent}) {
  // apiUserAgent: 'Android-Finsky/10.6.08-all (versionCode=81060800,sdk=27,device=marlin,hardware=marlin,product=marlin,build=OPM2.171019.029:user)',
  // downloadUserAgent: 'AndroidDownloadManager/8.1.0 (Linux; U; Android 8.1.0; Pixel Build/OPM2.171019.029)'
  const info = {
    username: 'khanhdo.android',
    password: 'passnhucu',
    androidId: '3207FEC0BEDEEF62',
    apiUserAgent,
    downloadUserAgent
  }

  return gpapi.GooglePlayAPI(info)
}

async function getPackageDetails(api, packageName, variant) {
  const {details} = await api.details(packageName)
  console.log(`${packageName} has details ${JSON.stringify(details)}`)
  return details.appDetails
}

function downloadApk(api, {packageName, versionString, versionCode, targetSdkVersion}) {
  let filePath = packageName

  if (versionString) {
    filePath = filePath.concat(`_v${versionString.replace('/', '-')}`)
  }

  if (versionCode) {
    filePath = filePath.concat(`_c${versionCode.toString().replace('/', '-')}`)
  }

  if (targetSdkVersion) {
    filePath = filePath.concat(`_t${targetSdkVersion}`)
  }

  filePath = filePath.concat('.apk')

  const fStream = fs.createWriteStream(filePath)

  return new BPromise(async (resolve, reject) => {
    fStream
      .on('error', reject)
      .on('finish', () => resolve(filePath))

    try {
      console.log(`Downloading ${packageName} - code: ${versionCode}`)
      const req = await api.download(packageName, versionCode)
      req.pipe(fStream)
      console.log(`Downloaded and saved at ${filePath}`)
    }
    catch (err) {
      reject(err)
    }
  })
}

//https://api.apptweak.com/android/applications/com.android.chrome/information.json
async function getAppInfo(packageName) {
  const [{statusCode}, body] = await requestAsync({
    url: `https://api.apptweak.com/android/applications/${packageName}/information.json`,
    method: 'GET',
    headers: {
      'X-Apptweak-Key': 'HRRWc15LPwoG8Xds9j998PbS3mQ'
    },
    json: true
  })

  return statusCode === HttpStatusCodes.OK ? body : {}
}

function convertToMatrix(arr, width) {
  return arr.reduce((rows, key, index) => (index % width == 0
    ? rows.push([key])
    : rows[rows.length - 1].push(key)) && rows, []);
}

async function main() {
  // There are 2 ways to a download chrome browser apk files:
  // - We need 4 devices: Android 4, Android 5, Android 7 (32 & 64)
  // - Use `adb pull` on above devices to download these.
  const udid = process.env.UDID || 'd8f618fa'

  const {apiUserAgent, downloadUserAgent} = await getUserAgents(udid)
  console.log(`-------> apiUserAgent: ${apiUserAgent}`)
  console.log(`-------> downloadUserAgent: ${downloadUserAgent}`)

  const packageNames = ['com.android.chrome']
  const newPackageNames = convertToMatrix(packageNames, 3)

  for (const packageNames of newPackageNames) {
    return BPromise.all(BPromise.map(packageNames, async (packageName) => {
      const api = await createGooglePlayAPI({apiUserAgent, downloadUserAgent})
      const appDetails = await getPackageDetails(api, packageName)
      console.log(JSON.stringify(appDetails))

      await downloadApk(api, appDetails).catch((err) =>
        console.log(`${packageName}, error: ${err.message}`)
      )
    }))
  }
}

main()
