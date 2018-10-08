import path from 'path'

import createExamples from '@meltwater/examplr'

import get from './get'
import post from './post'
import metrics from './metrics'

export const examples = {
  metrics,
  get,
  post
}

const envVars = [
  'LOG_LEVEL',
  'LOG_FILTER',
  'LOG_OUTPUT_MODE'
]

const defaultOptions = {
  baseUrl: 'https://httpbin.org'
}

if (require.main === module) {
  const { runExample } = createExamples({
    examples,
    envVars,
    defaultOptions
  })

  runExample({
    local: path.resolve(__dirname, 'local.json')
  })
}
