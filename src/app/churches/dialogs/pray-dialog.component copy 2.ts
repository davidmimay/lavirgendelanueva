import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
//payment method
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-pray-dialog',
  styleUrls: ['./dialog.scss'],
  template: `
    <h1 mat-dialog-title>Pray</h1>
    <div mat-dialog-content>
    <p>What do you want?</p>
      <mat-form-field>
        <input placeholder="ask" matInput [(ngModel)]="data.ask" />
      </mat-form-field>
    </div>

    <!-- new -->    
    <div class="container mt-5">
      <h2>Stripe Checkout</h2>
      <div class="row mt-5">
        <div class="col-md-4">
          <button (click)="pay(20)" class="btn btn-primary btn-block">Pay $20</button>
        </div>  
      </div>
      <p class="mt-5">
          Try it out using the test card number <b>4242 4242 4242 4242</b>, a random three-digit CVC number, any expiration date in the future, and a random five-digit U.S. ZIP code.
      </p>
    </div>
    <!-- end new -->

    <div mat-dialog-actions>
      <button mat-button (click)="onNoClick()">Cancel</button>
      <button mat-button color="accent" cdkFocusInitial (click)="checkout()">Light</button>
      
      <!--
      <button mat-button [mat-dialog-close]="data.ask" cdkFocusInitial>
        Create
      </button>
      -->
    </div>
  `
})

export class PrayDialogComponent {
  // payment method
  title = 'angular-stripe';
  priceId = 'price_1HtuDiLQT86JpABoTu5tRGgZ';
  quantity = 1;
  stripePromise = loadStripe(environment.stripe_key);
  /***********/

  constructor(
    public dialogRef: MatDialogRef<PrayDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  // payment method 1
  async checkout() {
    // Call your backend to create the Checkout session.

    // When the customer clicks on the button, redirect them to Checkout.
    const stripe = await this.stripePromise;
    const { error } = await stripe.redirectToCheckout({
      mode: 'payment',
      lineItems: [{ price: this.priceId, quantity: this.quantity }],
      successUrl: `${environment.webapp_url}/churches`,
      cancelUrl: `${environment.webapp_url}/churches`,
    });
    // If `redirectToCheckout` fails due to a browser or network
    // error, display the localized error message to your customer
    // using `error.message`.
    if (error) {
      console.log('Error:', error);
    }
  }
  /****** payment method >> https://w3path.com/angular-8-integrate-stripe-payment-gateway/ ***********/
  loadStripe() {
     
    if(!window.document.getElementById('stripe-script')) {
      var s = window.document.createElement("script");
      s.id = "stripe-script";
      s.type = "text/javascript";
      s.src = "https://checkout.stripe.com/checkout.js";
      window.document.body.appendChild(s);
    }
  }
  ngOnInit() {
    this.loadStripe();
  }
  pay(amount) {    
    var handler = (<any>window).StripeCheckout.configure({
      key: environment.stripe_key,
      locale: 'auto',
      token: function (token: any) {
        // You can access the token ID with `token.id`.
        // Get the token ID to your server-side code for use.
        console.log(token)
        alert('Token Created!!');
      }
    });
 
    handler.open({
      name: 'Demo Site',
      description: '2 widgets',
      amount: amount * 100
    });
 
  }
}


  /******************/ /*
  // payment method 3
  const session = await this.stripePromise.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'setup',
    customer: 'cus_FOsk5sbh3ZQpAU',
    success_url: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://example.com/cancel',
  });

  async checkout() {
    // Call your backend to create the Checkout session.

    // When the customer clicks on the button, redirect them to Checkout.
    const stripe = await this.stripePromise;
    const { error } = await stripe.redirectToCheckout({
      mode: 'payment',
      lineItems: [{ price: this.priceId, quantity: this.quantity }],
      successUrl: `${window.location.href}?success=true`,
      cancelUrl: `${window.location.href}?canceled=true`,
    });
    // If `redirectToCheckout` fails due to a browser or network
    // error, display the localized error message to your customer
    // using `error.message`.
    if (error) {
      console.log(error);
    }
  }

  const [message, setMessage] = useState("");
  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      setMessage("Order placed! You will receive an email confirmation.");
    }
    if (query.get("canceled")) {
      setMessage(
        "Order canceled -- continue to shop around and checkout when you're ready."
      );
    }
  }, []);
  
  /******************/

}