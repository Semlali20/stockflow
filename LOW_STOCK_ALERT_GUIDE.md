# 🚨 Automatic Low Stock Alert System - Step by Step Guide

## ✅ What Was Implemented

I've added **automatic low stock monitoring** to your inventory system. Now alerts are created automatically when inventory levels drop below thresholds!

---

## 🎯 How It Works

### Automatic Triggers
Alerts are created automatically when you:
1. **Create** inventory with low quantity
2. **Update** inventory to low quantity
3. **Adjust** inventory quantity (decrease)
4. **Reserve** inventory (reduces available quantity)
5. **Transfer** inventory out (reduces quantity)

### Alert Thresholds

| Quantity Available | Alert Level | Action |
|-------------------|-------------|--------|
| **< 5 units** | 🔴 CRITICAL | Immediate alert created |
| **< 10 units** | ⚠️ WARNING | Warning alert created |
| **≥ 10 units** | ✅ OK | No alert |

**Note**: System checks **Available Quantity** = `quantityOnHand - quantityReserved`

---

## 📋 Step-by-Step Testing Instructions

### Step 1: Start Your Docker Services

```bash
cd suspicious-goldstine
docker-compose up -d
```

**Wait for all services to start** (about 30-60 seconds)

Check services are running:
```bash
docker-compose ps
```

You should see:
- ✅ alert-service (port 8088)
- ✅ inventory-service (port 8086)
- ✅ location-service (port 8085)
- ✅ frontend (port 5173)
- ✅ PostgreSQL databases
- ✅ Kafka
- ✅ Redis

---

### Step 2: Login to Frontend

1. Open browser: **http://localhost:5173**
2. Login with your credentials
3. You should see the dashboard

---

### Step 3: Create Inventory with Low Stock (Test 1)

#### Option A: Using Frontend UI

1. Go to **Inventory** page in sidebar
2. Click **"+ New Inventory"** button
3. Fill in the form:
   - **Item**: Select any item (e.g., MacBook Pro 16)
   - **Location**: Select location (e.g., A-01-01-01-02)
   - **Warehouse**: Select warehouse
   - **Quantity On Hand**: **3** ← This will trigger CRITICAL alert!
   - **UOM**: PIECE
   - **Status**: AVAILABLE
4. Click **"Create"** button

#### Option B: Using API (Postman/cURL)

```bash
POST http://localhost:8086/api/inventory
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "itemId": "your-item-id",
  "locationId": "your-location-id",
  "warehouseId": "your-warehouse-id",
  "quantityOnHand": 3,
  "quantityReserved": 0,
  "uom": "PIECE",
  "status": "AVAILABLE"
}
```

---

### Step 4: Check Alert Was Created

#### Option A: Check Frontend Alert Page

1. Click **"Alerts"** in the sidebar (🔔 Bell icon)
2. You should see:
   - **New alert** with type "LOW_STOCK"
   - **Level**: "CRITICAL" (red badge)
   - **Message**: "CRITICAL: Item XXX has only 3.00 units available..."
   - **Status**: "ACTIVE"

#### Option B: Check Notification Dropdown

1. Look at **bell icon** in header (top right)
2. You should see **red badge** with number "1"
3. Click the bell icon
4. Dropdown shows the new alert
5. You can:
   - Click "Acknowledge" to mark as seen
   - Click "View All" to go to alerts page

---

### Step 5: Test Different Thresholds

#### Test CRITICAL Alert (< 5 units):

1. Create/adjust inventory to **4 units**
2. Expected: 🔴 **CRITICAL** alert created

#### Test WARNING Alert (< 10 units):

1. Create/adjust inventory to **7 units**
2. Expected: ⚠️ **WARNING** alert created

#### Test NO Alert (≥ 10 units):

1. Create/adjust inventory to **15 units**
2. Expected: ✅ **NO** alert created

---

### Step 6: Test Inventory Update

1. Go to **Inventory** page
2. Find an existing inventory
3. Click **Edit** (pencil icon)
4. Change **Quantity On Hand** to **2**
5. Click **"Update"**
6. Expected: New **CRITICAL** alert appears immediately

---

### Step 7: Test Inventory Adjustment

1. Go to **Inventory** page
2. Find inventory with quantity 15
3. Click **Actions** → **Adjust Quantity**
4. Set **New Quantity** to **4**
5. Add **Reason**: "Stock sold"
6. Click **"Adjust"**
7. Expected: New **CRITICAL** alert appears

