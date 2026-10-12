# ClarifyX Backend

This is the backend API for the ClarifyX application, built with Node.js, Express, TypeScript, and Sequelize ORM.

## Prerequisites

- Node.js (v18 or newer)
- PostgreSQL (running locally or accessible via URL)

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```
   *Ensure `DATABASE_URL` points to your PostgreSQL database.*

## Running the Application

- **Development**:
  ```bash
  npm run dev
  ```
  Runs the server on `http://localhost:4000` with hot-reloading. The database schema will automatically sync in development mode.

- **Production**:
  ```bash
  npm run build
  npm run start
  ```

## Available Scripts

- `npm run dev`: Start dev server
- `npm run build`: Compile TypeScript to JavaScript
- `npm run start`: Start production server
- `npm run test`: Run Jest tests

## API Endpoints

### Health Check
- `GET /api/health`: Returns API health status.

### Scans
- `POST /api/scans`: Create a new scan.
- `GET /api/scans`: Get all scans.
- `GET /api/scans/:id`: Get a specific scan.
- `DELETE /api/scans/:id`: Delete a specific scan.
