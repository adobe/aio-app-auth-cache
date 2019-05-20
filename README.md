[![Build Status](https://travis-ci.com/adobe/adobeio-cna-auth-cache-dynamodb.svg?branch=master)](https://travis-ci.com/adobe/adobeio-cna-auth-cache-dynamodb)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)


This module is an OW action to store access tokens in Dynamodb.

## Usage
This can be used to store access tokens and the corresponding expiry dates.
The mandatory parameters required for this action to talk to dynamodb include accessKeyId, secretAccessKey, sessionToken (only in case of temporary credentials), region and endpoint.
Some important terminology is listed below.
profileID is <IntegrationID>:oauth:<IMS UserID>
provider is "adobe" for IMS
accessToken is either the user accessToken or service token as per IMS terminilogy
Call the action with any of the following combinations for the described functionality.


## Storing
Takes three mandatory parameters and stores the tokens in dynamodb.
```
profileID
provider
accessToken
```

## Retrieving
Takes two mandatory parameters and returns the corresponding accessToken.
```
profileID
provider
```

## Deleting
Takes two mandatory parameters and deletes the corresponding accessToken.
```
profileID
provider
```

## Schema
The dynamodb tables required for this action should have the following schema
```
#Profile Table
profileID (Partition Key)
provider (Sort Key)

#Refresh Table
profileID (Partition Key)
expiryDate (Sort Key)
```

### Contributing

Contributions are welcomed! Read the [Contributing Guide](./.github/CONTRIBUTING.md) for more information.

### Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.
