const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()


const uri = "mongodb+srv://rent:rent@cluster0.lhe87.mongodb.net/rentdb?retryWrites=true&w=majority";
// console.log(process.env.DB_PASS, process.env.DB_USER, process.env.DB_NAME);

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());
app.use(express.static('houses'));

const port = 5000;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const houseCollection = client.db("rentdb").collection("house");
  const orderCollection = client.db("rentdb").collection("order");

  app.post('/addHouses', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const des = req.body.des;
    const newImg = file.data;
    const encImg = newImg.toString('base64')

    const image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    }
    houseCollection.insertOne({ name, des, image })
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  app.get('/showHouses', (req, res) => {
    houseCollection.find({})
      .toArray((err, houseDocument) => {
        res.send(houseDocument);
      })
  });

  app.post('/orderHouses', (req, res) => {
    const order = req.body;
    orderCollection.insertOne(order)
      .then(result => {
        res.send(result)
      })
  })

  app.get('/showOrderHouses', (req, res) => {
    orderCollection.find({ email: req.query.email })
      .toArray((err, orderDocument) => {
        res.send(orderDocument)
      })
  })

  app.get('/allOrderdHouses', (req, res) => {
    orderCollection.find({})
      .toArray((err, allOrderDocument) => {
        res.send(allOrderDocument)
      })
  })
 
});




app.get('/', (req, res) => {
  res.send('It is working')
})


app.listen(process.env.PORT || port, console.log('port listing'))