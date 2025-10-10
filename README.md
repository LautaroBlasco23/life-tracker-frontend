# Life Tracker

A minimalist life tracking application for organizing daily activities and finances. Built with modern web technologies and a focus on simplicity and user experience.

## ✨ Features

### 🔐 Authentication

- Secure user registration and login
- Protected routes with session management
- Persistent authentication state

### 📋 Activity Management

- Create, edit, and delete activities
- Interactive progress tracking (click to increment)
- Target-based completion system
- Time-based categories (Morning, Afternoon, Night)
- Flexible frequency settings (Daily, Weekly with specific days)
- Visual progress indicators

### 💰 Finance Tracking

- Personal finance management interface
- _Backend integration in progress_

### 👤 User Profile

- Profile information management
- Avatar upload
- Theme preferences (Light/Dark)
- Account settings

## 🚀 Getting Started

### Prerequisites

- Node.js 22+
- npm or yarn
- Backend API running (see [Backend Repository](#))

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/life-tracker-frontend.git
cd life-tracker-frontend
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui + Radix UI
- **State Management:** React Context API
- **Form Handling:** React Hook Form + Zod
- **Icons:** Lucide React
- **Date Handling:** date-fns

## 📁 Project Structure

```
├── app/              # Next.js pages and layouts
├── components/       # Reusable React components
├── services/         # API service layer
├── types/            # TypeScript type definitions
├── contexts/         # React context providers
├── lib/              # Utility functions
└── public/           # Static assets
```

## 🐳 Docker Deployment

Build and run with Docker:

```bash
# Production build
make build-prod

# Run container
make run-container

# View logs
make logs

# Stop container
make stop
```

See `Makefile` for all available commands.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:ts` - Type check with TypeScript
- `npm run format` - Format code with Prettier

## 🤝 Contributing

Contributions are welcome! This is an open-source project free for anyone to use and modify.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- [Backend Repository](#) - API server for Life Tracker
- [Live Demo](#) - Try it out

## 🙏 Acknowledgments

Built with modern open-source technologies and inspired by the need for a simple, effective life tracking solution.
