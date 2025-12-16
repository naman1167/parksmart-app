# ParkSmart Backend

A complete, production-ready Node.js + Express + MongoDB backend for a parking management system with authentication, role-based access control, and booking functionality.

## 🚀 Features

- **User Authentication**: JWT-based authentication with secure password hashing
- **Role-Based Access Control**: Admin and user roles with protected routes
- **Parking Spot Management**: Full CRUD operations for parking spots
- **Booking System**: Create and manage parking reservations
- **RESTful API**: Clean, well-structured API endpoints
- **Error Handling**: Comprehensive error handling middleware
- **Data Validation**: Input validation at model and controller levels

## 📁 Folder Structure

```
parksmart-backend/
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB connection configuration
│   ├── controllers/
│   │   ├── authController.js      # Authentication logic
│   │   ├── parkingSpotController.js # Parking spot operations
│   │   └── bookingController.js   # Booking operations
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT verification & role checks
│   │   └── errorMiddleware.js     # Global error handling
│   ├── models/
│   │   ├── User.js                # User schema with auth methods
│   │   ├── ParkingSpot.js         # Parking spot schema
│   │   └── Booking.js             # Booking schema
│   ├── routes/
│   │   ├── authRoutes.js          # Auth endpoints
│   │   ├── parkingSpotRoutes.js   # Parking spot endpoints
│   │   └── bookingRoutes.js       # Booking endpoints
│   ├── seed/
│   │   └── seed.js                # Database seeding script
│   └── server.js                  # Main application entry point
├── .env.example                   # Environment variables template
├── package.json
└── README.md
```

## 🛠️ Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Steps

1. **Clone/Navigate to the project directory**
   ```bash
   cd parksmart-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/parksmart
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRE=30d
   ```

4. **Seed the database** (optional but recommended)
   ```bash
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   For production:
   ```bash
   npm start
   ```

## 🌱 Seeding the Database

The seed script populates the database with:
- 1 admin user
- 2 regular users
- 10 parking spots across 5 locations
- 5 sample bookings with different statuses

Run the seed script:
```bash
npm run seed
```

**Sample Credentials:**
- **Admin**: admin@parksmart.com / admin123
- **User**: john@example.com / password123

## 📚 API Documentation

### Base URL
```
http://localhost:5000
```

### Authentication

All authenticated routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

### 🔐 Auth Routes

#### Register User
- **POST** `/api/auth/register`
- **Access**: Public
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user"  // optional, defaults to "user"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "token": "jwt_token_here"
    }
  }
  ```

#### Login User
- **POST** `/api/auth/login`
- **Access**: Public
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**: Same as register

---

### 🅿️ Parking Spot Routes

#### Get All Parking Spots
- **GET** `/api/spots`
- **Access**: Public
- **Query Params**: `?available=true` (optional)
- **Response**:
  ```json
  {
    "success": true,
    "count": 10,
    "data": [...]
  }
  ```

#### Get Available Parking Spots
- **GET** `/api/spots/available`
- **Access**: Public

#### Get Single Parking Spot
- **GET** `/api/spots/:id`
- **Access**: Public

#### Create Parking Spot
- **POST** `/api/spots`
- **Access**: Private (Admin only)
- **Body**:
  ```json
  {
    "spotNumber": "A-101",
    "location": {
      "name": "Downtown Mall",
      "address": "123 Main St, City Center",
      "coordinates": {
        "lat": 40.7128,
        "lng": -74.0060
      }
    },
    "pricePerHour": 5,
    "isAvailable": true
  }
  ```

#### Update Parking Spot
- **PUT** `/api/spots/:id`
- **Access**: Private (Admin only)
- **Body**: Any fields to update

#### Delete Parking Spot
- **DELETE** `/api/spots/:id`
- **Access**: Private (Admin only)

---

### 📅 Booking Routes

#### Create Booking
- **POST** `/api/bookings`
- **Access**: Private (Authenticated users)
- **Body**:
  ```json
  {
    "spot": "spot_id_here",
    "startTime": "2024-12-08T10:00:00",
    "endTime": "2024-12-08T14:00:00",
    "amountPaid": 20
  }
  ```

#### Get My Bookings
- **GET** `/api/bookings/my`
- **Access**: Private (Authenticated users)
- **Response**:
  ```json
  {
    "success": true,
    "count": 3,
    "data": [...]
  }
  ```

#### Get All Bookings
- **GET** `/api/bookings/all`
- **Access**: Private (Admin only)

#### Update Booking Status
- **PUT** `/api/bookings/:id`
- **Access**: Private (Authenticated, owner or admin)
- **Body**:
  ```json
  {
    "status": "completed"  // "active", "completed", or "cancelled"
  }
  ```

---

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | Secret key for JWT signing | Required |
| `JWT_EXPIRE` | JWT token expiration time | `30d` |

## 🏗️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Middleware**: CORS, express-async-handler
- **Development**: nodemon

## 📝 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data

## 🔒 Security Features

- Password hashing using bcryptjs
- JWT-based authentication
- Role-based authorization (user/admin)
- Protected routes with middleware
- Input validation at multiple levels

## 🎯 Future Enhancements

- Payment integration (Stripe/PayPal)
- Real-time spot availability updates (Socket.io)
- Email notifications for bookings
- Advanced search and filtering
- Booking conflict resolution
- QR code generation for bookings
- Analytics dashboard for admins
- Rate limiting and API throttling
- Image uploads for parking spots
- Reviews and ratings system

## 📄 License

ISC

## 👥 Support

For issues or questions, please submit an issue to the repository.

---

**Built with ❤️ for ParkSmart**
