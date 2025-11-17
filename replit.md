# Overview

This project is a careers website built with a modern tech stack featuring React with TypeScript on the frontend and Express with Node.js on the backend. The application displays job openings, allows users to browse and filter positions, and includes functionality for job applications. It's designed as a professional careers page for "TechCorp Solutions" with sections for company mission, job listings, culture, and contact information.

The application uses a flexible data storage architecture that supports both Google Sheets and PostgreSQL backends through a unified storage interface, making it adaptable for different deployment scenarios.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Comprehensive set of accessible components from Radix UI primitives

## Backend Architecture
- **Server Framework**: Express.js with TypeScript
- **Data Layer**: Abstracted storage interface that supports multiple backends
- **API Design**: RESTful endpoints for jobs and applications management
- **Development Setup**: Hot module replacement with Vite integration for development

## Data Storage Solutions
The application implements a flexible storage abstraction through the `IStorage` interface, supporting:
- **Google Sheets Backend**: Uses Google Sheets API as a database alternative
- **PostgreSQL Backend**: Traditional database with Drizzle ORM for type-safe queries
- **Unified Interface**: Common methods for CRUD operations across different storage backends

## Database Schema Design
- **Jobs Table**: Stores job postings with metadata (title, department, type, level, location, requirements)
- **Applications Table**: Manages job applications with candidate information and status tracking
- **Users/Admin Tables**: Authentication and authorization for different user types
- **Relationships**: Foreign key relationships between jobs and applications

## External Dependencies
- **Database**: Neon PostgreSQL (serverless) or Google Sheets API
- **Authentication**: Google Cloud APIs for Sheets integration
- **UI Framework**: Radix UI primitives with Tailwind CSS
- **Development Tools**: Replit integration with cartographer plugin
- **Build System**: Vite with React plugin and TypeScript support
- **Form Handling**: React Hook Form with Zod validation