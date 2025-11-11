# 🚀 Stock Management System - Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ **Before You Start**
- [ ] Backup your database
- [ ] Test in development environment
- [ ] Review all documentation
- [ ] Prepare rollback plan
- [ ] Notify team about deployment

---

## 🗄️ **Step 1: Database Migration**

### 1.1 Backup Database (CRITICAL!)
```bash
# MongoDB backup
mongodump --uri="YOUR_MONGO_URI" --out=./backup-$(date +%Y%m%d)

# Or using MongoDB Compass / Atlas
# Create a manual snapshot before proceeding
```

### 1.2 Run Migration Script
```bash
cd database/migrations
node add_stock_features.js
```

**Expected Output:**
```
✅ Connected to database
✅ Updated X clients
✅ Updated X stores  
✅ Updated X colis with stock fields
✅ Created indexes
✅ MIGRATION COMPLETED SUCCESSFULLY
```

### 1.3 Verify Migration
```javascript
// In MongoDB shell or Compass
db.clients.findOne({}, { features_access: 1, stock_config: 1 })
// Should show features_access and stock_config fields

db.stores.findOne({}, { features_access: 1, stock_location: 1 })
// Should show stock_location field
```

---

## 📦 **Step 2: Deploy Backend Code**

### 2.1 Git Workflow
```bash
# On your development branch
git status
git add .
git commit -m "feat: Add stock management system

- Added Stock, StockMovement, StockAlert models
- Added stock controller with 18 endpoints
- Added stock access middleware
- Updated Client, Store, Colis models
- Added stock integration to colis lifecycle
- Added complete documentation"

# Create feature branch (if not already)
git checkout -b feature/stock-management

# Push to remote
git push origin feature/stock-management
```

### 2.2 Code Review
- [ ] Review all new files
- [ ] Check for console.logs in production code
- [ ] Verify environment variables
- [ ] Test all API endpoints locally

### 2.3 Merge to Main/Production Branch
```bash
# After approval
git checkout main
git merge feature/stock-management
git push origin main
```

### 2.4 Deploy to Server
```bash
# SSH to your server
ssh user@your-server.com

# Navigate to project
cd /path/to/eromax/backend

# Pull latest code
git pull origin main

# Install dependencies (if any new)
npm install

# Restart server
pm2 restart eromax-backend
# or
npm run prod
```

### 2.5 Verify Deployment
```bash
# Check logs
pm2 logs eromax-backend

# Test health endpoint
curl http://your-server.com/api/health

# Test stock endpoint (should return 403 for unauthenticated)
curl http://your-server.com/api/stock/my-stocks
```

---

## 🧪 **Step 3: Testing in Production**

### 3.1 Enable Stock for Test Client
```bash
# Using MongoDB shell or API
PUT http://your-server.com/api/stock/admin/client/CLIENT_ID/access
Headers: Authorization: Bearer ADMIN_TOKEN
Body:
{
  "features_access": {
    "stock_management": true
  }
}
```

### 3.2 Test Complete Workflow
1. ✅ Client creates stock → Status: pending
2. ✅ Admin approves stock → Status: active
3. ✅ Client creates colis with stock → Stock reserved
4. ✅ Admin delivers colis → Stock deducted
5. ✅ Verify stock movements created

### 3.3 Monitor for Errors
```bash
# Watch logs in real-time
pm2 logs eromax-backend --lines 100

# Check for errors
grep "ERROR" /path/to/logs/error.log
grep "Stock" /path/to/logs/combined.log
```

---

## 👥 **Step 4: Enable for Pilot Clients**

### 4.1 Select Pilot Clients
Choose 2-3 clients who:
- ✅ Have expressed interest in stock management
- ✅ Are tech-savvy and can provide feedback
- ✅ Have manageable inventory size (50-200 items)
- ✅ Are willing to test new features

### 4.2 Enable Stock Access
```javascript
// For each pilot client
db.clients.updateOne(
  { email: "pilot@example.com" },
  {
    $set: {
      "features_access.stock_management": true,
      "stock_config.require_admin_approval": true,
      "stock_config.low_stock_alert_threshold": 10
    }
  }
)
```

### 4.3 Train Pilot Clients
- [ ] Schedule training session
- [ ] Walk through stock creation process
- [ ] Demonstrate colis creation with stock
- [ ] Explain approval workflow
- [ ] Provide documentation links

### 4.4 Gather Feedback
- Daily check-ins during first week
- Weekly feedback sessions
- Track issues/feature requests
- Monitor usage patterns

---

## 🎯 **Step 5: Gradual Rollout**

### Week 1-2: Pilot Phase
- 2-3 pilot clients
- Daily monitoring
- Quick bug fixes
- Feature refinements

### Week 3-4: Early Adopters
- Enable for 10-15 interested clients
- Less frequent monitoring
- Collect feedback
- Plan improvements

### Week 5-6: General Availability
- Announce feature to all clients
- Enable on request
- Self-service enablement (admin panel)
- Continued support

