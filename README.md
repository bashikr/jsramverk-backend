### Jsramverk-backend (Magic Editor) ###
This repository contains a server that runs as a backend for an 
assignment  in the jsramverk course, (DV1612 H21) at Blekinge Institute of Technology. It is built with Node.js, Express, and MongoDB (Atlas).

### Steps to start using jsramverk-backend are: ###
#### First: ####
1. Clone this repository ```git clone https://github.com/bashikr/jsramverk-backend.git```
2. npm install
3. npm install -g nodemon

#### Second: ####
Connect the back-end to MongoDB Atlas by creating a file with the name **config.json** inside the **connection-mongodb** folder and fill it with:

```
{
    "username": "your mongoDB Atlas username",
    "password": "the password of the given username",
    "database": "the name of your database",
    "docsCollection": "the collection name"
}
```
#### Third: ####
Start the server in:
* Development
```npm run watch```

* Production
```npm start```

> Now the server is ready and running. You can open any browser of you choice and then open the following url:
http://localhost:1337


### Magic Editor back-end Routes: ###

 
| Route      | Method | Result     |
| :---        |    :----:   |          ---: |
| /      | GET       | Index page that Returns 'Hello Webbis'  |
| /documents   | GET        | Returns all the documents inside the docs collection  |
| /documents/:id   | GET        | Returns specific document by its id  |
| /documents/create-doc   | POST        | Creates a new document  |
| /documents/update-doc   | PUT        | Updates a specific document in the docs collection  |
| /documents/delete-doc/:id  | DELETE        | Deletes a specific document from the docs collection  |
