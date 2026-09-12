Server Side API

A RESTful backend API built with Node.js, Express.js, TypeScript, and
PostgreSQL (Neon).

The project implements authentication, role-based authorization,
password hashing, JWT-based access/refresh tokens, and issue management.

🚀 Tech Stack

Backend

Node.js

Express.js

TypeScript

Database

PostgreSQL

Neon PostgreSQL

pg

Authentication & Security

bcryptjs --- password hashing

jsonwebtoken --- JWT access/refresh tokens

HTTP cookies --- refresh-token storage

Role-based authorization

Environment

dotenv

tsx

tsup

📁 Project Structure

A typical structure for this project is:

server_side/
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── db/
│   ├── types/
│   └── server.ts
│
├── dist/
├── .env
├── package.json
├── tsconfig.json
└── README.md

The exact folder names can vary depending on the current implementation,
but the main application entry point is:

src/server.ts

🔐 Authentication System

The API uses JWT authentication.

There are two main token concepts:

Access Token

The access token is used to authenticate protected API requests.

Example:

Authorization: Bearer <access_token>

Refresh Token

The refresh token is used to obtain a new access token after the access
token expires.

The refresh token is handled through a cookie.

👥 User Roles

The project currently uses three roles:

user
agent
admin

Roles are checked through authentication/authorization middleware.

Conceptually:

Request
   ↓
JWT Authentication
   ↓
User Information
   ↓
Role Check
   ↓
Controller
   ↓
PostgreSQL

For example, an admin-only route should reject a normal user even when
the user has a valid JWT.

🔑 Password Security

Passwords are never stored as plain text.

The project uses:

bcryptjs

When a user registers:

Plain Password
      ↓
bcrypt hash
      ↓
Database

During login:

Entered Password
      ↓
bcrypt comparison
      ↓
Valid / Invalid

🗄️ PostgreSQL Database

The application uses PostgreSQL through the pg package.

The database is hosted using Neon PostgreSQL.

Database connection is normally configured using environment variables.

Example:

DATABASE_URL=your_neon_database_url
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
PORT=5000

Never commit the real .env file to GitHub.

Add it to .gitignore:

.env
node_modules/
dist/

📌 API Routes

The API is divided into authentication, user/profile, and
issue-management functionality.

Route names below describe the API structure used by this project. If
a route was renamed in the current source code, use the route defined
in the corresponding routes file as the final source of truth.

1. Authentication Routes

Register

POST /api/auth/register

Creates a new user account.

Typical request body:

{
  "name": "Rifat",
  "email": "rifat@example.com",
  "password": "password123"
}

What happens

Client
  ↓
Register API
  ↓
Validate user data
  ↓
Hash password with bcrypt
  ↓
Insert user into PostgreSQL
  ↓
Return response

Login

POST /api/auth/login

Authenticates an existing user.

Typical request:

{
  "email": "rifat@example.com",
  "password": "password123"
}

The server:

Finds the user.

Compares the password using bcrypt.

Generates an access token.

Generates a refresh token.

Sends the refresh token using a cookie.

Returns authentication information.

Refresh Token

POST /api/auth/refresh-token

Generates a new access token using a valid refresh token.

Flow:

Refresh Cookie
     ↓
Verify Refresh JWT
     ↓
Find User
     ↓
Generate New Access Token
     ↓
Return Access Token

Logout

POST /api/auth/logout

Logs the user out by clearing the refresh-token cookie.

👤 User / Profile Routes

User/profile functionality is protected using authentication middleware.

A protected request follows this flow:

Request
  ↓
Access Token
  ↓
auth middleware
  ↓
Verify JWT
  ↓
Attach user information
  ↓
Controller

The user information can then be used to identify the currently
authenticated user.

🐛 Issue Management

The project contains an issue-management system.

An issue contains information such as:

{
  "title": "Login button not working",
  "description": "The login button does not submit the form.",
  "type": "bug",
  "status": "open",
  "reporter_id": 1
}

Issue Fields

title

Issue title.

Maximum length:

150 characters

description

Detailed description of the issue.

Minimum length:

20 characters

type

Allowed values:

bug
feature_request

status

Allowed values:

open
in_progress
resolved

reporter_id

The ID of the user who reported the issue.

📋 Issue Routes

Create Issue

POST /api/issues

Creates a new issue.

Example:

{
  "title": "Navbar is broken",
  "description": "The navbar does not work correctly on mobile devices.",
  "type": "bug"
}

