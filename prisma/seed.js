const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Working placeholder image URLs
const images = {
  // User profile images
  users: [
    'https://randomuser.me/api/portraits/men/1.jpg',
    'https://randomuser.me/api/portraits/women/2.jpg',
    'https://randomuser.me/api/portraits/men/3.jpg',
    'https://randomuser.me/api/portraits/women/4.jpg',
    'https://randomuser.me/api/portraits/men/5.jpg',
    'https://randomuser.me/api/portraits/men/6.jpg',
  ],
  // Restaurant logos
  restaurantLogos: [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop', // Burger
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop', // Pizza
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=200&h=200&fit=crop', // Asian
  ],
  // Restaurant cover images
  restaurantImages: [
    'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=400&fit=crop',
  ],
  // Category images
  categories: {
    'Fast Food': 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=300&h=300&fit=crop',
    'Italian': 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=300&h=300&fit=crop',
    'Asian': 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=300&h=300&fit=crop',
    'Mexican': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300&h=300&fit=crop',
    'Indian': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&h=300&fit=crop',
    'Healthy': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop',
    'Desserts': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=300&fit=crop',
    'Beverages': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&h=300&fit=crop',
  },
  // Menu item category images
  menuCategories: {
    'Appetizers': 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=300&h=300&fit=crop',
    'Main Course': 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=300&h=300&fit=crop',
    'Sides': 'https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=300&h=300&fit=crop',
    'Desserts': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&h=300&fit=crop',
    'Beverages': 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=300&h=300&fit=crop',
    'Specials': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=300&fit=crop',
    'Combos': 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=300&h=300&fit=crop',
    'Kids Menu': 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=300&h=300&fit=crop',
  },
  // Menu items - Burgers
  burgers: {
    'Classic Cheeseburger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    'Bacon BBQ Burger': 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=300&fit=crop',
    'Veggie Burger': 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&h=300&fit=crop',
    'Crispy Fries': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop',
    'Milkshake': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop',
  },
  // Menu items - Pizza
  pizza: {
    'Margherita Pizza': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop',
    'Pepperoni Pizza': 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop',
    'Spaghetti Carbonara': 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop',
    'Caesar Salad': 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&h=300&fit=crop',
    'Tiramisu': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop',
  },
  // Menu items - Asian
  asian: {
    'Spring Rolls': 'https://images.unsplash.com/photo-1548507200-d395094e9da4?w=400&h=300&fit=crop',
    'Gyoza Dumplings': 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&h=300&fit=crop',
    'Pad Thai': 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&h=300&fit=crop',
    'Kung Pao Chicken': 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=300&fit=crop',
    'Dragon Roll': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop',
    'California Roll': 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop',
  },
  // Addon images
  addons: {
    'Small': 'https://placehold.co/100x100/orange/white?text=S',
    'Medium': 'https://placehold.co/100x100/orange/white?text=M',
    'Large': 'https://placehold.co/100x100/orange/white?text=L',
    'Extra Large': 'https://placehold.co/100x100/orange/white?text=XL',
    'Chicken': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=100&h=100&fit=crop',
    'Beef': 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=100&h=100&fit=crop',
    'Shrimp': 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=100&h=100&fit=crop',
    'Tofu': 'https://images.unsplash.com/photo-1628689469838-524a4a973b8e?w=100&h=100&fit=crop',
    'Cheese': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=100&h=100&fit=crop',
    'Bacon': 'https://images.unsplash.com/photo-1606851091851-e8c8c0fca5ba?w=100&h=100&fit=crop',
    'Mushrooms': 'https://images.unsplash.com/photo-1504545102780-26774c1bb073?w=100&h=100&fit=crop',
    'Onions': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=100&h=100&fit=crop',
    'Extra Cheese': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=100&h=100&fit=crop',
    'Extra Sauce': 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=100&h=100&fit=crop',
    'Add Avocado': 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=100&h=100&fit=crop',
    'Add Egg': 'https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=100&h=100&fit=crop',
  },
};

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.menuItemIndividualAddon.deleteMany();
  await prisma.menuItemGroupAddon.deleteMany();
  await prisma.menuItemDietaryMap.deleteMany();
  await prisma.menuItemTagMap.deleteMany();
  await prisma.groupAddonOption.deleteMany();
  await prisma.groupAddon.deleteMany();
  await prisma.individualAddon.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuTab.deleteMany();
  await prisma.restaurantCategory.deleteMany();
  await prisma.restaurantOperatingHour.deleteMany();
  await prisma.restaurantWithdrawalBank.deleteMany();
  await prisma.restaurantRefundBank.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.userAdresses.deleteMany();
  await prisma.loggedDevices.deleteMany();
  await prisma.otp.deleteMany();
  await prisma.riderApproval.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing data');

  // ============================================
  // 1. CREATE USERS
  // ============================================
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'John Smith',
        username: 'johnsmith',
        email: 'john@restaurant.com',
        passwordHash: '$2b$10$examplehash123456789',
        gender: 'male',
        userType: 'buissness',
        phoneNumber: '+1234567890',
        profileImage: images.users[0],
        isEmailVerified: true,
        accountStatus: 'ACTIVE',
        provider: 'EMAIL',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Sarah Johnson',
        username: 'sarahjohnson',
        email: 'sarah@pizzaplace.com',
        passwordHash: '$2b$10$examplehash123456789',
        gender: 'female',
        userType: 'buissness',
        phoneNumber: '+1234567891',
        profileImage: images.users[1],
        isEmailVerified: true,
        accountStatus: 'ACTIVE',
        provider: 'EMAIL',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Mike Chen',
        username: 'mikechen',
        email: 'mike@asianfusion.com',
        passwordHash: '$2b$10$examplehash123456789',
        gender: 'male',
        userType: 'buissness',
        phoneNumber: '+1234567892',
        profileImage: images.users[2],
        isEmailVerified: true,
        accountStatus: 'ACTIVE',
        provider: 'EMAIL',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Emily Davis',
        username: 'emilydavis',
        email: 'emily@customer.com',
        passwordHash: '$2b$10$examplehash123456789',
        gender: 'female',
        userType: 'customer',
        phoneNumber: '+1234567893',
        profileImage: images.users[3],
        isEmailVerified: true,
        accountStatus: 'ACTIVE',
        provider: 'EMAIL',
      },
    }),
    prisma.user.create({
      data: {
        name: 'David Wilson',
        username: 'davidwilson',
        email: 'david@customer.com',
        passwordHash: '$2b$10$examplehash123456789',
        gender: 'male',
        userType: 'customer',
        phoneNumber: '+1234567894',
        profileImage: images.users[4],
        isEmailVerified: true,
        accountStatus: 'ACTIVE',
        provider: 'GOOGLE',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Alex Martinez',
        username: 'alexmartinez',
        email: 'alex@rider.com',
        passwordHash: '$2b$10$examplehash123456789',
        gender: 'male',
        userType: 'rider',
        phoneNumber: '+1234567895',
        profileImage: images.users[5],
        isEmailVerified: true,
        accountStatus: 'ACTIVE',
        provider: 'EMAIL',
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // ============================================
  // 2. CREATE USER ADDRESSES
  // ============================================
  await Promise.all([
    prisma.userAdresses.create({
      data: {
        userId: users[3].id,
        address: '123 Main Street, Apt 4B',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        latitude: '40.7128',
        longitude: '-74.0060',
        label: 'Home',
        isActive: true,
      },
    }),
    prisma.userAdresses.create({
      data: {
        userId: users[3].id,
        address: '456 Office Plaza, Suite 200',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        latitude: '40.7580',
        longitude: '-73.9855',
        label: 'Work',
        isActive: false,
      },
    }),
    prisma.userAdresses.create({
      data: {
        userId: users[4].id,
        address: '789 Park Avenue',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        latitude: '34.0522',
        longitude: '-118.2437',
        label: 'Home',
        isActive: true,
      },
    }),
  ]);

  console.log('Created user addresses');

  // ============================================
  // 3. CREATE RESTAURANT CATEGORIES (with images)
  // ============================================
  const categories = await Promise.all([
    prisma.category.upsert({ where: { name: 'Fast Food' }, update: { image: images.categories['Fast Food'] }, create: { name: 'Fast Food', image: images.categories['Fast Food'] } }),
    prisma.category.upsert({ where: { name: 'Italian' }, update: { image: images.categories['Italian'] }, create: { name: 'Italian', image: images.categories['Italian'] } }),
    prisma.category.upsert({ where: { name: 'Asian' }, update: { image: images.categories['Asian'] }, create: { name: 'Asian', image: images.categories['Asian'] } }),
    prisma.category.upsert({ where: { name: 'Mexican' }, update: { image: images.categories['Mexican'] }, create: { name: 'Mexican', image: images.categories['Mexican'] } }),
    prisma.category.upsert({ where: { name: 'Indian' }, update: { image: images.categories['Indian'] }, create: { name: 'Indian', image: images.categories['Indian'] } }),
    prisma.category.upsert({ where: { name: 'Healthy' }, update: { image: images.categories['Healthy'] }, create: { name: 'Healthy', image: images.categories['Healthy'] } }),
    prisma.category.upsert({ where: { name: 'Desserts' }, update: { image: images.categories['Desserts'] }, create: { name: 'Desserts', image: images.categories['Desserts'] } }),
    prisma.category.upsert({ where: { name: 'Beverages' }, update: { image: images.categories['Beverages'] }, create: { name: 'Beverages', image: images.categories['Beverages'] } }),
  ]);

  console.log(`Created ${categories.length} categories`);

  // ============================================
  // 4. CREATE MENU ITEM CATEGORIES (with images)
  // ============================================
  const menuItemCategories = await Promise.all([
    prisma.menuItemCategory.upsert({ where: { name: 'Appetizers' }, update: { image: images.menuCategories['Appetizers'] }, create: { name: 'Appetizers', image: images.menuCategories['Appetizers'] } }),
    prisma.menuItemCategory.upsert({ where: { name: 'Main Course' }, update: { image: images.menuCategories['Main Course'] }, create: { name: 'Main Course', image: images.menuCategories['Main Course'] } }),
    prisma.menuItemCategory.upsert({ where: { name: 'Sides' }, update: { image: images.menuCategories['Sides'] }, create: { name: 'Sides', image: images.menuCategories['Sides'] } }),
    prisma.menuItemCategory.upsert({ where: { name: 'Desserts' }, update: { image: images.menuCategories['Desserts'] }, create: { name: 'Desserts', image: images.menuCategories['Desserts'] } }),
    prisma.menuItemCategory.upsert({ where: { name: 'Beverages' }, update: { image: images.menuCategories['Beverages'] }, create: { name: 'Beverages', image: images.menuCategories['Beverages'] } }),
    prisma.menuItemCategory.upsert({ where: { name: 'Specials' }, update: { image: images.menuCategories['Specials'] }, create: { name: 'Specials', image: images.menuCategories['Specials'] } }),
    prisma.menuItemCategory.upsert({ where: { name: 'Combos' }, update: { image: images.menuCategories['Combos'] }, create: { name: 'Combos', image: images.menuCategories['Combos'] } }),
    prisma.menuItemCategory.upsert({ where: { name: 'Kids Menu' }, update: { image: images.menuCategories['Kids Menu'] }, create: { name: 'Kids Menu', image: images.menuCategories['Kids Menu'] } }),
  ]);

  console.log(`Created ${menuItemCategories.length} menu item categories`);

  // ============================================
  // 5. CREATE TAGS LIST
  // ============================================
  const tags = await Promise.all([
    prisma.tagsList.upsert({ where: { name: 'Spicy' }, update: {}, create: { name: 'Spicy' } }),
    prisma.tagsList.upsert({ where: { name: 'Best Seller' }, update: {}, create: { name: 'Best Seller' } }),
    prisma.tagsList.upsert({ where: { name: 'New' }, update: {}, create: { name: 'New' } }),
    prisma.tagsList.upsert({ where: { name: 'Chef Special' }, update: {}, create: { name: 'Chef Special' } }),
    prisma.tagsList.upsert({ where: { name: 'Limited Time' }, update: {}, create: { name: 'Limited Time' } }),
    prisma.tagsList.upsert({ where: { name: 'Popular' }, update: {}, create: { name: 'Popular' } }),
    prisma.tagsList.upsert({ where: { name: 'Organic' }, update: {}, create: { name: 'Organic' } }),
  ]);

  console.log(`Created ${tags.length} tags`);

  // ============================================
  // 6. CREATE DIETARY LIST
  // ============================================
  const dietary = await Promise.all([
    prisma.dietaryList.upsert({ where: { name: 'Vegetarian' }, update: {}, create: { name: 'Vegetarian' } }),
    prisma.dietaryList.upsert({ where: { name: 'Vegan' }, update: {}, create: { name: 'Vegan' } }),
    prisma.dietaryList.upsert({ where: { name: 'Gluten-Free' }, update: {}, create: { name: 'Gluten-Free' } }),
    prisma.dietaryList.upsert({ where: { name: 'Halal' }, update: {}, create: { name: 'Halal' } }),
    prisma.dietaryList.upsert({ where: { name: 'Kosher' }, update: {}, create: { name: 'Kosher' } }),
    prisma.dietaryList.upsert({ where: { name: 'Dairy-Free' }, update: {}, create: { name: 'Dairy-Free' } }),
    prisma.dietaryList.upsert({ where: { name: 'Nut-Free' }, update: {}, create: { name: 'Nut-Free' } }),
  ]);

  console.log(`Created ${dietary.length} dietary options`);

  // ============================================
  // 7. CREATE GROUP ADDONS (with images)
  // ============================================
  const groupAddons = await Promise.all([
    prisma.groupAddon.create({
      data: {
        title: 'Choose Your Size',
        isLimited: true,
        maxSelectionLimit: 1,
        isRequired: true,
        isAdminCreated: true,
        options: {
          create: [
            { name: 'Small', price: 0, image: images.addons['Small'] },
            { name: 'Medium', price: 2.00, image: images.addons['Medium'] },
            { name: 'Large', price: 4.00, image: images.addons['Large'] },
            { name: 'Extra Large', price: 6.00, image: images.addons['Extra Large'] },
          ],
        },
      },
    }),
    prisma.groupAddon.create({
      data: {
        title: 'Choose Your Protein',
        isLimited: true,
        maxSelectionLimit: 1,
        isRequired: true,
        isAdminCreated: true,
        options: {
          create: [
            { name: 'Chicken', price: 0, image: images.addons['Chicken'] },
            { name: 'Beef', price: 2.00, image: images.addons['Beef'] },
            { name: 'Shrimp', price: 3.00, image: images.addons['Shrimp'] },
            { name: 'Tofu', price: 0, image: images.addons['Tofu'] },
          ],
        },
      },
    }),
    prisma.groupAddon.create({
      data: {
        title: 'Choose Your Spice Level',
        isLimited: true,
        maxSelectionLimit: 1,
        isRequired: false,
        isAdminCreated: true,
        options: {
          create: [
            { name: 'Mild', price: 0, image: 'https://placehold.co/100x100/green/white?text=Mild' },
            { name: 'Medium', price: 0, image: 'https://placehold.co/100x100/yellow/black?text=Med' },
            { name: 'Hot', price: 0, image: 'https://placehold.co/100x100/orange/white?text=Hot' },
            { name: 'Extra Hot', price: 0, image: 'https://placehold.co/100x100/red/white?text=X-Hot' },
          ],
        },
      },
    }),
    prisma.groupAddon.create({
      data: {
        title: 'Choose Your Toppings',
        isLimited: true,
        maxSelectionLimit: 3,
        isRequired: false,
        isAdminCreated: true,
        options: {
          create: [
            { name: 'Cheese', price: 1.00, image: images.addons['Cheese'] },
            { name: 'Bacon', price: 1.50, image: images.addons['Bacon'] },
            { name: 'Mushrooms', price: 0.75, image: images.addons['Mushrooms'] },
            { name: 'Onions', price: 0.50, image: images.addons['Onions'] },
          ],
        },
      },
    }),
  ]);

  console.log(`Created ${groupAddons.length} group addons`);

  // ============================================
  // 8. CREATE INDIVIDUAL ADDONS (with images)
  // ============================================
  const individualAddons = await Promise.all([
    prisma.individualAddon.create({ data: { name: 'Extra Cheese', price: 1.50, image: images.addons['Extra Cheese'] } }),
    prisma.individualAddon.create({ data: { name: 'Extra Sauce', price: 0.75, image: images.addons['Extra Sauce'] } }),
    prisma.individualAddon.create({ data: { name: 'Add Avocado', price: 2.00, image: images.addons['Add Avocado'] } }),
    prisma.individualAddon.create({ data: { name: 'Add Egg', price: 1.00, image: images.addons['Add Egg'] } }),
    prisma.individualAddon.create({ data: { name: 'Extra Napkins', price: 0, image: 'https://placehold.co/100x100/gray/white?text=Napkins' } }),
    prisma.individualAddon.create({ data: { name: 'Utensils', price: 0, image: 'https://placehold.co/100x100/gray/white?text=Utensils' } }),
  ]);

  console.log(`Created ${individualAddons.length} individual addons`);

  // ============================================
  // 9. CREATE RESTAURANTS (with images)
  // ============================================
  const restaurants = await Promise.all([
    prisma.restaurant.create({
      data: {
        userId: users[0].id,
        name: 'The Burger Joint',
        description: 'Best burgers in town with fresh ingredients and secret sauce',
        email: 'contact@burgerjoint.com',
        phone: '+1234567800',
        country: 'USA',
        city: 'New York',
        state: 'NY',
        address: '100 Burger Street, Manhattan',
        latitude: '40.7489',
        longitude: '-73.9680',
        logo: images.restaurantLogos[0],
        images: JSON.stringify([images.restaurantImages[0], 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=400&fit=crop']),
        video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        deliveryType: 'PAID',
        deliveryTime: 'FIFTEEN_TO_TWENTY_MIN',
        status: 'APPROVED',
        useSameTiming: true,
        categories: { create: [{ categoryId: categories[0].id }] },
        operatingHours: {
          create: [
            { day: 'MONDAY', isOpen: true, openTime: '10:00', closeTime: '22:00' },
            { day: 'TUESDAY', isOpen: true, openTime: '10:00', closeTime: '22:00' },
            { day: 'WEDNESDAY', isOpen: true, openTime: '10:00', closeTime: '22:00' },
            { day: 'THURSDAY', isOpen: true, openTime: '10:00', closeTime: '22:00' },
            { day: 'FRIDAY', isOpen: true, openTime: '10:00', closeTime: '23:00' },
            { day: 'SATURDAY', isOpen: true, openTime: '11:00', closeTime: '23:00' },
            { day: 'SUNDAY', isOpen: true, openTime: '11:00', closeTime: '21:00' },
          ],
        },
        menuTabs: { create: [{ name: 'Burgers' }, { name: 'Sides' }, { name: 'Drinks' }] },
      },
      include: { menuTabs: true },
    }),
    prisma.restaurant.create({
      data: {
        userId: users[1].id,
        name: 'Mama Mia Pizzeria',
        description: 'Authentic Italian pizzas made with love and tradition',
        email: 'info@mamamiapizza.com',
        phone: '+1234567801',
        country: 'USA',
        city: 'New York',
        state: 'NY',
        address: '200 Pizza Lane, Brooklyn',
        latitude: '40.6782',
        longitude: '-73.9442',
        logo: images.restaurantLogos[1],
        images: JSON.stringify([images.restaurantImages[1], 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=400&fit=crop']),
        video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        deliveryType: 'FREE',
        deliveryTime: 'TWENTY_FIVE_TO_THIRTY_MIN',
        status: 'APPROVED',
        useSameTiming: false,
        categories: { create: [{ categoryId: categories[1].id }] },
        operatingHours: {
          create: [
            { day: 'MONDAY', isOpen: true, openTime: '11:00', closeTime: '23:00' },
            { day: 'TUESDAY', isOpen: true, openTime: '11:00', closeTime: '23:00' },
            { day: 'WEDNESDAY', isOpen: true, openTime: '11:00', closeTime: '23:00' },
            { day: 'THURSDAY', isOpen: true, openTime: '11:00', closeTime: '23:00' },
            { day: 'FRIDAY', isOpen: true, openTime: '11:00', closeTime: '00:00' },
            { day: 'SATURDAY', isOpen: true, openTime: '12:00', closeTime: '00:00' },
            { day: 'SUNDAY', isOpen: false, openTime: null, closeTime: null },
          ],
        },
        menuTabs: { create: [{ name: 'Pizzas' }, { name: 'Pasta' }, { name: 'Salads' }, { name: 'Desserts' }] },
      },
      include: { menuTabs: true },
    }),
    prisma.restaurant.create({
      data: {
        userId: users[2].id,
        name: 'Dragon Wok Asian Fusion',
        description: 'Modern Asian cuisine with a fusion twist',
        email: 'hello@dragonwok.com',
        phone: '+1234567802',
        country: 'USA',
        city: 'Los Angeles',
        state: 'CA',
        address: '300 Dragon Avenue, Chinatown',
        latitude: '34.0622',
        longitude: '-118.2377',
        logo: images.restaurantLogos[2],
        images: JSON.stringify([images.restaurantImages[2], 'https://images.unsplash.com/photo-1526234362653-3b75a0c07438?w=800&h=400&fit=crop']),
        video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        deliveryType: 'FAST',
        deliveryTime: 'FIVE_TO_TEN_MIN',
        status: 'APPROVED',
        useSameTiming: true,
        categories: { create: [{ categoryId: categories[2].id }] },
        operatingHours: {
          create: [
            { day: 'MONDAY', isOpen: true, openTime: '11:30', closeTime: '22:00' },
            { day: 'TUESDAY', isOpen: true, openTime: '11:30', closeTime: '22:00' },
            { day: 'WEDNESDAY', isOpen: true, openTime: '11:30', closeTime: '22:00' },
            { day: 'THURSDAY', isOpen: true, openTime: '11:30', closeTime: '22:00' },
            { day: 'FRIDAY', isOpen: true, openTime: '11:30', closeTime: '23:00' },
            { day: 'SATURDAY', isOpen: true, openTime: '12:00', closeTime: '23:00' },
            { day: 'SUNDAY', isOpen: true, openTime: '12:00', closeTime: '21:00' },
          ],
        },
        menuTabs: { create: [{ name: 'Starters' }, { name: 'Noodles' }, { name: 'Rice Dishes' }, { name: 'Sushi' }] },
      },
      include: { menuTabs: true },
    }),
  ]);

  console.log(`Created ${restaurants.length} restaurants`);

  // ============================================
  // 10. CREATE MENU ITEMS (with images)
  // ============================================

  // Burger Joint Menu Items
  const burgerMenuItems = await Promise.all([
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[0].id,
        categoryId: menuItemCategories[1].id,
        menuTabId: restaurants[0].menuTabs[0].id,
        name: 'Classic Cheeseburger',
        description: 'Juicy beef patty with melted cheddar, lettuce, tomato, and our secret sauce',
        images: JSON.stringify([images.burgers['Classic Cheeseburger']]),
        preparationTime: '15 min',
        price: 12.99,
        isAvailable: true,
        tags: { create: [{ tagId: tags[1].id }, { tagId: tags[5].id }] },
        groupAddons: { create: [{ addonId: groupAddons[0].id }] },
        individualAddons: { create: [{ individualAddonId: individualAddons[0].id }] },
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[0].id,
        categoryId: menuItemCategories[1].id,
        menuTabId: restaurants[0].menuTabs[0].id,
        name: 'Bacon BBQ Burger',
        description: 'Beef patty topped with crispy bacon, BBQ sauce, and onion rings',
        images: JSON.stringify([images.burgers['Bacon BBQ Burger']]),
        preparationTime: '18 min',
        price: 14.99,
        isAvailable: true,
        tags: { create: [{ tagId: tags[3].id }] },
        groupAddons: { create: [{ addonId: groupAddons[0].id }] },
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[0].id,
        categoryId: menuItemCategories[1].id,
        menuTabId: restaurants[0].menuTabs[0].id,
        name: 'Veggie Burger',
        description: 'Plant-based patty with fresh vegetables and vegan mayo',
        images: JSON.stringify([images.burgers['Veggie Burger']]),
        preparationTime: '15 min',
        price: 11.99,
        isAvailable: true,
        dietary: { create: [{ dietaryId: dietary[0].id }, { dietaryId: dietary[1].id }] },
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[0].id,
        categoryId: menuItemCategories[2].id,
        menuTabId: restaurants[0].menuTabs[1].id,
        name: 'Crispy Fries',
        description: 'Golden crispy french fries with seasoning',
        images: JSON.stringify([images.burgers['Crispy Fries']]),
        preparationTime: '10 min',
        price: 4.99,
        isAvailable: true,
        dietary: { create: [{ dietaryId: dietary[0].id }] },
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[0].id,
        categoryId: menuItemCategories[4].id,
        menuTabId: restaurants[0].menuTabs[2].id,
        name: 'Milkshake',
        description: 'Creamy milkshake - choose your flavor',
        images: JSON.stringify([images.burgers['Milkshake']]),
        preparationTime: '5 min',
        price: 5.99,
        isAvailable: true,
      },
    }),
  ]);

  // Pizza Place Menu Items
  const pizzaMenuItems = await Promise.all([
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[1].id,
        categoryId: menuItemCategories[1].id,
        menuTabId: restaurants[1].menuTabs[0].id,
        name: 'Margherita Pizza',
        description: 'Classic tomato sauce, fresh mozzarella, and basil',
        images: JSON.stringify([images.pizza['Margherita Pizza']]),
        preparationTime: '20 min',
        price: 14.99,
        isAvailable: true,
        tags: { create: [{ tagId: tags[1].id }] },
        dietary: { create: [{ dietaryId: dietary[0].id }] },
        groupAddons: { create: [{ addonId: groupAddons[0].id }] },
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[1].id,
        categoryId: menuItemCategories[1].id,
        menuTabId: restaurants[1].menuTabs[0].id,
        name: 'Pepperoni Pizza',
        description: 'Loaded with pepperoni and extra cheese',
        images: JSON.stringify([images.pizza['Pepperoni Pizza']]),
        preparationTime: '20 min',
        price: 16.99,
        isAvailable: true,
        tags: { create: [{ tagId: tags[5].id }] },
        groupAddons: { create: [{ addonId: groupAddons[0].id }, { addonId: groupAddons[3].id }] },
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[1].id,
        categoryId: menuItemCategories[1].id,
        menuTabId: restaurants[1].menuTabs[1].id,
        name: 'Spaghetti Carbonara',
        description: 'Creamy pasta with bacon, egg, and parmesan',
        images: JSON.stringify([images.pizza['Spaghetti Carbonara']]),
        preparationTime: '18 min',
        price: 13.99,
        isAvailable: true,
        tags: { create: [{ tagId: tags[3].id }] },
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[1].id,
        categoryId: menuItemCategories[0].id,
        menuTabId: restaurants[1].menuTabs[2].id,
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with caesar dressing and croutons',
        images: JSON.stringify([images.pizza['Caesar Salad']]),
        preparationTime: '10 min',
        price: 8.99,
        isAvailable: true,
        dietary: { create: [{ dietaryId: dietary[0].id }] },
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[1].id,
        categoryId: menuItemCategories[3].id,
        menuTabId: restaurants[1].menuTabs[3].id,
        name: 'Tiramisu',
        description: 'Classic Italian dessert with coffee and mascarpone',
        images: JSON.stringify([images.pizza['Tiramisu']]),
        preparationTime: '5 min',
        price: 7.99,
        isAvailable: true,
        tags: { create: [{ tagId: tags[1].id }] },
      },
    }),
  ]);

  // Asian Fusion Menu Items
  const asianMenuItems = await Promise.all([
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[2].id,
        categoryId: menuItemCategories[0].id,
        menuTabId: restaurants[2].menuTabs[0].id,
        name: 'Spring Rolls',
        description: 'Crispy vegetable spring rolls with sweet chili sauce',
        images: JSON.stringify([images.asian['Spring Rolls']]),
        preparationTime: '12 min',
        price: 6.99,
        isAvailable: true,
        dietary: { create: [{ dietaryId: dietary[0].id }, { dietaryId: dietary[1].id }] },
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[2].id,
        categoryId: menuItemCategories[0].id,
        menuTabId: restaurants[2].menuTabs[0].id,
        name: 'Gyoza Dumplings',
        description: 'Pan-fried pork dumplings with dipping sauce',
        images: JSON.stringify([images.asian['Gyoza Dumplings']]),
        preparationTime: '15 min',
        price: 8.99,
        isAvailable: true,
        tags: { create: [{ tagId: tags[5].id }] },
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[2].id,
        categoryId: menuItemCategories[1].id,
        menuTabId: restaurants[2].menuTabs[1].id,
        name: 'Pad Thai',
        description: 'Stir-fried rice noodles with shrimp, peanuts, and tamarind sauce',
        images: JSON.stringify([images.asian['Pad Thai']]),
        preparationTime: '18 min',
        price: 14.99,
        isAvailable: true,
        tags: { create: [{ tagId: tags[1].id }, { tagId: tags[5].id }] },
        groupAddons: { create: [{ addonId: groupAddons[1].id }, { addonId: groupAddons[2].id }] },
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[2].id,
        categoryId: menuItemCategories[1].id,
        menuTabId: restaurants[2].menuTabs[2].id,
        name: 'Kung Pao Chicken',
        description: 'Spicy stir-fried chicken with peanuts and vegetables',
        images: JSON.stringify([images.asian['Kung Pao Chicken']]),
        preparationTime: '15 min',
        price: 13.99,
        isAvailable: true,
        tags: { create: [{ tagId: tags[0].id }] },
        groupAddons: { create: [{ addonId: groupAddons[2].id }] },
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[2].id,
        categoryId: menuItemCategories[1].id,
        menuTabId: restaurants[2].menuTabs[3].id,
        name: 'Dragon Roll',
        description: 'Eel and cucumber topped with avocado and eel sauce',
        images: JSON.stringify([images.asian['Dragon Roll']]),
        preparationTime: '20 min',
        price: 16.99,
        isAvailable: true,
        tags: { create: [{ tagId: tags[3].id }, { tagId: tags[2].id }] },
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[2].id,
        categoryId: menuItemCategories[1].id,
        menuTabId: restaurants[2].menuTabs[3].id,
        name: 'California Roll',
        description: 'Crab, avocado, and cucumber with sesame seeds',
        images: JSON.stringify([images.asian['California Roll']]),
        preparationTime: '15 min',
        price: 12.99,
        isAvailable: true,
        tags: { create: [{ tagId: tags[5].id }] },
      },
    }),
  ]);

  console.log(`Created ${burgerMenuItems.length + pizzaMenuItems.length + asianMenuItems.length} menu items`);

  // ============================================
  // 11. CREATE RIDER APPROVAL
  // ============================================
  await prisma.riderApproval.create({
    data: {
      userId: users[5].id,
      city: 'New York',
      country: 'USA',
      latitude: '40.7128',
      longitude: '-74.0060',
      vehicleType: 'MOTORBIKE',
      vehicleRegNo: 'ABC-1234',
      vehicleImages: JSON.stringify(['https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&h=300&fit=crop']),
      nicPic: 'https://placehold.co/400x250/gray/white?text=NIC+Front',
      licensePic: 'https://placehold.co/400x250/gray/white?text=License',
      status: 'APPROVED',
    },
  });

  console.log('Created rider approval');

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n========================================');
  console.log('SEED COMPLETED SUCCESSFULLY!');
  console.log('========================================');
  console.log(`Users: ${users.length}`);
  console.log(`  - Business: 3`);
  console.log(`  - Customers: 2`);
  console.log(`  - Riders: 1`);
  console.log(`Restaurant Categories: ${categories.length}`);
  console.log(`Menu Item Categories: ${menuItemCategories.length}`);
  console.log(`Tags: ${tags.length}`);
  console.log(`Dietary Options: ${dietary.length}`);
  console.log(`Group Addons: ${groupAddons.length}`);
  console.log(`Individual Addons: ${individualAddons.length}`);
  console.log(`Restaurants: ${restaurants.length}`);
  console.log(`Menu Items: ${burgerMenuItems.length + pizzaMenuItems.length + asianMenuItems.length}`);
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
