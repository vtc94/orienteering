/*

Author: Team P
Last Modified: 17/08/2017

*/

var firebaseConfig = {
    apiKey: "AIzaSyB_RdmObV9iQp1xF9UeA_XqAyiS4SXZ9LE",
    authDomain: "trial-d940f.firebaseapp.com",
    databaseURL: "https://trial-d940f.firebaseio.com",
    projectId: "trial-d940f",
    storageBucket: "trial-d940f.appspot.com",
    messagingSenderId: "416732198099",
    appId: "1:416732198099:web:f4f77eed2eb31b08"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

// Initialize Firebase
/*var config = {
    apiKey: "AIzaSyCcb3bzfYhoZyytxk69dLXdGf8FD-IqVic",
    authDomain: "orienteering-a0c63.firebaseapp.com",
    databaseURL: "https://orienteering-a0c63.firebaseio.com",
    projectId: "orienteering-a0c63",
    storageBucket: "orienteering-a0c63.appspot.com",
    messagingSenderId: "570574227287"
  };
firebase.initializeApp(config);*/

  //database referece
  const database = firebase.database();

  //store signed in user
  var currentUser = null;

    //sign up form

    const txtEmail = document.getElementById('txtEmail');
    const txtPassword = document.getElementById('txtPassword');
    const txtFirstName = document.getElementById('txtFirstName');
    const txtLastName = document.getElementById('txtLastName');
    const txtPhone = document.getElementById('txtPhone');
    const txtDob = document.getElementById('txtDob');
    const txtConfirmPassword = document.getElementById('txtConfirmPassword');
    const btnSignUp = document.getElementById('btnSignUp');

    //sign in form

    const txtLoginEmail = document.getElementById('txtLoginEmail');
    const txtLoginPassword = document.getElementById('txtLoginPassword');
    const btnLogin = document.getElementById('btnLogin');

    //dashboard
    const btnLogOut = document.getElementById('btnLogOut');
    var userName = document.getElementById('userName');

    //Handle click event for login button

    if(btnLogin!=null){
      btnLogin.addEventListener('click', e => {
        const email = txtLoginEmail.value;
        const password = txtLoginPassword.value;

        firebase.auth().signInWithEmailAndPassword(email, password)
        .catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
		  
          //invalid email format
          if(errorCode=="auth/invalid-email"){
            $('#loginEmailDiv').addClass('has-error');
            $('#errorAlert').html(getDismissableAlertString("Invalid E-mail",
              " - The e-mail address you entered is not valid."));

          }
          //user not found
          else if(errorCode=="auth/user-not-found"){
            $('#loginEmailDiv').addClass('has-error');
            $('#errorAlert').html(getDismissableAlertString("Invalid E-mail",
              " - The e-mail address you entered does not belong to a user."));
          }
          //invalid password for uservar message =
          else if(errorCode=="auth/wrong-password"){
            $('#loginPasswordDiv').addClass('has-error');
            $('#errorAlert').html(getDismissableAlertString("Invalid Password",
              " - The password you entered is incorrect."));
          }
        });
      });
    }

    //reset the error field when user input is detected
    $('#txtLoginEmail').on('input', function() {
        $('#loginEmailDiv').removeClass('has-error');
        $('#loginPasswordDiv').removeClass('has-error');
        $('#errorAlert').html("");
    });
	
    $('#txtLoginPassword').on('input', function() {
        $('#loginEmailDiv').removeClass('has-error');
        $('#loginPasswordDiv').removeClass('has-error');
        $('#errorAlert').html("");
    });

    //Handle click event for signUp button
    if(btnSignUp!=null){
      btnSignUp.addEventListener('click', e => {
        isSignUpDataValid();
        //get form values
        const email = txtEmail.value;
        const password = txtPassword.value;
        const firstName = txtFirstName.value;
        const lastName = txtLastName.value;
        const phone = txtPhone.value;
        const dob = txtDob.value;

        if(isSignUpDataValid()){
          //create new user
          firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(user => {
              //save user data to database
              firebase.database().ref('users/' + user.uid).set({
                  firstName: firstName,
                  lastName: lastName,
                  phone: phone,
                  dob: dob
              });
              //currentUser = user;
            })
            .catch(function(error) {
              // Handle Errors here.
              var errorCode = error.code;
              var errorMessage = error.message;

              $('#errorAlert').html(getDismissableAlertString("Error",
                " - " + errorMessage));
            });
          }
      });
    }

    //Handle on click event for logout button
    if(btnLogOut!=null){
      btnLogOut.addEventListener('click', e => {	
		localStorage.clear();		
		nagivateToLogin();       
      });
    }

    //realtime auth state listener
    var log = firebase.auth().onAuthStateChanged(user =>{
      if(user){
        currentUser = user;
        //store current user in localStorage
        localStorage.setItem("currentUser", JSON.stringify(user));
        loadAdditionalUserData(user);
        checkAdminStatus(user);
      }
      else{
        currentUser = null;
        if(!(($('body').is('.loginPage')) || ($('body').is('.signUpPage')))){
          //alert("You must be logged in to access this page");
          nagivateToLogin();
        }
      }
    });

    //check if user is admin
    function checkAdminStatus(user){
      firebase.database().ref('/admins/').once('value').then(function(snapshot) {
        //user is admin
        if(snapshot.child(user.uid).val()=="true"){
          localStorage.setItem("isAdmin", "true");
        }
		//user is not an admin
        //navigate to player dashboard
        else{ 
          localStorage.setItem("isAdmin", "false");
        }
      });
      //navigate to admin dashboard
      if(($('body').is('.loginPage')) || ($('body').is('.signUpPage'))){
        navigateToDashboard();
      }
    }

    function navigateToDashboard(){
      location.href = "dashboard.html";
    }

    function nagivateToLogin(){
      location.href = "index.html";
    }

    function loadAdditionalUserData(user){
      firebase.database().ref('/users/' + user.uid).once('value').then(function(snapshot) {
          var additionalUserData = {
            firstName :  snapshot.val().firstName,
            lastName : snapshot.val().lastName,
            dob : snapshot.val().dob,
            phone : snapshot.val().phone
          }
          localStorage.setItem("additionalUserData", JSON.stringify(additionalUserData));
      });

      localStorage.setItem("user", JSON.stringify(user));
    }

    //returns a string with html for a customized dismissable alert
    function getDismissableAlertString(title, message){
      var message =
      "<div class=\"alert alert-danger alert-dismissable\">" +
        "<button type=\"button\" class=\"close\"" +
        "data-dismiss=\"alert\" aria-hidden=\"true\">&times;</button>" +
        "<strong>" + title + "</strong>" + message + "</div>";
        return message;
    }

    //check fields for sign up page
    function isSignUpDataValid(){
      if(txtEmail.value.trim().length==0 ||
        txtPassword.value.trim().length==0 ||
        txtFirstName.value.trim().length==0 ||
        txtLastName.value.trim().length==0 ||
        txtDob.value.trim().length==0 ||
        txtConfirmPassword.value.trim().length==0 ||
        txtPhone.value.trim().length==0){
          $('#errorAlert').html(getDismissableAlertString("Error",
            " - Please enter the required details."));
            return false;
        }
        else if(txtConfirmPassword.value!=txtPassword.value){
          $('#errorAlert').html(getDismissableAlertString("Error",
            " - The entered passwords does not match."));
            return false;
        }
        else if(! /^\d+$/.test(txtPhone.value) ||
        !(txtPhone.value.length>=8 && txtPhone.value.length<=10)){
          $('#errorAlert').html(getDismissableAlertString("Error",
            " - The entered phone number is invalid."));
            return false;
        }
		
		//check if dob is older than at least 5 years)
        else if(Date.parse(txtDob.value)-Date.parse(new Date())>0){ 
            $('#errorAlert').html(getDismissableAlertString("Error",
              " - Date of birth can not be in the future"));
              return false;
        }
        return true;
      }