---

### Step 8: Verify Alert Details

1. Go to **Alerts** page
2. Click on any LOW_STOCK alert
3. Check **Details Modal** shows:
   - ✅ Alert Type: "LOW_STOCK"
   - ✅ Alert Level: "CRITICAL" or "WARNING"
   - ✅ Message with item ID and quantity
   - ✅ Entity Type: "ITEM"
   - ✅ Entity ID: Your item ID
   - ✅ Additional Data: JSON with itemId, locationId, currentQuantity, threshold
4. You can:
   - **Acknowledge**: Mark alert as seen
   - **Resolve**: Close the alert (e.g., after restocking)

---

## 🔍 Troubleshooting

### Issue 1: No Alerts Appearing

**Check**:
1. ✅ Services are running: `docker-compose ps`
2. ✅ Inventory quantity is below threshold (< 10)
3. ✅ Alert-service logs: `docker-compose logs alert-service`
4. ✅ Inventory-service logs: `docker-compose logs inventory-service`

**Look for logs**:
```
inventory-service | 🚨 CRITICAL LOW STOCK: Item XXX has only 3.00 units...
inventory-service | ✅ Low stock alert created successfully

alert-service | REST request to create alert - type: LOW_STOCK, level: EMERGENCY
alert-service | Alert created successfully with ID: alert-123
```

### Issue 2: Alerts Not Visible in Frontend

**Check**:
1. ✅ Frontend connected to correct API: `http://localhost:8080`
2. ✅ Auto-refresh working (waits 30 seconds)
3. ✅ Alert status is "ACTIVE" (not RESOLVED)
4. ✅ Browser console for errors: Press F12

**Manual refresh**:
- Click **Refresh** button on Alerts page
- Or wait 30 seconds for auto-refresh

### Issue 3: Alert Created Multiple Times

**Expected**: One alert per inventory operation

**If multiple alerts**:
- Check if you're creating/updating multiple times
- Each operation creates a new alert
- This is normal behavior

**To resolve duplicates**:
1. Go to Alerts page
2. Click **Resolve** on old alerts
3. Keep only the latest one

### Issue 4: Alert Level is Wrong

**Check thresholds**:
- CRITICAL: `quantity < 5`
- WARNING: `quantity < 10`

**Example**:
- Quantity = 3 → CRITICAL ✅
- Quantity = 7 → WARNING ✅
- Quantity = 12 → No alert ✅

---

## 📊 Checking Logs (Debugging)

### View Inventory Service Logs:
```bash
docker-compose logs -f inventory-service | grep -i "stock\|alert"
```

You should see:
```
🚨 CRITICAL LOW STOCK: Item 123 has only 3.00 units available at location 456 (threshold: 5)
⚠️ Creating low stock alert - Item: 123, Location: 456, Quantity: 3.0
✅ Low stock alert created successfully
```

### View Alert Service Logs:
```bash
docker-compose logs -f alert-service | grep -i "alert\|low"
```

You should see:
```
REST request to create alert - type: LOW_STOCK, level: EMERGENCY, entity: ITEM/123
Alert created successfully with ID: alert-abc-123
```

---

## 🎯 Expected Results

### When Quantity = 3 (CRITICAL):
1. ✅ Inventory created/updated successfully
2. ✅ CRITICAL alert created in database
3. ✅ Alert appears on Alerts page (red badge)
4. ✅ Bell icon shows "1" badge
5. ✅ Dropdown shows alert with red color
6. ✅ Alert message: "CRITICAL: Item XXX has only 3.00 units..."

### When Quantity = 7 (WARNING):
1. ✅ Inventory created/updated successfully
2. ✅ WARNING alert created in database
3. ✅ Alert appears on Alerts page (orange badge)
4. ✅ Bell icon shows "1" badge
5. ✅ Dropdown shows alert with orange color
6. ✅ Alert message: "WARNING: Item XXX has 7.00 units..."

### When Quantity = 15 (OK):
1. ✅ Inventory created/updated successfully
2. ✅ NO alert created
3. ✅ Alerts page shows no new alerts
4. ✅ Bell icon shows "0" or no badge

---

## 📱 Frontend Features

