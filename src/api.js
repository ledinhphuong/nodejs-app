import BPromise from 'bluebird'

const STATE = process.env.STATE || 'COMPLETE'
const SESSION_ID = process.env.SESSION_ID || 86028
const requestAsync = BPromise.promisify(require('request'), { multiArgs: true })

let configs = {
  // username: 'phuong',
  // token: '2252cb17-b5ee-429b-a003-51157e16f74a',
  username: 'khanhdo',
  token: '09d0c410-ff77-48fc-980a-8edc3d0da970',
  apiUrl: 'https://api-test.kobiton.com'
}

// configs = {
//   username: 'hoavutrongvn',
//   token: '7618ece6-9f13-491f-8ae2-5aaa4b48df5e',
//   apiUrl: 'https://api.kobiton.com'
// }

const auth = 'Basic ' + Buffer.from(`${configs.username}:${configs.token}`).toString('base64')
const headers = {
  'Authorization': auth,
  'Content-Type': 'application/json'
}

class Api {
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
