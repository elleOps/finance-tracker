# Finance Tracker

A full-stack personal finance tracker built with React, FastAPI, SQLAlchemy, and SQLite.

The application allows users to record income and expenses, organise transactions by category, edit or delete existing entries, filter transactions, and monitor their overall financial balance through a simple web interface.

## Overview

Finance Tracker was built as a portfolio project to explore full-stack application development, REST APIs, database modelling, and frontend-backend integration.

The project consists of a React frontend communicating with a Python FastAPI backend. Transaction and category data is stored using SQLAlchemy with SQLite as the database.

The interface was designed from scratch using custom CSS, with a focus on keeping the application clean, professional, and easy to use.

## Features

* Add income and expense transactions
* Assign transactions to categories
* Record transaction dates
* Edit existing transactions
* Delete transactions
* Filter transactions by category
* Filter transactions by date range
* View total income
* View total expenses
* View current balance
* Responsive custom frontend styling
* Error feedback for failed requests
* Loading state while application data is retrieved
* REST API backed by a relational database

## Tech Stack

### Frontend

* React
* Vite
* JavaScript
* Custom CSS
* Google Fonts

  * Fraunces
  * Inter

### Backend

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* SQLite
* Uvicorn

## Architecture

The application follows a simple client-server architecture:

```text
┌──────────────────────┐
│   React Frontend     │
│                      │
│  Forms / Filters /   │
│  Transaction UI      │
└──────────┬───────────┘
           │
           │ HTTP requests
           │
           ▼
┌──────────────────────┐
│    FastAPI Backend   │
│                      │
│  REST API endpoints  │
│  Validation          │
│  Business logic      │
└──────────┬───────────┘
           │
           │ SQLAlchemy
           │
           ▼
┌──────────────────────┐
│    SQLite Database   │
│                      │
│ Categories           │
│ Transactions         │
└──────────────────────┘
```

The frontend communicates with the backend using HTTP requests. FastAPI handles the API layer, while SQLAlchemy provides the ORM layer between the Python application and SQLite database.

## Data Model

The application currently uses two related database models.

### Category

Each category has:

* `id`
* `name`

Categories have a one-to-many relationship with transactions.

### Transaction

Each transaction contains:

* `id`
* `amount`
* `description`
* `date`
* `type`
* `category_id`

The `category_id` field creates a foreign-key relationship between transactions and categories.

This means categories are stored separately rather than repeatedly storing category names inside every transaction.

## API

The FastAPI backend exposes the following endpoints:

| Method   | Endpoint             | Purpose                                 |
| -------- | -------------------- | --------------------------------------- |
| `GET`    | `/categories`        | Retrieve all categories                 |
| `POST`   | `/categories`        | Create a category                       |
| `GET`    | `/transactions`      | Retrieve transactions                   |
| `POST`   | `/transactions`      | Create a transaction                    |
| `PUT`    | `/transactions/{id}` | Update a transaction                    |
| `DELETE` | `/transactions/{id}` | Delete a transaction                    |
| `GET`    | `/summary`           | Calculate income, expenses, and balance |

The `/summary` endpoint calculates:

```text
Balance = Total Income - Total Expenses
```

## Getting Started

### Prerequisites

Make sure you have the following installed:

* Python 3
* Node.js
* npm
* Git

### 1. Clone the repository

```bash
git clone https://github.com/elleOps/finance-tracker.git
cd finance-tracker
```

### 2. Create and activate a Python virtual environment

On macOS/Linux:

```bash
python3 -m venv venv
source venv/bin/activate
```

On Windows:

```bash
python -m venv venv
venv\Scripts\activate
```

### 3. Install backend dependencies

```bash
pip install -r requirements.txt
```

### 4. Seed the database

The project includes a small seed script that creates the default transaction categories.

Run:

```bash
python3 seed.py
```

The default categories are:

* Groceries
* Rent
* Salary
* Transport
* Entertainment
* Utilities

The SQLite database (`finance.db`) is created locally and is intentionally excluded from version control.

### 5. Start the backend

From the root `finance-tracker` directory:

```bash
uvicorn main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

FastAPI also provides interactive API documentation at:

```text
http://127.0.0.1:8000/docs
```

### 6. Start the frontend

Open a second terminal and navigate to the frontend:

```bash
cd frontend
npm install
npm run dev
```

Vite will provide a local development URL, normally:

```text
http://localhost:5173
```

Open that address in your browser.

Both the backend and frontend need to remain running while using the application.

## Project Structure

```text
finance-tracker/
│
├── main.py                 # FastAPI application, models, schemas and API endpoints
├── seed.py                 # Seeds the database with default categories
├── requirements.txt        # Python dependencies
├── .gitignore
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   │
│   └── src/
│       ├── App.jsx         # Main React component and application logic
│       ├── App.css         # Custom application styling
│       ├── index.css
│       └── main.jsx
│
└── finance.db              # Local SQLite database (not committed)
```

## Development Decisions

### Why FastAPI?

FastAPI provides a lightweight way to build a REST API in Python while providing automatic request validation through Pydantic and automatically generated API documentation.

### Why SQLAlchemy?

SQLAlchemy provides an ORM layer, allowing the application to work with database records through Python models rather than constructing SQL queries throughout the application.

The models also make relationships between entities explicit, such as the relationship between categories and transactions.

### Why SQLite?

SQLite was chosen because it is file-based and requires no separate database server, making it appropriate for a small local application and straightforward development environment.

### Why React?

React provides a component-based approach to building the frontend and makes it straightforward to manage application state such as transactions, categories, filters, and form data.

## Frontend-Backend Integration

The React application communicates directly with the FastAPI server using the browser's `fetch` API.

For example, loading the application data involves retrieving:

```text
GET /transactions
GET /categories
GET /summary
```

The frontend then stores the returned data in React state and renders the interface from that state.

Creating, editing, and deleting transactions similarly send HTTP requests to the appropriate FastAPI endpoints.

CORS is configured on the backend to allow the local Vite development server to communicate with the API.

## Current Status

The application is currently functional as a local full-stack application.

Implemented:

* Database models
* API endpoints
* Category management
* Transaction creation
* Transaction editing
* Transaction deletion
* Income/expense calculations
* Balance calculation
* Category filtering
* Date filtering
* Frontend validation and error feedback
* Loading state
* Custom frontend design
* Frontend-backend integration

The current version is intended primarily for local development and demonstration.

## Future Improvements

Potential future improvements include:

* User authentication
* Multiple user accounts
* Persistent cloud database
* Production deployment
* Monthly and yearly spending summaries
* Charts and spending visualisations
* More advanced filtering
* Recurring transactions
* Budget tracking
* CSV export
* Pagination for larger transaction histories
* Automated backend tests
* Frontend component testing
* API integration tests
* Improved accessibility
* Responsive mobile-focused design

## What I Learned

This project provided practical experience building a complete application across the frontend, backend, and database layers.

Key areas explored include:

* Designing relational database models
* Building REST APIs with FastAPI
* Using an ORM with SQLAlchemy
* Validating API input with Pydantic
* Managing frontend state with React
* Connecting a JavaScript frontend to a Python backend
* Handling asynchronous HTTP requests
* Implementing CRUD operations
* Working with CORS
* Managing local development environments
* Using Git and GitHub for version control

## Running the Project Locally

In short, the application requires two running processes:

**Terminal 1 — Backend**

```bash
source venv/bin/activate
uvicorn main:app --reload
```

**Terminal 2 — Frontend**

```bash
cd frontend
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

---

Built as a personal software engineering portfolio project.
