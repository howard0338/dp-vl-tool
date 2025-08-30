# DP's VL Tool

A Next.js web application for job classification, reward distribution, and timer management in VL (Virtual Life) gaming.

## Features

- **Party Management**: Organize up to 4 parties with 6 members each
- **Job Classification**: Assign jobs (SHAD, NL, BM, MM, PALA, DK, HR, BUCC, SAIR, BS)
- **Loot Distribution**: Manage BON, BELT, and Trainee assignments
- **Countdown Timers**: 4 customizable timers for different game events
- **Expedition Summary**: Real-time statistics and player counts
- **Bon Split Grid**: Visual loot box allocation system
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14, React 18
- **Styling**: CSS Modules
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd dp-vl-tool
```

2. Install dependencies
```bash
npm install
```

3. Run development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
dp-vl-tool/
├── pages/
│   └── index.js          # Main application page
├── styles/
│   └── Home.module.css   # CSS modules for styling
├── public/               # Static assets
├── package.json          # Dependencies and scripts
├── next.config.js        # Next.js configuration
├── vercel.json           # Vercel deployment config
└── README.md            # Project documentation
```

## Usage

### Party Management
- Fill in player names in the ID fields
- Select appropriate jobs from the dropdown
- Choose loot types (BON, BELT, or Trainee)

### Timers
- Click "Reset" to start countdown timers
- Timers automatically count down
- dispel: 1 minute (auto-restart)
- golem: 2 minutes
- gargoyles: 2.5 minutes  
- jail: 4 minutes

### Expedition Summary
- Click "Generate" to update statistics
- View real-time counts of players, jobs, and loot types

### Bon Split Grid
- Visual representation of loot box allocation
- Click "Split Bon" to distribute rewards

## Deployment to Vercel

### 1. Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit"
```

### 2. Push to GitHub
```bash
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

### 3. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will automatically detect Next.js and deploy
6. Get your public URL instantly

## Configuration

### Vercel Settings
The `vercel.json` file is pre-configured for optimal deployment:
- Uses `@vercel/next` builder
- Handles all routes properly
- Optimized for Next.js applications

### Next.js Settings
- Static export enabled for better performance
- SWC minification for faster builds
- Strict mode enabled for better development experience

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub.
