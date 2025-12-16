# ParkSmart Frontend

Modern, responsive React frontend for the ParkSmart parking management system.

## 🚀 Features

- **Authentication**: Login, Register, JWT-based auth
- **Protected Routes**: Role-based access control
- **Parking Spots**: Browse available spots, filter, book
- **Bookings**: Create and manage parking reservations
- **Admin Panel**: Manage spots and view all bookings
- **Responsive Design**: Mobile-first with Tailwind CSS
- **API Integration**: Clean axios service layer

## 📁 Project Structure

```
src/
├── api/                    # API service layer
│   ├── axiosConfig.js     # Axios instance with interceptors
│   ├── auth.js            # Auth API calls
│   ├── spots.js           # Parking spots API
│   └── bookings.js        # Bookings API
├── components/
│   ├── common/            # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Card.jsx
│   │   ├── Loader.jsx
│   │   └── Alert.jsx
│   └── layout/
│       └── Navbar.jsx
├── context/
│   └── AuthContext.jsx    # Auth state management
├── hooks/
│   └── useAuth.js         # Auth hook
├── layouts/
│   └── DashboardLayout.jsx
├── pages/
│   ├── auth/
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── spots/
│   │   └── ParkingSpots.jsx
│   ├── bookings/
│   │   ├── MyBookings.jsx
│   │   └── NewBooking.jsx
│   └── Dashboard.jsx
├── router/
│   ├── AppRouter.jsx      # Main router
│   └── ProtectedRoute.jsx # Route protection
├── App.jsx
└── index.css
```

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API endpoint:**
   The API base URL is set in `src/api/axiosConfig.js`:
   ```javascript
   baseURL: 'http://localhost:3000/api'
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   ```
   http://localhost:5173
   ```

## 🔑 Demo Credentials

```
Admin:
Email: admin@parksmart.com
Password: admin123

User:
Email: john@example.com
Password: password123
```

## 📱 Pages & Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/login` | Public | User login |
| `/register` | Public | User registration |
| `/dashboard` | Protected | User dashboard |
| `/parking-spots` | Protected | Browse parking spots |
| `/bookings` | Protected | My bookings |
| `/bookings/new` | Protected | Create new booking |

## 🎨 UI Components

### Button
```jsx
<Button variant="primary" onClick={handleClick} loading={loading}>
  Click Me
</Button>
```

Variants: `primary`, `secondary`, `danger`, `success`, `outline`

### Input
```jsx
<Input
  label="Email"
  type="email"
  name="email"
  value={email}
  onChange={handleChange}
  error={errors.email}
  required
/>
```

### Card
```jsx
<Card>
  <h3>Title</h3>
  <p>Content</p>
</Card>
```

### Alert
```jsx
<Alert type="success" message="Success!" onClose={() => setMsg('')} />
```

Types: `success`, `error`, `warning`, `info`

## 🔐 Authentication Flow

1. **Login/Register** → Returns JWT token
2. **Token Storage** → Saved in localStorage
3. **Axios Interceptor** → Attaches token to all requests
4. **Protected Routes** → Checks auth before rendering
5. **Auto Logout** → On 401 error (expired token)

## 🔄 API Integration

All API calls use the centralized axios instance:

```javascript
import { login } from '../api/auth';
import { getAllSpots } from '../api/spots';
import { createBooking } from '../api/bookings';

// Example usage
const response = await getAllSpots();
const spots = response.data;
```

## 🎯 Key Features

### State Management
- **Auth Context**: Global user state
- **useAuth Hook**: Easy access to auth functions
- **LocalStorage**: Persistent login

### Form Validation
- Client-side validation
- Error display
- Loading states

### Error Handling
- Global axios interceptor
- User-friendly error messages
- Auto redirect on auth failure

### Responsive Design
- Mobile-first approach
- Tailwind CSS utilities
- Flexible grid layouts

## 🚀 Build for Production

```bash
npm run build
```

Dist folder will be created with optimized build.

## 📦 Dependencies

- React 18
- React Router DOM v6
- Axios
- Tailwind CSS
- Vite

## 💡 Tips

1. **Backend Must Be Running**: Start backend on port 3000
2. **Seed Database**: Run `npm run seed` in backend
3. **CORS**: Backend has CORS enabled for localhost:5173
4. **Token Expiry**: Tokens expire in 30 days (configurable)

## 🐛 Troubleshooting

**Login fails:**
- Check backend is running on port 3000
- Verify database is seeded
- Check browser console for errors

**API calls fail:**
- Verify baseURL in axiosConfig.js
- Check network tab in dev tools
- Ensure token is present in localStorage

**Protected routes redirect:**
- Clear localStorage and login again
- Check token expiration

## 📄 License

ISC

---

**Built with ❤️ for ParkSmart**
