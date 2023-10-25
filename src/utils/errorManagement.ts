export interface ServiceResponseT<T> {
  statusCode: number
  body: T
  functionName: string
}
interface errorT {
  message: string
  stack: string
  origin: string
  entry: string
  errorMessageKey: string
  userMessage: string
}
const parseError = (error: any): errorT => {
  try {
    return JSON.parse(error.message)
  } catch (e) {
    return error
  }
}
export const handleError = (error: any, errorMessageKey: string = 'UNDEFINED_ERR', functionName?: string, userLanguage: string = 'en'): Error => {
  error = parseError(error)
  const userMessage = (error.userMessage !== undefined)
    ? error.userMessage
    : ((TS_STRING[error.message] ?? TS_STRING[errorMessageKey]) !== undefined)
        ? ((TS_STRING as any)[error.message] ?? (TS_STRING as any)[errorMessageKey])[userLanguage]
        : ''

  for (const key of Object.keys(errorKeys)) {
    if ((errorKeys as any)[key] === error.message) {
      errorMessageKey = error.message
      break
    }
  }

  const errorObj = {
    message: error.message ?? error,
    stack: error.stack,
    origin: error.origin ?? functionName,
    entry: functionName,
    errorMessageKey,
    ...(userMessage !== undefined && { userMessage })
  }

  if (process.env.SILENT_MODE === undefined || process.env.SILENT_MODE === '0') {
    console.log(JSON.stringify(errorObj))
  }
  if (process.env.RUNNING_MODE === 'production') {
    delete errorObj.stack
    delete errorObj.origin
    delete errorObj.entry
  }
  const errorFormatted = JSON.stringify(errorObj)

  return new Error(errorFormatted)
}
export const errorKeys = {
  UNDEFINED_ERROR: 'UNDEFINED_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  HEALTH_CHECK_ERROR: 'HEALTH_CHECK_ERROR',
  POSTGRES_CONNECTION_ERROR: 'POSTGRES_CONNECTION_ERROR',
  ENTITY_NOT_FOUND: 'ENTITY_NOT_FOUND',
  QUERY_ERROR: 'QUERY_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DELETE_ERROR: 'DELETE_ERROR',
  CREATE_ERROR: 'CREATE_ERROR'
}
const TS_STRING: Record<string, { en: string }> = {
  [errorKeys.CREATE_ERROR]: {
    en: 'CREATE_ERROR'
  },
  [errorKeys.DELETE_ERROR]: {
    en: 'DELETE_ERROR'
  },
  [errorKeys.NOT_FOUND]: {
    en: 'NOT_FOUND'
  },
  [errorKeys.ENTITY_NOT_FOUND]: {
    en: 'ENTITY_NOT_FOUND'
  },
  [errorKeys.QUERY_ERROR]: {
    en: 'QUERY_ERROR'
  },
  [errorKeys.UNDEFINED_ERROR]: {
    en: 'UNDEFINED_ERROR'
  },
  [errorKeys.HEALTH_CHECK_ERROR]: {
    en: 'HEALTH_CHECK_ERROR'
  },
  [errorKeys.POSTGRES_CONNECTION_ERROR]: {
    en: 'POSTGRES_CONNECTION_ERROR'
  },
  [errorKeys.AUTH_ERROR]: {
    en: 'AUTH_ERROR'
  }
}