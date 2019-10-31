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
const crypto = require('./crypto');
const stateLib = require('@adobe/aio-lib-state')

const mycrypto = new crypto();

async function main(params) {
  return new Promise((resolve, reject) => {
    if (_fail_on_missing(["profileID"], params, reject) ) {
        return;
    }  
    stateLib.init().then(
        (stateClient) => {
            if (params.accessToken && params.profileID) {
                // console.log("Setting")
                _set_handler(params, resolve, reject, stateClient);
            } else {
                if(params.delete === true){
                    // console.log("Delete key:" + params.profileID);
                    _delete_tokens(params, resolve, reject, stateClient);
                }else{
                    // console.log("GET key:" + params.profileID);
                    _get_handler(params, resolve, reject, stateClient);
                }
            }          
        }
    )
  });
}

function _set_handler(params, resolve, reject, stateClient) {
  if (_fail_on_missing(["profileID","provider","accessToken"], params, reject) ) {
    return;
  }
  params.accessToken = mycrypto.encryptString(params.profileID, params.accessToken);
  params.refreshToken = params.refreshToken
                            ? mycrypto.encryptString(params.profileID, params.refreshToken)
                            : "";
  // console.log("Persisting..."+params.profileID);
  _add_profile(params, resolve, reject, stateClient)
}

function _get_handler(params, resolve, reject, stateClient) {
  if (_fail_on_missing(["profileID", "provider"], params, reject) ) return;

  let profileID = params.profileID
  let provider = params.provider
  stateClient.get(profileID+":"+provider)
    .then((response)=>{
        if(response.value){
            let value = response.value
            value.accessToken = mycrypto.decryptString(value.profileID, value.accessToken)
            if(value.refreshToken && value.refreshToken.length > 0)
                value.refreshToken = mycrypto.decryptString(value.profileID, value.refreshToken)  
            resolve(value)
        }else
            reject({message:"Not Found"})
    })
    .catch((err)=>{reject(err)})
}

function _delete_tokens(params, resolve, reject, stateClient) {
  let {profileID, provider} = params
  stateClient.delete(profileID+":"+provider)
    .then(()=>{resolve("Deleted successfully")})
}

function _add_profile(params, resolve, reject, stateClient) {
  let { profileID, provider, accessToken, accessTokenExpiry, refreshToken, refreshTokenExpiry, context} = params;
  let value = {
          "profileID": profileID,
          "provider": provider,
          "accessToken": accessToken,
          "accessTokenExpiry": accessTokenExpiry,
          "refreshToken": refreshToken,
          "refreshTokenExpiry": refreshTokenExpiry
    }
  let set_profile_handler = () => {  
    stateClient.get(profileID+":"+provider).then(()=>{
        resolve({
            profileID: profileID,
            provider: provider,
            context: context
        });
    
    })
  }
  stateClient.put(profileID+":"+provider, value)
    .then(set_profile_handler)
    .catch((err)=>{
      reject(err)
    });
}

function _fail_on_missing(param_names, params, reject) {
  for(let param_name of param_names)
    if (params[param_name] == null || typeof(params[param_name]) == "undefined") {
      reject({
        "message": "Parameter " + param_name + " is required."
      });
      return true
    }
  return false
}

export default main;
