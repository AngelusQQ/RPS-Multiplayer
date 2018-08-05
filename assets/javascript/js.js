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

//DELETE
database.ref().on("value", function(snapshot) {
  if(!snapshot.child("server").exists()) {
    database.ref('server').set({
      roomOne: {
        message: "",
        userOne: 0,
        userTwo: 0,
        users: 0,
        inGame: false,
        choiceOne: "One",
        choiceTwo: "Two"
      },
      roomTwo: {
        message: "",
        userOne: 0,
        userTwo: 0,
        users: 0,
        inGame: false,
        choiceOne: "One",
        choiceTwo: "Two"
      },
      roomThree: {
        message: "",
        userOne: 0,
        userTwo: 0,
        users: 0,
        inGame: false,
        choiceOne: "One",
        choiceTwo: "Two"
      },
      roomFour: {
        message: "",
        userOne: 0,
        userTwo: 0,
        users: 0,
        inGame: false,
        choiceOne: "One",
        choiceTwo: "Two"
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

    //updating chatroom messages
    database.ref('server/').on("value", function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        if(childSnapshot.val().message !== "" && childSnapshot.val().userOne === userUID || childSnapshot.val().userTwo === userUID) {
          $('#chatroom').append(childSnapshot.val().message);
          $('#chatroom').scrollTop(100000);
          database.ref('server/' + childSnapshot.key).update({ message: "" });
        }
      });
    });

    database.ref('users/' + firebase.auth().currentUser.uid).on("value", function(datasnapshot) {
      firebase.database().ref("server/").once("value").then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
          //updating the number of users
          if(datasnapshot.val().channel === 0) {
            var temp = childSnapshot.val().users;
            temp -= 1;
            if(childSnapshot.val().userOne === userUID) {
              firebase.database().ref("server/" + childSnapshot.key).update({ userOne: 0, users: temp, inGame: false });
            } else if (childSnapshot.val().userTwo === userUID) {
              firebase.database().ref("server/" + childSnapshot.key).update({ userTwo: 0, users: temp, inGame: false });
            }
          }
        });
      });

    });

    //starting the game
    database.ref('server/').on("value", function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        var temp = childSnapshot.val();
        if(temp.userOne !== 0 && temp.userTwo !== 0 && temp.inGame === false) {
          database.ref('server/' + childSnapshot.key).update({ inGame: true });
          $('#chatroom').append("<div>Game has Started! Select a choice!</div>");
        }
      });
    });

    //serverOne
    database.ref('server/roomOne').on("value", function(snapshot) {
      if(snapshot.val().inGame === true) {
        //draw
        if(snapshot.val().choiceOne === snapshot.val().choiceTwo) {
          $('.rps').css("border-width", "0");
          database.ref('server/roomOne').update({
            choiceOne: "One",
            choiceTwo: "Two",
            message: "DRAW!"
          });
        } else if (snapshot.val().choiceOne !== snapshot.val().choiceTwo) {
          if(snapshot.val().choiceOne === "rock" && snapshot.val().choiceTwo === "paper" || snapshot.val().choiceOne === "paper" && snapshot.val().choiceTwo === "scissors" || snapshot.val().choiceOne === "scissors" && snapshot.val().choiceTwo === "rock") {
            //player 2 wins
            $('.rps').css("border-width", "0");
            database.ref('server/roomOne').update({
              choiceOne: "One",
              choiceTwo: "Two",
              message: "Player 2 wins!"
            });
          } else if(snapshot.val().choiceTwo === "rock" && snapshot.val().choiceOne === "paper" || snapshot.val().choiceTwo === "paper" && snapshot.val().choiceOne === "scissors" || snapshot.val().choiceTwo === "scissors" && snapshot.val().choiceOne === "rock") {
            //player 1 wins
            $('.rps').css("border-width", "0");
            database.ref('server/roomOne').update({
              choiceOne: "One",
              choiceTwo: "Two",
              message: "Player 1 wins!"
            });
          }
        }
      }
    });

    //serverOne
    database.ref('server/roomTwo').on("value", function(snapshot) {
      if(snapshot.val().inGame === true) {
        //draw
        if(snapshot.val().choiceOne === snapshot.val().choiceTwo) {
          $('.rps').css("border-width", "0");
          database.ref('server/roomTwo').update({
            choiceOne: "One",
            choiceTwo: "Two",
            message: "DRAW!"
          });
        } else if (snapshot.val().choiceOne !== snapshot.val().choiceTwo) {
          if(snapshot.val().choiceOne === "rock" && snapshot.val().choiceTwo === "paper" || snapshot.val().choiceOne === "paper" && snapshot.val().choiceTwo === "scissors" || snapshot.val().choiceOne === "scissors" && snapshot.val().choiceTwo === "rock") {
            //player 2 wins
            $('.rps').css("border-width", "0");
            database.ref('server/roomTwo').update({
              choiceOne: "One",
              choiceTwo: "Two",
              message: "Player 2 wins!"
            });
          } else if(snapshot.val().choiceTwo === "rock" && snapshot.val().choiceOne === "paper" || snapshot.val().choiceTwo === "paper" && snapshot.val().choiceOne === "scissors" || snapshot.val().choiceTwo === "scissors" && snapshot.val().choiceOne === "rock") {
            //player 1 wins
            $('.rps').css("border-width", "0");
            database.ref('server/roomTwo').update({
              choiceOne: "One",
              choiceTwo: "Two",
              message: "Player 1 wins!"
            });
          }
        }
      }
    });


    //serverThree
    database.ref('server/roomThree').on("value", function(snapshot) {
      if(snapshot.val().inGame === true) {
        //draw
        if(snapshot.val().choiceOne === snapshot.val().choiceTwo) {
          $('.rps').css("border-width", "0");
          database.ref('server/roomThree').update({
            choiceOne: "One",
            choiceTwo: "Two",
            message: "DRAW!"
          });
        } else if (snapshot.val().choiceOne !== snapshot.val().choiceTwo) {
          if(snapshot.val().choiceOne === "rock" && snapshot.val().choiceTwo === "paper" || snapshot.val().choiceOne === "paper" && snapshot.val().choiceTwo === "scissors" || snapshot.val().choiceOne === "scissors" && snapshot.val().choiceTwo === "rock") {
            //player 2 wins
            $('.rps').css("border-width", "0");
            database.ref('server/roomThree').update({
              choiceOne: "One",
              choiceTwo: "Two",
              message: "Player 2 wins!"
            });
          } else if(snapshot.val().choiceTwo === "rock" && snapshot.val().choiceOne === "paper" || snapshot.val().choiceTwo === "paper" && snapshot.val().choiceOne === "scissors" || snapshot.val().choiceTwo === "scissors" && snapshot.val().choiceOne === "rock") {
            //player 1 wins
            $('.rps').css("border-width", "0");
            database.ref('server/roomThree').update({
              choiceOne: "One",
              choiceTwo: "Two",
              message: "Player 1 wins!"
            });
          }
        }
      }
    });


    //serverFour
    database.ref('server/roomFour').on("value", function(snapshot) {
      if(snapshot.val().inGame === true) {
        //draw
        if(snapshot.val().choiceOne === snapshot.val().choiceTwo) {
          $('.rps').css("border-width", "0");
          database.ref('server/roomFour').update({
            choiceOne: "One",
            choiceTwo: "Two",
            message: "DRAW!"
          });
        } else if (snapshot.val().choiceOne !== snapshot.val().choiceTwo) {
          if(snapshot.val().choiceOne === "rock" && snapshot.val().choiceTwo === "paper" || snapshot.val().choiceOne === "paper" && snapshot.val().choiceTwo === "scissors" || snapshot.val().choiceOne === "scissors" && snapshot.val().choiceTwo === "rock") {
            //player 2 wins
            $('.rps').css("border-width", "0");
            database.ref('server/roomFour').update({
              choiceOne: "One",
              choiceTwo: "Two",
              message: "Player 2 wins!"
            });
          } else if(snapshot.val().choiceTwo === "rock" && snapshot.val().choiceOne === "paper" || snapshot.val().choiceTwo === "paper" && snapshot.val().choiceOne === "scissors" || snapshot.val().choiceTwo === "scissors" && snapshot.val().choiceOne === "rock") {
            //player 1 wins
            $('.rps').css("border-width", "0");
            database.ref('server/roomFour').update({
              choiceOne: "One",
              choiceTwo: "Two",
              message: "Player 1 wins!"
            });
          }
        }
      }
    });




  } else {
    // When User Signsout or closes window
  }
});

