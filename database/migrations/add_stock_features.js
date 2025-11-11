/**
 * ============================================================
 * DATABASE MIGRATION: Add Stock Management Features
 * ============================================================
 * 
 * This script adds stock management fields to existing documents
 * Run this ONCE after deploying the stock management system
 * 
 * SAFE TO RUN: All updates use $set with default values
 * NO DATA LOSS: Only adds missing fields, doesn't modify existing data
 */

const mongoose = require("mongoose");
require("dotenv").config();

async function runMigration() {
    try {
        // Connect to database
        console.log("Connecting to database...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to database");

        const db = mongoose.connection.db;

        // ============================================================
        // 1. UPDATE CLIENTS - Add features_access and stock_config
        // ============================================================
        console.log("\n📋 Updating Clients collection...");
        
        const clientsResult = await db.collection("clients").updateMany(
            { 
                features_access: { $exists: false }
            },
            {
                $set: {
                    "features_access.stock_management": false,
                    "features_access.api_integration": false,
                    "features_access.advanced_reporting": false,
                    "features_access.multi_store": false,
                    "features_access.bulk_operations": false,
                    "features_access.custom_branding": false,
                    "stock_config.require_admin_approval": true,
                    "stock_config.auto_approve_threshold": null,
                    "stock_config.low_stock_alert_threshold": 10,
                    "stock_config.allow_negative_stock": false
                }
            }
        );
        console.log(`✅ Updated ${clientsResult.modifiedCount} clients`);

        // ============================================================
        // 2. UPDATE STORES - Add features_access and stock_location
        // ============================================================
        console.log("\n📋 Updating Stores collection...");
        
        const storesResult = await db.collection("stores").updateMany(
            { 
                features_access: { $exists: false }
            },
            {
                $set: {
                    "features_access.stock_management": null, // null = inherit from client
                    "stock_location": "siege"
                }
            }
        );
        console.log(`✅ Updated ${storesResult.modifiedCount} stores`);

        // ============================================================
        // 3. UPDATE COLIS - Add stock fields to produits (if needed)
        // ============================================================
        console.log("\n📋 Updating Colis collection...");
        
        // This updates only colis that have produits array
        // Adds stock-related fields if they don't exist
        const colisWithProduits = await db.collection("colis").find({
            produits: { $exists: true, $ne: [] }
        }).toArray();

        let colisUpdated = 0;
        for (const colis of colisWithProduits) {
            let needsUpdate = false;
            const updatedProduits = colis.produits.map(produit => {
                if (!produit.hasOwnProperty('usesStock')) {
                    needsUpdate = true;
                    return {
                        ...produit,
                        usesStock: false,
                        stockId: null,
                        stockSku: null,
                        quantityUsed: 1,
                        stockReserved: false,
                        stockDeducted: false
                    };
                }
                return produit;
            });

            if (needsUpdate) {
                await db.collection("colis").updateOne(
                    { _id: colis._id },
                    { $set: { produits: updatedProduits } }
                );
                colisUpdated++;
            }
        }
        console.log(`✅ Updated ${colisUpdated} colis with stock fields`);

        // ============================================================
        // 4. CREATE INDEXES
        // ============================================================
        console.log("\n📋 Creating indexes...");
        
        // Clients indexes
        await db.collection("clients").createIndex(
            { "features_access.stock_management": 1 }
        );
        console.log("✅ Created index on clients.features_access.stock_management");

        // Stock indexes (if stock collection exists)
        try {
            await db.collection("stocks").createIndex(
                { clientId: 1, storeId: 1, sku: 1 }, 
                { unique: true }
            );
            await db.collection("stocks").createIndex({ clientId: 1, status: 1 });
            await db.collection("stocks").createIndex({ status: 1, quantite_disponible: 1 });
            await db.collection("stocks").createIndex({ isDeleted: 1, status: 1 });
            console.log("✅ Created indexes on stocks collection");
        } catch (error) {
            console.log("ℹ️  Stocks collection doesn't exist yet (this is normal on first run)");
        }

        // StockMovements indexes
        try {
            await db.collection("stockmovements").createIndex({ stockId: 1, date: -1 });
            await db.collection("stockmovements").createIndex({ clientId: 1, date: -1 });
            await db.collection("stockmovements").createIndex({ type: 1, date: -1 });
            await db.collection("stockmovements").createIndex({ colisId: 1 });
            console.log("✅ Created indexes on stockmovements collection");
        } catch (error) {
            console.log("ℹ️  StockMovements collection doesn't exist yet");
        }

        // StockAlerts indexes
        try {
            await db.collection("stockalerts").createIndex({ clientId: 1, isRead: 1, isResolved: 1 });
            await db.collection("stockalerts").createIndex({ stockId: 1, createdAt: -1 });
            await db.collection("stockalerts").createIndex({ type: 1, isResolved: 1 });
            console.log("✅ Created indexes on stockalerts collection");
        } catch (error) {
            console.log("ℹ️  StockAlerts collection doesn't exist yet");
        }

        // ============================================================
        // 5. SUMMARY
        // ============================================================
        console.log("\n" + "=".repeat(60));
        console.log("✅ MIGRATION COMPLETED SUCCESSFULLY");
        console.log("=".repeat(60));
        console.log(`
📊 Summary:
- Clients updated: ${clientsResult.modifiedCount}
- Stores updated: ${storesResult.modifiedCount}
- Colis updated: ${colisUpdated}
- Indexes created: ✅

🎯 Next Steps:
1. Enable stock management for pilot clients:
   db.clients.updateOne(
     { email: "client@example.com" },
     { $set: { "features_access.stock_management": true } }
   )

2. Verify the migration:
   - Check that clients have features_access field
   - Check that stores have stock_location field
   - Check that new collections can be created

3. Start testing stock management features!
        `);

    } catch (error) {
        console.error("\n❌ MIGRATION FAILED:");
        console.error(error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log("\n✅ Database connection closed");
        process.exit(0);
    }
}

// Run migration
console.log("=" + "=".repeat(59));
console.log(" STOCK MANAGEMENT MIGRATION");
console.log("=" + "=".repeat(59) + "\n");
console.log("⚠️  IMPORTANT: This script will modify your database");
console.log("⚠️  Make sure you have a backup before proceeding!\n");
console.log("Starting migration in 3 seconds...\n");

setTimeout(() => {
    runMigration();
}, 3000);

