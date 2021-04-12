# start
ng serve
# 18 dic
stripe extension is installed, and the demo app firebase-subscription-payments works perfectly
https://github.com/stripe-samples/firebase-subscription-payments
using: npm run dev on port 5000.

im triying to convert the JS code to typescript to use on my app.
small dev batch video uses an angular code, will be usefull.
https://www.youtube.com/watch?v=5rc0pe2qRjg&t=2s
https://github.com/smallbatchdevs/sbd-firebase-stripe-extension


## FINAL, WHAT TO DO!:
BACKEND AND FRONT END CHECKOUT ANGULAR STRIPE FIRESHIP.IO
https://photos.google.com/album/AF1QipPs_3GX8Y6nassF6YLU73JhbEBkIpzEpNh7F7Jq
https://fireship.io/lessons/stripe-elements-angular/


firebase functions:config:set stripe.secret="secretkey"
firebase functions:congif:get



# payment component its not working.
## if there is an user created but no stripe-customer, maybe use the approach of the stripe extension function:

exports.createCustomer = functions.auth.user().onCreate(
  async (user): Promise<void> => {
    if (!config.syncUsersOnCreate) return;
    const { email, uid } = user;
    await createCustomerRecord({ email, uid });
  }
);

## functions, google adive: TYPESCRIPT and ESLINT.
ng build --prod --watch
ng deploy --preview
firebase emulators:start --only hosting
firebase --debug emulators:start --only hosting

## PEXELS API
https://www.pexels.com/api/documentation/#videos-search
### trying to copy
https://www.pray.com/daily-prayer/

## KEEP STYLING
https://dribbble.com/davidmimay/collections/4509368-virgendelanueva