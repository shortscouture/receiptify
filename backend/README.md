# Receiptify Backend

Node.js/Express API with SQLite database and JWT authentication.

## Project Structure

```
backend/
├── config/
│   └── database.js          # Sequelize database configuration
├── controllers/
│   └── authController.js    # Authentication logic (register, login)
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   ├── index.js             # Sequelize initialization
│   ├── user.js              # User model
│   └── receipt.js           # Receipt model
├── routes/
│   ├── auth.js              # Auth routes (/auth/register, /auth/login)
│   └── user.js              # User routes (/api/me)
├── __tests__/
│   ├── models.test.js       # Database model tests
│   └── auth.test.js         # Authentication API tests
├── docs/
│   └── AUTH.md              # Authentication API documentation
├── data/                    # SQLite database files (gitignored)
├── .env.example             # Environment variable template
├── server.js                # Express server entry point
└── package.json
```

## Database Schema

### Users Table
- `id` (integer, PK, auto-increment)
- `name` (string)
- `email` (string, unique, validated)
- `password` (string, hashed with bcrypt)
- `created_at` (timestamp)

### Receipts Table
- `id` (integer, PK, auto-increment)
- `user_id` (integer, FK → users.id)
- `datetime` (datetime)
- `merchant` (string)
- `category` (string)
- `amount` (decimal)
- `source_email` (string, validated)
- `created_at` (timestamp)

**Relationship:** User has many Receipts

## Setup

### Docker/Containerized (Recommended)

Since this project is containerized, use Docker Compose to run the application:

```bash
# From the project root
docker-compose up backend
```

### Local Development

If running locally without Docker:

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and change JWT_SECRET
npm start
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DB_STORAGE=./data/database.sqlite
DB_LOGGING=false
PORT=3000
```

**⚠️ Important:** Change `JWT_SECRET` to a strong random value in production!

Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

## Authentication

This API uses JWT (JSON Web Tokens) for authentication.

- Tokens expire after 7 days
- Passwords are hashed with bcrypt (10 salt rounds)
- Protected routes require `Authorization: Bearer <token>` header

See [docs/AUTH.md](./docs/AUTH.md) for detailed API documentation.

## API Endpoints

### Public Routes
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token

### Protected Routes (require JWT)
- `GET /api/me` - Get current user info

## Testing

Run all tests:
```bash
npm test
```

Run specific test suite:
```bash
npm test -- auth.test.js
npm test -- models.test.js
```

**Note:** Tests use a separate test database (`database.test.sqlite`) that is recreated for each test run.

## Dependencies

### Core
- `express` - Web framework
- `sequelize` - ORM for SQLite
- `sqlite3` - SQLite database driver
- `dotenv` - Environment variable management
- `cors` - CORS middleware

### Authentication
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token generation/verification
- `express-validator` - Request validation

### Development
- `jest` - Testing framework
- `supertest` - HTTP testing

## Scripts

- `npm start` - Start the server
- `npm test` - Run tests with Jest

## Development Notes

- Database automatically syncs on server start
- Models use snake_case for database columns (Sequelize `underscored: true`)
- Server only starts when `NODE_ENV !== 'test'` to allow test imports
- CORS is enabled for all origins (configure for production)

## Security Recommendations

1. **Change JWT_SECRET** - Use a cryptographically secure random value
2. **Use HTTPS** - Always use HTTPS in production
3. **Rate limiting** - Add rate limiting to auth endpoints
4. **Input validation** - Already implemented with express-validator
5. **SQL injection** - Protected by Sequelize parameterized queries
6. **Password strength** - Currently requires 6+ characters (consider strengthening)

## Next Steps

- Add password reset functionality
- Implement refresh tokens
- Add email verification
- Create receipt CRUD endpoints
- Add receipt filtering/search
- Implement file upload for receipt images
