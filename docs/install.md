# Installation Guide — SE_G25 Project 2 (Food Delivery Platform)

## Overview
This repository contains **Project 2 (SE_G25)** — a full-stack food delivery system that enables:
- Real-time order updates via **Socket.IO**
- User authentication and order tracking
- Redistributed orders for nearby users

**Tech Stack**
- **Backend**: Node.js + Express API, MongoDB data models.
- **Frontend**: React + Vite customer-facing application (including 3D menu views).
- **Admin**: React + Vite dashboard for restaurant staff.
- **Database:** MongoDB


---

## Prerequisites

Before setting up, install the following tools:

| Tool | Recommended Version | Link |
|------|----------------------|------|
| [Node.js](https://nodejs.org/en/download/) | ≥ 18.x | Includes npm |
| [Git](https://git-scm.com/downloads) | ≥ 2.x | Source control |
| [MongoDB Community Server](https://www.mongodb.com/try/download/community) | ≥ 6.x | Database |


## Setup Backend (Server)

Move into the backend folder:

```bash
cd backend
npm install
npm run server
```
Expected output: 
-Server started on http://localhost:4000
-DB Connected
-Follow the link to verify if API is working

## Setup Frontend (Server)
Move into the frontend folder:
```bash
cd frontend
npm install
npm run dev
```
Expected output: 
- Local:   http://localhost:5173/
- Follow the link

## Setup Admin
Move into the admin folder:
```bash
cd admin
npm install
npm run dev
```
Expected output: 
- Local:   http://localhost:5174/
- Follow the link
