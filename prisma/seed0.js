const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ========================================
  // SEED TAGS LIST
  // ========================================
  const tags = ['SPECIAL', 'NEW', 'POPULAR'];

  console.log('📦 Seeding tags list...');
  for (const tagName of tags) {
    await prisma.tagsList.upsert({
      where: { name: tagName },
      update: {},
      create: { name: tagName },
    });
  }
  console.log(`✅ Seeded ${tags.length} tags`);

  // ========================================
  // SEED DIETARY LIST
  // ========================================
  const dietaries = ['VEGAN', 'VEGETARIAN', 'HALAL', 'KETO', 'GLUTEN_FREE'];

  console.log('📦 Seeding dietary list...');
  for (const dietaryName of dietaries) {
    await prisma.dietaryList.upsert({
      where: { name: dietaryName },
      update: {},
      create: { name: dietaryName },
    });
  }
  console.log(`✅ Seeded ${dietaries.length} dietary options`);

  // ========================================
  // SEED MENU ITEM CATEGORIES
  // ========================================
  const menuCategories = [
    'Burgers',
    'Pizza',
    'Pasta',
    'Sandwiches',
    'Salads',
    'Beverages',
    'Desserts',
    'Appetizers',
    'Main Course',
    'Soups',
    'Seafood',
    'Chicken',
    'Beef',
    'Vegetarian',
    'Breakfast',
    'Bakery',
    'Ice Cream',
    'Coffee & Tea',
    'Juices',
    'Smoothies'
  ];

  console.log('📦 Seeding menu categories...');
  for (const categoryName of menuCategories) {
    await prisma.menuItemCategory.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName },
    });
  }
  console.log(`✅ Seeded ${menuCategories.length} menu categories`);

  // ========================================
  // SEED PRODUCT ITEM CATEGORIES
  // ========================================
  const productCategories = [
    'Electronics',
    'Clothing',
    'Home & Garden',
    'Sports & Outdoors',
    'Books',
    'Toys & Games',
    'Health & Beauty',
    'Automotive',
    'Office Supplies',
    'Pet Supplies',
    'Jewelry',
    'Tools & Hardware',
    'Baby Products',
    'Furniture',
    'Kitchen & Dining',
    'Arts & Crafts',
    'Musical Instruments',
    'Video Games',
    'Shoes',
    'Bags & Luggage'
  ];

  console.log('📦 Seeding product categories...');
  for (const categoryName of productCategories) {
    await prisma.productItemCategory.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName },
    });
  }
  console.log(`✅ Seeded ${productCategories.length} product categories`);

  // ========================================
  // CREATE DEFAULT "FULL MENU" TAB FOR ALL RESTAURANTS
  // ========================================
  console.log('📦 Creating default menu tabs for all restaurants...');
  
  const restaurants = await prisma.restaurant.findMany({
    select: { id: true }
  });

  let createdMenuTabs = 0;
  for (const restaurant of restaurants) {
    const existingTab = await prisma.menuTab.findFirst({
      where: {
        restaurantId: restaurant.id,
        name: 'Full Menu'
      }
    });

    if (!existingTab) {
      await prisma.menuTab.create({
        data: {
          name: 'Full Menu',
          restaurantId: restaurant.id
        }
      });
      createdMenuTabs++;
    }
  }
  console.log(`✅ Created ${createdMenuTabs} default "Full Menu" tabs`);

  // ========================================
  // CREATE DEFAULT "ALL PRODUCTS" TAB FOR ALL STORES
  // ========================================
  console.log('📦 Creating default product tabs for all stores...');
  
  const stores = await prisma.store.findMany({
    select: { id: true }
  });

  let createdProductTabs = 0;
  for (const store of stores) {
    const existingTab = await prisma.productTab.findFirst({
      where: {
        storeId: store.id,
        name: 'All Products'
      }
    });

    if (!existingTab) {
      await prisma.productTab.create({
        data: {
          name: 'All Products',
          storeId: store.id
        }
      });
      createdProductTabs++;
    }
  }
  console.log(`✅ Created ${createdProductTabs} default "All Products" tabs`);

  // ========================================
  // UPDATE EXISTING MENU ITEMS WITHOUT TAB
  // ========================================
  console.log('📦 Updating menu items to use default tabs...');
  
  const menuItemsWithoutTab = await prisma.menuItem.findMany({
    where: { menuTabId: null },
    select: { id: true, restaurantId: true }
  });

  let updatedMenuItems = 0;
  for (const item of menuItemsWithoutTab) {
    const defaultTab = await prisma.menuTab.findFirst({
      where: {
        restaurantId: item.restaurantId,
        name: 'Full Menu'
      }
    });

    if (defaultTab) {
      await prisma.menuItem.update({
        where: { id: item.id },
        data: { menuTabId: defaultTab.id }
      });
      updatedMenuItems++;
    }
  }
  console.log(`✅ Updated ${updatedMenuItems} menu items`);

  // ========================================
  // UPDATE EXISTING PRODUCT ITEMS WITHOUT TAB
  // ========================================
  console.log('📦 Updating product items to use default tabs...');
  
  const productItemsWithoutTab = await prisma.productItem.findMany({
    where: { productTabId: null },
    select: { id: true, storeId: true }
  });

  let updatedProductItems = 0;
  for (const item of productItemsWithoutTab) {
    const defaultTab = await prisma.productTab.findFirst({
      where: {
        storeId: item.storeId,
        name: 'All Products'
      }
    });

    if (defaultTab) {
      await prisma.productItem.update({
        where: { id: item.id },
        data: { productTabId: defaultTab.id }
      });
      updatedProductItems++;
    }
  }
  console.log(`✅ Updated ${updatedProductItems} product items`);

  console.log('🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`  • ${tags.length} tags`);
  console.log(`  • ${dietaries.length} dietary options`);
  console.log(`  • ${menuCategories.length} menu categories`);
  console.log(`  • ${productCategories.length} product categories`);
  console.log(`  • ${createdMenuTabs} restaurant default tabs`);
  console.log(`  • ${createdProductTabs} store default tabs`);
  console.log(`  • ${updatedMenuItems} menu items updated`);
  console.log(`  • ${updatedProductItems} product items updated`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });