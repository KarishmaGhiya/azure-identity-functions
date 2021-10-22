const identity = require("@azure/identity");
const msRestNodeauth = require("@azure/ms-rest-nodeauth");

async function main(context, req) {
  context.log("JavaScript HTTP trigger function processed a request.");

  process.env.AZURE_LOG_LEVEL = "verbose";
  const managedIdentityClientId = "bf031ca3-5eac-4592-a92f-a08a77cbc610";

  // console.log("Trying the DefaultAzureCredential");
  // try {
  //   let credential = new identity.DefaultAzureCredential({
  //     managedIdentityClientId,
  //   });
  //   const result = await credential.getToken("https://vault.azure.net/");
  //   console.log("DefaultAzureCredential", result);
  // } catch (e) {
  //   console.error("DefaultAzureCredential error", e.message);
  // }
  //
  // console.log("Trying the ManagedIdentityCredential");
  // try {
  //   let credential = new identity.ManagedIdentityCredential(
  //     managedIdentityClientId
  //   );
  //   const result = await credential.getToken("https://vault.azure.net/");
  //   console.log("ManagedIdentityCredential", result);
  // } catch (e) {
  //   console.error("ManagedIdentityCredential error", e.message);
  // }

  const tries = 5;
  const tokens = [];

  console.log(
    `Trying ${tries} times with the DefaultAzureCredential without parameters`
  );
  try {
    let credential = new identity.DefaultAzureCredential();
    const promises = [];
    for (let i = 0; i < tries; i++) {
      promises.push(
        credential.getToken("https://graph.microsoft.com/.default")
      );
    }
    for (promise of promises) {
      const result = await promise;
      if (result && result.token) {
        tokens.push(result);
        console.log("RESULT", tokens.length, result);
      }
    }
  } catch (e) {
    console.log(
      `${tries} times DefaultAzureCredential without parameters error somewhere`,
      e
    );
  }

  console.log(`Total tokens found: ${tokens.length}`);

  console.log("TIME", Date.now());
  console.log(
    `Trying ${tries} times with the ManagedIdentityCredential without parameters`
  );
  try {
    let credential = new identity.ManagedIdentityCredential();
    const promises = [];
    for (let i = 0; i < tries; i++) {
      promises.push(
        credential.getToken("https://graph.microsoft.com/.default")
      );
    }
    for (promise of promises) {
      const result = await promise;
      console.log("TIME", Date.now());
      if (result && result.token) {
        tokens.push(result);
      }
    }
  } catch (e) {
    console.log(
      `${tries} times ManagedIdentityCredential without parameters error somewhere`,
      e
    );
  }
  console.log(`Total tokens found: ${tokens.length}`);

  console.log("TIME", Date.now());
  console.log(`Trying ${tries} times with the ManagedIdentityCredential`);
  try {
    let credential = new identity.ManagedIdentityCredential(
      managedIdentityClientId
    );
    const promises = [];
    for (let i = 0; i < tries; i++) {
      promises.push(credential.getToken("https://vault.azure.net/"));
    }
    for (promise of promises) {
      const result = await promise;
      console.log("TIME", Date.now());
      if (result && result.token) {
        tokens.push(result);
      }
    }
  } catch (e) {
    console.log(`${tries} times ManagedIdentityCredential error somewhere`, e);
  }

  // console.log("Trying the loginWithAppServiceMSI");
  // try {
  //   let credential = await msRestNodeauth.loginWithAppServiceMSI({
  //     clientId: managedIdentityClientId,
  //   });
  //   const result = await credential.getToken("https://vault.azure.net/");
  //   console.log("loginWithAppServiceMSI", result);
  // } catch (e) {
  //   console.error("loginWithAppServiceMSI error", e.message);
  // }

  console.log(`Total tokens found: ${tokens.length}`);

  console.log(`Trying ${tries} times with the loginWithAppServiceMSI`);
  try {
    let credential = await msRestNodeauth.loginWithAppServiceMSI({
      clientId: managedIdentityClientId,
    });
    const promises = [];
    for (let i = 0; i < tries; i++) {
      promises.push(credential.getToken("https://vault.azure.net/"));
    }
    for (promise of promises) {
      const result = await promise;
      if (result) {
        tokens.push(result);
      }
    }
  } catch (e) {
    console.log(`${tries} times loginWithAppServiceMSI error somewhere`, e);
  }

  console.log(`Total tokens found: ${tokens.length}`);
  console.log(JSON.stringify(tokens));

  const name = req.query.name || (req.body && req.body.name);
  const responseMessage = name
    ? "Hello, " + name + ". This HTTP triggered function executed successfully."
    : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";
}

const express = require("express");
const app = express();
const port = 8080;

app.get("/", (req, res) => {
  res.send("Hello World!");
  main().then(console.log).catch(console.error);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
  main().then(console.log).catch(console.error);
});
