# KIVO "justo lo que necesitas" - Minimalist E-Commerce Platform

## Overview

KIVO "justo lo que necesitas" is an educational full-stack e-commerce platform built with a modern stack emphasizing minimalist design and MVC architecture. The project serves as a learning platform for students to understand full-stack development with proper separation of concerns, authentication, and security best practices. The application features a public store interface for browsing products and a protected administrative dashboard for managing products and promotions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application uses a hybrid approach with both server-side rendering and client-side React components. The server-side uses EJS templates for SEO-friendly pages and rapid development, while the client-side leverages React with TypeScript for interactive components. The frontend styling is implemented with TailwindCSS and shadcn/ui components, providing a consistent design system with customizable themes.

### Backend Architecture
The backend follows a strict MVC (Model-View-Controller) pattern with clear separation of responsibilities:
- **Controllers**: Handle HTTP requests and responses, business logic coordination
- **Models**: Manage data operations and database interactions through a storage abstraction layer
- **Views**: EJS templates for server-side rendering
- **Middleware**: Authentication, authorization, and request processing
- **Routes**: API endpoints and page routing with proper security guards

The server uses Express.js with TypeScript for type safety and runs on Node.js 18+. The application is structured to support both development with Vite for hot reloading and production deployment on platforms like Render.

### Data Storage Solutions
The application uses PostgreSQL as the primary database through Supabase, which provides both database hosting and authentication services. The data layer is abstracted through a storage interface that could potentially support multiple database backends. Key database features include:
- **Drizzle ORM** for type-safe database operations and migrations
- **Timestamped records** with timezone support for accurate temporal data
- **Row Level Security (RLS)** capabilities for production security
- **Relational integrity** with foreign key constraints between users, products, and promotions

### Authentication and Authorization
Authentication is handled entirely through Supabase Auth with a clear separation between client and server keys:
- **Client-side**: Uses Supabase anon key for user registration, login, and session management
- **Server-side**: Uses service role key for administrative operations and user verification
- **JWT validation**: Server validates bearer tokens and checks user permissions
- **Role-based access**: Admin privileges stored in user profiles with database-level verification

The security model ensures that sensitive service role keys are never exposed to the frontend, maintaining a secure separation of privileges.

### External Dependencies

- **Supabase**: Primary backend service providing PostgreSQL database, authentication, and real-time capabilities
- **Drizzle ORM**: Database toolkit for PostgreSQL with type-safe queries and migrations
- **React Query**: Client-side data fetching and caching for optimal user experience
- **TailwindCSS**: Utility-first CSS framework for responsive design
- **shadcn/ui**: High-quality React component library built on Radix UI primitives
- **Vite**: Build tool and development server for fast client-side development
- **Express.js**: Web framework for Node.js handling server-side routing and middleware
- **EJS**: Templating engine for server-side rendered pages
- **Zod**: Schema validation library for type-safe data validation

The application is designed to be deployment-ready for Render with clear migration paths to other platforms like Vercel for Next.js deployment.