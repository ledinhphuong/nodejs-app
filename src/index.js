//import '@babel/polyfill'
import API from './api'
import GenJWTToken from './gen-jwt-token'

async function main() {
  await _main()

  // local
  // generate script for v1
  // Result will be saved in RevistPlans.testScriptGenerationInfo
  // await API.generateElementSelector(277)
  // generate script for v2
  // Remove value in TestCaseVersions.testScriptData
  // manual 422, appium script 423
  await API.generateElementSelectorV2('01898c79-df97-21ca-03ac-253beea05a5d')

  // test env
  // await API.generateElementSelector(78725)
  // await API.generateElementSelectorV2('01896dab-7c61-f91b-da07-044acad566d4')

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
