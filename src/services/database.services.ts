import { Collection, Db, MongoClient, ServerApiVersion } from 'mongodb'
import 'dotenv/config'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'

const uri: string = process.env.MONGODB_URI || ''
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
class DatabaseServices {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    })
    this.db = this.client.db(process.env.DATABASE_NAME)
  }
  async connect() {
    try {
      // connect with mongo atlas (optional)
      await this.client.connect()
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      console.log(`Connect successful with mongo atlas at database name : ${process.env.DATABASE_NAME}`)
    } catch (error) {
      console.log(`Error connecting : ${error}`)
    }
  }

  //getter call users collection in Mongo
  get users(): Collection<User> {
    return this.db.collection('users')
  }
  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection('refresh_tokens')
  }
}

// tao database service
const databaseServices = new DatabaseServices()

export default databaseServices
