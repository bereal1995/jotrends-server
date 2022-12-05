## 1. Run PostgreSQL Server with docker compose

```bash
docker-compose up -d
```

## 2. Run Bash

```bash
docker exec -it postgresql-db-1 bash
```

## 3. login as postgres

```bash
sudo su - postgres
```

## 4. Run following statements

```sql
CREATE DATABASE jotrends ENCODING 'UTF8';
CREATE USER jotrends WITH ENCRYPTED PASSWORD 'jotrends';
GRANT ALL PRIVILEGES ON DATABASE jotrends to jotrends;
ALTER USER jotrends CREATEDB;
```
