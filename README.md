# Manipur Student Directory & Community

React + Vite frontend with an Express + MongoDB backend.

## Modules

- Student directory with search and filters
- Batch and course browsing
- Student profile pages
- Admin student CRUD
- Admin batch CRUD
- Admin dashboard and authentication
- Community chat: General, CSE and Freshers channels
- Events and public registration
- Admin event CRUD and registration viewer
- Admin announcements
- Public latest announcements
- Admin audit logs
- Rate limiting on public chat and event registration

## MongoDB setup

The MySQL layer has been removed. The backend now uses the official MongoDB Node.js driver.

1. Install and start MongoDB locally, or create a MongoDB Atlas cluster.
2. Open `backend/.env` and set:

```env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=ManipurStudentDirectory
```

For Atlas, `MONGODB_URI` should be your Atlas connection string.

3. Create the database collections and indexes:

```bash
cd backend
npm install
node database/mongo-init.js
```

MongoDB will create these collections:

- `admins`
- `batches`
- `students`
- `announcements`
- `events`
- `event_registrations`
- `community_messages`
- `audit_logs`
- `counters`

You do **not** need to manually create SQL tables or run the old `.sql` migration.

### Create the first admin

After MongoDB setup:

```bash
cd backend
npm run create-admin
```

Default development account:

- Email: `admin@manipurstudents.com`
- Password: `Admin@12345`
- Role: `admin`

Change the `ADMIN_PASSWORD` value in `.env` before using this in production.

## Start backend

```bash
cd backend
npm install
npm start
```

## Start frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend API client continues to use `http://localhost:5000/api`, so no frontend database code needs to change.

## Important implementation detail

The API still exposes numeric `id` values for students, batches, events, announcements, admins, community messages, registrations and audit logs. MongoDB internally also has its normal `_id`, but the application uses the numeric IDs so the existing React frontend routes and filters continue to work without changing the UI.
