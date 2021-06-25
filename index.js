const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()


const app = express()




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4sklc.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

console.log(uri);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('reviews'));
app.use(fileUpload());


const port = 5000

app.get('/', (req, res) => {
    res.send('Hello Inner-Interior Design!')
})


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const servicesCollection = client.db("interiorDesign").collection("services");
    const reviewsCollection = client.db("interiorDesign").collection("reviews");


    app.get('/services', (req, res) => {
        servicesCollection.find({})
            .toArray((err, items) => {
                res.send(items);
            })
    })

    app.get('/service/:id', (req, res) => {
        servicesCollection.find({ _id: ObjectId(req.params.id) })
            .toArray((err, items) => {
                res.send(items[0]);
            })
    })
    
    app.post('/addService', (req, res) => {
        const newService = req.body;
        console.log('adding new services', newService)
        servicesCollection.insertOne(newService)
        .then(result => {
            console.log(result.insertedCount)
            res.send(result.insertedCount > 0)
        })
    })

    app.get('/testimonial', (req, res) => {
        reviewsCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.post('/review', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const designation = req.body.designation;
        const description = req.body.description;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };
        reviewsCollection.insertOne({name, designation, description, image })
        .then(result =>{
            res.send(result.insertedCount > 0)
        })
    })

});

app.listen(process.env.PORT || port)