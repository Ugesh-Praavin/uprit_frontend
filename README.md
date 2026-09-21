# UpRit Frontend

This is the frontend application for UpRit, built with React, Vite, and Tailwind CSS. It features a modern and responsive user interface, starting with the registration workflow.

## 🚀 Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Linting**: [ESLint](https://eslint.org/)

## 🛠️ Prerequisites

Before you begin, ensure you have met the following requirements:
- **Node.js**: `v18.0.0` or higher recommended.
- **npm**: `v9.0.0` or higher (usually installed alongside Node.js).

## 💻 Local Development Setup

Follow these steps to get your development environment set up and running:

### 1. Install Dependencies

Navigate to the project directory and run the following command to install all required npm packages:

```bash
npm install
```

### 2. Environment Configuration (Optional)

If your backend API or any third-party services require specific configurations, you can create a `.env` file in the root of the project.

Since this project uses Vite, remember that only environment variables prefixed with `VITE_` are exposed to your React client code.

Example `.env` file:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Start the Development Server

Once the dependencies are installed, you can start the local development server:

```bash
npm run dev
```

The application will typically start on [http://localhost:5173/](http://localhost:5173/). Any changes you make to the code will automatically reflect in the browser thanks to Hot Module Replacement (HMR).

## 📦 Build for Production

To create a production-ready build of the application, run:

```bash
npm run build
```

This will compile and minify your React application into the `dist/` directory, which can then be hosted on any static file server (like Nginx, Vercel, Netlify, etc.).

You can preview the production build locally by running:

```bash
npm run preview
```

## 🧹 Code Quality

This project uses ESLint to maintain code quality and consistency. To run the linter and check for any issues:

```bash
npm run lint
```

## 📁 Project Structure

A quick overview of the key directories:
- `src/`: Contains the React source code, components, styles, and assets.
- `public/`: Contains static assets that are not processed by Vite.
- `vite.config.js`: Configuration file for Vite.
- `eslint.config.js`: Configuration file for ESLint.

---
*Happy Coding! Level Up Your Journey with UpRit.*
