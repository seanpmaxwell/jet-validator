/**
 * Test server file.
 */

import express, { Request, Response } from 'express';

import jetValidator from '../lib/jet-validator';


// **** Variables **** //

const PORT = 3024,
  SERVER_MSG = `Express server started on port: "${PORT}"`;

const app = express(),
  validate = jetValidator();


// **** Middleware **** //

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// **** Some shared functions **** //

/**
 * Get express route handler
 */
const getHandler = (msg: string) => {
  return (_: Request, res: Response) => 
    res.status(200).send(msg);
};

/**
 * Test if object is a user.
 */
const isInstanceOfUser = (user: unknown) => {
  return (
    !!user &&
    typeof user === 'object' &&
    'id' in user &&
    'name' in user
  );
};


// **** Routes **** //

// Base route
app.get('/', getHandler(SERVER_MSG));

// Test "req.body.user" is an object, and req.params.id is a number.
app.post(
  '/example-1/:id',
  validate('email', ['user', 'object'], ['id', 'number', 'params']),
  getHandler('example 1 called'),
);

// Test "req.body.password" is a string.
app.post(
  '/example-2',
  validate('password'),
  getHandler('example 2 called'),
);

// Test "req.body.isAdmin" is a string.
app.post(
  '/example-3',
  validate(['isAdmin', 'boolean']),
  getHandler('example 3 called'),
);

// Test "req.body.user" satisfies the "isInstanceOfUser" function.
app.post(
  '/example-4',
  validate(['user', isInstanceOfUser]),
  getHandler('example 4 called'),
);

// Test "req.body.email" satisfies the email function.
app.post(
  '/example-5',
  validate(['email']),
  getHandler('example 5 called'),
);

// Test "req.params.id" satisfies the id function.
app.get(
  '/example-6/:id',
  validate(['id', 'number', 'params']),
  getHandler('example 6 called'),
);


// **** Start server **** //

app.listen(PORT, () => console.log(SERVER_MSG));
