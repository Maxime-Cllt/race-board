<div align="center">
    <h1>Race Board</h1>
</div>

<div align="center">
 <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge" alt="Version" />
</div>

## 📖 Overview

Race Board is a monitoring application designed to visualize and analyze racetrack data. It provides a
user-friendly interface to track performance metrics, visualize data trends, and gain insights into
racing activities.

<div align="center">

<table style="border-collapse: collapse; border: none;">
  <tr>
    <td><img src="assets/sc1.png" alt="Screenshot 1" width="350"></td>
    <td><img src="assets/sc2.png" alt="Screenshot 2" width="350"></td>
  </tr>
  <tr>
    <td><img src="assets/sc3.png" alt="Screenshot 3" width="350"></td>
    <td><img src="assets/sc4.png" alt="Screenshot 4" width="350"></td>
  </tr>
</table>

</div>

## ✨ Key Features

- ⚡ **Real-time Data Visualization**: Visualize data in real-time with interactive charts and
  graphs.
- 📊 **Performance Metrics**: Track key performance indicators such speed, average speed and lane
  usage.
- 📈 **Data Analysis**: Analyze trends and patterns

## 📋 Prerequisites

- **SpeedStream**: Race Board uses [SpeedStream](https://github.com/Maxime-Cllt/SpeedStream) for data
  streaming and processing. Ensure you have it set up in your project.

## 🚀 Getting Started

### 1. Configure Environment

The application supports **three modes**:

#### 🎮 SIMULATION Mode (Default)
Perfect for UI development and testing without any API. Generates realistic mock data:

```env
NEXT_PUBLIC_APP_MODE=SIMULATION
```

**Use case**: Frontend development, UI testing, demos without backend

#### 🔧 DEV Mode
Connects to your local development API server:

```env
NEXT_PUBLIC_APP_MODE=DEV
NEXT_PUBLIC_API_URL=http://192.168.1.100:3000
```

**Use case**: Testing with real API during development

#### 🚀 PROD Mode
Connects to production API server:

```env
NEXT_PUBLIC_APP_MODE=PROD
NEXT_PUBLIC_API_URL=http://your-production-server.com:3000
```

**Use case**: Production deployment with live data

---

### 2. Find Your Local IP Address

> **Important**: If using DEV or PROD mode, `localhost` won't work on some systems. Use your local IP address instead.

**Quick method** - Run the provided script:
```bash
./scripts/get-local-ip.sh
```

**Manual methods:**
- **macOS**: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- **Linux**: `hostname -I`
- **Windows**: `ipconfig` (look for IPv4 Address)

Then update `.env.local`:
```bash
cp .env.example .env.local
# Edit NEXT_PUBLIC_API_URL with your IP address
```

---

### 3. Install Dependencies

```bash
bun install
```

### 4. Run the Application

```bash
bun run dev
```

The application will be available at `http://localhost:3001`.

> **Note**: In DEV or PROD mode, make sure your [SpeedStream](https://github.com/Maxime-Cllt/SpeedStream) backend is running. See the [ENDPOINTS.md](ENDPOINTS.md) file for API documentation.

## 🔗 See Also

- [SpeedStream](https://github.com/Maxime-Cllt/SpeedStream)

## 🧪 Code Quality

### Unit Tests available

To run unit tests, use the following command:

```bash
bun run test
```

### Linting

To check for linting issues, run:

```bash
bun run lint
```

### Format Code

To format the codebase, use:

```bash
bun run format
```

## 🤝 Contributing

Contributions are welcome! To contribute:

- **Fork the Repository**
- **Create a Feature Branch**:
  ```bash
  git checkout -b feature/your-feature-name
    ```
