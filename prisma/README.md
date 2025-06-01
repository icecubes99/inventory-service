# Database Seeding

This directory contains the database seed file that populates your inventory management system with sample data.

## Running the Seed

```bash
# Seed the database with sample data
npm run db:seed

# Reset the entire database and re-seed (⚠️ This will delete ALL existing data)
npm run db:reset
```

## Seed Data Overview

The seed file creates a comprehensive set of test data that demonstrates all the relationships and roles in the system:

### 🏢 Locations (6 total)

**Warehouses:**

- Central Warehouse Manila (Manager: Jose Santos)
- Central Warehouse Cebu (Manager: Maria Garcia)

**Construction Sites:**

- BGC Construction Site (Manager: Robert Cruz)
- Makati Tower Project (Manager: Anna Reyes)
- Ortigas Commercial Complex (Manager: Miguel Torres) - Under Maintenance
- Alabang Residential Project (Manager: Carmen Dela Cruz)

### 👥 Users (16 total)

**By Role:**

- **ADMIN** (1): System Administrator
- **WAREHOUSE_MANAGER** (2): Jose Santos, Maria Garcia
- **SITE_MANAGER** (4): Robert Cruz, Anna Reyes, Miguel Torres, Carmen Dela Cruz
- **INVENTORY_MASTER** (1): Luis Mendoza
- **PURCHASER** (2): Sofia Hernandez, Carlos Villanueva
- **ACCOUNTING** (2): Diana Flores, Benjamin Ramos
- **FOREMAN** (4): Ricardo Aquino, Elena Castro, Gabriel Silva, Isabel Morales

### 🔑 Login Credentials

All users have the same password: `password123`

**⚠️ IMPORTANT: Use USERNAME (not email) for login!**

**Quick Test Accounts:**

- **Admin**: Username: `admin` / Password: `password123`
- **Warehouse Manager**: Username: `wh_manager_manila` / Password: `password123`
- **Site Manager**: Username: `site_manager_bgc` / Password: `password123`
- **Foreman**: Username: `foreman_bgc1` / Password: `password123`

**Common Login Mistake:**

- ❌ Don't use: `admin@company.com` (this is the email)
- ✅ Use instead: `admin` (this is the username)

### 🔗 Relationships

- Each location has an assigned manager
- Users are distributed across locations based on their roles
- Warehouse staff (managers, purchasers, inventory masters) are assigned to warehouses
- Site staff (managers, foremen) are assigned to construction sites
- Admin and accounting roles are not tied to specific locations

### 📊 Data Structure

The seed demonstrates:

- ✅ User-Location assignments (many-to-many through locationId)
- ✅ Location-Manager relationships (one-to-many)
- ✅ Role-based access control setup
- ✅ Different location types and statuses
- ✅ Realistic Filipino names and company structure
- ✅ Proper password hashing with bcrypt

## Development Tips

1. **Testing**: The seeded data works perfectly with your existing test suite
2. **Authentication**: All users can log in immediately with `password123`
3. **Permissions**: The data respects your role-based access control rules
4. **Realistic**: Names and structure reflect a real Philippine construction company

## Customization

To modify the seed data:

1. Edit `prisma/seed.ts`
2. Modify the `locationsData` and `usersData` arrays
3. Update the `locationManagerMappings` to match your changes
4. Run `npm run db:seed` to apply changes

---

**Note**: The seed file uses `createMany()` for efficient bulk inserts and handles the circular dependency between users and locations properly.
