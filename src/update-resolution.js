import BPromise from 'bluebird'
import get from 'lodash/get'
import {db} from '@kobiton/core-service'

async function main() {
  const executions = await db.AutomatedExecutionSession.findAll({
    where: {
      deviceConfiguration: {
        platformName: 'IOS',
        resolution: null
      }
    },
    include: [
      {
        model: db.Session,
        as: 'execution',
        include: [{
          model: db.Device
        }]
      }
    ]
  })

  let index = 0
  await BPromise.map(executions, async (rawExecution) => {
    const execution = rawExecution.toJSON()
    const resolution = get(execution, 'execution.Device.capabilities.resolution')
    let {deviceConfiguration} = execution

    if (deviceConfiguration && resolution) {
      deviceConfiguration = {
        ...deviceConfiguration,
        resolution
      }

      console.log(`${++index} deviceConfiguration: ${JSON.stringify(deviceConfiguration)}`)
      await db.AutomatedExecutionSession.update(
        {deviceConfiguration},
        {where: {id: execution.id}}
      )
    }
  })
}

main()
