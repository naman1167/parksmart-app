# ParkSmart New Features User Guide

## 1. Razorpay Payment Integration
The booking process now includes a payment gateway.
- **How to use**: 
  1. Create a `New Booking`.
  2. Click "Book Now".
  3. A modal will appear offering payment via **Razorpay** or **Skip Payment (Demo)**.
- **Setup**: To enable real payments, you must add your Razorpay credentials to `parksmart-frontend/.env`:
  ```
  VITE_RAZORPAY_KEY_ID=your_key_id
  ```

## 2. User Inbox
Accessed via "My Inbox" on the dashboard.
- **Function**: View all your past and active tickets/receipts in one place.
- **Features**: Visual status badges, quick link to receipts, summary details.

## 3. Find My Spot (Batch ID)
Accessed via "Find My Spot" on the dashboard.
- **Function**: Locate your car or parking spot using the `Batch ID` (Reference Code) from your receipt.
- **Features**: Search by ID (`ORD-XXXXXX`), view spot location on map, view booking status.

## 4. Admin Dashboard Updates
- **New Feature**: "Create Parking Spot" quick action added.
- **Removed**: "My Bookings" link removed (as admins don't typically book spots for themselves).

## 5. Map Improvements
- **Fixes**: The map now correctly handles parking spot coordinates.
- **New Spots**: Creating a new spot defaults coordinates to Delhi (since no geocoding API is connected yet). You can update these in the database if needed.

## 6. Real-time Updates
- **Features**: The dashboard map updates in real-time when spots are booked or released.
- **Mechanism**: Powered by Socket.io.

