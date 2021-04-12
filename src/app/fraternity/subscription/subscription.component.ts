import { Component, OnInit } from '@angular/core';
/**** NEW TS ***/
import * as firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { environment } from '../../../environments/environment';
import { loadStripe } from '@stripe/stripe-js';


@Component({
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent implements OnInit {

  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFirestore,
  ) {}
  
  /**** NEW TYPESCRIPT ****/
  STRIPE_PUBLISHABLE_KEY = (environment.stripe_key);
  taxRates = (environment.stripe_tax);
  firebaseConfig = (environment.firebase);
  functionLocation = (environment.location);
  
  
  ngOnInit() {  /*
    // **** Data listeners *****
    // get your products
    
    async function startDataListeners() { // function startDataListeners() {
      const products = document.querySelector('.products');
      const template = document.querySelector('#product');
      this.db.collection('products').where('active', '==', true)
      // this.db.collection('products', ref => ref.where('active', '==', true))
      .get()
      
      .then(function (querySnapshot) {
        querySnapshot.forEach(async function (doc) {
          const priceSnap = await doc.ref.collection('prices').orderBy('unit_amount').get();
          if (!'content' in document.createElement('template')) {
            console.error('Your browser doesn’t support HTML template elements.');
            return;
          }
          const product = doc.data();
          const container = template.content.cloneNode(true);

          container.querySelector('h2').innerText = product.name.toUpperCase();
          container.querySelector('.description').innerText = product.description?.toUpperCase() || '';
          // Prices dropdown
          priceSnap.docs.forEach((doc) => {
            const priceId = doc.id;
            const priceData = doc.data();
            const content = document.createTextNode(
              `${new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: priceData.currency,
              })} per ${ // }).format((priceData.unit_amount / 100).toFixed(2))} per ${
                priceData.interval
              }`
            );
            const option = document.createElement('option');
            option.value = priceId;
            option.appendChild(content);
            container.querySelector('#price').appendChild(option);
          });

          if (product.images.length) {
            const img = container.querySelector('img');
            img.src = product.images[0];
            img.alt = product.name;
          }

          const form = container.querySelector('form');
          form.addEventListener('submit', subscribe);

          products.appendChild(container);
        });
      });
      
      .then(function (querySnapshot) {
        querySnapshot.forEach(async function (doc) {
          console.log(doc.id, ' => ', doc.data());
          const priceSnap = await doc.ref.collection('prices').get();
          priceSnap.docs.forEach((doc) => {
            console.log(doc.id, ' => ', doc.data());
          });
        });
      });
      
      // Get all subscriptions for the customer
      const user = await this.afAuth.auth.currentUser;
      this.db.collection('customers')
        .doc(user) //.doc(currentUser)
        .collection('subscriptions')
        .where('status', 'in', ['trialing', 'active'])
        .onSnapshot(async (snapshot) => {
          if (snapshot.empty) {
            // Show products
            document.querySelector('#subscribe').style.display = 'block';
            return;
          }
          document.querySelector('#subscribe').style.display = 'none';
          document.querySelector('#my-subscription').style.display = 'block';
          // In this implementation we only expect one Subscription to exist
          const subscription = snapshot.docs[0].data();
          const priceData = (await subscription.price.get()).data();
          document.querySelector(
            '#my-subscription p'
          ).textContent = `You are paying ${new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: priceData.currency,
          }).format((priceData.unit_amount / 100).toFixed(2))} per ${
            priceData.interval
          }, giving you the role: ${await getCustomClaimRole()}. 🥳`;
        });
        
    } 

    
    // ***** Event listeners ******
    // Signout button
    
    document.getElementById('signout')
    .addEventListener('click', () => firebase.auth().signOut());
    
    // Checkout handler
    async function subscribe(event) {
      event.preventDefault();
      document.querySelectorAll('button').forEach((b) => (b.disabled = true));
      const formData = new FormData(event.target);
      //const user = await this.afAuth.auth.currentUser;
      const docRef = await this.db
      .collection('customers')
      .doc(this.afAuth.auth.currentUser) //.doc(user)   .doc(currentUser)

      .collection('checkout_sessions')
      .add({
        price: formData.get('price'),
        allow_promotion_codes: true,
        tax_rates: this.taxRates, // tax_rates: taxRates,
        success_url: window.location.origin,
        cancel_url: window.location.origin,
        metadata: {
          tax_rate: '10% sales tax exclusive',
        },
      });
      // Wait for the CheckoutSession to get attached by the extension
      docRef.onSnapshot(async (snap) => {
        const { error, sessionId } = snap.data();
        if (error) {
          // Show an error to your customer and then inspect your function logs.
          alert(`An error occured: ${error.message}`);
          document.querySelectorAll('button').forEach((b) => (b.disabled = false));
        }
        if (sessionId) {
          // We have a session, let's redirect to Checkout
          // Init Stripe
          const stripe = await loadStripe(this.STRIPE_PUBLISHABLE_KEY); // const stripe = Stripe(this.STRIPE_PUBLISHABLE_KEY);
          await stripe.redirectToCheckout({ sessionId }); // stripe.redirectToCheckout({ sessionId });
        }
      });
    }
    
    // Billing portal handler
    document.querySelector('#billing-portal-button')
      .addEventListener('click', async (event) => {
        document.querySelectorAll('button').forEach((b) => (b.disabled = true));
        // Call billing portal function
        const functionRef = firebase
          .app()
          .functions(this.functionLocation)
          .httpsCallable('ext-firestore-stripe-subscriptions-createPortalLink');
        const { data } = await functionRef({ returnUrl: window.location.origin });
        window.location.assign(data.url);
        console.log('billing portal button works!')
      });
    
    // Get custom claim role helper
    async function getCustomClaimRole() {
      await firebase.auth().currentUser.getIdToken(true);
      const decodedToken = await firebase.auth().currentUser.getIdTokenResult();
      return decodedToken.claims.stripeRole;
    }*/
  }
}