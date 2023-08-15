import routes from './routes'
import express from 'express'
import cors from 'cors'
import databaseServices from './services/database.services'
import { defaultError } from './middleware/errors.middlewares'

const app = express()
const port = 4000

const corsOptions = {
  origin: `http://localhost:${process.env.FRONT_END_PORT}`,
  credentials: true,
  optionSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.json())

app.listen(port, () => {
  console.log(`Server is running in port ${port}`)
})

//connect database
databaseServices.connect()

Object.values(routes).forEach((route) => {
  app.use(route)
})

app.use(defaultError)
