module.exports = {
    tables: [
      {
        TableName: `Profile`,
        KeySchema: [{AttributeName: 'profileID', KeyType: 'HASH'},{AttributeName: 'provider', KeyType: 'RANGE'}],
        AttributeDefinitions: [{AttributeName: 'profileID', AttributeType: 'S'},{AttributeName: 'provider', AttributeType: 'S'}],
        ProvisionedThroughput: {ReadCapacityUnits: 5, WriteCapacityUnits: 5},
      },
      {
        TableName: `RefreshToken`,
        KeySchema: [{AttributeName: 'profileID', KeyType: 'HASH'},{AttributeName: 'expiryDate', KeyType: 'RANGE'}],
        AttributeDefinitions: [{AttributeName: 'profileID', AttributeType: 'S'},{AttributeName: 'expiryDate', AttributeType: 'S'}],
        ProvisionedThroughput: {ReadCapacityUnits: 5, WriteCapacityUnits: 5},
      }
      // etc
    ]
  };