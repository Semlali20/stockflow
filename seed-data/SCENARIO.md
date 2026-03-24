# TechSupply SARL — Seed Data Scenario

**Company:** TechSupply SARL — Moroccan B2B tech distributor
**Period covered:** January 2026 → March 2026
**All prices in MAD (Moroccan Dirham)**

---

## 📐 Data Structure Overview

| File | Contents |
|------|----------|
| `products.json` | 10 categories, 30 products, 180 variants |
| `locations.json` | 2 sites, 4 warehouses, 15 locations |
| `inventory.json` | 5 inventories, 8 lots, 74 serial numbers, 22 stock records |
| `purchases.json` | 4 suppliers, 5 purchase orders |
| `movements.json` | 10 movements (IN/OUT/TRANSFER/BLOCKED) |
| `sales.json` | 10 customers, 10 quotes, 7 delivery notes |
| `alerts.json` | 7 alerts (critical/warning/info) |

---

## 🔄 Stock Evolution — Step by Step

### Step 1 — Setup (January 2026)
- Sites, warehouses and locations created
- 5 inventories defined across 2 warehouses
- Product catalog created: 30 products, 180 variants across 10 categories
- Tracking types assigned: **SERIAL** (smartphones, laptops, tablets, printers), **LOT** (cables, chargers, storage), **QUANTITY** (audio, cases, networking)

---

### Step 2 — PO-001 received (February 5, 2026) → MOV-001 (IN)
**Supplier:** TechImport Global | **Inventory:** INV-001 (Electronics Main)

| Product | Qty | Serials |
|---------|-----|---------|
| Samsung Galaxy A54 5G | +20 | R58T301... → R58T320... |
| Apple iPhone 14 | +15 | F2LNXQ3C7A9D → ...Q5T |
| Apple iPad 10th Gen | +10 | IPD10-A2696-001 → 010 |

**Stock after:** A54=20, iPhone=15, iPad=10

---

### Step 3 — PO-002 received (February 10, 2026) → MOV-002 (IN)
**Supplier:** ElecDistrib Maroc | **Inventory:** INV-001 + INV-002

| Product | Qty |
|---------|-----|
| Dell Inspiron 15 3520 | +12 (SERIAL) |
| HP Pavilion 14-dv2 | +8 (SERIAL) |
| Sony WH-1000XM5 | +25 (QUANTITY) |
| JBL Flip 6 | +30 (LOT-008) |

---

### Step 4 — PO-003 received (February 20, 2026) → MOV-003 (IN)
**Supplier:** SmartTech Wholesale | ⚠️ LOT-003B flagged during QC inspection

| Product | Qty | Lot |
|---------|-----|-----|
| USB-C Braided Cable | +100 | LOT-001 |
| HDMI 4K Cable | +80 | LOT-002 |
| 65W GaN Charger | +45 | LOT-003A (OK) |
| 65W GaN Charger | +5 | **LOT-003B ⚠️ Expiry 2026-04-10** |
| iPhone 14 Silicone Case | +60 | QUANTITY |
| Samsung A54 Hybrid Case | +40 | QUANTITY |

---

### Step 5 — PO-004 received (February 25, 2026)
**Supplier:** DigiParts Pro | Storage + peripherals

| Product | Qty | Lot |
|---------|-----|-----|
| WD Elements 1TB HDD | +30 | LOT-004 |
| Samsung 870 EVO SSD | +25 | LOT-005 |
| SanDisk 128GB USB | +50 | LOT-006 |
| Logitech MX Master 3S | +15 | QUANTITY |
| Keychron K2 Keyboard | +10 | QUANTITY |

---

### Step 6 — Quote Q-001 → Delivery DN-001 (February 20, 2026) → MOV-005 (OUT)
**Customer:** Maroc Telecom | Quote accepted, converted to delivery

| Product | Qty Shipped | Serials used |
|---------|-------------|--------------|
| Samsung Galaxy A54 5G | -5 | R58T316...→R58T320... |
| Dell Inspiron 15 3520 | -2 | DEL-INS15-CNAXFJ, CNBXFK |
| Sony WH-1000XM5 | -3 | — |

**Stock after:** A54=15, Dell=10, Sony=22

---

### Step 7 — Quote Q-002 → DN-002 (March 1, 2026) → MOV-006 (OUT)
**Customer:** Orange Maroc

| Product | Qty | Lot |
|---------|-----|-----|
| USB-C Braided Cable | -10 | LOT-001 → 90 remaining |
| iPhone 14 Silicone Case | -10 | QUANTITY → 50 remaining |

---

### Step 8 — Quote Q-003 → DN-003 (March 5, 2026) → MOV-007 (OUT)
**Customer:** Inwi

| Product | Qty |
|---------|-----|
| Apple iPhone 14 | -2 → 13 remaining |
| Apple iPad 10th Gen | -1 → 9 remaining |
| HDMI 4K Cable (LOT-002) | -15 → 65 remaining |

