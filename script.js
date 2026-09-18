// BurgerBalanceCafe - simple JavaScript
// Signup and login data is saved in the browser using localStorage,
// because this project does not have a backend server.

// ---------- helper functions ----------

function getUsers() {
  var data = localStorage.getItem("bbc_users");
  if (data == null) {
    return [];
  }
  return JSON.parse(data);
}

function saveUsers(users) {
  localStorage.setItem("bbc_users", JSON.stringify(users));
}

function getSession() {
  var data = localStorage.getItem("bbc_session");
  if (data == null) {
    return null;
  }
  return JSON.parse(data);
}

function setSession(user) {
  localStorage.setItem("bbc_session", JSON.stringify(user));
}

function checkEmail(email) {
  return email.indexOf("@") > 0 && email.indexOf(".") > 0;
}

function onlyDigits(phone) {
  return phone.replace(/\D/g, "");
}

function showNote(id, text, isOk) {
  var note = document.getElementById(id);
  if (note == null) {
    return;
  }
  note.innerHTML = text;
  if (isOk) {
    note.className = "form-note ok";
  } else {
    note.className = "form-note err";
  }
}

// ---------- show login or logout in the menu ----------

var loginLink = document.querySelector(".nav-login");
var session = getSession();

if (loginLink != null && session != null) {
  loginLink.innerHTML = "Logout";
  loginLink.href = "#";
  loginLink.onclick = function () {
    localStorage.removeItem("bbc_session");
    window.location.href = "index.html";
    return false;
  };
}

// ---------- contact form ----------

var contactForm = document.getElementById("contact-form");

if (contactForm != null) {
  contactForm.onsubmit = function (e) {
    e.preventDefault();

    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    var subject = document.getElementById("subject").value;
    var message = document.getElementById("message").value;

    if (name == "" || email == "" || subject == "" || message == "") {
      showNote("form-note", "Please fill all the fields.", false);
      return false;
    }

    if (!checkEmail(email)) {
      showNote("form-note", "Please enter a valid email address.", false);
      return false;
    }

    showNote("form-note", "Thank you. Your message has been received.", true);
    contactForm.reset();
    return false;
  };
}

// ---------- login form ----------

var loginForm = document.getElementById("login-form");

if (loginForm != null) {
  var forgotLink = document.getElementById("forgot-password-link");

  if (forgotLink != null) {
    forgotLink.onclick = function (e) {
      e.preventDefault();
      showNote("login-note", "Password reset is not available. Please use the Contact page.", false);
      return false;
    };
  }

  loginForm.onsubmit = function (e) {
    e.preventDefault();

    var identifier = document.getElementById("login-identifier").value;
    var password = document.getElementById("login-password").value;

    if (identifier == "" || password == "") {
      showNote("login-note", "Please enter your email or phone and password.", false);
      return false;
    }

    var users = getUsers();
    var found = null;
    var phone = onlyDigits(identifier);

    for (var i = 0; i < users.length; i++) {
      if (users[i].email.toLowerCase() == identifier.toLowerCase()) {
        found = users[i];
      }
      if (phone.length == 10 && onlyDigits(users[i].phone) == phone) {
        found = users[i];
      }
    }

    if (found == null || found.password != password) {
      showNote("login-note", "Wrong email/phone or password.", false);
      return false;
    }

    setSession(found);
    showNote("login-note", "Login successful. Please wait...", true);
    setTimeout(function () {
      window.location.href = "index.html";
    }, 1000);
    return false;
  };
}

// ---------- signup form ----------

var signupForm = document.getElementById("signup-form");

if (signupForm != null) {
  signupForm.onsubmit = function (e) {
    e.preventDefault();

    var name = document.getElementById("signup-name").value;
    var email = document.getElementById("signup-email").value;
    var phone = document.getElementById("signup-phone").value;
    var password = document.getElementById("signup-password").value;
    var confirm = document.getElementById("signup-confirm").value;

    if (name == "" || email == "" || phone == "" || password == "" || confirm == "") {
      showNote("signup-note", "Please fill all the fields.", false);
      return false;
    }

    if (!checkEmail(email)) {
      showNote("signup-note", "Please enter a valid email address.", false);
      return false;
    }

    if (onlyDigits(phone).length != 10) {
      showNote("signup-note", "Please enter a 10 digit phone number.", false);
      return false;
    }

    if (password.length < 6) {
      showNote("signup-note", "Password must be at least 6 characters.", false);
      return false;
    }

    if (password != confirm) {
      showNote("signup-note", "Passwords do not match.", false);
      return false;
    }

    var users = getUsers();

    for (var i = 0; i < users.length; i++) {
      if (users[i].email.toLowerCase() == email.toLowerCase() ||
          onlyDigits(users[i].phone) == onlyDigits(phone)) {
        showNote("signup-note", "This email or phone number is already registered.", false);
        return false;
      }
    }

    var newUser = { name: name, email: email, phone: phone, password: password };
    users.push(newUser);
    saveUsers(users);
    setSession(newUser);

    showNote("signup-note", "Account created successfully. Please wait...", true);
    setTimeout(function () {
      window.location.href = "index.html";
    }, 1000);
    return false;
  };
}
