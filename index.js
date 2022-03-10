const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const admin = require('firebase-admin');
const port = process.env.PORT || 5000;
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const serviceAccount = require('./autoexpress2-c0800-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ksj3s.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// console.

// async function verifyToken(req, res, next) {
//   if (req.headers?.authorization?.startsWith('Bearer ')) {
//     const token = req.headers.authorization.split(' ')[1];

//     try {
//       const decodedUser = await admin.auth().verifyIdToken(token);
//       req.decodedEmail = decodedUser.email;
//     } catch {}
//   }
//   next();
// }
async function run() {
  try {
    await client.connect();
    const database = client.db('carcollection');
    console.log('database connected successfully');
    const OurCollection = database.collection('carcollection');
    const bookingsCollection = database.collection('bookings');
    const adminCollection = database.collection('admin');
    const clientFeedbackCollection = database.collection('clientFeedback');

    console.log('collection connected successfully');
    app.get('/carcollection', async (req, res) => {
      const cursor = OurCollection.find({});
      // const count = await count.count();
      const carcollection = await cursor.toArray();
      res.send(carcollection);
    });
    //post api
    app.post('/carcollection', async (req, res) => {
      const carcollection = req.body;
      console.log('hit the post api', carcollection);
      const result = await OurCollection.insertOne(carcollection);
      console.log(result);
      res.send('post hitted');
    });
    // sending client feedback to db
    app.post('/sendClientFeedback', (req, res) => {
      const { img, name, designationAndCompanyName, feedback } = req.body;
      clientFeedbackCollection
        .insertOne({ img, name, designationAndCompanyName, feedback })
        .then(() => {
          res.end();
        });
    });

    // get client feedback to db
    app.get('/getClientFeedback', (req, res) => {
      console.log('hello');
      clientFeedbackCollection.find({}).toArray((error, documents) => {
        res.send(documents);
      });
    });

    // Add admin data in db
    app.post('/addAdmin', (req, res) => {
      const { email } = req.body;
      adminCollection.insertOne({ email }).then(() => {
        console.log('hello');
        res.end();
      });
    });

    // Add admin data in db
    app.get('/getAdminInfo', (req, res) => {
      adminCollection
        .find({ email: req.query.email })
        .toArray((error, documents) => {
          res.send(documents);
        });
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening at ${port}`);
});
