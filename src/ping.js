import BPromise from 'bluebird'
import ping from "net-ping"

const URL = process.env.URL || 'www.google.com'

function main() {
  const session = ping.createSession()

  session.pingHost(URL, function (error, target) {
    if (error) {
      console.log (target + ": " + error.toString ())
    }
    else {
      console.log (target + ": Alive")
    }
  })
}

main()
