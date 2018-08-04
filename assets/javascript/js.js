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

  database.ref(userId).set({
    message: "temp"
  })
}

function returningUser(userId) {
  database.ref('users/' + userId).child("input").set("Waitings");
  database.ref('users/' + userId).child("channel").set(0);
  $('.channel').css("display", "block");
  $('form').css("display", "none");
}

//DELETE
database.ref().on("value", function(snapshot) {
  if(!snapshot.child("server").exists()) {
    database.ref('server').set({
      roomOne: {
        userOne: 0,
        userTwo: 0,
        users: 0
      },
      roomTwo: {
        userOne: 0,
        userTwo: 0,
        users: 0
      },
      roomThree: {
        userOne: 0,
        userTwo: 0,
        users: 0
      },
      roomFour: {
        userOne: 0,
        userTwo: 0,
        users: 0
      }
    });
  }
});

//-----------------------------Firebase Authorization Module---------------------------------------------------------
var auth = firebase.auth();
var userUID; //capturing the UID to be used as a global variable

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
    userUID = user.uid;

    firebase.auth().currentUser.updateProfile({ displayName: "User Ones" });

    firebase.database().ref("users").once("value").then(function(snapshot) {
      if(snapshot.child(uid).exists() && snapshot.val()[uid].name !== -1) {
        returningUser(uid);
      } else {
        newUser(uid, -1, 0, 0, "Waiting", 0);
      }
    });

    database.ref('server/').on("value", function(snapshot) {

      snapshot.forEach(function(childSnapshot) {
        if(childSnapshot.val().message !== "") {
          $('#chatroom').append(childSnapshot.val().message);
          $('#chatroom').scrollTop(100000);
          database.ref('server/' + childSnapshot.key).update({ message: "" });
        }

      });

    });

    database.ref('users/' + firebase.auth().currentUser.uid).on("value", function(snapshot) {
      if(snapshot.val().channel === 0) {
        firebase.database().ref("server/").once("value").then(function(snapshot) {
          snapshot.forEach(function(childSnapshot) {
            var temp = childSnapshot.val().users;
            temp -= 1;
            if(childSnapshot.val().userOne === userUID) {
              firebase.database().ref("server/" + childSnapshot.key).update({ userOne: 0, users: temp });
            } else if (childSnapshot.val().userTwo === userUID) {
              firebase.database().ref("server/" + childSnapshot.key).update({ userTwo: 0, users: temp });
            }

            database.ref("users/" + firebase.auth().currentUser.uid).once("value", function (temp){
              console.log(childSnapshot.key);
              console.log(temp.val().channel);
              console.log($('*[data=' + temp.val().channel + ']').parent().parent().attr("data-room"));
              if( $('*[data=' + temp.val().channel + ']').parent().parent().attr("data-room") ===  childSnapshot.key) {
                $('#chatroom').append("Someone has Left");
              }

            });

          });
        });
      }
    });

  } else {
    // When User Signsout or closes window
  }
});

//-------------------------------------------------Database Updates-------------------------------------------------

//updating room status for users
database.ref('server/').on("value", function(snapshot) {
  $('#slotOne').text(snapshot.child("roomOne").val().users + "/2");
  $('#slotTwo').text(snapshot.child("roomTwo").val().users + "/2");
  $('#slotThree').text(snapshot.child("roomThree").val().users + "/2");
  $('#slotFour').text(snapshot.child("roomFour").val().users + "/2");
});

//---------------------------------------------------DOM----------------------------------------------------

$(document).ready(function() {

  //Default Settings
  document.getElementById("menutheme").volume = 0.25;

  //Stage 0 - Basic Start Button when loading the page so user interacts with DOM (for the sound)
  $('#start').on("click", function(event) {
    event.preventDefault();
    $('#start').css("display", "none");
    $('#gameChannels').css("display", "block");
  });

  //Stage 1 - New User
  $('#button').on("click", function(event) {
    event.preventDefault();
    newUser(firebase.auth().currentUser.uid, $('#login').val(), 0, 0, "Waiting", 0);
    $('#login').val("");
    console.log("Name Set");
    $('.channel').css("display", "block");
    $('#login, #button').css("display", "none");
  });

  //Stage 2 - Returning User
  $('.channel').on("click", function() {
    var room = $(this).attr("data-room");
    var roomNumber = parseInt($(this).attr("value"));
    database.ref('users/' + userUID).update({ channel: roomNumber });
    database.ref('server/' + room).once("value").then(function(snapshot) {
      var temp = snapshot.val().users;
      temp += 1
      if(snapshot.val().userOne === 0) {
        database.ref('server/' + room).update({ userOne: userUID, users: temp});
        $('#gameChannels').css("display", "none");
        $('#' + room).css("display", "block");
        $('#unique, #chatbox, #submitChat, #chat, #chatroom').css("display", "block");
      } else if (snapshot.val().userTwo === 0) {
        database.ref('server/' + room).update({ userTwo: userUID, users: temp});
        $('#gameChannels').css("display", "none");
        $('#' + room).css("display", "block");
        $('#unique, #chatbox, #submitChat, #chat, #chatroom').css("display", "block");
      } else {
        alert("This room is full!");
      }
    });
  });

  //Stage 2 - Playing Sound
  $('.channel, .rps').mouseenter(function() {
    document.getElementById("menutheme").play();
  });

  //Stage 3 - Game Room
  $('.back').on("click", function() {
    $('#unique, #chatbox, #submitChat, #chat, #chatroom').css("display", "none");
    $('#gameChannels').css("display", "block");
    $(this).parent().css("display", "none");
    var temp = $(this).parent().attr("id");
    database.ref('server/' + temp).once("value").then(function(snapshot) {
      var numberOfPlayers = snapshot.val().users;
      numberOfPlayers -= 1;
      if(snapshot.val().userOne === userUID) {
        database.ref('server/' + temp).update({ userOne: 0, users: numberOfPlayers });
      } else if (snapshot.val().userTwo === userUID) {
        database.ref('server/' + temp).update({ userTwo: 0, users: numberOfPlayers });
      }
      database.ref('users/' + firebase.auth().currentUser.uid).update({ channel: 0 });
    });
  });

  $('.rps').on("click", function() {
    $('.rps').css("border-width", "0px");
    $(this).css("border-width", "0.25vw");
    database.ref('users/' + firebase.auth().currentUser.uid).update({ input: $(this).attr("id") });
  });

  $('#submitChat').on("click", function(event) {

    event.preventDefault();

    database.ref('users/' + userUID).once("value").then(function(snapshot) {
      var temp = "<div>" + snapshot.val().name + ": " + $('#chat').val() + "</div>";
      var room = $('*[data=' + snapshot.val().channel + ']').parent().parent().attr("data-room");
      database.ref('server/' + room).update({ message: temp})
      $('#chat').val("");
    });

  });
});
