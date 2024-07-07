Please follow the instructions within ./TODO.md! Thank you :)
### ./views/index.ejs
```ejs
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FleetVRP: Route Optimization Software</title>
  <!-- Materialize CSS -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
  <!-- Material Icons -->
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <script src="https://unpkg.com/htmx.org@1.6.1"></script>
  <%- include('style.ejs') %>
</head>

<body>
  <%- include('splash.ejs') %>

  <main style="min-height: calc(100vh - 300px);">
    <div class="container">
      <% if (user) { %>
        <div class="row">
          <div class="col s12 m6">
            <div class="card">
              <div class="card-content">
                <span class="card-title">VRP: Owner</span>
                <p>Import and export data and setup Managers.</p>
              </div>
              <div class="card-action">
                <a href="/app/owner" class="waves-effect waves-light btn blue darken-2 fluid">Owner</a>
              </div>
            </div>
          </div>
          <div class="col s12 m6">
            <div class="card">
              <div class="card-content">
                <span class="card-title">VRP: Manager</span>
                <p>Configure which users can see which VRP modules.</p>
              </div>
              <div class="card-action">
                <a href="/app/manager" class="waves-effect waves-light btn blue darken-2 fluid">Manager</a>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col s12 m6">
            <div class="card">
              <div class="card-content">
                <span class="card-title">VRP: Solver</span>
                <p>Calculate VRP algorithms in the cloud or on local machines.</p>
              </div>
              <div class="card-action">
                <a href="/app/solver" class="waves-effect waves-light btn blue darken-2 fluid">Solver</a>
              </div>
            </div>
          </div>
          <div class="col s12 m6">
            <div class="card">
              <div class="card-content">
                <span class="card-title">VRP: Planner</span>
                <p>Look at the backlog of orders, run them through the solver, and sync new routes with Pickup and Delivery.</p>
              </div>
              <div class="card-action">
                <a href="/app/planner" class="waves-effect waves-light btn blue darken-2 fluid">Planner</a>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col s12 m6">
            <div class="card">
              <div class="card-content">
                <span class="card-title">VRP: Pickup & Delivery</span>
                <p>Stay ontop of your pre planned route.</p>
              </div>
              <div class="card-action">
                <a href="/app/pickup-and-delivery" class="waves-effect waves-light btn blue darken-2 fluid">Pickup & Delivery</a>
              </div>
            </div>
          </div>
          <div class="col s12 m6">
            <div class="card">
              <div class="card-content">
                <span class="card-title">VRP: Order</span>
                <p>Place customer work orders into the Planner backlog.</p>
              </div>
              <div class="card-action">
                <a href="/app/order" class="waves-effect waves-light btn blue darken-2 fluid">Order</a>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col s12 m6 offset-m3">
            <div class="card">
              <div class="card-content">
                <span class="card-title">Welcome, <%= user.email %>!</span>
                <p>Your Stripe Customer ID: <%= user.stripeCustomerId %></p>
              </div>
              <div class="card-action">
                <form action="/logout" method="POST">
                  <button type="submit" class="waves-effect waves-light btn grey lighten-1 black-text fluid">Logout</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      <% } else { %>
        <div class="row">
          <div class="col s12 m6">
            <div class="card">
              <div class="card-content">
                <span class="card-title">New User?</span>
                <p>Create an account to get started with our amazing services.</p>
              </div>
              <div class="card-action">
                <a href="/register" class="waves-effect waves-light btn blue darken-2 fluid">Register</a>
              </div>
            </div>
          </div>
          <div class="col s12 m6">
            <div class="card">
              <div class="card-content">
                <span class="card-title">Returning User?</span>
                <p>Welcome back! Sign in to access your account.</p>
              </div>
              <div class="card-action">
                <a href="/login" class="waves-effect waves-light btn blue darken-2 fluid">Login</a>
              </div>
            </div>
          </div>
        </div>
      <% } %>
    </div>
    <br />
    <br />
    <br />
  </main>

  <%- include('footer.ejs') %>

  <!-- Materialize JavaScript -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
  <script>
    // Initialize Materialize components
    M.AutoInit();
  </script>
</body>

</html>
```

