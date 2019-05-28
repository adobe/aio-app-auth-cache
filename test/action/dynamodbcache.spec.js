/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import action from '../../src/action/dynamodbcache.js';

const {DocumentClient} = require('aws-sdk/clients/dynamodb');
const config = {
  convertEmptyValues: true,
  ...({
    endpoint: 'http://localhost:8000',
    sslEnabled: false,
    region: 'local-env',
  }),
};
const ddb = new DocumentClient(config);
chai.config.includeStack = true;
chai.use(chaiAsPromised);
chai.should();

let commonParams = {
  endpoint: 'http://localhost:8000',
  sslEnabled: false,
  region: 'local-env', 
  accessKeyId: '', 
  secretAccessKey: '',
  provider:'adobe'
}

describe('DynamoDBCache', () => {
  describe('with all values', () => {
    it('should add user token properly', (done) => {
      let params = {...commonParams, profileID:'profile1',accessToken:'token1',
                    accessTokenExpiry:'ate',refreshToken:'rt',refreshTokenExpiry:'rte'};
      let result = action(params);
      result.should.eventually.deep.equal({profileID: 'profile1', provider: 'adobe', context: undefined})
            .notify(done)
    });
    it('should get user token properly', (done) => {
      let params = {...commonParams, profileID:'profile1'};
      let result = action(params);
      
      result.should.eventually.deep.equal({profileID: 'profile1', provider: 'adobe',accessToken:'token1',
                                          accessTokenExpiry:'ate',refreshToken:'rt',refreshTokenExpiry:'rte'})
            .notify(done)
    });
    it('should delete user token properly', (done) => {
      let params = {...commonParams, profileID:'profile1', delete:true};
      let result = action(params);
      result.should.eventually.deep.equal({message: 'Deleted successfully'})
            .notify(done)
    });
  });
  describe('with no AWS DynamoDB creds', () => {
    it('should error out', (done) => {
      let params = {};
      let result = action(params);
      result.should.be.rejected.and
            .eventually.have.property("message","Parameter accessKeyId is required.")
            .notify(done)
    });
  });
  describe('with no profile params', () => {
    it('should error out', (done) => {
      let params = commonParams;
      let result = action(params);
      result.should.be.rejected.and
            .eventually.have.property("message","Why are you even here!!!")
            .notify(done)
    });
  });
  describe('with no refreshToken', () => {
    it('should error out', (done) => {
      let params = {...commonParams, profileID:'profile1', accessToken:'accessToken'};
      let result = action(params);
      result.should.eventually.be.rejected.and
            .have.property("error","ValidationException: One or more parameter values were invalid: An AttributeValue may not contain an empty string")
            .notify(done)
    });
  });

});
