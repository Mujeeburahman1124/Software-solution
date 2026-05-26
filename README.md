# She Blog Platform

A full-stack blog website built with **Next.js 14**, **React**, **TypeScript**, **Tailwind CSS**, and **PostgreSQL**. Developed as an internship assessment project for **She Software Solutions**.

## Live Demo

🔗 [https://software-solution-gilt.vercel.app](https://software-solution-gilt.vercel.app)

## Features

- **Blog Listing** — Browse all published blogs with search and category filters
- **Blog Detail** — Read full blog content with author info and cover images
- **Blog Creation** — Rich text editor with cover image, category, and tags
- **Authentication** — Secure signup and login with JWT and bcrypt
- **Admin Dashboard** — Manage all blog content (edit, delete, publish/unpublish)
- **Role-Based Access** — Public, User, Admin, and Super Admin roles
- **Responsive Design** — Optimized for mobile, tablet, and desktop
- **SEO Optimized** — Semantic HTML, meta tags, and fast load times
- **Bookmarks** — Save blogs to read later
- **Reactions & Comments** — Engage with blog content

## Tech Stack

| Technology   | Purpose              |
| ------------ | -------------------- |
| Next.js 14   | Full-stack framework |
| React 18     | Frontend UI          |
| TypeScript   | Type safety          |
| Tailwind CSS | Styling              |
| PostgreSQL   | Database             |
| JWT          | Authentication       |
| bcrypt       | Password hashing     |
| Vercel       | Deployment           |

## Project Structure

```
app/
├── (home)/           # Home page, create blog page
├── admin/            # Admin dashboard
├── api/              # API routes (auth, blogs, bookmarks)
├── auth/             # Login and signup pages
├── blog/             # Blog detail and edit pages
├── saved/            # Saved/bookmarked blogs
├── layout.tsx        # Root layout
└── globals.css       # Global styles

components/
├── auth/             # Auth-related components
├── blog/             # Blog card component
└── common/           # Header, Footer, Loading

lib/
├── api-client.ts     # Frontend API client
├── auth.ts           # JWT and password utilities
├── db.ts             # PostgreSQL connection pool
├── hooks.ts          # Custom React hooks
└── utils.ts          # Utility functions

scripts/
└── db-setup.js       # Database schema setup

models/
└── index.ts          # Data models
```

## API Endpoints

| Method | Endpoint                    | Description          |
| ------ | --------------------------- | -------------------- |
| POST   | `/api/auth/signup`          | Register new user    |
| POST   | `/api/auth/login`           | User login           |
| GET    | `/api/blogs`                | List all blogs       |
| POST   | `/api/blogs`                | Create new blog      |
| GET    | `/api/blogs/[id]`           | Get single blog      |
| PUT    | `/api/blogs/[id]`           | Update blog          |
| DELETE | `/api/blogs/[id]`           | Delete blog          |
| POST   | `/api/blogs/[id]/react`     | React to a blog      |
| GET    | `/api/blogs/[id]/comments`  | Get blog comments    |
| POST   | `/api/blogs/[id]/comments`  | Add a comment        |
| POST   | `/api/blogs/[id]/bookmark`  | Bookmark a blog      |
| GET    | `/api/bookmarks`            | Get user bookmarks   |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 13+

### Installation

```bash
# Clone the repository
git clone https://github.com/Mujeeburahman1124/Software-solution.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database credentials

# Set up the database
node scripts/db-setup.js

# Start development server
npm run dev
```

### Environment Variables

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
DATABASE_SSL=true
JWT_SECRET=your-secret-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Deployment

Deployed on **Vercel** with PostgreSQL hosted on **Neon**.

## Author

**Mujeeburahman** — Full Stack Developer Intern  
She Software Solutions | 2026
