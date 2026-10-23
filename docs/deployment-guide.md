# Deployment Guide — Aiven Console PostgreSQL, Spring Boot & React

## 1. Aiven Console Database Provisioning
1. Sign in to [Aiven Console](https://console.aiven.io/).
2. Create a new service:
   - Service Type: **PostgreSQL**
   - Cloud Provider: AWS / GCP / Azure (select region closest to target users, e.g., `ap-south-1` Mumbai / Hyderabad).
   - Plan: Free Tier or Startup plan.
   - Service Name: `pg-fuelrescue-prod`.
3. In **Overview -> Connection information**:
   - Note the **Host**, **Port**, **User** (`avnadmin`), **Password**, and **Database name** (`defaultdb`).
   - Download the CA certificate if required, or append `?sslmode=require` to JDBC URL.
4. Construct your JDBC connection string:
   ```
   jdbc:postgresql://<HOST>:<PORT>/defaultdb?sslmode=require
   ```

## 2. Spring Boot Backend Deployment (Render / Railway / AWS ECS)
1. Set the following environment variables on your hosting provider:
   - `DB_URL`: `jdbc:postgresql://<HOST>:<PORT>/defaultdb?sslmode=require`
   - `DB_USER`: `avnadmin`
   - `DB_PASSWORD`: `<YOUR_AIVEN_PASSWORD>`
   - `JWT_SECRET`: `<64_CHAR_HEX_RANDOM_SECRET>`
   - `CORS_ALLOWED_ORIGINS`: `https://fuelrescue.vercel.app`
2. Build command:
   ```bash
   ./mvnw clean package -DskipTests
   ```
3. Run command:
   ```bash
   java -jar target/fuelrescue-backend-1.0.0-SNAPSHOT.jar
   ```
4. Flyway automatically runs `V1__init_schema.sql` on startup to initialize all tables.

## 3. Frontend Deployment (Vercel / Netlify)
1. Build command: `npm run build`
2. Output directory: `dist`
3. Environment variables:
   - `VITE_API_URL`: Backend URL (e.g., `https://api.fuelrescue.in`)
   - `VITE_GOOGLE_MAPS_API_KEY`: (Optional) Google Maps Platform API key
