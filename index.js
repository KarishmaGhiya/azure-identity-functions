const identity = require("@azure/identity");

async function main(context, req) {
  console.log("JavaScript HTTP trigger function processed a request.");

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

  const tries = 1;
  const tokens = [];

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

  let query =
    "?api-version=2019-07-01-preview&resource=https://graph.microsoft.com/";
  let url = process.env.MSI_ENDPOINT + query;
  const req2 = https.get(
    url,
    {
      headers: { secret: process.env.MSI_SECRET },
    },
    (res) => {
      console.log(`statusCode: ${res.statusCode}`);
      res.on("data", (d) => {
        console.log("DATA", d);
      });
    }
  );
  req2.on("error", (error) => {
    console.log("ERROR", error);
  });
  req2.end();
}

const express = require("express");
const app = express();
const port = 8080;
const fs = require("fs");

app.get("/", async (req, res) => {
  const result = await main();
  res.send(`RESULT:\n${result}`);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
