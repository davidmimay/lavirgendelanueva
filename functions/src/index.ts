// **** SOURCE: https://firebase.google.com/docs/use-cases/payments ****
'use strict';

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

const { Logging } = require('@google-cloud/logging');
const logging = new Logging({ projectId: process.env.GCLOUD_PROJECT });

// const { Stripe } = require('stripe');
import Stripe from 'stripe';
const stripe = new Stripe(functions.config().stripe.secret, {
  apiVersion: '2020-08-27',
});

/*** new ESPECIFY REGION *** */
const REGION = functions.region('europe-west2');


/**
 * When a user is created, create a Stripe customer object for them.
 *
 * @see https://stripe.com/docs/payments/save-and-reuse#web-create-customer
 */
exports.createStripeCustomer = REGION.auth.user().onCreate(async (user) => { //exports.createStripeCustomer = functions.auth.user().onCreate(async (user) => {
  const customer = await stripe.customers.create({ email: user.email });
  const intent = await stripe.setupIntents.create({
    customer: customer.id,
  });
  await admin.firestore().collection('stripe_customers').doc(user.uid).set({
    customer_id: customer.id,
    setup_secret: intent.client_secret,
  });
  return;
});

/**
 * When adding the payment method ID on the client,
 * this function is triggered to retrieve the payment method details.
 */
exports.addPaymentMethodDetails = REGION.firestore //exports.addPaymentMethodDetails = functions.firestore
  .document('/stripe_customers/{userId}/payment_methods/{pushId}')
  .onCreate(async (snap, context) => {
    try {
      const paymentMethodId = snap.data().id;
      const paymentMethod = await stripe.paymentMethods.retrieve(
        paymentMethodId
      );
      await snap.ref.set(paymentMethod);
      // Create a new SetupIntent so the customer can add a new method next time.
      const intent = await stripe.setupIntents.create({
        customer: `${paymentMethod.customer}`,
      });
      await snap.ref.parent.parent.set(
        {
          setup_secret: intent.client_secret,
        },
        { merge: true }
      );
      return;
    } catch (error) {
      await snap.ref.set({ error: userFacingMessage(error) }, { merge: true });
      await reportError(error, { user: context.params.userId });
    }
  });

/**
 * When a payment document is written on the client,
 * this function is triggered to create the payment in Stripe.
 *
 * @see https://stripe.com/docs/payments/save-and-reuse#web-create-payment-intent-off-session
 */

// [START chargecustomer]
exports.createStripePayment = REGION.firestore
//exports.createStripePayment = functions.firestore
  .document('stripe_customers/{userId}/payments/{pushId}')
  .onCreate(async (snap, context) => {
    const { amount, currency, payment_method } = snap.data();
    try {
      // Look up the Stripe customer id.
      const customer = (await snap.ref.parent.parent.get()).data().customer_id;
      // Create a charge using the pushId as the idempotency key
      // to protect against double charges.
      const idempotencyKey = context.params.pushId;
      const payment = await stripe.paymentIntents.create(
        {
          amount,
          currency,
          customer,
          payment_method,
          off_session: false,
          confirm: true,
          confirmation_method: 'manual',
        },
        { idempotencyKey }
      );
      // If the result is successful, write it back to the database.
      await snap.ref.set(payment);
    } catch (error) {
      // We want to capture errors and render them in a user-friendly way, while
      // still logging an exception with StackDriver
      console.log(error);
      await snap.ref.set({ error: userFacingMessage(error) }, { merge: true });
      await reportError(error, { user: context.params.userId });
    }
  });

// [END chargecustomer]

/**
 * When 3D Secure is performed, we need to reconfirm the payment
 * after authentication has been performed.
 *
 * @see https://stripe.com/docs/payments/accept-a-payment-synchronously#web-confirm-payment
 */
exports.confirmStripePayment = REGION.firestore
// exports.confirmStripePayment = functions.firestore
  .document('stripe_customers/{userId}/payments/{pushId}')
  .onUpdate(async (change, context) => {
    if (change.after.data().status === 'requires_confirmation') {
      const payment = await stripe.paymentIntents.confirm(
        change.after.data().id
      );
      change.after.ref.set(payment);
    }
  });

/**
 * When a user deletes their account, clean up after them
 */
exports.cleanupUser = REGION.auth.user().onDelete(async (user) => {
//exports.cleanupUser = functions.auth.user().onDelete(async (user) => {
  const dbRef = admin.firestore().collection('stripe_customers');
  const customer = (await dbRef.doc(user.uid).get()).data();
  await stripe.customers.del(customer.customer_id);
  // Delete the customers payments & payment methods in firestore.
  const snapshot = await dbRef
    .doc(user.uid)
    .collection('payment_methods')
    .get();
  snapshot.forEach((snap) => snap.ref.delete());
  await dbRef.doc(user.uid).delete();
  return;
});

/**
 * To keep on top of errors, we should raise a verbose error report with Stackdriver rather
 * than simply relying on console.error. This will calculate users affected + send you email
 * alerts, if you've opted into receiving them.
 */

