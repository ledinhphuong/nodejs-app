import BPromise from 'bluebird'

const STATE = process.env.STATE || 'COMPLETE'
const SESSION_ID = process.env.SESSION_ID || 86028
const requestAsync = BPromise.promisify(require('request'), { multiArgs: true })

let configs = {
  username: 'phuong',
  token: '00d4e6fd-2782-405c-a5a0-fc94e88a5014',
  apiUrl: 'http://localhost:3000'

  // username: 'kobitonadmin',
  // token: '05bcba8c-fe7e-41c7-add8-c0e3e9eb5a02',
  // apiUrl: 'https://api-test.kobiton.com'
}

const auth = 'Basic ' + Buffer.from(`${configs.username}:${configs.token}`).toString('base64')
const headers = {
  'Authorization': auth,
  'Content-Type': 'application/json'
}

console.log(`Header: ${JSON.stringify(headers)}`)

class Api {
  async getOTPToken(phoneNo) {
    const url = `${configs.apiUrl}/v1/otp/phones/${phoneNo}/find-otp-code`
    const [{ statusCode }, data] = await requestAsync({
      url,
      json: true,
      method: 'GET',
      headers: headers
    })

    console.log(`request: ${url}`)
    console.log(`statusCode = ${statusCode}, ${JSON.stringify(data)}`)
  }

  async getSMS(phoneNo) {
    const url = `${configs.apiUrl}/v1/otp/phones/${phoneNo}/find-sms-message`
    const [{ statusCode }, data] = await requestAsync({
      url,
      json: true,
      method: 'GET',
      headers: headers
    })

    console.log(`request: ${url}`)
    console.log(`statusCode = ${statusCode}, ${JSON.stringify(data)}`)
  }

  async unbookOTPPhoneNumber(phoneNo) {
    const url = `${configs.apiUrl}/v1/otp/phones/${phoneNo}/unbook`
    const [{ statusCode }, data] = await requestAsync({
      url,
      method: 'POST',
      headers: headers
    })

    console.log(`request: ${url}`)
    console.log(`statusCode = ${statusCode}, ${JSON.stringify(data)}`)
  }

  async bookOTPPhoneNumber() {
    // Deprecated. Now it is still used for exported appium script
    // const url = `${configs.apiUrl}/v1/otp/phone-numbers/available`

    const url = `${configs.apiUrl}/v1/otp/phones/book?countryCode=1`
    const [{ statusCode }, data] = await requestAsync({
      url,
      json: true,
      method: 'GET',
      headers: headers
    })

    console.log(`request: ${url}`)
    console.log(`statusCode = ${statusCode}, ${JSON.stringify(data)}`)
  }

  async deviceBundles() {
    const reqId = Date.now()
    const [{ statusCode }, data] = await requestAsync({
      url: `${configs.apiUrl}/v1/device-bundles?platformName=Android&category=PHONE&category=ANY&sessionId=4153348&reqId=${reqId}`,
      json: true,
      method: 'GET',
      headers: headers
    })

    console.log(`statusCode = ${statusCode}, ${JSON.stringify(data)}`)
  }

  // Start/ Rerun a Revisit Plan
  // https://kobiton.atlassian.net/wiki/spaces/KOBITON/pages/3370385442/Trigger+Scriptless+on+Automation+Appium+Script
  async startRevisitPlan() {
    const body = {
      "exploringSessionIds": [3975459],

      // If we want to use difference app version with exploring session
      // "appPath": "kobiton-store:v100",

      "deviceBundleId": [497],
      // "runAllDevicesInBundle": true,

      // Select a small set of devices in the deviceBundleId
      "deviceSelections": [
        {
          "deviceCapabilities": [
            {
              "deviceName": "Pixel 3",
              "platformVersion": "*",
              "deviceSource": "KOBITON"
            }
            // ,
            // {
            //   "deviceName": "*S9*",
            //   "platformVersion": "10.0.0",
            //   "deviceSource": "KOBITON"
            // }
          ]
        }
        // ,
        // {
        //   "dataSetId": 100,
        //   "deviceCapabilities": {
        //     "deviceName": "Nokia*",
        //     "platformVersion": "11.0.0",
        //     "deviceSource": "KOBITON"
        //   }
        // }
      ]
    }

    const [{ statusCode }, data] = await requestAsync({
      url: 'https://api.kobiton.com/v1/revisitPlans/start',
      json: true,
      method: 'POST',
      headers: headers,
      body
    })

    console.log(`statusCode = ${statusCode}, ${JSON.stringify(data)}`)
  }

  async deleteSession() {
    const [{ statusCode }, data] = await requestAsync({
      url: `https://api-test.kobiton.com/v1/sessions/${SESSION_ID}`,
      json: true,
      method: 'DELETE',
      headers: headers
    })

    console.log(`statusCode = ${statusCode}, ${JSON.stringify(data)}`)
  }

  async updateSession() {
    const [{ statusCode }, data] = await requestAsync({
      url: `https://api-test.kobiton.com/v1/sessions/${SESSION_ID}`,
      json: true,
      method: 'PUT',
      body: { state: `${STATE}` }, // "PASSED | FAILED | COMPLETE"
      headers: headers
    })

    console.log(`statusCode = ${statusCode}, ${JSON.stringify(data)}`)
  }

  async getDevices() {
    console.log(JSON.stringify(headers))

    const [{ statusCode }, data] = await requestAsync({
      url: `${configs.apiUrl}/v1/devices`,
      json: true,
      method: 'GET',
      headers: headers
    })

    console.log(`statusCode = ${statusCode}, ${JSON.stringify(data)}`)
  }

  async getOnlineIosDevices() {
    const devices = await this.getDevices()
    if (!devices) return null

    const onlineDevices = devices
      .privateDevices
      .filter((device) => {
        return (
          device.platformName === 'iOS' &&
          device.isBooked === false &&
          device.isOnline === true &&
          device.hostedBy === configs.username
        )
      })

    return onlineDevices
  }

  // Deprecated
  async rerunRevisit() {
    const [{ statusCode }, data] = await requestAsync({
      url: `${configs.apiUrl}/v1/revisitPlans`,
      json: true,
      method: 'POST',
      body: { exploringSessionIds: [173673], deviceIds: [555389] },
      headers: headers
    })

    console.log(`statusCode = ${statusCode}, ${JSON.stringify(data)}`)
  }

  async generateElementSelector(revisitPlanId) {
    const url = `${configs.apiUrl}/v1/revisitPlans/${revisitPlanId}/generate-element-selector`
    console.log(`Triggering ${url}...`)

    const [{ statusCode }, data] = await requestAsync({
      url,
      method: 'POST',
      headers: headers
    })

    console.log(`statusCode = ${statusCode}, ${JSON.stringify(data)}`)
  }
}

export default new Api()
