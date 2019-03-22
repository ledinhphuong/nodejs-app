import '@babel/polyfill'

async function main() {
  await _main()

  console.log('main: Hello world')
}

async function _main() {
  console.log('_main: asyn-await')
}

main()
