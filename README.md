# HabaClothes API

ASP.NET Core Web API backend for the HabaClothes storefront.

## Features
- JWT auth (login/register/me)
- Products CRUD (admin-only write)
- Orders creation and history
- Admin endpoints
- SQL Server via EF Core

## Prerequisites
- .NET 10 SDK
- SQL Server (local instance or Docker)

## Configuration
Update the connection string and JWT key in [HabaClothes.Api/appsettings.json](HabaClothes.Api/appsettings.json).

Example settings:
- ConnectionStrings:DefaultConnection (defaults to LocalDB for development)
- Jwt:Key (use a secure 32+ character value)

## Run
```bash
dotnet restore

dotnet ef database update --project HabaClothes.Api\HabaClothes.Api.csproj

dotnet run --project HabaClothes.Api\HabaClothes.Api.csproj
```

Swagger UI will be available at https://localhost:5001/swagger in development.

## Seeded Users
- Admin: admin@habaclothes.local / Admin123!
- Customer: customer@habaclothes.local / Customer123!

Replace these credentials in production.
