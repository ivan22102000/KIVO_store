# KIVO "Justo lo que necesitas" - Full-Stack E-Commerce Platform

## Overview

KIVO is a modern, minimalist e-commerce platform designed as an educational full-stack application. The project demonstrates best practices in web development with a focus on clean architecture, type safety, and user experience. It features a React frontend with shadcn/ui components, an Express.js backend with MVC architecture, and PostgreSQL database integration through Drizzle ORM and Supabase services.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built with React and TypeScript, utilizing a component-based architecture with modern development practices. The frontend uses Vite for fast development and building, with TailwindCSS for styling and shadcn/ui for high-quality, accessible UI components. The application follows a single-page application (SPA) pattern with client-side routing via Wouter, providing a smooth user experience with React Query for efficient data fetching and caching.

### Backend Architecture  
The server follows a traditional MVC (Model-View-Controller) pattern using Express.js with TypeScript. The architecture separates concerns clearly with dedicated layers for routing, business logic, and data access. The server provides both API endpoints for the React frontend and server-side rendered pages using EJS templates for SEO optimization. Authentication is handled through Supabase Auth with JWT validation, and the storage layer is abstracted through an interface that supports PostgreSQL operations via Drizzle ORM.

### Data Storage Solutions
The application uses PostgreSQL as the primary database, hosted through Supabase for managed database services. Drizzle ORM provides type-safe database operations with automatic TypeScript schema generation. The database schema includes tables for user profiles, products, and promotions with proper foreign key relationships and timezone-aware timestamps. Row Level Security (RLS) is configured for production-ready security, and the storage layer is designed to be easily testable and maintainable.

### Authentication and Authorization
Authentication is implemented using Supabase Auth with a clear separation between client and server-side operations. The client uses the anonymous key for user registration and login, while the server uses the service role key for administrative operations. JWT tokens are validated server-side for protected routes, with role-based access control through user profiles that include admin flags. The architecture ensures security keys are properly separated and never exposed to the client-side code.

## External Dependencies

- **Supabase**: Provides PostgreSQL database hosting, authentication services, and real-time capabilities
- **Drizzle ORM**: Type-safe database toolkit for PostgreSQL with schema migrations and query building
- **React Query (@tanstack/react-query)**: Client-side data fetching, caching, and synchronization
- **shadcn/ui**: Component library built on Radix UI primitives for accessible, customizable components  
- **TailwindCSS**: Utility-first CSS framework for responsive design and styling
- **Vite**: Modern build tool providing fast development server and optimized production builds
- **Wouter**: Lightweight client-side routing library for React applications
- **Express.js**: Web application framework for Node.js handling server-side routing and middleware
- **TypeScript**: Type safety across the entire application stack
- **Radix UI**: Headless component primitives for building accessible user interfaces