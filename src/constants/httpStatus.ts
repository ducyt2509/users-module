import { Response } from 'express'

const responseWithData = (res: Response, statusCode: number, data: any) =>
  res.status(statusCode).send({
    statusCode,
    data
  })
const error = (res: Response) =>
  responseWithData(res, 500, {
    message: 'Oops! Something wrong in Server!'
  })

const ok = (res: Response, message: string) =>
  responseWithData(res, 202, {
    message
  })
const badRequest = (res: Response, message: string) =>
  responseWithData(res, 400, {
    message
  })

const unauthorized = (res: Response) =>
  responseWithData(res, 401, {
    message: 'Unauthorized'
  })

const notfound = (res: Response) =>
  responseWithData(res, 404, {
    message: 'Resource not found '
  })

export { responseWithData, error, ok, badRequest, unauthorized, notfound }
