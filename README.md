[![Version](https://img.shields.io/npm/v/@adobe/aio-app-auth-cache.svg)](https://npmjs.org/package/@adobe/aio-app-auth-cache)
[![Downloads/week](https://img.shields.io/npm/dw/@adobe/aio-app-auth-cache.svg)](https://npmjs.org/package/@adobe/aio-app-auth-cache)
[![Build Status](https://travis-ci.com/adobe/aio-app-auth-cache.svg?branch=master)](https://travis-ci.com/adobe/aio-app-auth-cache)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)


This module is an OW action to store access tokens.

## Usage
This can be used to store access tokens and the corresponding expiry dates.
Some important terminology is listed below.
profileID is <IntegrationID>:oauth:<IMS UserID>
the provider is "adobe" for IMS
accessToken is either the user accessToken or service token as per IMS terminology
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


### Contributing

Contributions are welcomed! Read the [Contributing Guide](./.github/CONTRIBUTING.md) for more information.

### Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.
