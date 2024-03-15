require('dotenv').config();
const { CommunicationIdentityClient } = require('@azure/communication-identity');

// This code demonstrates how to fetch your connection string
// from an environment variable.
const connectionString = process.env['COMMUNICATION_SERVICES_CONNECTION_STRING'];

// Instantiate the identity client
const identityClient = new CommunicationIdentityClient(connectionString);


const main = async () => {
console.log("Azure Communication Services - Access Tokens Quickstart")

let identityResponse = await identityClient.createUser();
console.log(`\nCreated an identity with ID: ${identityResponse.communicationUserId}`);
// Issue an access token with a validity of an hour and the "voip" scope for an identity
const tokenOptions = { tokenExpiresInMinutes: 60 };
let tokenResponse = await identityClient.getToken(identityResponse, ["voip"], tokenOptions);


// Get the token and its expiration date from the response
const { token, expiresOn } = tokenResponse;
console.log(`\nIssued an access token with 'voip' scope that expires at ${expiresOn}:`);
console.log(token);

};

main().catch((error) => {
  console.log("Encountered an error");
  console.log(error);
})