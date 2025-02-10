# Shortie URL Shortener API

[![CI/CD](https://github.com/silverstone-git/shortie/actions/workflows/deploy.yml/badge.svg)](https://github.com/silverstone-git/shortie/actions/workflows/deploy.yml)

This is the API for Shortie, a URL shortening service that allows users to create short URLs from long URLs and provides analytics for tracking clicks.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the API](#running-the-api)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Home Page](#home-page)
  - [URL Redirection](#url-redirection)
  - [Analytics](#analytics)
  - [Shorten URL](#shorten-url)
- [Technologies Used](#technologies-used)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Introduction

Shortie simplifies long URLs into shorter, more manageable links.  It also provides analytics to track the performance of your shortened URLs, including total clicks, unique users, clicks by date, operating system, and geographic location.

## Features

- Short URL creation from long URLs.
- Custom alias support for short URLs.
- URL redirection.
- Comprehensive click analytics (total clicks, unique users, clicks by date, OS, and location).
- OAuth-based authentication.

## Getting Started

### Prerequisites

- Node.js (v20 or higher recommended)
- npm or yarn
- MongoDB (running instance)
- Redis (running instance)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/silverstone-git/shortie.git
cd shortie
```



 * Install dependencies:
```bash
npm install  # Or yarn install
```

 * Configure environment variables:
   * Create a .env file in the project root for local development (__important__) and/or put them in your shell config.  
     Example:  

```bash
NODE_ENV=development  
PORT=3000  
DATABASE_URL=mongodb://localhost:27017/shortie  # Replace with your MongoDB URI  
REDIS_URL=redis://localhost:6379  # Replace with your Redis URL  
PORT=3000  
BASE_URL=http://localhost:3000  
AUTH_SECRET=ABCABCABCABACC # Replace with your own auth secret  
AUTH_GOOGLE_ID=ABCABCABCABACC # Replace with your own google web client ID  
AUTH_GOOGLE_SECRET=ABCABCABCABACC # Replace with your own google web client secret  
AUTH_TRUST_HOST=http://localhost:3000

# These 3 are build time vars, so, they go in your shell profile / through export command / etc.
MAXMIND_LICENSE_KEY=ABCABCABCABACC # optional. get from maxmind.com/en/geoip-demo  
DOCKER_USERNAME=ABCABCABCABACC  # required, put in anything if you dont have a dockerhub account  
LATEST_TAG="latest" # required. replace with your own version/tag name of the desired docker image  
```
  

   * For running docker locally or in production, use a .env.production file and configure it as needed.  

### Running the API
### Local Development:

```
npm run dev  # Uses nodemon for automatic restarts
```
### Production (Docker):
 * Build the Docker image:
 ```
   docker-compose build
```
 * Run the Docker containers:
 ```
   docker-compose up -d
```

### Next steps
- Log in by visiting /api/auth/signin
- Copy the cookie string shown at home page into your request's Cookie Header
- Shorten URLs and Analyze the visitors
- Profit  


## API Endpoints
The API is documented using Swagger.  You can access the Swagger UI at /api/docs after starting the server.  The following are the main endpoints:
### Authentication
 * GET /api/auth/signin: Redirects to the OAuth login page.
### Home Page
 * GET /: Returns the home page, shows authenticated user information
### URL Redirection
 * GET /{alias}: Redirects to the original URL associated with the given alias.
### Analytics
 * GET /api/analytics/overall: Overall analytics for the user generated links
 * GET /api/analytics/{alias}: Retrieves analytics for the given alias.
 * GET /api/analytics/topic/{topic}: Retrieves analytics for the given topic.
### Shorten URL
 * POST /api/shorten: Creates a new short URL
 * GET /api/shorten/{alias}: hops you through to your desired long URL, corresponding to alias
### Docs
 * GET /api/docs: Documentation shown in html page using swagger  



## Technologies Used
 * Node.js
 * TypeScript
 * Express.js
 * MongoDB
 * Redis
 * @auth/express
 * @auth/mongodb-adapter
 * cors
 * dotenv
 * express-rate-limit
 * geoip-lite
 * module-alias
 * ngeohash
 * npm-run-all
 * redis
 * supertest
 * swagger-ui-express
 * tsx
 * uuid
 * yamljs

## Testing
```
npm test
```


## Deployment
The API is designed to be deployed using Docker and Docker Compose.  See the Running the API section for instructions.  


## Contributing
Contributions are welcome! Please open an issue or submit a pull request.  


## License
[MIT](https://mit-license.org)  


## Key Improvements and Explanations

This project has undergone several key improvements, focusing on code organization, functionality, and production readiness. Here's a detailed breakdown:
### Code Structure and Organization:
 * Modular Design: The codebase is organized into distinct folders (routes, types, utils, middlewares) to promote maintainability and scalability. This separation of concerns makes it easier to navigate and understand the different parts of the application.
 * Unified Exports: Exports from files are unified for production builds, streamlining the build process and potentially reducing bundle size.
### Functionality Enhancements:
 * Enhanced Analytics: The analytics response object has been improved to provide more comprehensive data, including total clicks, unique users, clicks by date, operating system (including Android), and geographic location.
 * Geolocation: Geolocation functionality has been implemented, allowing for the tracking of clicks based on user location.  This feature uses geoip-lite to provide geolocation data.
 * Location Grouping:  A location grouping feature has been added, using ngeohash to group clicks from nearby areas (e.g., within a country or region) for more meaningful location-based analytics.
 * Improved URL Handling: Redundant fields in the URL data have been removed, simplifying the data model.
 * Authentication with Auth.js: The authentication system has been migrated to Auth.js, providing a more robust, secure, and feature-rich authentication solution.  This replaces the previous manual OAuth implementation.
 * User Model Adjustments: The user model has been updated to align with the Google user payload, simplifying user data handling.  


### Production Readiness:
 * Import Alias Fix: tsc-alias is used to resolve import aliases in production builds, ensuring that the application works correctly after compilation.
 * Docker Setup: Docker setup has been improved and made compatible with environment variables, allowing for easier deployment and configuration in different environments.
 * Redis Service in Docker Compose: A Redis service has been added to the docker-compose.yml file, simplifying the management of Redis as a dependency in the Docker environment.
 * Production-Ready Docker Compose: The Docker Compose configuration is now optimized for production, including environment variable handling and image pulling/pushing to Docker Hub.
 * trust proxy Setting: The trust proxy setting in Express.js has been correctly configured to 1 to enhance security when running behind a reverse proxy like Nginx.  This mitigates the risk of IP spoofing attacks on rate limiting.
 * Redis Connection Fix: Issues with the Redis connection have been resolved, ensuring reliable communication with the Redis database.
 * Enhanced Logging: More logging has been added to improve debugging and monitoring in production.
 * Package Lock Ignored: The package-lock.json file is now ignored in version control to allow flexibility in dependency updates.  

### Bug Fixes and Debugging:
 * Docker Configuration: Issues with the Docker environment were resolved with a lot of trial and error
 * Type Error Fixes: Several type errors have been corrected to improve code stability and prevent runtime issues.
 * /:alias Endpoint Fix: The /:alias endpoint has been debugged and corrected, and it has been multiplexed with the root route (/) to avoid conflicts.
### Other Deliberate Choices / Challenges:
 * Mongoose Removed: Mongoose has been removed, potentially simplifying the database interaction and improving performance.  MongoDB's native driver is now used.
 * type: 'module' setting in package.json: The entire API has been made an EcmaScript Module to be compatible with modern JS runtimes and libraries, backwards compatible with CommonJS
 * Global Type File Updates: The global type file has been updated with more modules to improve type safety across the project  

