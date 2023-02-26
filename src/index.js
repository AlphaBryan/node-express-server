// import 'dotenv/config';
// import cors from 'cors';
// import express from 'express';
require('dotenv').config();
const express = require('express'); // if you use this syntax you don't need to install babel to transpile the code to es5
const cors = require('cors'); // if you use this syntax you don't need to install babel to transpile the code to es5
const stripe = require('stripe')('sk_test_51Mfg6GGApzwnePEL5VH7uWf25NDVAoAsdknoJsP7CjpEWhkE31zjaxcDdWvMsvmzIW9oPRCcN7MAY2ZaxXXXsnEM00SsmJs4nz');

const app = express();
const publishableKey = 'pk_live_51Mfg6GGApzwnePELJPaF4akailNU8KL0ptiKgmlpkLx52lutqfuNlWfg27sVikqluIjFhvEUMmJqGx9I2jJTdkt5003MFchrNz'
app.use(cors());

app.get('/config', (req, res) => {
  res.send({
    publishableKey: publishableKey,
  });
});

app.post('/pay', async (req, res) => {
  console.log('Request');
  const value = 100;
  const customers = await stripe.customers.list();
  const customer = customers.data[0];

  if (!customer) {
    await stripe.customers.create({
      email: 'opus@gmail.com',
      name: 'Opus',
      phone: '1234567890',
    });
    console.log('No customer, create customer')
    return res.send({ error: 'No customer, create customer' })
  }

  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: '2020-08-27' },
  );

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: value * 100,
      currency: 'usd',
      customer: customer.id,
      // shipping
      description: 'Software development services',
      payment_method_types: ['card'],

    });
    res.send({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: 'Server error',
    });

  }
});


app.get('/', (req, res) => res.send('Hello World!'));

app.listen(process.env.PORT, () =>
  console.log(`Example app listening on port ${process.env.PORT}!`),
);
