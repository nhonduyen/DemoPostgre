# PostgresDemo — Docker Compose

This repository includes an API, a Postgres Database, and a Vite React frontend.

Quick start (build and run all services):

```bash
docker compose up --build
```

Services:
- PostgreSQL: available on `localhost:5432` (DB name: `PostgresDemo`, user: `postgres`, password: `postgres`).
  - SQL migration files from `PostgreDemo.Database/migrations` are mounted into the Postgres image and will be executed on first container initialization.
- API: built from `PostgresDemo.Api/Dockerfile`, available on `http://localhost:5000`.
  - Connection string is injected by docker-compose: `ConnectionStrings__DefaultConnection` → `Host=db;Port=5432;Database=PostgresDemo;Username=postgres;Password=postgres`.
- Frontend: built from `PostgresDemo.Frontend/Dockerfile`, served by nginx on `http://localhost:5173`.

Notes:
- To stop and remove containers:

```bash
docker compose down -v
```

- If you want to re-run DB initialization, remove the `db-data` volume and restart:

```bash
docker compose down -v
docker compose up --build
```

- API logs can be viewed with:

```bash
docker compose logs -f api
```

Enjoy!