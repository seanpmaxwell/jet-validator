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

// Test "res.body.email" is a string
app.post('/test-string-on-body', validate('email'), (_: Req, res: Res) => {
  console.log('"/test-string-on-body" called');
  return res.status(200).end();
});


// **** Start server **** //

app.listen(PORT, () => console.log(SERVER_MSG));
