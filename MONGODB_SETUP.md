# MongoDB Atlas Setup Guide

## Quick Setup (5 minutes)

### Step 1: Create MongoDB Atlas Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with your email (it's FREE)
3. Choose the FREE tier (M0 Sandbox)

### Step 2: Create a Cluster
1. After login, click "Build a Database"
2. Select **FREE** (M0) tier
3. Choose a cloud provider (AWS) and region close to you
4. Click "Create Cluster" (takes 1-3 minutes)

### Step 3: Create Database User
1. Click "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `inextrack_user`
5. Password: Create a strong password (save it!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### Step 4: Whitelist Your IP
1. Click "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

### Step 5: Get Connection String
1. Click "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string (looks like):
   ```
   mongodb+srv://inextrack_user:<password>@cluster0.xxxxx.mongodb.net/
   mongodb+srv://inextrack_user:inextrack$1234@cluster0.d6d9gsi.mongodb.net/?appName=Cluster0
   ```
5. Replace `<password>` with your actual password
6. Add the database name at the end: `inextrack`

### Step 6: Update Your .env File
Open `server/.env` and replace the MONGODB_URI line with your connection string:

```env
MONGODB_URI=mongodb+srv://inextrack_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/inextrack?retryWrites=true&w=majority
```

### Step 7: Restart the Server
The server will automatically reconnect to MongoDB Atlas!

---

## Alternative: Install MongoDB Locally

### Windows Installation:
1. Download: https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.0-signed.msi
2. Run the installer
3. Choose "Complete" installation
4. Install as a Windows Service
5. After installation, MongoDB runs automatically

### Start MongoDB Service:
```bash
net start MongoDB
```

---

## Troubleshooting

**Connection Timeout:**
- Make sure you whitelisted your IP in Network Access
- Check your firewall settings

**Authentication Failed:**
- Double-check your password in the connection string
- Ensure you created the database user properly

**Need Help?**
- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com/
- Connection String Format: https://docs.mongodb.com/manual/reference/connection-string/
