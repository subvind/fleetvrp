Application is running on: http://localhost:3000
[
  {
    "id": "1720306394678",
    "email": "travis.burandt@gmail.com",
    "password": "$2b$10$nouxt7Hmh/bSGqu8Q0dnoeYwelxoUQuLZM88RqXQc2xS4nnKqGYeW",
    "stripeCustomerId": "cus_QQUxRD5F7Pbga0"
  }
]
[Nest] 31737  - 07/06/2024, 6:00:10 PM   ERROR [ExceptionsHandler] users.find is not a function
TypeError: users.find is not a function
    at AuthService.register (/Users/subvind/Projects/fleetvrp/src/auth.service.ts:65:32)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at AppController.register (/Users/subvind/Projects/fleetvrp/src/app.controller.ts:41:18)
    at async /Users/subvind/Projects/fleetvrp/node_modules/@nestjs/core/router/router-execution-context.js:46:28
    at async /Users/subvind/Projects/fleetvrp/node_modules/@nestjs/core/router/router-proxy.js:9:17