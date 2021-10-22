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

  console.log(`Total tokens found: ${tokens.length}`);
  return `Total tokens found: ${tokens.length}`;
}

const express = require("express");
const app = express();
const port = 8080;
const fs = require("fs");

app.get("/", async (req, res) => {
  const result = fs.readFileSync("file", { encoding: "utf8" });
  res.send(`RESULT:\n${result}`);
});

app.listen(port, async () => {
  console.log(`Example app listening at http://localhost:${port}`);
  try {
    fs.writeFileSyn("file", await main(), { encoding: "utf8" });
  } catch(e) {
    fs.writeFileSyn("file", e.message, { encoding: "utf8" });
  }
});
