# MongoDB database setup

Database name: `ManipurStudentDirectory` (or the value of `MONGODB_DB`).

## Collections

- `admins` — admin accounts and bcrypt password hashes.
- `batches` — course/batch definitions.
- `students` — student directory records; `batch_id` points to `batches.id`.
- `announcements` — public/admin announcements; `created_by` points to `admins.id`.
- `events` — events; `created_by` points to `admins.id`.
- `event_registrations` — registrations; `event_id` points to `events.id`.
- `community_messages` — community chat messages and optional file metadata.
- `audit_logs` — admin activity history; `admin_id` points to `admins.id`.
- `counters` — numeric ID counters used to keep the existing frontend-compatible numeric IDs.

MongoDB does not require you to manually create these collections first. Run `node database/mongo-init.js` and MongoDB will create them and the indexes.

## Main document fields

### admins
`id`, `name`, `email`, `password_hash`, `role`, `created_at`, `updated_at`

### batches
`id`, `batch_name`, `batch_year`, `course_name`, `duration_years`, `description`, `created_at`, `updated_at`

### students
`id`, `full_name`, `enrollment_number`, `email`, `phone`, `gender`, `course_name`, `branch`, `batch_id`, `admission_year`, `current_year`, `semester`, `expected_graduation_year`, `profile_image`, `bio`, `created_at`, `updated_at`

### announcements
`id`, `title`, `content`, `is_published`, `created_by`, `created_at`, `updated_at`

### events
`id`, `title`, `description`, `venue`, `event_date`, `registration_deadline`, `is_published`, `created_by`, `created_at`, `updated_at`

### event_registrations
`id`, `event_id`, `name`, `email`, `enrollment_number`, `created_at`

### community_messages
`id`, `channel`, `display_name`, `message`, `reply_to_id`, `file_name`, `file_path`, `file_mime`, `file_size`, `created_at`

### audit_logs
`id`, `admin_id`, `action`, `entity_type`, `entity_id`, `description`, `ip_address`, `created_at`

## Create the first admin

After setup, run:

`npm run create-admin`

The default account is:

- Email: `admin@manipurstudents.com`
- Password: `Admin@12345`

For production, change `ADMIN_PASSWORD` in `.env` before running the command.
