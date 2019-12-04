import '@babel/polyfill'
import 'colors'
import BPromise from 'bluebird'
import wd from 'wd'

const execAsync = BPromise.promisify(require('child_process').exec, { multiArgs: true })

const caps = {
  platformName: 'iOS',
  deviceName: process.env.NAME || 'iPhone 5s*',
  udid: process.env.UDID || '471e46fb5d4dc6bcf0a55924a421a9548957ce05',
  bundleId: 'com.apple.AppStore',
  captureScreenshots: false,
  newCommandTimeout: 300000
}

const APPIUM = {
  host: 'localhost',
  port: 4723
}

const KOBITON = {
  host: 'api-test.kobiton.com',
  auth: 'itaios:34f840cb-279f-42f0-862b-0761b17795b3',
  user: 'itaios',
  key: '34f840cb-279f-42f0-862b-0761b17795b3',
  protocol: 'https',
  port: 443
}

async function installApp(appWillBeInstall) {
  const server = process.env.SERVER === 'local' ? APPIUM : KOBITON

  console.log(`Running automation with server: ${JSON.stringify(server)}`)
  const driver = wd.promiseChainRemote(server)

  driver.on('status', (info) => console.log(info.cyan))
  driver.on('command', (meth, path, data) => {
    console.log('> ' + meth.yellow, path.grey, data || '')
  })
  driver.on('http', (meth, path, data) => {
    console.log('> ' + meth.magenta, path, (data || '').grey)
  })

  console.log(`Using capabilities: ${JSON.stringify(caps)}`)
  await driver.init(caps)

  const timeout = 1 * 60 * 1000
  await driver.setImplicitWaitTimeout(timeout)
  await driver.setAsyncScriptTimeout(timeout)
  await driver.setPageLoadTimeout(timeout)

  // Sometimes, AppStore app asks to Allow notification
  await _closeAlert(driver, { action: 'accept', buttonLabel: 'Allow' })

  // https://github.com/facebook/WebDriverAgent/wiki/How-To-Achieve-The-Best-Lookup-Performance
  await driver
    // Click on Search tab
    .waitForElementByIosClassChain('**/XCUIElementTypeTabBar[`visible == 1`]/XCUIElementTypeButton[`name BEGINSWITH[c] "search" AND visible == 1`]').click()
    // Click on Search textfield and Enter app name (want to install)
    .waitForElementByIosClassChain('**/XCUIElementTypeSearchField').click().sendKeys(appWillBeInstall)
    // Click Search button on keyboard
    .waitForElementByIosClassChain('**/XCUIElementTypeButton[`name BEGINSWITH[c] "search" AND visible == 1`]').click()

  // Click install button
  await _clickInstallButton(driver, appWillBeInstall)

  // Click Open button
  await _clickOpenButton(driver, appWillBeInstall)

  await driver
    // Get bundleId
    .sleep(2000) // wait a little bit for the screen is quiet
    .execute('mobile:activeAppInfo')
    // .execute('mobile:launchApp', { bundleId: 'com.facebook.Facebook' })
    // .execute('mobile:siriCommand', { text: 'where am i?' })

  await driver
    .sleep(10000)
    .quit()

  // We can get budleId if the running script + hosting devices are in the same mac
  const bundleId = await getBundleId(appWillBeInstall)
  console.log(`Finshed to install: ${bundleId}`)
}

async function getBundleId(appName) {
  // CFBundleIdentifier, CFBundleVersion, CFBundleDisplayName
  // com.facebook.Facebook, "180461199", "Facebook"
  // com.facebook.WebDriverAgentRunner.xctrunner, "1", "WebDriverAgentRunner-Runner"
  // vn.com.vng.zingalo, "309", "Zalo"
  const [stdout, stderr] = await execAsync('/usr/local/bin/ideviceinstaller -l')

  if (stderr) {
    console.log(stderr)
    return
  }

  if (!stdout) return null

  const appInfos = stdout
    .split('\n')
    .map((line) => line.split(','))

  const foundAppInfos = appInfos && appInfos.filter((info) => {
    if (info.length === 3) {
      const name = (info[2] && info[2].trim()).toLowerCase()
      return (name && name.includes(appName.toLowerCase()))
    }

    return false
  })

  if (!foundAppInfos || foundAppInfos.length < 1) return null

  const foundAppInfo = foundAppInfos[0]
  return foundAppInfo[0]
}

async function _closeAlert(driver, alertOptions, retryTimes = 3) {
  const finalOpts = { ...alertOptions, action: 'accept', buttonLabel: 'Allow' }

  let i = 0
  while (i < retryTimes) {
    try {
      await driver.execute('mobile: alert', finalOpts)
      return true
    }
    catch (err) {
      console.log(err)
    }

    i++
  }

  return false
}

async function _clickInstallButton(driver, appWillBeInstall, retryTimes = 5) {
  let i = 0
  while (i < retryTimes) {
    try {
      await driver.waitForElementByIosClassChain(
        `**/XCUIElementTypeCell[\`label BEGINSWITH[c] "${appWillBeInstall}"\`][-1]/XCUIElementTypeButton[\`name BEGINSWITH[c] "re-download" OR name BEGINSWITH[c] "redownload" OR name BEGINSWITH[c] "get"\`]`).click()
      return true
    }
    catch (err) {
      console.log(err)
      await _closeAlert(driver, { action: 'accept', buttonLabel: 'Install' })
    }

    i++
  }

  return false
}

async function _clickOpenButton(driver, appWillBeInstall, retryTimes = 20) {
  let i = 0
  while (i < retryTimes) {
    try {
      await driver.waitForElementByIosClassChain(
        `**/XCUIElementTypeCell[\`label BEGINSWITH[c] "${appWillBeInstall}"\`][-1]/XCUIElementTypeButton[\`label BEGINSWITH[c] "oPen"\`]`).click()
      return true
    }
    catch (err) {
      console.log(err)
      await _closeAlert(driver, { action: 'accept', buttonLabel: 'Install' }, retryTimes = 1)
    }

    i++
  }

  return false
}

installApp(process.env.APP || 'Slack').then(
  () => {
    console.log('Done.')
  }
)
