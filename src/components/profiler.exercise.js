import * as React from 'react'
import {client} from 'utils/api-client'

let queue = []

setInterval(sendProfileQueue, 5000)

function sendProfileQueue() {
  if (!queue.length) {
    return Promise.resolve({success: true})
  }
  const queueToSend = [...queue]
  queue = []
  return client('profile', {data: queueToSend})
}

function Profiler({metadata, phases, ...props}) {
  function reportProfile(
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
    interactions,
  ) {
    if (!phases || phases.includes(phase)) {
      queue.push({
        metadata,
        id,
        phase,
        actualDuration,
        baseDuration,
        startTime,
        commitTime,
        interactions: [...interactions],
      })
    }
  }
  return <React.Profiler onRender={reportProfile} {...props} />
}

export {Profiler}
export {unstable_trace as trace, unstable_wrap as wrap} from 'scheduler/tracing'
