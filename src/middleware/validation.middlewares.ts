import express from 'express'
import { body, validationResult, ValidationChain } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'
import { EntityError, ErrorWithStatus } from '~/models/Errors'

// sequential processing, stops running validations chain if the previous one fails.
export const validate = (checkSchema: RunnableValidationChains<ValidationChain>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await checkSchema.run(req)

    //get errors from promise
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }

    const errorsObject = errors.mapped()

    const entityError = new EntityError({ errors: {} })

    for (const key in errorsObject) {
      const { msg } = errorsObject[key]
      if (msg instanceof ErrorWithStatus && msg.statusCode !== 422) {
        return next(msg)
      }
      entityError.errors[key] = errorsObject[key]
    }

    next(entityError)
  }
}
