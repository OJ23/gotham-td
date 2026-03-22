# Gotham Registry

React + Vite frontend with an Express + MongoDB API for heroes and criminals.

## Cloudinary image upload setup

1. Install dependencies:

```bash
npm install
```

2. Create `gotham-td/.env` and set:

```env
MONGO_URI=mongodb://127.0.0.1:27017/gotham_registry
PORT=4000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

3. Start frontend and backend together:

```bash
npm run dev:all
```

When you upload an image from the form, the file is sent to Cloudinary via `/api/uploads/image`. The resulting `image` URL and `imagePublicId` are saved in MongoDB.

## MongoDB data notes

The local `mongo-data/` folder is intentionally ignored and should not be committed to Git. It contains live MongoDB WiredTiger database files, which can grow large over time.

Use MongoDB dump files for backups or handoff instead of committing `mongo-data/`.

### Create a dump

Run this from the project root while MongoDB is running:

```bash
mongodump --uri="mongodb://127.0.0.1:27017/gotham_registry" --out ./mongo-backups
```

This creates a timestampable backup folder under `mongo-backups/` that you can archive or share outside Git if needed.

### Restore a dump

To restore the database from a dump:

```bash
mongorestore --uri="mongodb://127.0.0.1:27017/gotham_registry" --drop ./mongo-backups/gotham_registry
```

If your dump was created with the default `mongodump --out ./mongo-backups`, restore from the database folder inside that dump directory.
