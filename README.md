# 🚀 LinkedIn Post Manager

A powerful, AI-driven content management platform for LinkedIn professionals. Streamline your content workflow from research to scheduling with seamless LinkedIn integration.

![LinkedIn Post Manager Banner](https://plus.unsplash.com/premium_photo-1683836722608-60ab4d1b58e5?q=80&w=2012&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)

## ✨ Features

### 🔍 AI-Powered Research
- Create topics with keywords to guide your content strategy
- Leverage advanced AI to gather relevant, up-to-date information
- Filter sources and customize research preferences

### 📝 Intelligent Content Creation
- Generate engaging LinkedIn posts from your research
- Choose from multiple writing tones (professional, casual, thoughtful)
- Create content variations to maximize engagement
- Automatic hashtag suggestions

### 📅 Smart Scheduling
- Plan your content calendar visually
- Schedule posts for optimal times
- Set post visibility (public or connections-only)
- Calendar view for content planning

### 🔄 Direct LinkedIn Integration
- Connect your LinkedIn account with OAuth
- Post directly to LinkedIn with one click
- Track post status in real-time
- Notification system for successful publishing or errors

### 📊 Content Organization
- Organize posts by topics
- Track post status (draft, scheduled, published)
- Search and filter your content library
- Dashboard with performance metrics

## 🖥️ Screenshots

<div align="center">
  <img src="https://via.placeholder.com/400x300?text=Dashboard" alt="Dashboard" width="48%" />
  <img src="https://via.placeholder.com/400x300?text=Calendar+View" alt="Calendar View" width="48%" />
  <img src="https://via.placeholder.com/400x300?text=Topic+Research" alt="Topic Research" width="48%" />
  <img src="https://via.placeholder.com/400x300?text=Post+Editor" alt="Post Editor" width="48%" />
</div>

## 🛠️ Tech Stack

- **Frontend**: React 19, Next.js 15, Tailwind CSS 4
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth with LinkedIn OAuth
- **AI Integration**: OpenAI API for content generation, Tavily API for research
- **Deployment**: Vercel with scheduled jobs

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm/bun
- PostgreSQL database
- LinkedIn Developer Account (for OAuth)
- OpenAI API Key
- Tavily API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/linkedin-post-manager.git
   cd linkedin-post-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with:
   ```
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/linkedin_post_manager"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3001"
   NEXTAUTH_SECRET="your-secret-here"
   
   # LinkedIn OAuth
   LINKEDIN_CLIENT_ID="your-linkedin-client-id"
   LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"
   
   # OpenAI API
   OPENAI_API_KEY="your-openai-api-key"
   
   # Tavily API
   TAVILY_API_KEY="your-tavily-api-key"
   
   # Cron job security
   CRON_SECRET="your-cron-secret"
   ```

4. **Set up the database**
   ```bash
   npx prisma db push
   # or
   npx prisma migrate dev --name init
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

6. **Open [http://localhost:3001](http://localhost:3001) to see the application**

## 📊 Project Structure

```
linkedin-post-manager/
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets
└── src/
    ├── app/                # Next.js App Router pages and API routes
    │   ├── api/            # Backend API endpoints
    │   ├── (routes)/       # Frontend pages
    │   └── ...
    ├── components/         # Reusable React components
    │   ├── admin/          # Admin-specific components
    │   ├── auth/           # Authentication components
    │   ├── layout/         # Layout components
    │   ├── posts/          # Post-related components
    │   └── ui/             # UI components
    ├── hooks/              # Custom React hooks
    ├── lib/                # Utility functions and services
    │   ├── contexts/       # React context providers
    │   ├── services/       # External API services
    │   └── utils/          # Helper utilities
    └── types/              # TypeScript type definitions
```

## 🔐 Authentication & Security

The application uses NextAuth.js with:
- Email/password authentication
- LinkedIn OAuth integration
- JWT strategy with refresh token handling
- Secure password hashing with bcrypt

## 🔄 Scheduled Jobs

Leverages Vercel Cron Jobs to automatically publish scheduled LinkedIn posts:
```
# vercel.json
{
  "crons": [
    {
      "path": "/api/cron/publish-scheduled-posts",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

## 🧩 API Integration

### LinkedIn API
- OAuth2 authentication
- Post creation with appropriate visibility settings
- Token refresh management

### OpenAI API
- Content generation based on research data
- Customizable content tones
- Hashtag suggestions

### Tavily API
- Topic-based research
- Configurable search parameters
- Source filtering

## 📝 License

[MIT License](LICENSE)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/yourusername/linkedin-post-manager/issues).

## 📬 Contact

Have questions? Reach out to us:
- Email: your.email@example.com
- Twitter: [@yourhandle](https://twitter.com/yourhandle)
- LinkedIn: [Your Name](https://linkedin.com/in/yourname)

---

<p align="center">Built with ❤️ for LinkedIn content creators</p>
