const form = document.getElementById('form');
const firstname_input = document.getElementById('firstname-input');
const email_input = document.getElementById('email-input');
const password_input = document.getElementById('password-input');
const repeat_password_input = document.getElementById('repeat-password-input');
const error_message = document.getElementById('error-message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  let errors = [];
  const email = email_input.value;
  const password = password_input.value;

  if (firstname_input) {
    
    const firstname = firstname_input.value;
    const repeatPassword = repeat_password_input.value;
    errors = getSignupFormErrors(firstname, email, password, repeatPassword);

    if (errors.length === 0) {
      try {
        const res = await fetch("https://zii-app-backend.onrender.com/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firstname, email, password })
        });
        const result = await res.json();
        if (!res.ok) throw result;
        alert("Account created!");
        window.location.href = `order.html?email=${encodeURIComponent(email)}`;
      } catch (err) {
        error_message.innerText = err.message || "Signup failed.";
      }
    }
  } else {
   
    errors = getLoginFormErrors(email, password);
    if (errors.length === 0) {
      try {
        const res = await fetch("https://zii-app-backend.onrender.com/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const result = await res.json();
        if (!res.ok) throw result;
        alert("Login successful!");
        window.location.href = `order.html?email=${encodeURIComponent(email)}`;
      } catch (err) {
        error_message.innerText = err.message || "Login failed.";
      }
    }
  }

  if (errors.length > 0) {
    error_message.innerText = errors.join(". ");
  }
});

function getSignupFormErrors(firstname, email, password, repeatPassword) {
  let errors = [];
  if (!firstname) errors.push('Firstname is required');
  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');
  if (password.length < 8) errors.push('Password must have at least 8 characters');
  if (password !== repeatPassword) errors.push('Passwords do not match');
  return errors;
}

function getLoginFormErrors(email, password) {
  let errors = [];
  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');
  return errors;
}
