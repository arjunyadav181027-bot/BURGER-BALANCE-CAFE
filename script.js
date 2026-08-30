// ==========================================================================
// BurgerBalanceCafe — shared front-end logic
// Auth (signup/login/logout) is fully self-contained using localStorage,
// so it works right out of the box with no server or backend required.
// Users are stored in the browser's localStorage under "bbc_users", and the
// active session under "bbc_session". This is a student-project-friendly
// stand-in for a real backend — swap it for real API calls when one exists.
// ==========================================================================

document.addEventListener("DOMContentLoaded", function () {

  // ------------------------------------------------------------------
  // Header shadow on scroll
  // ------------------------------------------------------------------
  var header = document.querySelector(".site-header");
  if (header) {
    var toggleHeaderShadow = function () {
      header.classList.toggle("scrolled", window.scrollY > 8);
    };
    toggleHeaderShadow();
    window.addEventListener("scroll", toggleHeaderShadow, { passive: true });
  }

  // ------------------------------------------------------------------
  // Gentle fade-in-on-scroll for cards and sections
  // ------------------------------------------------------------------
  var revealTargets = document.querySelectorAll(".pillar, .dish, .auth-card, .values-list li, .timeline li");
  if (revealTargets.length && "IntersectionObserver" in window) {
    revealTargets.forEach(function (el) { el.classList.add("reveal"); });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealTargets.forEach(function (el) { observer.observe(el); });
  }

  // ------------------------------------------------------------------
  // Mobile nav toggle
  // ------------------------------------------------------------------
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var isOpen = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    links.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ------------------------------------------------------------------
  // Auth helpers (shared by login.html and signup.html, and used on
  // every page to reflect logged-in state in the nav)
  // ------------------------------------------------------------------
  var USERS_KEY = "bbc_users";
  var SESSION_KEY = "bbc_session";
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function normalizePhone(raw) {
    var digits = (raw || "").replace(/\D/g, "");
    // Keep the last 10 digits so "+91 98765 43210" and "9876543210" match.
    return digits.slice(-10);
  }

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch (err) {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function setSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ name: user.name, email: user.email, phone: user.phone }));
  }

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch (err) {
      return null;
    }
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function findUserByIdentifier(identifier) {
    var users = getUsers();
    var idEmail = identifier.trim().toLowerCase();
    var idPhone = normalizePhone(identifier);
    return users.find(function (u) {
      return (u.email && u.email.toLowerCase() === idEmail) ||
             (idPhone.length === 10 && normalizePhone(u.phone) === idPhone);
    });
  }

  // ------------------------------------------------------------------
  // Reflect logged-in state in the nav on every page
  // ------------------------------------------------------------------
  var navLoginLinks = document.querySelectorAll(".nav-login");
  var session = getSession();
  if (navLoginLinks.length) {
    navLoginLinks.forEach(function (link) {
      if (session) {
        link.textContent = "Logout (" + session.name.split(" ")[0] + ")";
        link.setAttribute("href", "#");
        link.addEventListener("click", function (e) {
          e.preventDefault();
          clearSession();
          window.location.href = "index.html";
        });
      }
    });
  }

  // ------------------------------------------------------------------
  // Contact form (front-end only — no backend in this version)
  // ------------------------------------------------------------------
  var form = document.getElementById("contact-form");
  if (form) {
    var note = document.getElementById("form-note");

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var subject = form.subject.value.trim();
      var message = form.message.value.trim();

      if (!name || !email || !subject || !message) {
        showNote("Please fill in every field before sending.", false);
        return;
      }
      if (!emailPattern.test(email)) {
        showNote("That email address doesn't look right.", false);
        return;
      }

      showNote("Thanks, " + name.split(" ")[0] + " — your message is ready to send once this form is connected to a server.", true);
      form.reset();
    });
  }

  function showNote(text, ok) {
    if (!note) return;
    note.textContent = text;
    note.className = "form-note " + (ok ? "ok" : "err");
  }

  // ------------------------------------------------------------------
  // Login — accepts email OR phone number, checked against
  // accounts created on the sign-up page
  // ------------------------------------------------------------------
  var loginForm = document.getElementById("login-form");
  if (loginForm) {
    var loginNote = document.getElementById("login-note");
    var forgotLink = document.getElementById("forgot-password-link");

    if (forgotLink) {
      forgotLink.addEventListener("click", function (e) {
        e.preventDefault();
        showLoginNote("Password reset isn't available in this demo — please use the Contact page instead.", false);
      });
    }

    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var identifier = loginForm.identifier.value.trim();
      var password = loginForm.password.value;

      if (!identifier || !password) {
        showLoginNote("Please enter your email/phone and password.", false);
        return;
      }

      var user = findUserByIdentifier(identifier);
      if (!user || user.password !== password) {
        showLoginNote("No account matches those details, or the password is wrong.", false);
        return;
      }

      setSession(user);
      showLoginNote("Welcome back, " + user.name.split(" ")[0] + "! Redirecting…", true);
      setTimeout(function () { window.location.href = "index.html"; }, 900);
    });
  }

  function showLoginNote(text, ok) {
    if (!loginNote) return;
    loginNote.textContent = text;
    loginNote.className = "form-note " + (ok ? "ok" : "err");
  }

  // ------------------------------------------------------------------
  // Sign up — creates an account with both email and phone
  // ------------------------------------------------------------------
  var signupForm = document.getElementById("signup-form");
  if (signupForm) {
    var signupNote = document.getElementById("signup-note");

    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = signupForm.name.value.trim();
      var email = signupForm.email.value.trim();
      var phone = signupForm.phone.value.trim();
      var password = signupForm.password.value;
      var confirm = signupForm.confirm.value;
      var normalizedPhone = normalizePhone(phone);

      if (!name || !email || !phone || !password || !confirm) {
        showSignupNote("Please fill in every field.", false);
        return;
      }
      if (!emailPattern.test(email)) {
        showSignupNote("That email address doesn't look right.", false);
        return;
      }
      if (normalizedPhone.length !== 10) {
        showSignupNote("Please enter a valid 10-digit phone number.", false);
        return;
      }
      if (password.length < 6) {
        showSignupNote("Password should be at least 6 characters.", false);
        return;
      }
      if (password !== confirm) {
        showSignupNote("Passwords don't match.", false);
        return;
      }

      var users = getUsers();
      var emailTaken = users.some(function (u) { return u.email.toLowerCase() === email.toLowerCase(); });
      var phoneTaken = users.some(function (u) { return normalizePhone(u.phone) === normalizedPhone; });
      if (emailTaken || phoneTaken) {
        showSignupNote("An account with that email or phone number already exists — try logging in instead.", false);
        return;
      }

      var newUser = { name: name, email: email, phone: phone, password: password };
      users.push(newUser);
      saveUsers(users);
      setSession(newUser);

      showSignupNote("Account created — welcome, " + name.split(" ")[0] + "! Redirecting…", true);
      setTimeout(function () { window.location.href = "index.html"; }, 900);
    });
  }

  function showSignupNote(text, ok) {
    if (!signupNote) return;
    signupNote.textContent = text;
    signupNote.className = "form-note " + (ok ? "ok" : "err");
  }

});
