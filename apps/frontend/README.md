# EmoTrack Frontend

Modern React frontend for the EmoTrack emotion tracking platform.

## Features

- **Authentication**: Login and registration with JWT
- **Emotion Tracking**: Create, view, edit, and delete emotion records
- **Dashboard**: Visualize emotion trends and statistics
- **Reports**: View 15-day and 30-day emotion trends
- **Responsive Design**: Built with Tailwind CSS

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Recharts (data visualization)
- Lucide React (icons)

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Lint code
npm run lint
```

## Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://your-alb-dns-here
```

## Docker

```bash
# Build image
docker build -t emotrack-frontend .

# Run container
docker run -p 80:80 -e API_BASE_URL=http://your-alb-dns emotrack-frontend
```

## Deployment

The frontend is deployed to AWS using:
- Docker containers
- Application Load Balancer
- Auto Scaling Group (min 2 instances)
- EC2 instances

See the infrastructure configuration in `infra/` directory.
