const identity = require("@azure/identity");

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    process.env.AZURE_LOG_LEVEL = "verbose";
    const credential = identity.DefaultAzureCredential();
    await credential.getToken("https://vault.azure.net/")  

    const name = (req.query.name || (req.body && req.body.name));
    const responseMessage = name
        ? "Hello, " + name + ". This HTTP triggered function executed successfully."
        : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: responseMessage
    };
}