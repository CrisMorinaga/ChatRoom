<h2 align="center">Chatroom</h4>
<p align="center">
  <img width="1280" alt="ChatExample" src="https://github.com/CrisMorinaga/ChatRoom/assets/128830239/c7de7df8-853f-415c-bf03-b4f2b660851f">
</p>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#how-to-use">How To Use</a> •
  <a href="#tech-stack">Tech Stack</a>
</p>


## Key Features

* Real-time chat
  - Instantly send and receive messages from your friends or family.
* Persistent Message Storage
  - Messages are securely stored in a PostgreSQL database, ensuring you can revisit and continue your chats whenever you want.
* Code-Associated Chat Retrieval
  - Enter the code, and your previous messages and full chat history load instantly.

## How To Use

1) Clone this repo, and install the requirements for both Python and Typescript.
2) Create a .env file and fill it with your own secret information.
   ```
    # FLASK ENV
    SECRET_KEY=Your own super secret key
    DATABASE_URL=Your postgresql db link
    # NEXT.JS ENV
    NEXT_PUBLIC_SERVER=Your link to your Python server, use this one if your Python server is running
                       locally with the usual port: http://127.0.0.1:5000
    ```
3) Run the project and that's it!

<img width="1280" alt="MainRoom" src="https://github.com/CrisMorinaga/ChatRoom/assets/128830239/b073b344-0f06-47a1-9257-4a1332af1564">

 
## Tech Stack

* Backend:
  - Flask (For the backend API)
  - SQLAlchemy (ORM for Flask and PostgreSQL)
  - Flask-Socketio (To create the WebSocket connection between the backend and frontend)
* Frontend:
  - Next.js 13 (For designing the website)
  - Tailwind (For design)
  - Zod (For input validation)
  - Axios (For increased API calls security)
  - ShadcnUI (For UI design)
  - DaisyUI (For UI design)
  - Socketio-client (To be able to connect to the backend WebSocket)
* Database:
  - PostgreSQL

## You may also like...

- [SmartBrain](https://github.com/CrisMorinaga/SmartBrain) - A website that uses Clarifai API to scan an image URL and detect faces on it.
- [AI Tic-Tac-Toe](https://github.com/CrisMorinaga/Tic-Tac-Toe) - A Tic-Tac-Toe app that uses an AI with 3 levels of difficulty

---

> Linkedin [@Cristopher Morales](www.linkedin.com/in/cristopher-morales-c)


