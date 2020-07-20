//import '@babel/polyfill'
import API from './api'

async function main() {
  await _main()

  // const devices = await API.getOnlineIosDevices()
  // console.log(`Online iOS devices: ${JSON.stringify(devices)}`)

  await API.rerunRevisit()

  console.log('main: Hello world')
}

async function _main() {
  console.log('_main: asyn-await')
}

main()
  .then(() => console.log('Done.'))
  .catch((err) => console.log(err))
