# CampusBite Project

CampusBite is a campus food ordering application built with React, Node.js, Express and MariaDB.

## Current Features

- React frontend
- Menu loaded from MariaDB through the backend API
- Admin menu management
- Add, edit and delete menu items
- Dietary and weekday information
- Add food items to cart
- Cart counter
- Express REST API
- MariaDB database integration

## Project Setup

### 1. Clone the repository

```bash
git clone https://github.com/UncSammy/CampusBite-project.git
cd CampusBite-project
git checkout arkojits-frontend
```

### 2. Set up the database

Make sure MariaDB is installed and running.

The project contains a `database.sql` file which creates the CampusBite database, required tables and sample menu items.

Import it into MariaDB:

```bash
mysql -u root -p < database.sql
```

Enter your MariaDB password when asked.

### 3. Configure the backend

Go to the backend folder:

```bash
cd backend
```

Create a `.env` file inside the `backend` folder.

Use `backend/.env.example` as a template:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MARIADB_PASSWORD
DB_NAME=campusbite
DB_PORT=3306
```

Replace `YOUR_MARIADB_PASSWORD` with your own MariaDB password.

Do not commit the `.env` file because it contains private database credentials.

### 4. Install backend dependencies

Inside the `backend` folder:

```bash
npm install
```

### 5. Start the backend

```bash
npm start
```

The backend should run at:

`http://localhost:3000`

The menu API can be tested at:

`http://localhost:3000/api/menu`

### 6. Install frontend dependencies

Open another terminal and go to the frontend folder:

```bash
cd frontend
npm install
```

### 7. Start the frontend

```bash
npm run dev
```

The frontend should normally run at:

`http://localhost:5173`

## How It Works

The React frontend communicates with the Node/Express backend through API requests.

The backend connects to MariaDB and retrieves the menu items from the `menu_items` table.

Admin users can currently add, edit and delete menu items through the Admin page.

Customers can browse the menu and add food items to the cart.

## Current Development

The next features being worked on are:

- Cart UI
- Checkout and order handling
- Login and registration
- Further admin functionality

## Technologies

- React
- Vite
- Node.js
- Express
- MariaDB
- JavaScript
- HTML/CSS