### Alerts Page (`/alerts`)
- **Filter by Type**: Select "LOW_STOCK" to see only stock alerts
- **Filter by Level**: Select "CRITICAL" or "WARNING"
- **Filter by Status**: Select "ACTIVE" to see unresolved alerts
- **Search**: Type item ID or location to find specific alerts
- **Actions**:
  - **Acknowledge**: Mark alert as seen (changes status to ACKNOWLEDGED)
  - **Resolve**: Close alert (changes status to RESOLVED)
  - **Escalate**: Escalate CRITICAL alerts (changes status to ESCALATED)

### Notification Dropdown (Bell Icon)
- **Badge Count**: Shows number of unacknowledged alerts
- **Auto-Refresh**: Updates every 30 seconds
- **Quick Actions**:
  - Click **X** to acknowledge individual alert
  - Click **"Acknowledge All"** to acknowledge all alerts at once
  - Click **"View All"** to go to Alerts page
- **Click Alert**: Opens Alerts page with details

---

## 🔧 Customizing Thresholds

If you want to change the thresholds (e.g., CRITICAL at 3 instead of 5):

1. Open: `inventory-service/src/main/java/com/stock/inventoryservice/service/impl/InventoryServiceImpl.java`
2. Find method: `checkLowStockAndCreateAlert()`
3. Change values:
```java
final Double CRITICAL_THRESHOLD = 3.0;  // Changed from 5.0
final Double WARNING_THRESHOLD = 8.0;   // Changed from 10.0
```
4. Rebuild: `cd inventory-service && mvn clean compile`
5. Restart: `docker-compose restart inventory-service`

---

## 📈 Testing Scenarios

### Scenario 1: New Product Arrival (Low Initial Stock)
```
1. Receive 4 units of new product
2. Create inventory with quantity = 4
3. Expected: CRITICAL alert created immediately
4. Restock to 20 units
5. Update inventory quantity = 20
6. Expected: No new alert
7. Resolve the CRITICAL alert
```

### Scenario 2: Product Selling Fast
```
1. Start with inventory quantity = 50
2. Sell 42 units (adjust to 8)
3. Expected: WARNING alert created (quantity < 10)
4. Sell 4 more units (adjust to 4)
5. Expected: CRITICAL alert created (quantity < 5)
6. Order placed, mark alerts as acknowledged
7. Restock arrives, update to 100
8. Resolve all alerts
```

### Scenario 3: Reserved Inventory
```
1. Create inventory: quantityOnHand = 10, quantityReserved = 6
2. Available = 10 - 6 = 4
3. Expected: CRITICAL alert (available < 5)
4. Note: Alert based on AVAILABLE, not just on hand!
```

---

## ✅ Success Checklist

After testing, you should have:
- [ ] Created inventory with 3 units → CRITICAL alert appears
- [ ] Created inventory with 7 units → WARNING alert appears
- [ ] Created inventory with 15 units → NO alert appears
- [ ] Updated inventory to 4 units → CRITICAL alert appears
- [ ] Adjusted inventory to 2 units → CRITICAL alert appears
- [ ] Alerts visible on Alerts page
- [ ] Bell icon shows correct badge count
- [ ] Notification dropdown shows alerts
- [ ] Acknowledged an alert → status changed
- [ ] Resolved an alert → status changed
- [ ] Filtered alerts by type/level/status
- [ ] Searched for specific alert

---

## 🎊 Summary

**What You Now Have**:
- ✅ **Automatic** low stock monitoring
- ✅ **Real-time** alert creation
- ✅ **2-tier** threshold system (WARNING at < 10, CRITICAL at < 5)
- ✅ **Visual** alerts in frontend
- ✅ **Notifications** in dropdown
- ✅ **Email** notifications (if configured)
- ✅ **Complete** audit trail

**Triggers**:
- ✅ Create inventory
- ✅ Update inventory
- ✅ Adjust quantity
- ✅ Reserve inventory
- ✅ Transfer inventory

**Alert Features**:
- ✅ Acknowledge
- ✅ Resolve
- ✅ Escalate
- ✅ Filter & Search
- ✅ Auto-refresh (30s)

---

## 🚀 You're Ready!

Your automatic low stock alert system is now **fully operational**!

Just:
1. **Start Docker**: `docker-compose up -d`
2. **Login to frontend**: http://localhost:5173
3. **Create/update inventory** with low quantity
4. **Watch alerts appear** automatically! 🎉

**No configuration needed** - it works out of the box!
