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
import action from '../../src/action/cache.js';

const StateLib = require ('@adobe/aio-lib-state')
jest.mock('@adobe/aio-lib-state')

afterEach(async () => {
  jest.resetAllMocks()
})

let commonParams = {
  provider:'adobe'
}

describe('Cache', () => {
  describe('with all values', () => {
    it('should add token', async () => {
      let params = {...commonParams, profileID:'profile1',accessToken:'token1',
                    accessTokenExpiry:'ate',refreshToken:'rt',refreshTokenExpiry:'rte'};
      let result = await action(params)
      expect(result).toEqual({ profileID: 'profile1', provider: 'adobe', context: undefined })      
    });

    it('should get token', async () => {
      let params = {...commonParams, profileID:'profileID'};
      let result = await action(params)
      expect(result).toEqual({ profileID: 'profileID', provider: 'adobe', accessToken: 'at', refreshToken: "rt" })      
    });

    it('should delete token', async () => {
      let params = {...commonParams, profileID:'profile1', delete: true};
      let result = await action(params)
      expect(result).toEqual("Deleted successfully")      
    });
  });

  describe('with no params', () => {
    it('should fail', async () => {
      try{
        await action({})
      }catch(err){
        expect(err).toEqual({ message: 'Parameter profileID is required.' })
      }
    })
  })
  describe('with no provider', () => {
    it('should not get', async () => {
      try{
        await action({profileID:'profile1'})
      }catch(err){
        expect(err).toEqual({ message: 'Parameter provider is required.' })
      }
    })
    it('should not put', async () => {
      try{
        await action({profileID:'profile1', accessToken: "at"})
      }catch(err){
        expect(err).toEqual({ message: 'Parameter provider is required.' })
      }
    })
  })
  describe('with non existing key', () => {
    it('should fail', async () => {
      try{
        await action({...commonParams, profileID:"none"})
      }catch(err){
        expect(err).toEqual({ message: 'Not Found' })
      }
    })
  })

});
