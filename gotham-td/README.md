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
CLOUDINARY_API_SECRET=your_api_secret
```

3. Start frontend and backend together:

```bash
npm run dev:all
```

When you upload an image from the form, the file is sent to Cloudinary via `/api/uploads/image`. The resulting `image` URL and `imagePublicId` are saved in MongoDB.