// [START reporterror]

function reportError(err, context = {}) {
  // This is the name of the StackDriver log stream that will receive the log
  // entry. This name can be any valid log stream name, but must contain "err"
  // in order for the error to be picked up by StackDriver Error Reporting.
  const logName = 'errors';
  const log = logging.log(logName);

  // https://cloud.google.com/logging/docs/api/ref_v2beta1/rest/v2beta1/MonitoredResource
  const metadata = {
    resource: {
      type: 'cloud_function',
      labels: { function_name: process.env.FUNCTION_NAME },
    },
  };

  // https://cloud.google.com/error-reporting/reference/rest/v1beta1/ErrorEvent
  const errorEvent = {
    message: err.stack,
    serviceContext: {
      service: process.env.FUNCTION_NAME,
      resourceType: 'cloud_function',
    },
    context: context,
  };

  // Write the error log entry
  return new Promise((resolve, reject) => {
    log.write(log.entry(metadata, errorEvent), (error) => {
      if (error) {
        return reject(error);
      }
      return resolve();
    });
  });
}

// [END reporterror]

/**
 * Sanitize the error message for the user.
 */
function userFacingMessage(error) {
  return error.type
    ? error.message
    : 'An error occurred, developers have been alerted';
}

// ***** CAP AND BILLING NOTIFICATION ***
// ***** https://youtu.be/NWrZwXK92IM?list=PLl-K7zZEsYLmK1tiMBeKA0iDMPDCJKM-5
// ***** https://cloud.google.com/billing/docs/how-to/notify#cap_disable_billing_to_stop_usage

import {google} from 'googleapis';
import {GoogleAuth} from 'google-auth-library';
import util = require ('util');
const billing = google.cloudbilling('v1').projects;
const PROJECT_ID = process.env.GCLOUD_PROJECT;
const PROJECT_NAME = `projects/${PROJECT_ID}`;

interface PubSubData {
  readonly costAmount: number;
  readonly costIntervalStart: string;
  readonly budgetAmount: number;
  readonly lastReportedBillingStart: string;
}

// get billing info to cap
exports.getBillingInfo = REGION.https.onRequest(async (request, response) => {
  setCredentialsForBilling();
  console.log(`here is your environment variables: ${util.inspect(process.env)}`);
  // log billing info
  // const billingInfo = await billing.getBillingInfo({name: PROJECT_NAME});
  // console.log(`What I have from billin is ${util.inspect(billingInfo)}`); 
  response.send('All done! check your logs.'); 
})
// disable billing
async function disableBillingForReal() {
  setCredentialsForBilling();
  if (PROJECT_NAME) {
    const billingInfo = await billing.getBillingInfo({name: PROJECT_NAME});
    if (billingInfo.data.billingEnabled) {
      const result = await billing.updateBillingInfo({
        name: PROJECT_NAME,
        requestBody: {billingAccountName: ''},// Disable billing
      });
      console.log(`You auto-disable billing for ${PROJECT_NAME}`);
      console.log(util.inspect(result));
    } else {
      console.log(`You already disable billing`);
    }
  }
}

function setCredentialsForBilling() {
  const client = new GoogleAuth({
    scopes: [
      'https://www.googleapis.com/auth/cloud-billing',
      'https://www.googleapis.com/auth/cloud-platform',
    ],
  });
  // Set credential globally for all requests
  google.options({
    auth: client,
  });
}

exports.receiveBillingNotice = REGION.pubsub.topic('billing').onPublish((message) => {
  try {
    const data = message.json as PubSubData
    handlePubSub(data);
  } catch (error) {
    console.error(`Couldn't parse JSON message! ${error}`);
  }
  return null;
})

