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
const AWS = require('aws-sdk');

const mycrypto = new crypto();

function main(params) {
  return new Promise((resolve, reject) => {
    //console.log(params);
    if (_fail_on_missing(["accessKeyId","secretAccessKey"], params, reject) ) {
      return;
    }
    AWS.config.update({
      accessKeyId: params.accessKeyId,
      secretAccessKey: params.secretAccessKey,
      sessionToken: params.sessionToken,
      region: params.region || "us-east-2",
      endpoint: params.endpoint || "https://dynamodb.us-east-2.amazonaws.com"
    });

    let dynamodb_client = new AWS.DynamoDB.DocumentClient();
    if (params.accessToken && params.profileID) {
      //console.log("Setting")
      _set_handler(params, resolve, reject, dynamodb_client);
    } else {
      if(params.profileID){
        if(params.delete === true){
          //console.log("Delete key:" + params.profileID);
          deleteTokens(params, resolve, reject, dynamodb_client);
        }else{
          //console.log("GET key:" + params.profileID);
          _get_handler(params, resolve, reject, dynamodb_client);
        }
      } else {
        reject({message:"Why are you even here!!!"})
      }
    }
  });
}

function _set_handler(params, resolve, reject, dynamodb_client) {
  if (_fail_on_missing(["profileID","provider","accessToken"], params, reject) ) {
    return;
  }
  params.accessToken = mycrypto.encryptString(params.profileID, params.accessToken);
  params.refreshToken = params.refreshToken
                            ? mycrypto.encryptString(params.profileID, params.refreshToken)
                            : "";
  //console.log("Persisting..."+params.profileID);

  addProfile(params, resolve, reject, dynamodb_client)
}

function _get_handler(params, resolve, reject, dynamodb_client) {
  if (_fail_on_missing(["profileID"], params, reject) ) return;

  let profileID = params.profileID
  let provider = params.provider || null;
  const get_dynamodb_handler = (err, response) => {
    if(rejectIfError(err, reject, "dynamodb_get")) return
    if(response.Item){//Return the profile
      let profile = response.Item
      profile.accessToken = mycrypto.decryptString(profile.profileID, profile.accessToken)
      profile.refreshToken = mycrypto.decryptString(profile.profileID, profile.refreshToken)
      resolve(profile);
    }else{//Return all the providers of this user
      let profiles = response.Items || [];
      let providers = [];
      for (let i = 0; i < profiles.length; i++) {
        providers.push(profiles[i].provider);
      }
      resolve({providers: providers});
    }
  }

  //console.log("Reading persisted key info...");
  if(provider !==null){ //Get one specific identity of this user
    let dbparams = {
        TableName: "Profile",
        Key:{
            "profileID": profileID,
            "provider": provider
        }
    };
    dynamodb_client.get(dbparams, get_dynamodb_handler);
  }else{ //Get all identities of this user
    let dbparams = {
        TableName: "Profile",
        KeyConditionExpression: "profileID = :pID",
        ExpressionAttributeValues: {
            ":pID":profileID
        }
    };
    dynamodb_client.query(dbparams, get_dynamodb_handler);
  }

}

function deleteTokens(params, resolve, reject, dynamodb_client) {
  let {profileID, provider} = params
  let dbparams = {
      TableName :"Profile",
      Key:{
        "profileID": profileID,
        "provider": provider
      },
      ReturnValues: 'ALL_OLD'
  }

  dynamodb_client.delete(dbparams,
    function(err, data) {
      if(rejectIfError(err, reject, "dynamodb_delete_profile")) return
      let expiryDate = data.Attributes.refreshTokenExpiry;
      dynamodb_client.delete({
              TableName:"RefreshToken",
              Key:{"profileID":profileID, "expiryDate":expiryDate}
            }, function(err){
              if(rejectIfError(err, reject, "dynamodb_delete_refreshtoken")) return
              resolve({message:"Deleted successfully"})
            });
    });
}

function addProfile(params, resolve, reject, dynamodb_client) {
  let { profileID, provider, accessToken, accessTokenExpiry, refreshToken, refreshTokenExpiry, context} = params;
  let dbparams = {
      TableName :"Profile",
      Item:{
          "profileID": profileID,
          "provider": provider,
          "accessToken": accessToken,
          "accessTokenExpiry": accessTokenExpiry,
          "refreshToken": refreshToken,
          "refreshTokenExpiry": refreshTokenExpiry
          }
    }
  let set_profile_handler = (err) => {
      if(rejectIfError(err, reject, "dynamodb_put")) return
      if(provider == "adobe"){
        addRefreshToken(params, resolve, reject, dynamodb_client)
      }else{
        resolve({
          profileID: profileID,
          provider: provider,
          context: context
        });
      }
  }
  dynamodb_client.put(dbparams, set_profile_handler);
}

function addRefreshToken(params, resolve, reject, dynamodb_client) {
  let { profileID, provider, refreshToken, refreshTokenExpiry, context} = params;
  let refreshParams = {
    TableName : "RefreshToken",
    Item:{
      "profileID": profileID,
      "expiryDate": refreshTokenExpiry || "NA",
      "provider": provider,
      "refreshToken": refreshToken
    }
  }
  let set_refreshToken_handler = (err) =>{
    if(rejectIfError(err, reject, "dynamodb_put_refresh")) return;
    resolve({
      profileID: profileID,
      provider: provider,
      context: context
    });
  };
  dynamodb_client.put(refreshParams, set_refreshToken_handler);
}

function rejectIfError(err, reject, type){
  if (err !== null && typeof(err) !== "undefined") {
    reject({
      error: err.toString(),
      type: type
    })
    return true
  }
  return false
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
