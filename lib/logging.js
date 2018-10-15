export const makeSafe = f => (...args) => {
  try {
    return f(...args)
  } catch (err) {
    return {}
  }
}

export const createChildLogger = (log, {
  name,
  method,
  url,
  resourceName,
  meta,
  logProps,
  willLogOptions,
  options
}) => {
  const allMeta = willLogOptions ? { ...options, ...meta } : meta
  const l = log.child({
    method: method.toLowerCase(),
    url,
    resourceName,
    reqName: name,
    ...logProps,
    ...(Object.keys(allMeta).length === 0 ? {} : { meta: allMeta })
  })
  return l
}

export const getLogResponseProps = data => ({})

export const getLogResponseData = data => {
  const keys = [
    'allowHalfOpen',
    'body',
    'complete',
    'domain',
    'fromCache',
    'headers',
    'httpVersion',
    'httpVersionMajor',
    'httpVersionMinor',
    'method',
    'readable',
    'requestUrl',
    'retryCount',
    'setTimeout',
    'statusCode',
    'statusMessage',
    'timings',
    'trailers',
    'upgrade',
    'url',
    'writable'
  ]
  const newData = {}
  for (const key of keys) newData[key] = data[key]
  return newData
}