---

## 🔍 **Monitoring & Maintenance**

### Key Metrics to Track
```javascript
// Stock statistics
db.stocks.aggregate([
  { $match: { isDeleted: false } },
  { $group: {
      _id: "$status",
      count: { $sum: 1 }
  }}
])

// Stock movements per day
db.stockmovements.aggregate([
  { $match: {
      date: { $gte: new Date(Date.now() - 7*24*60*60*1000) }
  }},
  { $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
      count: { $sum: 1 }
  }}
])

// Low stock items
db.stocks.find({
  status: "active",
  $expr: { $lt: ["$quantite_disponible", "$quantite_minimum"] }
}).count()
```

### Daily Checks
- [ ] Check error logs
- [ ] Review pending stock approvals
- [ ] Monitor low stock alerts
- [ ] Check API response times

### Weekly Reviews
- [ ] Review stock usage statistics
- [ ] Analyze stock movement patterns
- [ ] Check for any stuck transactions
- [ ] Review client feedback

---

## 🚨 **Rollback Plan**

### If Issues Arise

#### Quick Rollback (Without Code Changes)
```bash
# Disable stock feature for all clients
db.clients.updateMany(
  {},
  { $set: { "features_access.stock_management": false } }
)

# This stops new stock operations while keeping data intact
```

#### Full Rollback (Revert Code)
```bash
# Revert to previous version
git revert HEAD
git push origin main

# Redeploy
ssh user@your-server.com
cd /path/to/eromax/backend
git pull
pm2 restart eromax-backend
```

#### Database Rollback (Last Resort)
```bash
# Restore from backup
mongorestore --uri="YOUR_MONGO_URI" --drop ./backup-DATE/

# Note: This loses all data since backup!
# Only use if absolutely necessary
```

---

## 📱 **Frontend Deployment**

### When Frontend is Ready

#### 1. Build Frontend
```bash
cd frontend
npm run build
```

#### 2. Deploy Static Files
```bash
# Copy build to server
scp -r build/* user@server:/var/www/eromax/

# Or use your deployment pipeline
```

#### 3. Update Environment Variables
```javascript
// frontend/.env.production
VITE_API_URL=https://api.eromax.com
```

#### 4. Test Frontend
- [ ] Login as admin
- [ ] Test stock approval workflow
- [ ] Login as client (with stock access)
- [ ] Test stock creation
- [ ] Test colis creation with stock

---

## 🔧 **Troubleshooting**

### Common Issues

#### Issue 1: "Stock management not enabled"
**Solution:** Enable feature for client
```javascript
db.clients.updateOne(
  { _id: ObjectId("CLIENT_ID") },
  { $set: { "features_access.stock_management": true } }
)
```

#### Issue 2: "Insufficient stock" but stock shows available
**Cause:** Stock might be reserved for other pending colis
**Solution:** Check reserved quantity
```javascript
db.stocks.findOne({ _id: ObjectId("STOCK_ID") }, {
  quantite_disponible: 1,
  quantite_reservee: 1
})
```

#### Issue 3: Stock movement not created
**Cause:** Transaction rollback or error in helper function
**Solution:** Check logs for errors
```bash
grep "Stock reservation error" /path/to/logs/error.log
```

#### Issue 4: Duplicate SKU error
**Cause:** SKU already exists for this client
**Solution:** Use unique SKU or delete old stock
```javascript
// Find existing stock
db.stocks.find({ clientId: ObjectId("CLIENT_ID"), sku: "SKU" })
```

---

## 📊 **Success Criteria**

### After 1 Week
- [ ] 0 critical bugs
- [ ] 2-3 pilot clients active
- [ ] 100+ stocks created
- [ ] 50+ colis using stock
- [ ] < 5% error rate

### After 1 Month
- [ ] 10+ clients using stock
- [ ] 1000+ stocks managed
- [ ] 500+ colis with stock
- [ ] < 1% error rate
- [ ] Positive feedback from users

---

## 📝 **Post-Deployment Tasks**

### Documentation
- [ ] Update user manual
- [ ] Create video tutorials
- [ ] Write FAQs
- [ ] Update API documentation

### Training
- [ ] Admin training session
- [ ] Client training materials
- [ ] Support team briefing
- [ ] Help desk knowledge base

### Marketing
- [ ] Announce new feature
- [ ] Send email to clients
- [ ] Update website
- [ ] Create demo video

---

## 🎉 **Deployment Complete!**

### Congratulations! Your stock management system is live! 🚀

**Next Steps:**
1. Monitor closely for first 48 hours
2. Respond quickly to any issues
3. Gather user feedback
4. Plan future improvements

**Need Help?**
- Check documentation: `STOCK_MANAGEMENT_DOCUMENTATION.md`
- Review API guide: `API_TESTING_GUIDE.md`
- Contact development team

---

*Last Updated: January 2025*  
*Version: 1.0.0*

