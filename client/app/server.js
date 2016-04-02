import {readDocument, writeDocument, addDocument} from './database.js';

var numberOfCandidates = 9;
var numberOfEvents = 6;
var numberOfPageEvents = 3;
var numberOfChats = 6;
var numberOfWeeks = 5;
var numberOfUsers = 5

/**
* Emulates how a REST call is *asynchronous* -- it calls your function back
* some time in the future with data.
*/
function emulateServerReturn(data, cb) {
  setTimeout(() => {
    cb(data);
  }, 4);
}

var token = ''; // <-- Put your base64'd JSON token here
/**
 * Properly configure+send an XMLHttpRequest with error handling, authorization token,
 * and other needed properties.
 */
function sendXHR(verb, resource, body, cb) {
  var xhr = new XMLHttpRequest();
  xhr.open(verb, resource);
  xhr.setRequestHeader('Authorization', 'Bearer ' + token);

  // The below comment tells ESLint that FacebookError is a global.
  // Otherwise, ESLint would complain about it! (See what happens in Atom if
  // you remove the comment...)
  /* global ElectError */

  // Response received from server. It could be a failure, though!
  xhr.addEventListener('load', function() {
    var statusCode = xhr.status;
    var statusText = xhr.statusText;
    if (statusCode >= 200 && statusCode < 300) {
      // Success: Status code is in the [200, 300) range.
      // Call the callback with the final XHR object.
      cb(xhr);
    } else {
      // Client or server error.
      // The server may have included some response text with details concerning
      // the error.
      var responseText = xhr.responseText;
      ElectError('Could not ' + verb + " " + resource + ": Received " + statusCode + " " + statusText + ": " + responseText);
    }
  });

  // Time out the request if it takes longer than 10,000 milliseconds (10 seconds)
  xhr.timeout = 10000;

  // Network failure: Could not connect to server.
  xhr.addEventListener('error', function() {
    ElectError('Could not ' + verb + " " + resource + ": Could not connect to the server.");
  });

  // Network failure: request took too long to complete.
  xhr.addEventListener('timeout', function() {
    ElectError('Could not ' + verb + " " + resource + ": Request timed out.");
  });

  switch (typeof(body)) {
    case 'undefined':
      // No body to send.
      xhr.send();
      break;
    case 'string':
      // Tell the server we are sending text.
      xhr.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
      xhr.send(body);
      break;
    case 'object':
      // Tell the server we are sending JSON.
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      // Convert body into a JSON string.
      xhr.send(JSON.stringify(body));
      break;
    default:
      throw new Error('Unknown body type: ' + typeof(body));
  }
}

export function  getUserData(userId, cb) {
  var userData = readDocument('users', userId);
  emulateServerReturn(userData, cb);
}

export function setUserData(userId, newData, cb) {
  var userData = {
    "_id": userId,
    "email": newData.email,
    "password": newData.password,
    "fullName": newData.fullName,
    "gender": newData.gender,
    "race": newData.race,
    "hispanic": newData.hispanic,
    "registered": newData.registered,
    "age": newData.age,
    "politicalAffiliation": newData.politicalAffiliation,
    "location": newData.location,
    "vote": newData.vote,
    "emailSettings": newData.emailSettings
  }
  writeDocument('users', userData);
  emulateServerReturn(userData, cb);
}

export function getCandidate(candIndex, cb) {
  var candidate = readDocument('candidates', candIndex);
  emulateServerReturn(candidate, cb);
}

export function getSomeEvents(page, cb) {
  var events = [];
  var start = 0;
  if (page === "2") {
    start = 3;
  }
  for (var i = start + 1; i <= numberOfPageEvents + start; i++) {
    events.push(readDocument('events', i));
  }
  emulateServerReturn(events, cb);
}

export function getAllEvents(cb) {
  var events = [];
  for (var i = 1; i <= numberOfEvents; i++) {
    events.push(readDocument('events', i));
  }
  emulateServerReturn(events, cb);
}

