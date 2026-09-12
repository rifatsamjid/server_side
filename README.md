# Server Side API

A RESTful backend API built with Node.js, Express.js, TypeScript, and PostgreSQL.

This project provides a backend API with user authentication, JWT-based authorization, role-based access control, password hashing, and issue management.

---

## 🚀 Tech Stack

### Backend
- Node.js
- Express.js
- TypeScript

### Database
- PostgreSQL
- Neon PostgreSQL
- pg

### Authentication & Security
- bcryptjs — Password hashing
- jsonwebtoken — JWT authentication
- Access Token
- Role-based authorization

### Development Tools
- tsx
- tsup
- dotenv

---

## 📁 Project Structure

server_side/
│
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── types/
│   └── server.ts
│
├── dist/
├── package.json
├── tsconfig.json
└── README.md

Main application entry point:

src/server.ts

---

# 🔐 Authentication System

The API uses JWT-based authentication to protect private routes.

### Authentication Flow

Client
  ↓
Login
  ↓
Verify Email & Password
  ↓
Generate JWT Access Token
  ↓
Client Sends Token
  ↓
Protected API Request
  ↓
Authentication Middleware
  ↓
Verify JWT
  ↓
Allow / Reject Request

---

# 🔑 Password Security

User passwords are never stored as plain text.

The project uses:

bcryptjs

### Registration Flow

User Password
      ↓
bcrypt Hash
      ↓
Hashed Password
      ↓
Database

### Login Flow

Entered Password
      ↓
Find User
      ↓
bcrypt Compare
      ↓
Valid / Invalid

---

# 👥 User Roles

The project contains three user roles:

- user
- agent
- admin

### User

A normal user can access routes available to regular users.

### Agent

An agent can access routes that require agent-level permissions.

### Admin

An administrator has higher-level permissions and can access admin-protected routes.

---

# 🛡️ Role Authorization

Role-based authorization is handled using authentication middleware.

Example:

auth("admin")

Only users with the admin role can access the protected route.

Multiple roles can also be allowed:

auth("admin", "agent")

In this case, both admin and agent users can access the route.

---

# 🧩 Authentication Middleware

The authentication middleware verifies the JWT access token before allowing access to protected routes.

### Process

HTTP Request
      ↓
Authorization Header
      ↓
Extract Bearer Token
      ↓
Verify JWT
      ↓
Decode User Information
      ↓
Check Authentication
      ↓
Next Middleware / Controller

Protected requests use:

Authorization: Bearer YOUR_ACCESS_TOKEN

Example:

Authorization: Bearer eyJhbGciOiJIUzI1Ni...

---

# 📌 API Routes

The API mainly contains authentication and issue-management functionality.

---

# 🔐 Authentication Routes

## Register User

Method:
POST

Route:
/api/auth/register

Creates a new user account.

### Request Body

{
  "name": "Rifat",
  "email": "rifat@example.com",
  "password": "password123"
}

### Registration Process

Client
  ↓
POST /api/auth/register
  ↓
Validate User Data
  ↓
Check Existing User
  ↓
Hash Password
  ↓
Create User
  ↓
Save User
  ↓
Return Response

---

## Login User

Method:
POST

Route:
/api/auth/login

Authenticates an existing user.

### Request Body

{
  "email": "rifat@example.com",
  "password": "password123"
}

### Login Process

Client
  ↓
POST /api/auth/login
  ↓
Find User
  ↓
Compare Password
  ↓
Generate JWT
  ↓
Return Authentication Response

---

# 👤 User / Profile Routes

User and profile-related routes are protected using authentication middleware.

### Protected Request Flow

Client
  ↓
Access Token
  ↓
Authentication Middleware
  ↓
Verify JWT
  ↓
Identify User
  ↓
Controller
  ↓
Response

The authenticated user's information can then be used inside the controller.

---

# 🐛 Issue Management

The project contains an Issue Management System.

Users can create and manage issues through the API.

### Example Issue

{
  "title": "Login button not working",
  "description": "The login button does not submit the form correctly.",
  "type": "bug",
  "status": "open",
  "reporter_id": 1
}

---

# 📋 Issue Fields

## title

The title of the issue.

Maximum length:

150 characters

Example:

Login button is not working

---

## description

Contains the detailed explanation of the issue.

Minimum length:

20 characters

Example:

The login button does not submit the form correctly.

---

## type

The issue type can be:

- bug
- feature_request

### Bug

Used when an existing feature or functionality is not working correctly.

Example:

The login button does not work.

### Feature Request

Used when a user wants a new feature.

Example:

Add Google authentication.

---

## status

An issue can have one of these statuses:

- open
- in_progress
- resolved

### Open

The issue has been created but work has not started.

### In Progress

The issue is currently being worked on.

### Resolved

The issue has been fixed or completed.

---

## reporter_id

Stores the ID of the user who reported the issue.

Example:

reporter_id = 5

This means the issue was reported by the user whose ID is 5.

---

# 📋 Issue Routes

## Create Issue

Method:
POST

Route:
/api/issues

Creates a new issue.

### Request Body

