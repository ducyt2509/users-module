import { NextFunction, Response, Request } from 'express'

export const defaultError = (err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.statusCode || 500).json(err)
}
