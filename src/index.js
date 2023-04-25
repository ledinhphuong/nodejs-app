//import '@babel/polyfill'
import API from './api'
import GenJWTToken from './gen-jwt-token'

async function main() {
  await _main()

  await API.generateElementSelector(26)

  // OTP:
  // await API.bookOTPPhoneNumber()
  // const phoneNo = '+14707989671'
  // await API.getOTPToken(phoneNo)
  // await API.unbookOTPPhoneNumber(phoneNo)

  // await API.deviceBundles()
  // await API.getDevices()

  //const jwt = await GenJWTToken.gen()
  //console.log(`JWT: ${jwt}`)

  console.log('main: Hello world')
}

async function _main() {
  console.log('_main: asyn-await')
}

main()
  .then(() => console.log('Done.'))
  .catch((err) => console.log(err))