export function getAllCandidates(cb) {
  var candidates = [];
  for (var i = 1; i<=numberOfCandidates; i++) {
    candidates.push(readDocument('candidates', i));
  }

  //Sort the candidates
  //Get surName connected to id
  //Get surNames
  var surNameIdDict = {};
  var surNameArray = [];
  for (var j = 0; j<candidates.length; j++) {
    var split = candidates[j].fullName.split(" ");
    var surName = (split)[split.length-1];
    surNameIdDict[surName] = j;
    surNameArray.push(surName);
  }
  //sort surNames
  surNameArray.sort();
  //push the candidate of the correct id into the right position
  var sortedCandidates = [];
  for (var k = 0; k<surNameArray.length; k++){
    var oldId = surNameIdDict[surNameArray[k]];
    sortedCandidates.push(candidates[oldId]);
  }
  emulateServerReturn(sortedCandidates, cb);
}

export function getAllChat(cb){
  var chatBoxes = [];
  for(var i = 1; i <= numberOfChats; i++){
    chatBoxes.push(readDocument('chatBox', i));
  }
  emulateServerReturn(chatBoxes, cb);
}


export function getAllCandidatesOfParty(partyId, cb) {
  var candidates = [];
  for (var i = 1; i<=numberOfCandidates; i++) {
    var candidate = readDocument('candidates', i);
    if(partyId === candidate.party){
      candidates.push(readDocument('candidates', i));
    }
    emulateServerReturn(candidates, cb);
  }
}

//need new function because there are 2 party types for independents.
export function getIndCandidates(cb) {
  var candidates = [];
  for (var i = 1; i<=numberOfCandidates; i++) {
    var candidate = readDocument('candidates', i);
    if(candidate.party === 3 || candidate.party === 4){
      candidates.push(readDocument('candidates', i));
    }
    emulateServerReturn(candidates, cb);
  }
}


export function getParty(partyId, cb) {
  var party = readDocument('parties', partyId);
  emulateServerReturn(party, cb)
}

export function postMessage(chatBoxId, author, message, cb){
  var chatBox = readDocument('chatBox', chatBoxId);
  chatBox.messages.push({
    "author": author,
    "contents": message
  });
  writeDocument('chatBox', chatBox);
  emulateServerReturn(chatBox, cb);
}

export function getChat(chatId, cb) {
  var chat = readDocument('chatBox', chatId);
  emulateServerReturn(chat, cb)
}

export function getEmailSettings(userId, cb) {
  var user = readDocument('users', userId);
  var email = user.emailSettings;
  emulateServerReturn(email, cb)
}

export function subscribe(candId, userId, cb) {
  var user = readDocument('users', userId);
  // var email = user.emailSettings;
  user.emailSettings.push(candId);
  writeDocument('users', user);
  //emulateServerReturn(user.emailSettings.map((id) => readDocument('candidates', id)), cb);
  emulateServerReturn(user.emailSettings, cb);
}

export function unsubscribe(candId, userId, cb) {
  var user = readDocument('users', userId);
  //var email = user.emailSettings;
  // (We didn't *resolve* the FeedItem object, so it is just an array of user IDs)
  var candIndex = user.emailSettings.indexOf(candId);
  // -1 means the user is *not* in the likeCounter, so we can simply avoid updating
  // anything if that is the case: the user already doesn't like the item.
  if (candIndex !== -1) {
    // 'splice' removes items from an array. This removes 1 element starting from userIndex.
    user.emailSettings.splice(candIndex, 1);
    writeDocument('users', user);
  }
  // Return a resolved version of the likeCounter
  //emulateServerReturn(user.emailSettings.map((id) => readDocument('candidates', id)), cb);
  emulateServerReturn(user.emailSettings, cb);

}

export function getAllUserRaceGender(cb){
  var userData = [];
  for(var i = 1; i <= numberOfUsers; i++){
    var data = {race : readDocument('users', i).race, gender: readDocument('users', i).gender};
    userData.push(data);
  }
  emulateServerReturn(userData, cb);
}

export function getAllWeeks(cb){
  var weeks = [];
  for(var i=1; i < numberOfWeeks; i++){
    weeks.push(readDocument('weeklyState', i));
  }
  emulateServerReturn(weeks, cb);
}