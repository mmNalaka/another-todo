# Another ToDo app

http://just-do-app-6xrllj-12551e-157-180-29-12.traefik.me/
[Live Demo](http://just-do-app-6xrllj-12551e-157-180-29-12.traefik.me/)


## Description

## User stories

### Core Features

- [x] As a user, I can create to-do items, such as a grocery list.
- [x] As a user, I can mark to-do items as "done" so that I can avoid clutter and focus on things that are still pending.
- [x] As a user, I can filter the to-do list and view items that were marked as done so that I can retrospect on my prior progress.
- [x] As a user, I can set the priority of a to-do item so that I can prioritize my tasks.
- [x] As a user, I can set a due date for a to-do item so that I can plan my tasks.
- [x] As a user, I can edit a to-do item so that I can correct my mistakes.
- [x] As a user, I can delete a to-do item so that I can remove tasks that are no longer relevant.


### Task Organization

- [x] As a user, I can add sub-tasks to my to-do items so that I could make logical groups of tasks and see their overall progress.
- [x] As a user, I can make infinite nested levels of subtasks.
- [x] As a user, I can change the order of tasks via drag & drop.
- [ ] As a user, I can move/convert subtasks to tasks via drag & drop.

### Cost Tracking

- [ ] As a user, I can specify cost/price for a task or a subtask so that I can track my expenses / project cost.
- [ ] As a user, I can see the sum of the subtasks aggregated in the parent task so that in my shopping list I can see what contributes to the overall sum (e.g., a task called "Salad" with ingredients as sub-tasks, showing the total cost).

### Rich Content

- [ ] As a user, I can add sub-descriptions of tasks in Markdown and view them as rich text while I'm not editing the descriptions.
- [ ] As a user, I can see the cursor and/or selection of another user as they select/type when editing text so that we can discuss focused words during our online call.

### List Management

- [x] As a user, I can create multiple to-do lists where each list has its unique URL that I can share with my friends so that I could have separate to-do lists for my groceries and work-related tasks.
- [x] As an owner/creator of a certain to-do list, I can freeze/unfreeze a to-do list I've created to avoid other users from mutating it.

### Special Task Types

- [ ] As a user, I can add "special" typed to-do items that will have custom style and some required fields:

### Offline & Persistence

- [ ] As a user, I can keep editing the list even when I lose internet connection, and can expect it to sync up with the backend as I regain connection.
- [x] As a user, I can be sure that my todos will be persisted so that important information is not lost when the server restarts.

### Advanced Features

- [x] As another user, I can collaborate in real-time with other users so that we can (for example) edit our family shopping list together.
- [ ] As a user, I can use my VR goggles to edit/browse multiple to-do lists in parallel in 3D space so that I can feel ultra-productive.

## Project Structure

```sh
ubiquiti-todo/
├── backend/          # Backend server
├── frontend/         # Frontend app
```

## Tech stack

- Backend: Node.js, TypeScript, Drizzle ORM, Hono, Zod
- Frontend: React, TypeScript, Tailwind CSS,
- Package manager: pnpm
- Database: PostgreSQL

## Local development

```bash
docker compose up -d
pnpm db:push
pnpm run dev
```

## Running locally

To run the application in a production-like environment locally, follow these steps:

### Prerequisites

- Docker and Docker Compose installed on your machine
- Git to clone the repository

### Steps to run

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ubiquiti-todo.git
   cd ubiquiti-todo
   ```

2. Create a `.env` file in the root directory with the following variables (or use the defaults):
   ```
   POSTGRES_PASSWORD=postgres
   POSTGRES_USER=postgres
   POSTGRES_DB=ubiquiti-todo
   JWT_SECRET=super_secret_key
   ACCESS_TOKEN_EXPIRY_MINUTES=15
   REFRESH_TOKEN_EXPIRY_DAYS=30
   ```

3. Build and start the containers using the production Docker Compose configuration:
   ```bash
   docker compose -f docker-compose.local.yaml up --build
   ```

4. Wait for all services to start. You should see logs indicating that the backend, frontend, and database are running.

5. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000

### Stopping the application

To stop the application, press `Ctrl+C` in the terminal where it's running, or run:
```bash
docker compose -f docker-compose.local.yaml down
```

To completely remove all data and start fresh, add the `-v` flag to remove volumes:
```bash
docker compose -f docker-compose.local.yaml down -v
```
