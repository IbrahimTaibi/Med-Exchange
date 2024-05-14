#Med-Exchange
Introduction

Med-Exchange is a Node.js Express application designed to serve as a backend for a medical exchange platform. It utilizes MongoDB as the database for storing medical information.

Prerequisites
Before running this application, make sure you have the following installed:

Node.js
MongoDB

Installation
Clone this repository to your local machine.

git clone https://github.com/IbrahimTaibi/Med-Exchange.git

Navigate to the project directory.
cd Med-Exchange

Install dependencies.
npm install

Configuration
Create a .env file in the root directory of the project.

Add the following environment variables to the .env file:
makefile

PORT=3000

MONGODB_URI=your_mongodb_connection_string

Replace your_mongodb_connection_string with the connection string for your MongoDB instance.

Usage
Start the server.

npm start
Access the API endpoints using tools like Postman or integrate them into your frontend application.
API Endpoints

GET /api/v2/medicament

POST /api/v2/medicament

PATCH /api/v2/medicament/:id

DELETE /api/v2/medicament/:id


Contribution
Contributions are welcome! Please fork the repository and submit pull requests.


