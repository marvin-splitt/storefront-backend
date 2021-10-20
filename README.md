# Storefront Backend

This project is part of the Udacity Full-Stack Javascript Nanodegree

It provides an express application serving several API endpoints for storing and accessing data, located in a postgres database. It serves routes for users, orders and products. It uses JWT Token for authorization.

## API Reference

Go to the `REQUIREMENTS.md` file for the API Endpoint reference and data shape documentation.

## Scripts

Run prettier

```bash
  npm run prettier
```

Run lint

```bash
  npm run lint
```

Run tests

```bash
  npm run test
```

Start the dev server

```bash
  npm run watch
```

Build the project

```bash
  npm run build
```

Run the application

```bash
  npm run start
```

## Run Locally

Clone the project

```bash
  git clone https://github.com/marvin-splitt/storefront-backend.git
```

Go to the project directory

```bash
  cd storefront-backend/
```

Install dependencies

```bash
  npm install
```

Set up the `.env` file for connecting to the database and a working authorization. `.env.example` file is provided with needed keys

Run the migrations

```bash
  db-migrate up
```

Start the docker postgres container

```bash
  docker-compose up -d
```

Start the dev server

```bash
  npm run watch
```

Application will run on port 3000

## Running Tests

To run tests, run the following command

```bash
  npm run test
```

## Author

Marvin Splitt ([@marvin-splitt](https://github.com/marvin-splitt))
