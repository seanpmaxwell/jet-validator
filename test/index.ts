/**
 * Test server file.
 */

import express, { Request as Req, Response as Res } from 'express';

import jetValidator from '../lib/jet-validator';


// **** Variables **** //

const PORT = 3024,
  SERVER_MSG = `Express server started on port: "${PORT}"`;

const app = express(),
  validate = jetValidator();


// **** Middleware **** //

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// **** Routes **** //

app.get('/', (_: Req, res: Res) => {
  return res.status(200).send(SERVER_MSG);
});

// Test "req.body.user" is an object, and req.params.id is a number.
app.post(
  '/example-1/:id',
  validate('email', ['user', 'object'], ['id', 'number', 'params']),
  (_: Req, res: Res) => {
    console.log('"/example-1" called');
    return res.status(200).end();
  }
);

// Test req.body.password is a string.
app.post('/example-2', validate('password'), (_: Req, res: Res) => {
  console.log('"/example-2" called');
  return res.status(200).end();
});


// **** Start server **** //

app.listen(PORT, () => console.log(SERVER_MSG));
