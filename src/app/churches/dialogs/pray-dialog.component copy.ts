import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
//payment method
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment.development';

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
    <div mat-dialog-actions>
      <button mat-button (click)="onNoClick()">Cancel</button>
      <button mat-button color="accent" [mat-dialog-close]="data.ask" cdkFocusInitial (click)="checkout()">Light</button>
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


  /******************/
  // payment method 2
  const ProductDisplay = ({ handleClick }) => (
    <section>
      <div className="product">
        <img
          src="https://i.imgur.com/EHyR2nP.png"
          alt="The cover of Stubborn Attachments"
        />
        <div className="description">
          <h3>Stubborn Attachments</h3>
          <h5>$20.00</h5>
        </div>
      </div>
      <button id="checkout-button" role="link" onClick={handleClick}>
        Checkout
      </button>
    </section>
  );
  const Message = ({ message }) => (
    <section>
      <p>{message}</p>
    </section>
  );
  export default function App() {
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
    const handleClick = async (event) => {
      const stripe = await stripePromise;
      const response = await fetch("/create-session", {
        method: "POST",
      });
      const session = await response.json();
      // When the customer clicks on the button, redirect them to Checkout.
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });
      if (result.error) {
        // If `redirectToCheckout` fails due to a browser or network
        // error, display the localized error message to your customer
        // using `result.error.message`.
      }
    };
    return message ? (
      <Message message={message} />
    ) : (
      <ProductDisplay handleClick={handleClick} />
    );
  }




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
  /******************/

}
