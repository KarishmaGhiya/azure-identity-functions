const identity = require("@azure/identity");

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    process.env.AZURE_LOG_LEVEL = "verbose";
    const managedIdentityClientId = "bf031ca3-5eac-4592-a92f-a08a77cbc610";

    console.log("Trying the DefaultAzureCredential");
    let credential = new identity.DefaultAzureCredential({ managedIdentityClientId });
    credential.getToken("https://vault.azure.net/").then((...a) => console.log("DefaultAzureCredential", a)).catch(console.error);  

    console.log("Trying the ManagedIdentityCredential");
    credential = new identity.ManagedIdentityCredential(managedIdentityClientId);
    credential.getToken("https://vault.azure.net/").then((...a) => console.log("ManagedIdentityCredential", a)).catch(console.error);  

    const name = (req.query.name || (req.body && req.body.name));
    const responseMessage = name
        ? "Hello, " + name + ". This HTTP triggered function executed successfully."
        : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: responseMessage
    };
}