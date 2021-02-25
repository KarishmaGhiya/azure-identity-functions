const identity = require("@azure/identity");

module.exports = async function(context) {
  process.env.AZURE_LOG_LEVEL = "verbose";
  const credential = identity.DefaultAzureCredential();
  await credential.getToken("https://vault.azure.net/")
  context.done();
};