The authenticated user's ID can be used as the reporter.

Get All Issues

GET /api/issues

Returns the available issues.

Example response:

[
  {
    "id": 1,
    "title": "Navbar is broken",
    "description": "The navbar does not work correctly on mobile devices.",
    "type": "bug",
    "status": "open",
    "reporter_id": 2
  }
]

Get Single Issue

GET /api/issues/:id

Returns one issue using its ID.

Example:

GET /api/issues/1

Update Issue

PATCH /api/issues/:id

Updates an existing issue.

For example, changing the status:

{
  "status": "in_progress"
}

Or changing the issue type:

{
  "type": "feature_request"
}

Delete Issue

DELETE /api/issues/:id

Deletes an issue.

Authorization should be applied according to the project's
role/permission rules.

🛡️ Middleware

The authentication middleware is responsible for verifying JWT access
tokens.

Conceptually:

Authorization Header
        ↓
Extract Bearer Token
        ↓
Verify JWT
        ↓
Decode User Information
        ↓
req.user
        ↓
Next Middleware / Controller

Role authorization can then be applied:

auth("admin")

or:

auth("admin", "agent")

This allows multiple roles to access the same protected route.

🔄 Request Flow

A protected request generally works like this:

Frontend
   │
   │ HTTP Request
   ▼
Express Router
   │
   ▼
Authentication Middleware
   │
   ▼
Role Authorization
   │
   ▼
Controller
   │
   ▼
PostgreSQL
   │
   ▼
Controller Response
   │
   ▼
Frontend

⚙️ Installation

Clone the project:

git clone <your-repository-url>
cd server_side

Install dependencies:

npm install

🔐 Environment Variables

Create a .env file:

PORT=5000

DATABASE_URL=your_neon_postgresql_connection_string

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

Use strong random values for JWT secrets.

▶️ Run Development Server

Use:

npm run dev

This runs:

tsx watch ./src/server.ts

The server automatically restarts when source files change.

🏗️ Build Project

Run:

npm run build

This executes:

tsup

The compiled application is generated inside the dist directory.

🚀 Start Production Server

After building:

npm start

This runs:

node dist/server.js

📦 package.json

Current package configuration:

{
  "name": "server_side",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node dist/server.js",
    "dev": "tsx watch ./src/server.ts",
    "build": "tsup",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "module",
  "devDependencies": {
    "@types/express": "^5.0.6",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/node": "^26.5.1",
    "@types/pg": "^8.21.0",
    "tsx": "^4.23.12",
    "typescript": "^7.0.2"
  },
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.3",
    "pg": "^8.23.0",
    "tsup": "^8.5.1"
  }
}

📚 Dependencies Explained

Package                 Purpose

express               REST API server
pg                    PostgreSQL connection
bcryptjs              Password hashing
jsonwebtoken          JWT authentication
dotenv                Environment variables
typescript            TypeScript development
tsx                   Run TypeScript directly during development
tsup                  Build/bundle TypeScript
@types/express        Express TypeScript types
@types/jsonwebtoken   JWT TypeScript types
@types/node           Node.js TypeScript types
@types/pg             PostgreSQL TypeScript types

🧪 Testing API

You can test the API using:

Postman

Thunder Client

REST Client

Frontend application

A common testing order is:

1. Register
      ↓
2. Login
      ↓
3. Receive Access Token
      ↓
4. Send Access Token
      ↓
5. Access Protected Route
      ↓
6. Create / Read / Update / Delete Issues

🌐 Example Authorization Header

For protected requests:

Authorization: Bearer YOUR_ACCESS_TOKEN

Example:

GET /api/issues
Authorization: Bearer eyJhbGciOiJIUzI1Ni...

🗃️ Database Concept

The main database relationships can be understood as:

Users
  │
  │ reporter_id
  ▼
Issues

One user can report multiple issues.

Example:

User
 ├── Issue #1
 ├── Issue #2
 └── Issue #3

🔒 Security Practices

This project follows several important backend security concepts:

Password hashing with bcrypt

JWT authentication

Refresh-token authentication

HTTP-only cookie approach for refresh tokens

Role-based authorization

Environment variables for secrets

PostgreSQL parameterized queries

Input validation

Never put secrets directly inside source code.

Bad:

const secret = "my-secret";

Better:

const secret = process.env.JWT_ACCESS_SECRET;

🛠️ Common Commands

Install dependencies

npm install

Development

npm run dev

Build

npm run build

Production

npm start