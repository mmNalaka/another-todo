# Ubiquiti Todo - Full Stack Developer Home Assignment

## User stories

### Core Features

- [ ] As a user, I can create to-do items, such as a grocery list.
- [ ] As another user, I can collaborate in real-time with other users so that we can (for example) edit our family shopping list together.
- [ ] As a user, I can mark to-do items as "done" so that I can avoid clutter and focus on things that are still pending.
- [ ] As a user, I can filter the to-do list and view items that were marked as done so that I can retrospect on my prior progress.

### Task Organization

- [ ] As a user, I can add sub-tasks to my to-do items so that I could make logical groups of tasks and see their overall progress.
- [ ] As a user, I can make infinite nested levels of subtasks.
- [ ] As a user, I can change the order of tasks via drag & drop.
- [ ] As a user, I can move/convert subtasks to tasks via drag & drop.

### Cost Tracking

- [ ] As a user, I can specify cost/price for a task or a subtask so that I can track my expenses / project cost.
- [ ] As a user, I can see the sum of the subtasks aggregated in the parent task so that in my shopping list I can see what contributes to the overall sum (e.g., a task called "Salad" with ingredients as sub-tasks, showing the total cost).

### Rich Content

- [ ] As a user, I can add sub-descriptions of tasks in Markdown and view them as rich text while I'm not editing the descriptions.
- [ ] As a user, I can see the cursor and/or selection of another user as they select/type when editing text so that we can discuss focused words during our online call.

### List Management

- [ ] As a user, I can create multiple to-do lists where each list has its unique URL that I can share with my friends so that I could have separate to-do lists for my groceries and work-related tasks.
- [ ] As an owner/creator of a certain to-do list, I can freeze/unfreeze a to-do list I've created to avoid other users from mutating it.

### Special Task Types

- [ ] As a user, I can add "special" typed to-do items that will have custom style and some required fields:

### Offline & Persistence

- [ ] As a user, I can keep editing the list even when I lose internet connection, and can expect it to sync up with the backend as I regain connection.
- [ ] As a user, I can be sure that my todos will be persisted so that important information is not lost when the server restarts.

### Advanced Features

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
pnpm run dev
```
