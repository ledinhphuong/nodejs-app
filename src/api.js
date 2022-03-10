import BPromise from 'bluebird'

const STATE = process.env.STATE || 'COMPLETE'
const SESSION_ID = process.env.SESSION_ID || 86028
const requestAsync = BPromise.promisify(require('request'), { multiArgs: true })

let configs = {
  username: 'kobiton-org-demo',
  token: 'e0038bd1-2f9a-469e-8dd0-ce9a5784b26b',
  apiUrl: 'https://api.kobiton.com'
}

const auth = 'Basic ' + Buffer.from(`${configs.username}:${configs.token}`).toString('base64')
const headers = {
  'Authorization': auth,
  'Content-Type': 'application/json'
}

class Api {
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

    console.log(`statuscode = ${statusCode}, ${JSON.stringify(data)}`)
  }

  async delete() {
    const [{ statusCode }, data] = await requestAsync({
      url: `https://api-test.kobiton.com/v1/sessions/${SESSION_ID}`,
      json: true,
      method: 'DELETE',
      headers: headers
    })

    console.log(`statuscode = ${statusCode}, ${JSON.stringify(data)}`)
  }

  async update() {
    const [{ statusCode }, data] = await requestAsync({
      url: `https://api-test.kobiton.com/v1/sessions/${SESSION_ID}`,
      json: true,
      method: 'PUT',
      body: { state: `${STATE}` }, // "PASSED | FAILED | COMPLETE"
      headers: headers
    })

    console.log(`statuscode = ${statusCode}, ${JSON.stringify(data)}`)
  }

  async getDevices() {
    console.log(JSON.stringify(headers))

    const [{ statusCode }, data] = await requestAsync({
      url: `${configs.apiUrl}/v1/devices`,
      json: true,
      method: 'GET',
      headers: headers
    })

    if (statusCode !== 200) return null
    return data
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

    console.log(`statuscode = ${statusCode}, ${JSON.stringify(data)}`)
  }
}

export default new Api()
