# Taskly - A Trello alternative

## 📋 Overview
Before introducing the project itself, let’s put a little bit of context on this. For
our third year of studies in computer science at Epitech, we must have practical
work experience at the start of the year part-time (Thursdays and Fridays). This
translates into a part-time internship or a professional project in a simulated work
situation.

And this is where this project comes in. In the simulated professional work,
we had to choose a project from a catalogue that the school provided. The projects
refer to an existing application, and our goal is to stick as closely as possible to the functionalities of the original app.<br>
About the app, I have chosen the EpiTrello project from the given projects
list. Trello is an online project management tool, inspired by Toyota's Kanban
method. It is based on the organization of projects into boards listing cards, each
representing tasks. Cards are assignable to users and are movable from one board
to another, representing their progress. Code name: “Taskly”.

## ✨ Key Features
- Visually intuitive and responsive Kanban board interface.
- Users can manage tasks through cards, lists, and boards.
- Supports multiple users and shared boards.
- Real-time updates when multiple users interact with the same board.

## ⚙️ Quick Start
1. Clone the repository: `git clone https://github.com/NuggetReckt/Taskly.git`
2. Navigate to the backend directory: `cd Taskly/backend`
3. In the `resources` directory, copy/paste the `.env-exemple` file and name the copy to `.env`: `cd resources && cp .env-exemple .env`
4. Open the `.env` with your prefered text editor and fill in the required fields.
5. Go back to the root directory and go to the frontend app directory: `cd ../../frontend/app`
6. create a `secrets.tsx` file with the following content:
  ```typescript
  export const API_BASEURL = "http://localhost:8000"
  export const API_SECRET = "" // The API key you set in the backend .env file
  export const JWT_SECRET = "" // The secret key for the JWT you set in the backend .env file
  ```
7. Build and run the project: `docker compose up --build`
8. That's it! Now you can access the application at http://localhost

⚠️ Do not forget to create secrets.tsx file for frontend and .env file for backend!

## 📚 Documentation
- [Documentation](https://taskly-1.gitbook.io/docs/)
- [API Reference](https://api.noskillworld.fr/docs)

## 🛠️ Technologies Used

### Frontend
- [React](https://react.dev/) - React is a declarative, component-based JavaScript library for building user interfaces.
- [Next.js](https://nextjs.org/) - Next.js is a React-based web framework for building full-stack applications with server-side rendering 
  and static site generation.
- [TailwindCSS](https://tailwindcss.com/) - TailwindCSS is a utility-first CSS framework for rapidly building custom user interfaces.

### Backend
- [Python](https://www.python.org/) - Python is an interpreted, high-level, general-purpose programming language.
- [FastAPI](https://fastapi.tiangolo.com/) - FastAPI is a modern, fast web framework for building APIs with Python 3.
- [PostgreSQL](https://www.postgresql.org/) - PostgreSQL is an advanced, open-source relational database management system focused on
  reliability, extensibility, and SQL standards compliance.

## 📄 Resources
- Original project website: https://trello.com
- TailwindCSS: https://tailwindcss.com/
- FastAPI: https://fastapi.tiangolo.com/
- Axios: https://axios-http.com/fr/

<br>

*Last update: April 2026*
<br>

<div align="center"><sub>{Epitech.} - 2026</sub></div>