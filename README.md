# P2P Marketplace (Nx Monorepo)

A simple Peer-to-Peer marketplace built with Next.js (App Router), NestJS, and Prisma inside an Nx monorepo.

## Project Structure

- **apps/client**: Next.js 15+ application (Frontend)
- **apps/server**: NestJS application (Backend API)
- **libs/db**: Shared Database module with Prisma schema and client
- **libs/shared/types**: Shared Typescript interfaces and DTOs

## Architecture Overview

This project is structured as a monorepo using **Nx**, enabling shared code and unified tooling.

-   **Frontend (apps/client)**: Built with **Next.js 15+** using the App Router. It leverages React Server Components for efficient data fetching and Client Components for interactive features. Styling is handled by **Tailwind CSS** and **Shadcn/UI**.
-   **Backend (apps/server)**: Built with **NestJS**, providing a robust and scalable architecture. It handles REST API requests, authentication (JWT), and business logic.
-   **Database**: **PostgreSQL** is used as the relational database, managed by **Prisma ORM** for type-safe database access and migrations.
-   **Shared Code (libs)**:
    -   `libs/shared/types`: Contains DTOs and interfaces shared between the client and server, ensuring end-to-end type safety.
    -   `libs/db`: Encapsulates the Prisma client and schema.
-   **Real-time Communication**: **Socket.io** is integrated for real-time updates on offers and transaction statuses.

## Features

-   **Users**: Register, Login (JWT), Profile
-   **Products**: Create, edit, delete, and view products with images, categories, and conditions.
-   **Offers**: Buyers can make offers on products. Sellers can Accept/Decline. Buyers can Withdraw.
-   **Transactions**: When an offer is accepted, a transaction is created. Status tracking (Paid, Shipped, Delivered, Completed).
-   **Real-time Notifications**: Socket.io integration for instant updates on offers and transactions.
-   **Search & Filter**: Filter products by category, price, search text.

## DB Schema Note

> **Important**: In the database schema (`libs/db/prisma/schema.prisma`), the table storing products is named **`Listing`**. In the application code (Frontend/Backend API), the concept is referred to as **`Product`**. Please keep this mapping in mind when working with the database directly.

## Prerequisites

-   Node.js (v18+)
-   Docker (for PostgreSQL and full-stack containerization)
-   npm or yarn or pnpm

## Setup & Run

### Option 1: Development (Manual)

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Start Database**
    ```bash
    # Only starts Postgres
    docker-compose up postgres -d
    ```

3.  **Setup Environment Variables**
    Copy `env.example` to `.env` in the root and adjust if necessary.
    ```bash
    cp env.example .env
    ```

4.  **Database Migration & Seed**
    Run Prisma migrations to set up the schema and seed initial data.
    ```bash
    # Run migrations
    npx nx run db:migrate 
    
    # Seed data
    npx nx run db:seed
    ```

5.  **Start Development Servers**
    Start both client and server in parallel.
    ```bash
    npx nx run-many --target=serve --projects=client,server --parallel
    ```

    -   **Client**: [http://localhost:4200](http://localhost:4200)
    -   **Server**: [http://localhost:3000](http://localhost:3000)

### Option 2: Docker Compose (Full Stack)

You can run the entire stack (Postgres, Server, Client) using Docker Compose.

**Production-like build:**
```bash
docker-compose up --build
```

**Development mode (Hot Reloading):**
This uses `docker-compose.dev.yml` to mount local volumes for hot-reloading.
```bash
docker-compose -f docker-compose.dev.yml up --build
```

### Database Seeding (First Run)

When running with Docker Compose for the first time, the database will be empty. You need to seed it with initial data.
While the containers are running, open a new terminal and run:

```bash
# Execute the seed script inside the running server container
docker-compose exec server npx nx run db:seed
```

*Note: You may still need to run migrations inside the container or locally pointing to the containerized DB.*

## API Documentation

The backend API is served at `http://localhost:3000/api`. Below are the key endpoints:

### Auth (`/auth`)
-   `POST /auth/register`: Register a new user account.
-   `POST /auth/login`: Authenticate and receive a JWT.
-   `GET /auth/profile`: Get the current authenticated user's profile.

### Products (`/products`)
-   `GET /products`: Fetch products with pagination and filters.
    -   Query Params: `page`, `take`, `category`, `search`, `minPrice`, `maxPrice`, `sort`, `excludeSeller`.
-   `POST /products`: Create a new product listing.
-   `GET /products/:id`: Get a single product by ID.
-   `PATCH /products/:id`: Update a product (Seller only).
-   `DELETE /products/:id`: Delete a product (Seller only).
-   `GET /products/user/:userId`: Get all products listed by a specific user.

### Offers (`/offers`)
-   `POST /offers`: Make a financial offer on a product.
-   `GET /offers/my-offers`: Get offers made by the current user (Buyer).
-   `GET /offers/incoming`: Get offers received on the current user's products (Seller).
-   `PATCH /offers/:id/accept`: Accept an offer (Seller).
-   `PATCH /offers/:id/decline`: Decline an offer (Seller).
-   `PATCH /offers/:id/withdraw`: Withdraw an offer (Buyer).
-   `GET /offers/product/:productId`: Get all offers for a specific product.

### Transactions (`/transactions`)
-   `GET /transactions/my`: Get all transactions for the current user (as Buyer or Seller).
-   `GET /transactions/:id`: Get details of a specific transaction.
-   `PATCH /transactions/:id/status`: Update the status of a transaction (e.g., to SHIPPED, DELIVERED).

## Tech Stack

-   **Frontend**: Next.js, TailwindCSS, Lucide Icons, Shadcn/UI (components), Axios, Socket.io-client
-   **Backend**: NestJS, Prisma, Passport (JWT), Socket.io (Gateway)
-   **Database**: PostgreSQL
-   **Tooling**: Nx, ESLint, Prettier, Jest/Cypress
