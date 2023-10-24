type TypeChecker = (value: any) => boolean

export type Validator<T> = {
  [K in keyof T]: {
    type: keyof TypeCheckers | 'array'
    itemType?: Validator<any>
    optional?: boolean
  }
}

interface TypeCheckers {
  string: TypeChecker
  number: TypeChecker
  boolean: TypeChecker
  undefined: TypeChecker
  null: TypeChecker
  object: TypeChecker
  any: TypeChecker
}

const typeCheckers: TypeCheckers = {
  string: (value): boolean => typeof value === 'string',
  number: (value): boolean => typeof value === 'number',
  boolean: (value): boolean => typeof value === 'boolean',
  undefined: (value): boolean => typeof value === 'undefined',
  null: (value): boolean => value === null,
  object: (value): boolean => typeof value === 'object' && value !== null,
  any: (_value): boolean => true
}

interface ValidationError {
  field: string
  expectedType: string
  actualType: string
}

export const validateRequestBody = <T>(body: any, validator: Validator<T>): ValidationError[] => {
  const errors: ValidationError[] = []

  for (const [key, configUnknown] of Object.entries(validator)) {
    const config = configUnknown as { type: keyof TypeCheckers | 'array', optional?: boolean, itemType?: Validator<any> }
    const value = body[key]

    if (value === undefined && (config.optional !== undefined && config.optional)) {
      continue
    }

    if (config.type === 'array') {
      if (!Array.isArray(value)) {
        errors.push({
          field: key,
          expectedType: 'array',
          actualType: typeof value
        })
        continue
      }

      const itemErrors = value
        .map((item: any, index: number) => validateRequestBody(item, config.itemType as Validator<any>))
        .flat()
        .map((err: ValidationError, index: number) => ({ ...err, field: `${key}[${index}].${err.field}` }))

      errors.push(...itemErrors)
      continue
    }

    if (typeof typeCheckers[config.type] !== 'function') {
      console.warn(`Warning: Unknown type ${config.type}`)
      continue
    }

    if (!typeCheckers[config.type](value)) {
      errors.push({
        field: key,
        expectedType: config.type,
        actualType: typeof value
      })
    }
  }

  return errors
}

export const isBodyValid = (body: any, bodyTypeValidator: any): ValidationError[] => {
  const errors = validateRequestBody(body, bodyTypeValidator)
  return errors
}
