import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@jewelcart.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const adminFirstName = 'Super';
  const adminLastName = 'Admin';

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('⚠️  Admin user already exists');
  } else {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    // Create superadmin user
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        firstName: adminFirstName,
        lastName: adminLastName,
        role: 'ADMIN',
      },
    });

    console.log('✅ Superadmin user created successfully!');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Role: ADMIN`);
  }

  // Check if products exist
  const productCount = await prisma.product.count();

  if (productCount === 0) {
    console.log('📦 Seeding sample products...');

    const products = [
      {
        name: 'Diamond Solitaire Ring',
        description: 'Exquisite 1-carat diamond set in 18k white gold. A timeless classic.',
        price: 2499.99,
        category: 'Rings',
        imageUrl: '/images/ring1.jpg',
        stockQuantity: 10,
        isFeatured: true,
      },
      {
        name: 'Pearl Drop Earrings',
        description: 'Freshwater pearls with sterling silver posts. Elegant for any occasion.',
        price: 349.99,
        category: 'Earrings',
        imageUrl: '/images/earring1.jpg',
        stockQuantity: 25,
        isFeatured: true,
      },
      {
        name: 'Gold Chain Necklace',
        description: '18-inch 14k gold chain. Perfect for layering or wearing alone.',
        price: 899.99,
        category: 'Necklaces',
        imageUrl: '/images/necklace1.jpg',
        stockQuantity: 15,
        isFeatured: true,
      },
      {
        name: 'Sapphire Tennis Bracelet',
        description: 'Stunning blue sapphires set in platinum. A statement piece.',
        price: 3499.99,
        category: 'Bracelets',
        imageUrl: '/images/bracelet1.jpg',
        stockQuantity: 8,
        isFeatured: true,
      },
      {
        name: 'Ruby Pendant Necklace',
        description: 'Deep red ruby surrounded by diamonds. Vintage-inspired design.',
        price: 1899.99,
        category: 'Necklaces',
        imageUrl: '/images/necklace2.jpg',
        stockQuantity: 12,
        isFeatured: false,
      },
      {
        name: 'Emerald Cut Diamond Earrings',
        description: 'Classic emerald cut diamonds in 18k yellow gold studs.',
        price: 4599.99,
        category: 'Earrings',
        imageUrl: '/images/earring2.jpg',
        stockQuantity: 5,
        isFeatured: true,
      },
      {
        name: 'Gold Bangle Bracelet',
        description: 'Solid 22k gold bangle with intricate filigree work.',
        price: 1299.99,
        category: 'Bracelets',
        imageUrl: '/images/bracelet2.jpg',
        stockQuantity: 20,
        isFeatured: false,
      },
      {
        name: 'Vintage Locket Pendant',
        description: 'Antique-style gold locket. Perfect for holding precious memories.',
        price: 449.99,
        category: 'Necklaces',
        imageUrl: '/images/necklace1.jpg',
        stockQuantity: 30,
        isFeatured: false,
      },
      {
        name: 'Diamond Halo Ring',
        description: '1.5-carat center stone with halo of smaller diamonds in rose gold.',
        price: 3299.99,
        category: 'Rings',
        imageUrl: '/images/ring2.jpg',
        stockQuantity: 7,
        isFeatured: true,
      },
      {
        name: 'Sapphire Blue Ring',
        description: 'Royal blue sapphire with diamond accents in white gold.',
        price: 1799.99,
        category: 'Rings',
        imageUrl: '/images/ring4.jpg',
        stockQuantity: 14,
        isFeatured: false,
      },
      {
        name: 'Pearl Strand Necklace',
        description: 'Akoya cultured pearls. Classic 16-inch strand.',
        price: 2199.99,
        category: 'Necklaces',
        imageUrl: '/images/necklace2.jpg',
        stockQuantity: 8,
        isFeatured: false,
      },
      {
        name: 'Diamond Stud Earrings',
        description: 'Brilliant round diamonds in 4-prong basket setting.',
        price: 1499.99,
        category: 'Earrings',
        imageUrl: '/images/earring1.jpg',
        stockQuantity: 18,
        isFeatured: true,
      },
    ];

    await prisma.product.createMany({
      data: products,
    });

    console.log(`✅ Created ${products.length} sample products`);
  } else {
    console.log(`⚠️  Products already exist (${productCount} found)`);
  }

  console.log('✨ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
