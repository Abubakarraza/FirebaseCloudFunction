const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const serviceAccount = require('./firebaseServiceKey.json');
const { v4: uuidv4 } = require('uuid');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const cors = require('cors');
const app = express();
const db = admin.firestore();
const userRef = db.collection('userData');
app.use(cors({ origin: true }));
app.get('/', (req, res) => {
  res.send('Hello How are you???');
});
app.post('/api/create', async (req, res) => {
  const uuid = uuidv4();
  try {
    const response = await userRef.doc(`/${uuid}/`).create({
      id: uuid,
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
    });
    if (response) {
      res.status(200).send({ message: 'User Created Successfully' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'Failed', msg: error });
  }
});
app.get('/api/getData', async (req, res) => {
  let data = [];
  try {
    const response = await userRef.get();
    const allData = response.docs.forEach((snapShot) => {
      data.push(snapShot.data());
      console.log(snapShot.data());
    });
    if (data.length) {
      res.status(200).send({ message: 'All User Fetched', allUser: data });
    } else {
      res.status(404).send({ message: 'Something Went Wrong' });
    }
  } catch (error) {
    res.send({ message: 'error', err: error });
    console.log('Error:', error);
  }
});
app.get('/api/singleData/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const response = await userRef.doc(id).get();
    if (response) {
      res.status(200).send({ message: 'User Find', data: response.data() });
    } else {
      res.status(404).send({ message: 'User is not Found' });
    }
  } catch (error) {
    res.send({ message: 'error', err: error });
    console.log('Error:', error);
  }
});
app.put('/api/updateUser/:id', async (req, res) => {
  try {
    const response = await userRef.doc(req.params.id).update({
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
    });
    if (response) {
      res.status(200).send({ message: 'User is updated', data: response });
    }
  } catch (error) {}
});
app.delete('/api/deleteUser/:id', async (req, res) => {
  try {
    const response = await userRef.doc(req.params.id).delete();
    if (response) {
      res.status(200).send({ message: 'User is deleted' });
    }
  } catch (error) {
    console.log(error);
  }
});
app.delete('/api/delData', async (req, res) => {
  try {
    const response = await userRef.doc().delete();
    if (response) {
      res.status(200).send({ message: 'Data is deleted' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Something Wrong' });
  }
});
exports.app = functions.https.onRequest(app);
