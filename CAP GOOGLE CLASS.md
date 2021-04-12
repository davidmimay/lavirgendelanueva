## NEW https://www.youtube.com/watch?v=NWrZwXK92IM&list=PLl-K7zZEsYLmK1tiMBeKA0iDMPDCJKM-5&index=1

## .eslint.js

"parserOptions": {
    // Required for certain syntax usages
    "ecmaVersion": 2017
    // tsconfigRootDir": "__dirname"
  },



  // "settings": {
  //   "jsdoc": {
  //     "tagNamePreference": {
  //       "returns": "return",
  //     },
  //     'import/resolver': {
  //       node: {
  //         extensions: ['.js', '.jsx', '.ts', '.tsx'],
  //         moduleDirectory: ['node_modules', 'src/'],
  //       }
  //     }
  //   }
  // }

## tsconfig.json

"include": [
  "es.lintrc.js",
  "src",
]

## emulator
cd functions
npm run build
firebase init emulators
firebase emulators:start

## port 8080 taken:
lsof -i :8080
kill 1852
kill-port --port 9099,5001,8080,9000,5000,8085

## test pub sub running in terminal
gcloud pubsub topics publish billing --message 'THIS IS NOT JSON'

## firestore
private / billing_info / lastReportedCost