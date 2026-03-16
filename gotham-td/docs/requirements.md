# Project Requirements (Baseline)

This document explains, in simple terms, what our project uses and how it is expected to run. We will update it as the project grows. Later, we can compare what we built against this document during a review.

## 1) Technology Stack

This section describes the main tools and languages used to build the product.

- Frontend (what users see): React (JavaScript) for building web pages and user interactions.
- Backend (server logic): Node.js with Express for handling requests, business rules, and APIs.
- Database: MongoDB for storing application data in collections.
- Image management: Cloudinary for image upload, storage, and delivery.
- Version control: Git for tracking code changes.

Why this matters for non-technical readers:
- It tells us what technology family we are working in.
- It helps us know what skills and tools are needed to maintain the project.

## 2) Database Schema

This section describes what information we store and how it is organized.

Simple explanation:
- A database is like a digital filing system.
- A schema is the structure of those files (what fields each record should have).

At minimum, this section should eventually include:
- Main collections/tables (for example: users, tasks, projects, etc.).
- Key fields in each collection (for example: name, email, createdDate).
- Relationships between data (for example: one user can have many tasks).
- Validation rules (for example: email must be unique, required fields cannot be empty).

Current status:
- Detailed schema definitions will be added here as we finalize data models.

## 3) Infrastructure

This section explains where and how the project runs.

Simple explanation:
- Infrastructure means the environment that keeps the application online and working.

At minimum, this section should eventually include:
- Hosting for frontend and backend.
- Database hosting and backups.
- Environment variables/secrets management.
- Deployment process (how new code goes live).
- Monitoring/logging (how we detect errors and performance issues).

Current status:
- Detailed infrastructure decisions will be added here as deployment choices are finalized.
- Cloudinary is used to manage uploaded hero and criminal images.

---

## How We Will Use This File Later

During project review, we will use this file to answer:
- Did we build what we planned?
- Are any parts missing or changed?
- Do we need to update technical or operational decisions?
