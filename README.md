# Jet-Validator

> A super quick, easy to setup validation middleware function for ExpresssJS routes.
> Written in typescript ann fully typesafe :)


## Quick start

- Call the `jetValidator()` function to return the `validate()` middleware function. 
If the validation fails, validate will return a `400` error with an error message.
If you want to change the error status code, you can pass `jetValidator()` an optional parameter.

- Arguments to `validate()` must be a string or an array. If they're a string, `validate()`
will make sure they are string on `req.body`.

- Note: `json()` and `urlencoded()` middleware must be added to express.

```typescript
import express, { Request, Response } from 'express';
import jetValidator from 'jet-validator';

const app = express(),
  validate = jetValidator();

app.post(
  '/api/v1/login/local',
  validate('email', 'password'), // Will check that email and password are strings on req.body
  (req: Request, res: Response) => {
    const { email, password } = req.body;
    ...etc,
  },
);
```


## Full guide

- As mentioned in the Quick Start, `validate()` accepts a string or an array. 

- If a string, `validate()` makes sure the arguments is of type `string` on `req.body`.

- If the argument is an array the format is:
```javascript
  [
    'paramName',
    '(optional) type or validator function (default is string)', 
    '(optional) property on "express.Request" to extract the value from (default is .body')
  ]
```

- For arrays, `validate()` makes sure the parameter is of the specified type or that the parameter satifies the validator function. The validator function must return `true` or `false`.

- Sample array1: `['id', 'number', 'body']`. This will make sure `id` is of type `number` on `req.body`.
- Sample array2: `['email', isEmail]`. This will make sure `req.body.email` satifies the `isEmail` function.

- Note for numbers on `req.query` and `req.params`: number-strings which pass `!isNaN()` are still valid. But on `req.body` a number should be `typeof toCheck === "number"`.

- For booleans on `req.query` and `req.params`: boolean strings should be `"true"` or `"false"`, but on `req.body` a boolean should  `typeof toCheck === "boolean"`.


## More examples

- Example 1: `validate('email', ['user', 'object'], ['id', 'number', 'params'])` will check that `email` is a `string` in `req.body`, that `user` is of type `object` in `req.body`, and that `id` is a `number` in `req.params`.

- Example 2: `validate('password')` will check that `password` is a `string` on `req.body`.

- Example 3: `validate(['isAdmin', 'boolean'])` will check that `isAdmin` is a `boolean` on `req.body`.

- Example 4: `validate(['user', isInstanceOfUser])` will check that `req.body.user` satifies the `isInstanceOfUser()` function.

- Example 5: `validate(['email'])` will check that `email` is a string in `req.body`.

- Example 6: `validate(['id', 'number', 'params'])` will check that `id` is a number-string in `req.params`.
