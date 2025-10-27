# Delas Alas Dental Clinic - Frontend Only

This is a clean, frontend-only version of the Delas Alas Dental Clinic website with separated HTML, CSS, and JavaScript files.

## Files Structure

- `index.html` - Main HTML file with all the website structure
- `style.css` - Complete CSS styles for the website
- `script.js` - Frontend JavaScript functionality (no backend dependencies)

## Features

### ✅ What's Included
- Complete responsive design
- Modern UI with smooth animations
- Mobile-friendly navigation
- Modal forms (Login, Register, Appointment Booking)
- Calendar integration for appointment booking
- Form validation
- Local storage for data persistence
- Toast notifications
- Password visibility toggle
- Smooth scrolling navigation

### ❌ What's Removed
- Firebase backend integration
- API calls to external services
- Server-side functionality
- Database connections

## How to Use

1. **Open the website**: Simply open `index.html` in any modern web browser
2. **No server required**: The website works completely offline
3. **Data storage**: All data (users, appointments, contacts) is stored locally in the browser

## Key Functionality

### User Authentication
- Users can register and login
- Passwords are stored locally (not secure for production)
- Session persistence across browser refreshes

### Appointment Booking
- Calendar integration with availability checking
- Time slot management
- Service selection
- Form validation

### Contact Form
- Message submission
- Local storage of contact messages

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Development Notes

- All styling is in `style.css`
- All JavaScript functionality is in `script.js`
- No external dependencies except Font Awesome icons
- Uses CSS Grid and Flexbox for layout
- Responsive design with mobile-first approach

## Customization

You can easily customize:
- Colors in CSS variables (`:root` section in `style.css`)
- Clinic information in `index.html`
- Business hours and contact details
- Services offered
- Appointment time slots

## Deployment to Vercel

This project can be deployed to Vercel with minimal configuration:

### Quick Deploy

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/delas-alas-dental.git
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration
   - Click "Deploy"

### Configuration Files

- `vercel.json` - Vercel configuration for routing and headers
- `.vercelignore` - Files to exclude from deployment

### Post-Deployment

After deployment, update the deployment URL in Supabase:

1. Go to Supabase Dashboard → SQL Editor
2. Run:
   ```sql
   UPDATE clinic_settings 
   SET deployment_url = 'https://your-app.vercel.app/appointment-schedule.html' 
   WHERE id = 'clinic';
   ```

3. The QR codes will now use your deployed HTTPS URL!

## Security Note

This is a frontend-only demo. For production use, you would need:
- Proper backend authentication
- Secure password hashing
- Database integration
- Email services for notifications
- HTTPS for security (provided by Vercel)


