# TrackMe Frontend

A React-based frontend application for the TrackMe activity tracking system. Built with modern React patterns, TypeScript, and a beautiful UI.

## Features

- 🔐 **Authentication** - Secure login/logout with JWT tokens
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📱 **Responsive Design** - Works on desktop and mobile devices
- ⚡ **Fast Performance** - Built with Vite for optimal development experience
- 🎨 **Modern UI** - Beautiful components with Tailwind CSS
- 🔄 **Real-time Updates** - React Query for efficient data fetching and caching
- 🛡️ **Type Safety** - Full TypeScript support
- **Activity Management**: Create, edit, and manage your activities
- **Activity Logs**: View and manage your activity tracking history
- **Dashboard**: Overview of your productivity and progress
- **Generate Activity Logs**: 
  - Generate today's activity logs with one click
  - Generate custom activity logs for specific date ranges and frequencies
  - Support for daily, weekly, and monthly activity generation
  - Automatic handling of excluded intervals and existing logs

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Context API + React Query
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Code Quality**: ESLint + Prettier

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── ui/             # Base UI components (Button, Input, Card, etc.)
├── contexts/           # React Context providers
│   ├── AuthContext.tsx # Authentication state management
│   └── ThemeContext.tsx # Dark/light theme management
├── hooks/              # Custom React hooks
│   ├── useActivities.ts # Activity management hooks
│   └── useActivityLogs.ts # Activity log management hooks
├── services/           # API service layer
│   ├── api.ts          # Axios configuration
│   ├── auth.ts         # Authentication API calls
│   ├── activities.ts   # Activities API calls
│   └── activityLogs.ts # Activity logs API calls
├── types/              # TypeScript type definitions
│   └── index.ts        # Shared types matching API structure
├── utils/              # Utility functions
│   ├── cn.ts           # Class name utility
│   └── date.ts         # Date formatting utilities
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see API documentation)

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your API URL:

   ```
   VITE_API_URL=http://localhost:3000/api/v1
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

## API Integration

The frontend is designed to work with the TrackMe API. Make sure your backend is running and accessible at the URL specified in your environment variables.

### Authentication

The app uses JWT tokens for authentication. Tokens are automatically:

- Stored in localStorage on login
- Included in API requests
- Removed on logout or 401 errors

### Data Fetching

All API calls are handled through React Query for:

- Automatic caching
- Background refetching
- Optimistic updates
- Error handling

## Customization

### Styling

The app uses Tailwind CSS with a custom design system. Colors and other design tokens are defined in `src/index.css` as CSS custom properties.

### Adding New Components

1. Create components in `src/components/`
2. Use the existing UI components as building blocks
3. Follow the established patterns for props and styling

### Adding New Pages

1. Create the page component
2. Add the route to `App.tsx`
3. Use the `ProtectedRoute` wrapper for authenticated pages

## Development Guidelines

- Use TypeScript for all new code
- Follow the established folder structure
- Use custom hooks for business logic
- Keep components small and focused
- Use the `cn` utility for conditional classes
- Write meaningful commit messages

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation as needed
4. Ensure all linting and type checks pass

## License

This project is part of the TrackMe activity tracking system.

## Generate Custom Activity Logs

The application now includes a powerful feature to generate activity logs for custom date ranges:

### How to Use

1. Navigate to the **Activity Logs** page
2. Click the **"Generate Custom Logs"** button
3. Select your desired frequency:
   - **Daily**: Generates logs for each day in the range (excluding weekends by default)
   - **Weekly**: Generates logs for weekly activities (on Sundays)
   - **Monthly**: Generates logs for monthly activities (on the 1st of each month)
4. Choose your start and end dates
5. Click **"Generate Logs"**

### Features

- **Smart Generation**: The system automatically determines which activities to generate based on their configured frequency
- **Excluded Intervals**: Respects your configured excluded intervals (weekends, specific weeks, months)
- **Duplicate Prevention**: Skips generation if logs already exist for the same period
- **Date Range Validation**: Prevents generation for ranges exceeding 1 year
- **Real-time Feedback**: Shows success/error messages and refreshes the activity logs list

### Technical Details

- Uses the `/api/v1/activity-logs/generate` endpoint
- Supports both single date and date range generation
- Integrates with the existing activity scheduler system
- Maintains consistency with the automatic generation logic

## Development

### Prerequisites

- Node.js 18+
- Yarn or npm

### Setup

1. Install dependencies:
   ```bash
   yarn install
   ```

2. Start the development server:
   ```bash
   yarn dev
   ```

3. The application will be available at `http://localhost:9001`

### API Integration

The frontend communicates with the TrackMe API backend. Make sure the API server is running on the expected port (typically 3000).

## Technologies Used

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Query (TanStack Query)
- React Router
- Lucide React Icons
- Sonner (Toast notifications)
