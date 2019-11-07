import '@babel/polyfill'
import 'colors'
import BPromise from 'bluebird'
import wd from 'wd'
import { assert } from 'chai'

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

  try {
    console.log(`Using capabilities: ${JSON.stringify(caps)}`)
    await driver.init(caps)
  }
  catch (e) {
    console.error(e)
    assert(false, 'The environment you requested was unavailable.')
  }

  await driver.setImplicitWaitTimeout(8 * 60 * 1000)

  // https://github.com/facebook/WebDriverAgent/wiki/How-To-Achieve-The-Best-Lookup-Performance
  await driver
    // 1. Click on Search tab
    // .elementByAccessibilityId('Search').click()
    // iOS 13.2
    .waitForElementByIosClassChain('**/XCUIElementTypeTabBar[`visible == 1`]/XCUIElementTypeButton[`name BEGINSWITH[c] "search" AND visible == 1`]').click()

    // 2. Click on Search textfield and Enter app name (want to install)
    // .elementByAccessibilityId('App Store').clear().sendKeys('youtube')
    // iOS 12.4
    // .waitForElementByXPath('//XCUIElementTypeSearchField[@name="App Store" and @label="App Store" and @visible="true"]').clear().sendKeys(appWillBeInstall)
    // iOS 13.2
    .waitForElementByIosClassChain('**/XCUIElementTypeSearchField').click().sendKeys(appWillBeInstall)

    // 3. Click Search button on keyboard
    // .elementByName('Search').click()
    // iOS 12.4
    // .waitForElementByXPath('//XCUIElementTypeButton[@name="Search" and @label="Search" and @visible="true"]').click()
    // iOS 13.2
    .waitForElementByIosClassChain('**/XCUIElementTypeButton[`name BEGINSWITH[c] "search" AND visible == 1`]').click()

    // 4. Click Install button
    // .waitForElementByXPath(`//XCUIElementTypeCell[contains(label,"${appWillInstall}")]`).click()
    // .waitForElementsByIosPredicateString(`type == "XCUIElementTypeCell" AND label BEGINSWITH[c] "${appWillBeInstall}"`)
    //   .first().click()
    // .sleep(10000)
    .waitForElementByIosClassChain(`**/XCUIElementTypeCell[\`label BEGINSWITH[c] "${appWillBeInstall}"\`][-1]/XCUIElementTypeButton[\`name IN {"re-download", "redownload", "get"}\`]`).click()
    // 4.1. Click on Install button to confirm
    // .waitForElementByIosClassChain(`**/XCUIElementTypeButton[\`name == "install"\`]`).click()

    // 5. Click Open button
    // .waitForElementByXPath('//XCUIElementTypeButton[@label="open" and @visible="true"]').click()
    .waitForElementByIosClassChain(`**/XCUIElementTypeCell[\`label BEGINSWITH[c] "${appWillBeInstall}"\`][-1]/XCUIElementTypeButton[\`label BEGINSWITH[c] "oPen"\`]`).click()
    .quit()

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

installApp(process.env.APP || 'Slack').then(
  () => {
    console.log('Done.')
  }
)
