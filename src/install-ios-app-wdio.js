import BPromise from 'bluebird'
import '@babel/polyfill'
import { remote } from 'webdriverio'

const APPIUM = {
  host: 'localhost',
  port: 4723
}

const KOBITON = {
  hostname: 'api-test.kobiton.com',
  auth: 'itaios:34f840cb-279f-42f0-862b-0761b17795b3',
  user: 'itaios',
  key: '34f840cb-279f-42f0-862b-0761b17795b3',
  protocol: 'https',
  port: 443
}

async function installApp(appWillBeInstall) {
  const server = process.env.SERVER === 'local' ? APPIUM : KOBITON

  const options = {
    logLevel: 'debug',
    capabilities: {
      platformName: 'iOS',
      deviceName: process.env.NAME || 'iPhone 5s*',
      udid: process.env.UDID || '471e46fb5d4dc6bcf0a55924a421a9548957ce05',
      bundleId: 'com.apple.AppStore',
      captureScreenshots: false,
      newCommandTimeout: 300000
    },
    ...server
  }

  console.log(`Running automation with options: ${JSON.stringify(options)}`)
  const driver = await remote(options)
  console.log(JSON.stringify(driver))

  const timeouts = 1 * 60 * 1000
  await driver.setTimeout({ timeouts, pageLoad: timeouts, script: timeouts, implicit: timeouts })

  // Sometimes, AppStore app asks to Allow notification
  // await _closeAlert(driver, 'Allow')

  // https://github.com/facebook/WebDriverAgent/wiki/How-To-Achieve-The-Best-Lookup-Performance
  const searchTab = await driver.$('-ios class chain:**/XCUIElementTypeTabBar[`visible == 1`]/XCUIElementTypeButton[`name BEGINSWITH[c] "search" AND visible == 1`]')
  searchTab && await searchTab.click()

  await driver.getPageSource()
  const searchTextField = await driver.$('-ios class chain:**/XCUIElementTypeSearchField')
  searchTextField && await searchTextField.setValue(appWillBeInstall)
  await driver.getPageSource()

  const searchKeyboard = await driver.$('-ios class chain:**/XCUIElementTypeButton[`name BEGINSWITH[c] "search" AND visible == 1`]')
  searchKeyboard && await searchKeyboard.click()

  // Click install button
  await _clickInstallButton(driver, appWillBeInstall)

  // Click Open button
  await _clickOpenButton(driver, appWillBeInstall)

  driver && await driver.deleteSession()
}

async function _closeAlert(driver, buttonLabel, retryTimes = 1) {
  let i = 0
  while (i < retryTimes) {
    try {
      const alertButton = await driver.$(
        `-ios class chain:**/XCUIElementTypeButton[\`name BEGINSWITH[c] "${buttonLabel}" AND visible == 1\`]`
      )

      if (alertButton) {
        await alertButton.click()
        return true
      }
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
    const installButton = await driver
      .$(`-ios class chain:**/XCUIElementTypeCell[\`label BEGINSWITH[c] "${appWillBeInstall}"\`][-1]/XCUIElementTypeButton[\`name BEGINSWITH[c] "re-download" OR name BEGINSWITH[c] "redownload" OR name BEGINSWITH[c] "get"\`]`)

    if (installButton) {
      installButton && await installButton.click()
      return true
    }

    i++
  }

  return false
}

async function _enterPasswordToConfirmInstallation(driver) {
  const passwordTextfield = await driver.$(
    `-ios class chain:**/XCUIElementTypeSecureTextField[\`visible == 1\`]`)
  await passwordTextfield.setValue('phuongle@2019')

  const signInButton = await driver.$(
    `-ios class chain:**/XCUIElementTypeButton[\`name BEGINSWITH[c] "Sign In" AND visible == 1\`]`)
  await signInButton.click()
}

async function _clickOpenButton(driver, appWillBeInstall, retryTimes = 20) {
  let i = 0
  while (i < retryTimes) {
    console.log(`${i} Finding Open button`)
    try {
      const openButton = await driver.$(
        `-ios class chain:**/XCUIElementTypeCell[\`label BEGINSWITH[c] "${appWillBeInstall}"\`][-1]/XCUIElementTypeButton[\`label BEGINSWITH[c] "oPen"\`]`)

      if (openButton) {
        await openButton.click()
        return true
      }
    }
    catch (err) {
      console.log(err)
    }

    await _closeAlert(driver, 'install')
    await _enterPasswordToConfirmInstallation(driver)
    i++
  }

  return false
}

async function testUICatalog() {
  const server = process.env.SERVER === 'local' ? APPIUM : KOBITON

  const options = {
    logLevel: 'debug',
    capabilities: {
      platformName: 'iOS',
      deviceName: process.env.NAME || 'iPhone 5s*',
      udid: process.env.UDID || '471e46fb5d4dc6bcf0a55924a421a9548957ce05',
      bundleId: 'com.example.apple-samplecode.UIKitCatalog',
      captureScreenshots: false,
      newCommandTimeout: 300000
    },
    ...server
  }

  console.log(`Running automation with options: ${JSON.stringify(options)}`)
  const driver = await remote(options)
  console.log(JSON.stringify(driver))

  const timeouts = 1 * 60 * 1000
  await driver.setTimeout({ timeouts, pageLoad: timeouts, script: timeouts, implicit: timeouts })

  // https://github.com/facebook/WebDriverAgent/wiki/How-To-Achieve-The-Best-Lookup-Performance
  const size = await driver.getWindowSize()
  console.log(JSON.stringify(size))

  await driver.getPageSource()

  await BPromise.delay(10000)
  const searchTab = await driver.$('-ios class chain:**/XCUIElementTypeButton[`visible == 1`][-1]')
  searchTab && await searchTab.click()

  await BPromise.delay(5000)

  driver && await driver.deleteSession()
}

// installApp(process.env.APP || 'Slack').then(
//   () => {
//     console.log('Done.')
//   }
// )

testUICatalog().then(
  () => {
    console.log('Done.')
  }
)
