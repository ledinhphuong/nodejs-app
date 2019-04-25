import BPromise from 'bluebird'

const STATE = process.env.STATE || 'COMPLETE'
const SESSION_ID = process.env.SESSION_ID || 86028
const requestAsync = BPromise.promisify(require('request'), {multiArgs: true})
const auth = 'Basic ' +
  Buffer.from('phuong:2252cb17-b5ee-429b-a003-51157e16f74a').toString('base64')

const headers = {
  'Authorization': auth,
  'Content-Type': 'application/json'
}

console.log(JSON.stringify(headers))

class Api {
  async delete() {
    const [{statusCode}, data] = await requestAsync({
      url: `https://api-test.kobiton.com/v1/sessions/${SESSION_ID}`,
      json: true,
      method: 'DELETE',
      headers: headers
    })

    console.log(`statuscode = ${statusCode}, ${JSON.stringify(data)}`)
  }

  async update() {
    const [{statusCode}, data] = await requestAsync({
      url: `https://api-test.kobiton.com/v1/sessions/${SESSION_ID}`,
      json: true,
      method: 'PUT',
      body: {state: `${STATE}`}, // "PASSED | FAILED | COMPLETE"
      headers: headers
    })

    console.log(`statuscode = ${statusCode}, ${JSON.stringify(data)}`)
  }

  async getDeviceList() {
    const [{statusCode}, data] = await requestAsync({
      url: `https://api-test.kobiton.com/v1/devices`,
      json: true,
      method: 'GET',
      headers: headers
    })

    console.log(`statuscode = ${statusCode}, ${JSON.stringify(data)}`)
  }
}

new Api().delete()
