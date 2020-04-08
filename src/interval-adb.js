
import BPromise from 'bluebird'
import path from 'path'

import {exec, spawn} from 'child_process'
const execAsync = BPromise.promisify(exec, { multiArgs: true })

const INTERVAL = process.env.INTERVAL || 10000

function runADBComment(command) {
  return execAsync(`adb ${command}`)
}

async function keepADBServerAlive() {
  try {
    // Auto start adb server if it is stopped
    const output = await runADBComment('devices -l')
    output && console.log(`${new Date().toISOString()}: ${output[0]}`)

    setInterval(() => keepADBServerAlive(), INTERVAL)
  }
  catch(err) {
    console.log(err)
  }
}


keepADBServerAlive()