//-------------------------------------------------Database Updates-------------------------------------------------
//initial update room status for joining users
database.ref('server/').once("value", function(snapshot) {
  $('#slotOne').text(snapshot.child("roomOne").val().users + "/2");
  $('#slotTwo').text(snapshot.child("roomTwo").val().users + "/2");
  $('#slotThree').text(snapshot.child("roomThree").val().users + "/2");
  $('#slotFour').text(snapshot.child("roomFour").val().users + "/2");
});

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
        alert("You are player 1");
      } else if (snapshot.val().userTwo === 0) {
        database.ref('server/' + room).update({ userTwo: userUID, users: temp});
        $('#gameChannels').css("display", "none");
        $('#' + room).css("display", "block");
        $('#unique, #chatbox, #submitChat, #chat, #chatroom').css("display", "block");
        alert("You are player 2");
      } else if (snapshot.val().userOne !== 0 && snapshot.val().userOne !== 0){
        alert("This room is full!");
      } else if (snapshot.val().userOne === userUID || snapshot.val().userTwo === userUID) {
        alert("You are already in this room in another window!");
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
    // database.ref('users/' + firebase.auth().currentUser.uid).update({ input: $(this).attr("id") });
    var room = $(this).parent().attr("id");
    var choice = $(this).attr("id");
    database.ref('server/' + room).once("value", function(snapshot) {
      var temp = snapshot.val();
      if(temp.userOne === userUID) {
        database.ref('server/' + room).update({ choiceOne: choice });
      } else if(temp.userTwo === userUID) {
        database.ref('server/' + room).update({ choiceTwo: choice });
      }
    });

    $('#chatroom').append("<div>You have chosen " + $(this).attr("id") + "</div>");
    $('#chatroom').scrollTop(100000);
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
