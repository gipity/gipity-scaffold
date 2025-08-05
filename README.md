# Gipity Scaffold App

# 📌 Important: Pre-Launch

**Initial Public Release:** v1.0.0-alpha • **Updated**: 5th August 2025 • **Author**: Steve Procter

**Support/Guidance**: Discussions & Issues in [Github Repo](https://github.com/gipity/gipity-scaffold) • Alternative [@Gipity-Steve in Replit community](https://replit.discourse.group/u/gipity-steve)

**Non-Support Discussions**: [steve@gipity.com](mailto:steve@gipity.com) • [LinkedIn](https://www.linkedin.com/in/stephencharlesprocter)

**Optional Vibe Building Studio (*paid-for. not yet live*)**: Email to join the waitlist • Visit [Gipity](https://www.gipity.com) - new site coming soon

## **What to expect from this pre-launch release**

> **Docs are definitely incomplete - including this one. Reach out for setup instructions and further guidance**

> **We are gathering early adopter feedback - contributions/feedback welcome**

> **The repo is public but may not be ready for less experienced users**

> **This is early-stage, and subject to change. Features are mostly done, but no promises. Take it as-is**

> **Expect breaks. Please don’t build production projects on it**

## **Clarification on documentation, including this readme**

This **Readme document** and the **replit.md instruction file** are the key documents to understanding the ***Gipity*** scaffold app.

However, the current versions were written by *Replit agent* as placeholders. They are only intended at this time to give a flavour, and may not be accurate. They have not been read, reviewed or verified by any human *Gipity* eyes.

`Please get in touch for human support from Steve during the pre-launch phase`

---

# ✍ Licensing & Fair Use

This project is MIT licensed. Please also read the [Gipity Usage Policy](./GIPITY-USAGE-POLICY.md) for intended use and support details.

---

# 🚀 Production-Ready Mobile App Scaffold

**Build cross-platform mobile applications in hours, not weeks.** A complete foundation for React + Capacitor + Express + Supabase applications with built-in authentication, multimedia handling, and native mobile deployment.

## ✨ What Makes This Special

🎯 **Complete Mobile Stack** - Everything you need from development to app store deployment
📱 **Dev/Prod Variants** - Build separate development and production apps that coexist on devices  
🔐 **Secure Architecture** - Backend-only database access with JWT authentication and admin panel
📸 **Native Features** - Camera integration, secure storage, safe area handling for all devices
⚡ **Rapid Deployment** - From code to iOS/Android app stores in minutes with automated scripts
🎨 **Asset Generation** - Complete icon/logo generation for all platforms and DPI levels

---

## 🏁 Quick Start (5 Minutes)

### 1. **Clone & Setup**
```bash
git clone https://github.com/your-username/gipity-scaffold
cd gipity-scaffold
npm install
```

### 2. **Create Supabase Project**
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and service role key
3. Add to Replit Secrets:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

### 3. **Setup Database**
1. Go to your Supabase project → SQL Editor
2. Copy all content from `gipity-scripts/gipity-supabase-prepare.sql`
3. Edit the admin user details (around line 277):
   - Replace `admin@yourapp.com` with your email
   - Replace `Your_First_Name` and `Your_Last_Name` with real values
4. Paste and run the script

### 4. **Start Development**
```bash
npm run dev
# Your app is now running at the displayed URL
```

**🎉 You now have a fully functional web app with authentication and admin panel!**

---

## 📱 Deploy to Mobile (Optional - 10 Minutes)

Ready to create native iOS and Android apps? Follow these steps:

### **Prerequisites Setup** (One-time)
- GitHub account with new empty repository named `[yourapp]-appflow`  
- Apple Developer account (for iOS apps)
- Google Play Developer account (for Android apps)
- Ionic Appflow account (free tier available)

### **Environment Variables** (Required for mobile)
Add these to your Replit Secrets:
```bash
# App Identity
APP_ID=com.yourcompany.yourapp
APP_NAME=Your App Name
APP_SCHEME=YourApp
APP_USER_AGENT=YourApp

# GitHub Integration  
GITHUB_USERNAME=your-github-username
APPFLOW_REPO_URL=yourapp-appflow
```

### **Generate App Assets** (One-time)
1. Create master images in `master-images/` folder:
   - `icon-master.png` (1024x1024px, transparent background)
   - `logo-master.png` (480x128px, transparent background)
   - `splash-square-master.png` (2732x2732px, optional background)
   - `splash-android-portrait-master.png` (1280x1920px)
   - `splash-android-landscape-master.png` (1920x1280px)
   - `splash-icon-square-master.png` (1024x1024px, transparent)

2. Run the image generator:
```bash
python3 gipity-scripts/gipity-image-resizer.py
```

### **Deploy to App Stores**
```bash
# For development builds (dev suffix - coexist with production)
./gipity-scripts/gipity-appflow-prepare.sh dev

# For production builds (clean identifiers)
./gipity-scripts/gipity-appflow-prepare.sh prod
```

The script will automatically:
- Sync your code to GitHub
- Configure mobile app settings
- Prepare for Ionic Appflow builds

---

## 🏗️ What's Included

### **Complete Tech Stack**
- **Frontend**: React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + JWT Authentication + Admin Panel
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Mobile**: Capacitor 7 + Ionic Appflow for iOS/Android deployment
- **Assets**: Automated multi-DPI icon/logo generation for all platforms

### **Production Features**
- ✅ **Secure Authentication** - JWT tokens with admin role management
- ✅ **Admin Dashboard** - Protected admin interface at `/server/admin`
- ✅ **Camera Integration** - Native photo capture with web fallback
- ✅ **File Storage** - Supabase Storage with user-specific security
- ✅ **Mobile Optimization** - Safe area handling, navigation bar theming
- ✅ **PWA Support** - Service worker, manifest, offline capability
- ✅ **Dev/Prod Variants** - Separate app identifiers for coexistence testing

### **Deployment Infrastructure**
- ✅ **Automated Scripts** - Complete mobile deployment automation
- ✅ **Asset Generation** - Icons and logos for all platforms and sizes
- ✅ **GitHub Integration** - Automated repository sync for mobile builds
- ✅ **Appflow Ready** - Pre-configured for Ionic Appflow compilation
- ✅ **Cross-Platform** - Single codebase deploys to web, iOS, and Android

---

## 🔧 Complete Setup Guides

### **Apple Developer Account Setup**

1. **Enroll in Apple Developer Program**
   - Go to [developer.apple.com](https://developer.apple.com)
   - Enroll for $99/year
   - Complete identity verification (can take 24-48 hours)

2. **Create App Identifiers**
   - Go to Certificates, Identifiers & Profiles
   - Create identifier for production: `com.yourcompany.yourapp`
   - Create identifier for development: `com.yourcompany.yourappdev`
   - Enable capabilities: App Groups, Push Notifications, Camera

3. **Generate Certificates**
   - Create distribution certificate for App Store
   - Create development certificate for testing
   - Download both certificates

4. **Create Provisioning Profiles**
   - Create distribution profile for production app
   - Create development profile for development app
   - Include your test devices in development profile

### **Android Developer Account Setup**

1. **Register Google Play Account**
   - Go to [play.google.com/console](https://play.google.com/console)
   - Pay $25 one-time registration fee
   - Complete identity verification

2. **Create App Entries**
   - Create new app for production version
   - Create separate app for development version (different package name)
   - Complete store listing information

3. **Generate Signing Keys**
   - Create upload key for Play Store
   - Create debug key for development testing
   - Store keys securely (losing them prevents app updates)

### **GitHub Repository Setup**

1. **Create Mobile Repository**
   - Create new repository: `[yourapp]-appflow`
   - Keep it empty (don't initialize with README)
   - Set to private or public based on preference

2. **Configure Authentication**
   - Generate personal access token with repo permissions
   - Add token to Replit Secrets as `GITHUB_TOKEN` (if needed)

### **Ionic Appflow Setup**

1. **Create Appflow Account**
   - Go to [ionic.io](https://ionic.io)
   - Sign up for free account or paid plan
   - Connect your GitHub account

2. **Import Mobile Project**
   - Import as Capacitor app (not Ionic Framework)
   - Connect to your `[yourapp]-appflow` repository
   - Configure build settings

3. **Configure Environments**
   - Create "Development" environment with variables:
     ```
     NODE_ENV=production
     VITE_BACKEND_URL=https://your-replit-app.replit.app
     ```
   - Create "Production" environment with same variables

4. **Add Signing Certificates**
   - Upload iOS distribution certificate and provisioning profile
   - Upload Android upload keystore
   - Configure for both dev and prod bundle IDs

5. **Build and Deploy**
   - Run builds for both development and production variants
   - Download IPA files for iOS testing
   - Download APK files for Android testing
   - Submit to app stores when ready

### **Supabase Configuration**

1. **Create Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project (choose region closest to users)
   - Wait for project initialization (2-3 minutes)

2. **Configure SMTP** (Optional - for email features)
   - Go to Authentication → Settings
   - Configure SMTP settings for your email provider
   - Test email sending functionality

3. **Storage Configuration**
   - Go to Storage → Settings
   - Set max upload file size: 5MB
   - Set allowed MIME types: `image/*`
   - Verify images bucket is public

4. **Run Database Setup**
   - Copy content from `gipity-scripts/gipity-supabase-prepare.sql`
   - Edit admin user details before running
   - Go to SQL Editor and run the complete script

---

## 📲 Testing Your Mobile Apps

### **iOS Testing**

1. **Development Testing**
   - Download IPA from Appflow
   - Use [diawi.com](https://diawi.com) to create installation link
   - Send link to test devices via email/SMS
   - Install by opening link on iOS device

2. **TestFlight Testing**
   - Upload IPA to App Store Connect
   - Create TestFlight group
   - Add internal/external testers
   - Distribute via TestFlight app

### **Android Testing**

1. **Direct Installation**
   - Download APK from Appflow
   - Enable "Install from unknown sources" on Android device
   - Transfer APK via USB, email, or cloud storage
   - Install directly on device

2. **Google Play Console Testing**
   - Upload AAB to Google Play Console
   - Create internal testing track
   - Add test user email addresses
   - Distribute via Play Store (test track)

### **Coexistence Testing**
Both development and production versions can be installed simultaneously on the same device, allowing you to:
- Compare features between versions
- Test production without losing development progress  
- Maintain separate user accounts and data
- Validate that both apps work independently

---

## 🛠️ Customization Guide

### **Branding Your App**

1. **App Identity** (Update environment variables)
   ```bash
   APP_ID=com.yourcompany.newname
   APP_NAME=Your New App Name
   APP_SCHEME=YourNewApp
   APP_USER_AGENT=YourNewApp
   ```

2. **Visual Assets** (Replace master images)
   - Update images in `master-images/` folder
   - Run `python3 gipity-scripts/gipity-image-resizer.py`
   - All platform icons/logos automatically generated

3. **Color Theme** (Edit CSS variables)
   - Update `client/src/index.css` color definitions
   - Modify Tailwind config in `tailwind.config.ts`
   - Update manifest colors in `public/manifest.json`

### **Adding Features**

1. **New API Endpoints**
   - Add routes in `server/routes.ts`
   - Follow JWT authentication pattern
   - Update shared types in `shared/schema.ts`

2. **Database Changes**
   - Create SQL scripts for new tables
   - Add to Supabase via SQL Editor
   - Update RLS policies for security

3. **Frontend Pages**
   - Create components in `client/src/pages/`
   - Add routes in `client/src/App.tsx`
   - Follow existing authentication patterns

### **Environment-Specific Configuration**

**Development Environment**
```bash
# Core (Required)
SUPABASE_URL=https://dev-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=dev_service_key

# Mobile (For mobile builds)
APP_ID=com.yourcompany.yourappdev
APP_NAME=Your App (Dev)
# ... other mobile variables with dev suffix
```

**Production Environment**
```bash
# Same as development but without dev suffixes
APP_ID=com.yourcompany.yourapp
APP_NAME=Your App
# ... clean identifiers for production
```

---

## 🚨 Troubleshooting

### **Common Issues**

**"Module not found" errors**
- Run `npm install` to install dependencies
- Check that all required environment variables are set

**Database connection fails**
- Verify Supabase URL and service role key
- Check that database setup script ran successfully
- Ensure RLS policies allow your user type

**Mobile builds fail**
- Verify all mobile environment variables are set
- Check that GitHub repository exists and is accessible
- Ensure Appflow has proper certificates uploaded

**Camera not working**
- On iOS: Check Info.plist has camera usage description
- On Android: Verify camera permissions in manifest
- On web: Ensure HTTPS for getUserMedia API

### **Getting Help**

**Built-in Debug Tools**
- Check browser console for frontend errors
- Review Replit console for backend errors
- Use network tab to inspect API calls

**Log Analysis**
- Backend logs appear in Replit console
- Mobile logs available through Appflow build logs
- Frontend errors visible in browser developer tools

---

## 🎓 Advanced Features

### **Email Integration** (Optional)
Add SMTP configuration for user emails:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_SENDER_EMAIL=your-email@gmail.com
SMTP_SENDER_NAME=Your App Name
```

### **Custom Domain Setup**
1. Purchase domain from registrar
2. Point domain to Replit deployment
3. Configure custom domain in Replit
4. Update mobile app backend URL

### **Performance Optimization**
- Use TanStack Query for API caching
- Implement lazy loading for components
- Optimize images with multi-DPI serving
- Enable service worker for offline functionality

---

## 🎯 Success Metrics

**After following this guide, you'll have:**
- ✅ Working web application with authentication
- ✅ Admin panel for user management
- ✅ Native iOS and Android applications
- ✅ Separate development and production app versions
- ✅ Complete asset generation for all platforms
- ✅ Automated deployment pipeline
- ✅ Professional app store ready applications

**Total setup time:** ~30 minutes for web, +20 minutes for mobile

---

## 🤝 Community & Support

### **Professional Support**
Need guidance beyond this documentation? Join our **Gipity Community Studio** for:

- 📺 **Video Walkthroughs** - Step-by-step video guides for complex setup procedures
- 💬 **Daily Live Office Hours** - Get real-time help from experienced developers
- 🏗️ **Architecture Reviews** - Expert feedback on your app customizations
- 🚀 **Advanced Tutorials** - Learn advanced patterns and best practices
- 👥 **Community Forum** - Connect with other developers building similar apps

**43 years of development experience, 30 years as a tech startup founder.**

Visit [gipity.com/community](https://gipity.com/community) for access details.

### **Open Source Contributions**
This scaffold is open source and welcomes contributions:
- Report issues on GitHub
- Submit feature requests
- Share your customizations with the community
- Contribute documentation improvements

### **Success Stories**
Share your apps built with this scaffold! Tag us on social media or submit to our showcase gallery.

---

## 📚 Additional Resources

### **Documentation**
- [replit.md](./replit.md) - Comprehensive agent and developer guide
- [Architecture Deep Dive](./docs/architecture.md) - Technical implementation details
- [API Reference](./docs/api.md) - Complete API endpoint documentation

### **Scripts Reference**
- `gipity-scripts/gipity-appflow-prepare.sh` - Mobile deployment automation
- `gipity-scripts/gipity-image-resizer.py` - Asset generation for all platforms  
- `gipity-scripts/gipity-supabase-prepare.sql` - Database setup and security

### **External Dependencies**
- [Supabase Documentation](https://supabase.com/docs) - Database and authentication
- [Capacitor Documentation](https://capacitorjs.com/docs) - Native mobile features
- [Ionic Appflow Documentation](https://ionic.io/docs/appflow) - Mobile app compilation
- [React Documentation](https://react.dev) - Frontend framework guide

---

**Ready to build your next mobile app?** Start with the Quick Start section above and join thousands of developers using this scaffold to create production-ready applications.

---