---

### Step 9 — Internal Transfer (March 10, 2026) → MOV-004
**From:** INV-002 / LOC-003 (Casablanca) **→ To:** INV-003 / LOC-012 (Rabat)

| Product | Qty |
|---------|-----|
| JBL Flip 6 (LOT-008) | -10 CAS / +10 RAB |

**CAS JBL after:** 30 - 8(later DN-004) - 1(DN-006) = 21 → then -10 transfer = 11
**RAB JBL after:** 0 + 10 = 10

---

### Step 10 — Quote Q-004 → DN-004 (March 12, 2026) → MOV-008 (OUT)
**Customer:** BMCE Bank

| Product | Qty | Lot |
|---------|-----|-----|
| HP Pavilion 14-dv2 | -3 → 5 remaining ⚠️ LOW |
| JBL Flip 6 | -8 (LOT-008) → 21 CAS |
| SanDisk 128GB USB | -20 (LOT-006) → 30 remaining |

**Alert triggered:** HP Pavilion below threshold (5 < 8)

---

### Step 11 — DN-006 Manual delivery (March 18, 2026) → MOV-009
**No quote** — walk-in retail, Technozone Maroc

| Product | Qty |
|---------|-----|
| Samsung A54 Hybrid Case | -2 → 38 remaining |
| USB-C Cable (LOT-001) | -5 → 85 remaining |
| JBL Flip 6 (LOT-008) | -1 → 21 remaining |

---

### Step 12 — BLOCKED Movement (March 20, 2026) → MOV-010 ⛔
**Attempted:** Ship 25 × Samsung Galaxy A54 | **Available:** 15
→ System blocks movement, stock unchanged, alert generated (ALT-006)

---

## 🚨 Active Alerts Summary

| ID | Type | Severity | Subject |
|----|------|----------|---------|
| ALT-001 | EXPIRING_LOT | 🔴 CRITICAL | USB-C Cable LOT-007 — expires in 6 days (returned batch) |
| ALT-002 | EXPIRING_LOT | 🔴 CRITICAL | 65W Charger LOT-003B — expires in 19 days |
| ALT-003 | LOW_STOCK | 🟡 WARNING | HP Pavilion 14 — 5 units (threshold: 8) |
| ALT-004 | LOW_STOCK | 🟡 WARNING | HP LaserJet M110we — 5 units (threshold: 10) |
| ALT-005 | LOW_STOCK | 🟡 WARNING | Keychron K2 — 6 available (4 reserved, threshold: 15) |
| ALT-006 | BLOCKED_MOVEMENT | 🟡 WARNING | Attempt to ship 25 Samsung A54 — only 15 available (RESOLVED) |
| ALT-007 | INFO | 🔵 INFO | Quote Q-007 (Technozone) expiring in 21 days — no response |

---

## 🔗 Key Entity Relationships

```
SUP-001 ──→ PO-001 ──→ MOV-001 (IN) ──→ INV-001
                              ↓
                    SERIAL: 20× Samsung A54
                         5× shipped via DN-001
                         15× still IN_STOCK

Q-001 ──→ DN-001 ──→ MOV-005 (OUT) ──→ reduces INV-001
  ↑                        ↓
CUST-001           serials marked SHIPPED

Q-006 (ACCEPTED) ──→ 6× Logitech + 4× Keychron RESERVED
                        ↓
                   quantityReserved in stock record
                   ALT-005 triggered (Keychron low)

MOV-004 (TRANSFER) ──→ JBL Flip 6
  INV-002 (CAS) -10         INV-003 (RAB) +10
```

---

## 🎯 What You Can Test With This Data

| Feature | Test Case |
|---------|-----------|
| Serial tracking | Scan serial R58T316YAZB → shows as SHIPPED via DN-001 |
| Lot tracking | Check LOT-001 usage history: 100→(-10 DN-002)→(-5 DN-006)→85 remaining |
| Stock validation | Try to ship 20 Samsung A54 → system allows (15 available) — try 16 → blocked |
| Quote flow | Q-001: DRAFT→SENT→ACCEPTED→CONVERTED, linked to DN-001 |
| Manual BL | DN-006/DN-007: no quote, inventory toggle OFF, manual entry |
| Low stock alert | Check INV-002 for Keychron K2 (6 available, 4 reserved) |
| Expiry alert | LOT-003B chargers expire 2026-04-10 — ensure picked before LOT-003A |
| Stock reservation | Q-006 ACCEPTED → 6 Logitech + 4 Keychron reserved but not shipped |
| Internal transfer | MOV-004: JBL moves from CAS to RAB — verify both inventories update |
| Cross-warehouse stock | JBL Flip 6 exists in INV-002 (11) and INV-003 (10) separately |
