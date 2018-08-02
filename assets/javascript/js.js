// database.ref().on("child_added", function(childSnapshot) {
//   console.log(childSnapshot.val());
// });

var config = {
  apiKey: "AIzaSyBH1KM8XYdLmDBxm7LjJJppfrLlw31v4ns",
  authDomain: "wma-rps-game.firebaseapp.com",
  databaseURL: "https://wma-rps-game.firebaseio.com",
  projectId: "wma-rps-game",
  storageBucket: "wma-rps-game.appspot.com",
  messagingSenderId: "817568211144"
};

firebase.initializeApp(config);

var database = firebase.database();

function newUser(userId, userName, numberOfWins, numberOfLosses, currentChoice, currentChannel) {
  database.ref('users/' + userId).set({
    name: userName,
    wins: numberOfWins,
    losses: numberOfLosses,
    input: currentChoice,
    channel: currentChannel
  });
}

function returningUser(userId) {
  database.ref('users/' + userId).child("input").set("Waitings");
  database.ref('users/' + userId).child("channel").set(0);
  $('.channel').css("display", "block");
  $('form').css("display", "none");
}

database.ref().on("value", function(snapshot) {
    if(!snapshot.child("server").exists()) {
      database.ref('server').set({
        roomOne: {
          isFull: false,
          userOne: {
            userName: 0,
            userChoice: 0
          },
          userTwo: {
            userName: 0,
            userChoice: 0
          }
        },
        roomTwo: {
          isFull: false,
          userOne: {
            userName: 0,
            userChoice: 0
          },
          userTwo: {
            userName: 0,
            userChoice: 0
          }
        },
        roomThree: {
          isFull: false,
          userOne: {
            userName: 0,
            userChoice: 0
          },
          userTwo: {
            userName: 0,
            userChoice: 0
          }
        },
        roomFour: {
          isFull: false,
          userOne: {
            userName: 0,
            userChoice: 0
          },
          userTwo: {
            userName: 0,
            userChoice: 0
          }
        }
      });
    }
});

//-----------------------------Firebase Authorization Module---------------------------------------------------------
var auth = firebase.auth();

auth.signInAnonymously().catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  // ...
});

auth.onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    var isAnonymous = user.isAnonymous;
    var uid = user.uid;

    firebase.database().ref("users").once("value").then(function(snapshot) {
      if(snapshot.child(uid).exists() && snapshot.val()[uid].name !== -1) {
        returningUser(uid);
      } else {
        newUser(uid, -1, 0, 0, "Waiting", 0);
      }
    });

  } else {
    // When User Signsout or closes window
  }
});
//---------------------------------------------------DOM----------------------------------------------------

$(document).ready(function() {
  document.getElementById("menutheme").volume = 0.25;

  $('.channel').mouseenter(function() {
    document.getElementById("menutheme").play();
  });

  $('.channel').on("click", function() {
    console.log("Channel Selected");
    var room = $(this).attr("data-room");
    $('#gameChannels').css("display", "none");
    $('#' + room).css("display", "block");
    // $('#chatroom').css("display", "block");
    // $('#submit').css("display", "block");
    // $('#chat').css("display", "block");
    $('#chatroom, #unique, #chatbox, #submit, #chat').css("display", "block");
  });

  //starting the game (user interacting with DOM)
  $('#start').on("click", function(event) {
    event.preventDefault();
    $('#start').css("display", "none");
    $('#gameChannels').css("display", "block");
  });

  //submit username or alias button [SUBMIT]
  $('#button').on("click", function(event) {
    event.preventDefault();
    // database.ref('users/' + firebase.auth().currentUser.uid).child("name").set($('#login').val());
    newUser(firebase.auth().currentUser.uid, $('#login').val(), 0, 0, "Waiting", 0);
    $('#login').val("");
    console.log("Name Set");
    $('.channel').css("display", "block");
    $('#login').css("display", "none");
  });

  $('#submit').on("click", function(event) {
    event.preventDefault();
    var temp = $('<div>');
    temp.text($('#chat').val());
    $('#chat').val("");
    $('#chatroom').append(temp);
  });
});