async function handlePubSub(pubSubData: PubSubData) {
  console.log('Received pubsub notification');
  console.log(pubSubData);
  // grab the most recent recorded cost
  const billingInfoDoc = await admin.firestore().doc('/private/billing_info').get(); // const billingInfoDoc = await firestore.doc('/private/billing_info').get();
  const spentSoFar = pubSubData.costAmount;
  const billingAlertIncrement = 0.01;

  if (billingInfoDoc.exists) {
    const previousBillingInfo = billingInfoDoc.data();
    console.log(`You have spend ${spentSoFar.toFixed(2)}€ compared to ${previousBillingInfo.lastReportedCost}€ of ${pubSubData.budgetAmount}€ budget`)
    if (spentSoFar - previousBillingInfo.lastReportedCost >= billingAlertIncrement) {
      console.log('Updated last reported cost and date');
      admin.firestore().doc('/private/billing_info').set({// firestore().doc('/private/billing_info').set({ lastReportedCost: spentSoFar });
        lastReportedCost: spentSoFar,
        lastReportedBillingStart: new Date(pubSubData.costIntervalStart),// lastReportedBillingStart: new Date(pubSubData.costIntervalStart),
      }); 
    } else if (isNewBillingCycle(pubSubData, previousBillingInfo)) {
      console.log(`New billing cycle, you have spent: ${spentSoFar.toFixed(2)}€`);
    }
    // dollars/hour to freak out
    const dollarsPerHourToFreakOut = pubSubData.budgetAmount / 30; // budget/30 days = budget a day.
    const spendRate = calculateDollarsPerHour(pubSubData, previousBillingInfo);
    if (spendRate > dollarsPerHourToFreakOut) {
      console.log(`Careful! you are spending ${spendRate.toFixed(2)}/hour`);
    } else {
      console.log(`You are spending ${spendRate.toFixed(2)}/hour`);
    }

  } else {
    console.log(`Created new firestore document with date and last reported cost: ${spentSoFar}`);
    admin.firestore().doc('/private/billing_info').set({
      lastReportedCost: spentSoFar,
      lastReportedBillingStart: pubSubData.costIntervalStart,
      lastReportedCostTime: new Date(),
    }); //new
  }
  // freak out
  const projectedCosts = calculateProjectedCosts(pubSubData);
  const projectedCostToFreakOut = pubSubData.budgetAmount / 2;
  if (projectedCosts > projectedCostToFreakOut) {
    console.log(`Atention! you'll spent ${projectedCosts.toFixed(2)}€ more than 50% of your budget of ${pubSubData.budgetAmount.toFixed(2)}€`);
  } else {
    console.log(`you'll spent ${projectedCosts.toFixed(2)}€`);
  }
  // disable billing
  const killingProjectAmount = pubSubData.budgetAmount;
  if (spentSoFar >= killingProjectAmount) {
    await disableBillingForReal();
    console.log(`WARNING! BILLING DISABLED FOR THIS PROJECT ${PROJECT_NAME}`);
  }
}

function isNewBillingCycle(pubSubData: PubSubData, previousBillingInfo: FirebaseFirestore.DocumentData) {
  console.log(`Our cost interval start is ${pubSubData.costIntervalStart}`);
  console.log(`Our last recorder date is ${previousBillingInfo.lastReportedBillingStart.toDate()}`);
  const startOfCurrentCycle = new Date(pubSubData.costIntervalStart);
  const lastBillingCycleStartDate = previousBillingInfo.lastReportedBillingStart.toDate();
  if (startOfCurrentCycle.getTime() === lastBillingCycleStartDate.getTime()) {
    console.log('The dates are the same');
    return false;
  } else {
    console.log('The dates are different');
    return true;
  }
}

function calculateProjectedCosts(pubSubData: PubSubData) {
  // estimated cost = current cost / percentaje through cycle
  const today = new Date()
  const todayInMills = today.getTime();
  const billingCycleStart = new Date(pubSubData.costIntervalStart).getTime();
  const lastMillisecondOfCycle = new Date(today.getFullYear(), today.getMonth() + 1, 1).getTime() - 1;
  const pctThere = (todayInMills - billingCycleStart) / (lastMillisecondOfCycle - billingCycleStart);
  // percentaje through cycle = (now - begining) / (end - beginning)
  const projectedCosts = pubSubData.costAmount / pctThere;
  console.log(`You are ${pctThere.toFixed(2)}% through the current cycle, I think you'll spent ${projectedCosts.toFixed(2)}€`);
  return projectedCosts;
}

function calculateDollarsPerHour(pubSubData: PubSubData, previousBillingInfo: FirebaseFirestore.DocumentData) {
  // how much have we spent since last recorded
  const lastReportedCost = previousBillingInfo.lastReportedCost;
  const spentSoFar = pubSubData.costAmount;
  const deltaSpent = spentSoFar - lastReportedCost;
  // how much times did past
  const lastReportedCostTime = (previousBillingInfo.lastReportedCostTime).toDate();
  const today = new Date();
  const deltaTimeInSeconds = (today.getTime() - lastReportedCostTime.getTime()) / 1000; // to get seconds
  const deltaTimeInHours = deltaTimeInSeconds / 3600; 
  // amount spent / time = spent per seconds
  const dollarsPerHour = deltaSpent / deltaTimeInHours;
  console.log(`You spent ${deltaSpent.toFixed(2)}€ in ${deltaTimeInHours.toFixed(2)} hours (${dollarsPerHour.toFixed(2)}€/hour)`);
  return dollarsPerHour;
}

// DEVELOPMENT ONLY
exports.fakePubSub = REGION.https.onRequest((request, response) => {
  const isEmulated = process.env.FUNCTIONS_EMULATOR;
  if (!isEmulated) {
    response.send("You are calling this in production");
    return;
  }
  
  const rawMessage = request.body.fakeData as string;
  console.log(`this is your raw data: ${rawMessage}`);
  try {
    const data = JSON.parse(rawMessage);
    if (data !== undefined) {
      handlePubSub(data as PubSubData);
    } else {
      console.error('Could not convert JSON');
    }
  } catch (error) {
    console.error(`Got an error! ${error}`);
  } 
  response.send('All done! check your logs!')
})