### ./views/login.ejs
```ejs
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login - FleetVRP</title>
  <!-- Materialize CSS -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
  <!-- Material Icons -->
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <script src="https://unpkg.com/htmx.org@1.6.1"></script>
  <%- include('style.ejs') %>
</head>

<body>
  <%- include('splash.ejs') %>

  <main style="min-height: calc(100vh - 300px);">
    <div class="container">
      <div class="row">
        <div class="col s12 m6 offset-m3">
          <div class="card">
            <div class="card-content">
              <span class="card-title">Login</span>
              <form action="/login" method="POST">
                <div class="input-field">
                  <input type="email" id="email" name="email" required>
                  <label for="email">Email</label>
                </div>
                <div class="input-field">
                  <input type="password" id="password" name="password" required>
                  <label for="password">Password</label>
                </div>
                <button type="submit" class="btn waves-effect waves-light blue darken-2 fluid">Login</button>
              </form>
            </div>
            <div class="card-action">
              <p>Don't have an account? <a href="/register">Register</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <%- include('footer.ejs') %>

  <!-- Materialize JavaScript -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
  <script>
    // Initialize Materialize components
    M.AutoInit();
  </script>
</body>

</html>
```

### ./views/register.ejs
```ejs
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Register - FleetVRP</title>
  <!-- Materialize CSS -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
  <!-- Material Icons -->
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <script src="https://unpkg.com/htmx.org@1.6.1"></script>
  <%- include('style.ejs') %>
</head>

<body>
  <%- include('splash.ejs') %>

  <main style="min-height: calc(100vh - 300px);">
    <div class="container">
      <div class="row">
        <div class="col s12 m6 offset-m3">
          <div class="card">
            <div class="card-content">
              <span class="card-title">Register</span>
              <form action="/register" method="POST">
                <div class="input-field">
                  <input type="email" id="email" name="email" required>
                  <label for="email">Email</label>
                </div>
                <div class="input-field">
                  <input type="password" id="password" name="password" required>
                  <label for="password">Password</label>
                </div>
                <button type="submit" class="btn waves-effect waves-light blue darken-2 fluid">Register</button>
              </form>
            </div>
            <div class="card-action">
              <p>Already have an account? <a href="/login">Login</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <%- include('footer.ejs') %>

  <!-- Materialize JavaScript -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
  <script>
    // Initialize Materialize components
    M.AutoInit();
  </script>
</body>

</html>
```

### ./views/splash.ejs
```ejs

<nav class="blue darken-2">
  <div class="nav-wrapper container">
    <a href="#" class="brand-logo">FleetVRP</a>
    <ul id="nav-mobile" class="right hide-on-med-and-down">
      <li><a href="/"><i class="material-icons left">home</i>Home</a></li>
    </ul>
  </div>
</nav>
<div class="hero blue darken-2">
  <div class="container">
    <h1 class="center-align">FleetVRP</h1>
    <p class="center-align flow-text">Vehicle Routing Problem</p>
  </div>
</div>
```

### ./views/style.ejs
```ejs
<style>
  body {
    background-color: #eee;
  }
  .hero {
    background-color: #1779ba;
    color: white;
    padding: 4rem 0;
    margin-bottom: 2rem;
  }
  .card-action {
    text-align: center;
  }
  .btn {
    text-transform: none;
  }
  .btn.fluid {
    width: 100%;
  }
</style>
```

### ./CURRENT_ERROR.md
```md

```

### ./TODO.md
```md
after todo: i will update my code base with the submitted files and run
the program ... if there is an error then it will be placed within ./CURRENT_ERROR.md
otherwise assume i have updated my requirements.

durring todo: if there is an error within ./CURRENT_ERROR.md then help me solve that
otherwise don't worry about it and proceed with the following todo rules.

TODO RULES:
 1) return a ./src/<filename>.js file or ./view/<filename>.ejs file
 2) i'd like TypeScript or EJS code in response to my queries!
 3) keep console.log statements for debugging
 4) keep code comments for documentation
 5) use mdui CSS library
```

