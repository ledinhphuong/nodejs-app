import chrome from 'selenium-webdriver/chrome'
import {Builder, Browser, By, Key, until, Capabilities} from 'selenium-webdriver'

chrome.setDefaultService(new chrome.ServiceBuilder('/Users/phuongle/MyProjects/public/selenium-macOS-chrome/chromedriver_mac64/chromedriver').build())

async function example() {
   var driver = new Builder()
      .withCapabilities(Capabilities.chrome())
      .build()

  try {
   //  await driver.get('https://www.google.com');
   //  await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN)
   //  await driver.wait(until.titleIs('webdriver - Google Search'), 1000)

    await driver.get('https://ionicframework.com/docs/api/checkbox')
    const source = await driver.getPageSource()
    console.log(source)
  } finally {
    await driver.quit()
  }
}

example()

// function test() {
//    var driver = new webdriver.Builder().
//    withCapabilities(webdriver.Capabilities.chrome()).
//    build()

//    driver.get('http://www.lambdatest.com')
//    driver.quit()
// }

// test()