<p align="center">
    <a href="https://docs.icure.com">
        <img alt="icure-your-data-platform-for-medtech-and-ehr" src="https://icure.com/assets/icons/logo.svg">
    </a>
    <h1 align="center">iCure MedTech Node JS Back-End Template</h1>
</p>

Start working on your e-health Node.JS Back-End app with iCure in a few minutes, by using our dedicated template: 
```
git clone git@github.com:icure/icure-medical-device-node-js-boilerplate-app-template.git my-icure-nodejs-app
```


Once your app is created, rename the file `.env.default` to `.env` and complete the following values: 
- **PARENT_ORGANISATION_USERNAME**: The username of your parent organisation to manage medical data through your organisation,
- **PARENT_ORGANISATION_TOKEN**: The application token (pwd) of your parent organisation to manage medical data through your organisation,
- **PARENT_ORGANISATION_PUBLIC_KEY** (Optional): The public key of your parent organisation. Complete it only if you already generated cryptographic keys for your parent organisation,
- **PARENT_ORGANISATION_PRIVATE_KEY** (Optional): The private key of your parent organisation. Complete it only if you already generated cryptographic keys for your parent organisation,
- **HOST** (Optional): The host to use to start your Node.JS server (127.0.0.1 by default),
- **PORT** (Optional): The port to use to start your Node.JS server (3000 by default),
- **LOCAL_STORAGE_LOCATION** (Optional): The path to your local storage file (./scratch/localStorage by default)

And start your Node.JS server by executing 
```
cd my-icure-nodejs-app && yarn && yarn start
```

*Confused about the information mentionned above ? Check our [Quick Start](https://docs.icure.com/sdks/quick-start/) to know more about them and how to retrieve them from our [Cockpit Portal](https://cockpit.icure.cloud/)*

Looking for React Native template instead ? Head [here](https://github.com/icure/icure-medical-device-react-native-boilerplate-app-template).

Looking for React.JS template instead ? Head [here](https://github.com/icure/icure-medical-device-react-js-boilerplate-app-template).


## Requirements
Make sure the following tools are installed on your machine:
- [NodeJS](https://nodejs.org/en) (Node 16 + at least)
- [Yarn Package manager](https://yarnpkg.com/getting-started/install)


## Which technologies are used ? 
- [Node.JS](https://nodejs.org/en)
- [Express](https://expressjs.com/)
- [node-localstorage](https://www.npmjs.com/package/node-localstorage) as a key-value storage solution
- [ESLint](https://eslint.org/) as a code analyzer
- [Prettier](https://prettier.io/) as a code formatter

We chose this set of technologies, because we consider them as the most efficient ones to work with. 
Nonetheless, you can of course work with the technologies of your choices and still integrate the iCure MedTech Typescript SDK in your Node.JS server.


## What includes this template ?
- The [iCure MedTech Typescript SDK](https://github.com/icure/icure-medical-device-js-sdk) dependency; 
- The cryptographic keys creation of your parent organisation. The first time you'll start your Node.JS server (and go to `http://127.0.0.1:3000`), the template will check if you already provided any cryptographic keys for your parent organisation. If not, it will create them, save the public key on iCure and save your private & public keys at the local storage location and in the .env file. 


## What's next ? 
Check out our[MedTech Documentation](https://docs.icure.com/sdks/quick-start/node-js-quick-start) and more particularly our [How To's](https://docs.icure.com/sdks/how-to/index), in order to start implementing new functionalities inside your Node.JS Server !