{
  "title": "Navbar is broken",
  "description": "The navbar does not work correctly on mobile devices.",
  "type": "bug"
}

### Flow

Client
  ↓
POST /api/issues
  ↓
Authentication Middleware
  ↓
Validate Request
  ↓
Create Issue
  ↓
Save to Database
  ↓
Return Response

---

## Get All Issues

Method:
GET

Route:
/api/issues

Returns all available issues.

### Example Response

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

---

## Get Single Issue

Method:
GET

Route:
/api/issues/:id

Returns a single issue using its ID.

### Example

GET /api/issues/1

This returns the issue whose ID is 1.

---

## Update Issue

Method:
PATCH

Route:
/api/issues/:id

Updates an existing issue.

### Example

PATCH /api/issues/1

### Update Status

{
  "status": "in_progress"
}

### Update Type

{
  "type": "feature_request"
}

The API can update the required fields without replacing the entire issue.

---

## Delete Issue

Method:
DELETE

Route:
/api/issues/:id

Deletes an issue using its ID.

### Example

DELETE /api/issues/1

The issue with ID 1 will be deleted according to the project's authorization rules.

---

# 🔄 Complete API Request Flow

A protected API request generally follows this architecture:

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
Database
   │
   ▼
Controller Response
   │
   ▼
Frontend

---

# 🧠 Backend Architecture

The project follows a modular backend architecture.

Routes
  ↓
Middleware
  ↓
Controllers
  ↓
Services
  ↓
Database

### Routes

Routes define API endpoints.

Examples:

POST /api/auth/register
POST /api/auth/login

GET /api/issues
GET /api/issues/:id
POST /api/issues
PATCH /api/issues/:id
DELETE /api/issues/:id

### Middleware

Middleware handles common operations such as:

- Authentication
- JWT verification
- Role checking
- Request processing
- Validation

### Controllers

Controllers handle the main request and response logic.

Examples:

- Authentication Controller
- User Controller
- Issue Controller

### Services

Services contain reusable business logic and database-related operations.

---

# 📦 Dependencies

| Package | Purpose |
|---|---|
| express | Backend REST API framework |
| pg | PostgreSQL database connection |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT authentication |
| dotenv | Environment configuration |
| tsx | Run TypeScript during development |
| typescript | TypeScript development |
| tsup | Build TypeScript project |
| @types/express | Express TypeScript types |
| @types/jsonwebtoken | JWT TypeScript types |
| @types/node | Node.js TypeScript types |
| @types/pg | PostgreSQL TypeScript types |

---

# ⚙️ Installation

Clone the repository:

git clone <your-repository-url>

Go to the project directory:

cd server_side

Install dependencies:

npm install

---

# ▶️ Development Server

Start the development server:

npm run dev

This command runs:

tsx watch ./src/server.ts

The server automatically restarts whenever the source code changes.

---

# 🏗️ Build Project

Build the project using:

npm run build

This runs:

tsup

The compiled files are generated inside:

dist/

---

# 🚀 Production Server

After building the project:

npm start

This runs:

node dist/server.js

---

# 🧪 API Testing

The API can be tested using:

- Postman
- Thunder Client
- REST Client
- Frontend application

### Recommended Testing Order

1. Register User
        ↓
2. Login
        ↓
3. Receive Access Token
        ↓
4. Send Access Token
        ↓
5. Access Protected Route
        ↓
6. Create Issue
        ↓
7. Get All Issues
        ↓
8. Get Single Issue
        ↓
9. Update Issue
        ↓
10. Delete Issue

---

# 🌐 Authorization Header

Protected API routes require an access token.

Use:

Authorization: Bearer YOUR_ACCESS_TOKEN

Example:

GET /api/issues

Authorization: Bearer eyJhbGciOiJIUzI1Ni...

---

# 🗃️ Database Relationship

The main relationship between users and issues can be represented as:

Users
  │
  │ reporter_id
  ▼
Issues

One user can report multiple issues.

Example:

User #1
  ├── Issue #1
  ├── Issue #2
  └── Issue #3

---

# 🔒 Security Practices

The project follows several important backend security practices:

- Password hashing with bcrypt
- JWT authentication
- Role-based authorization
- Protected API routes
- Input validation
- Environment-based configuration
- Parameterized database queries

Sensitive information should never be hard-coded inside the source code.

Bad:

const secret = "my-secret";

Better:

const secret = process.env.JWT_ACCESS_SECRET;

---

# 🛠️ Common Commands

### Install Dependencies

npm install

### Start Development Server

npm run dev

### Build Project

npm run build

### Start Production Server

npm start

---

# 📦 package.json

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

---

# 📚 Project Summary

This project is a backend REST API developed with modern Node.js technologies.

The main concepts demonstrated in this project are:

- Node.js
- Express.js
- TypeScript
- REST API
- JWT Authentication
- Password Hashing
- Role-Based Authorization
- PostgreSQL
- CRUD Operations
- Middleware
- API Validation

The project is designed to provide a structured and secure backend API that can be connected with a frontend application such as React, Next.js, or another client application.