import { PrismaClient, Condition, ListingStatus, OfferStatus, Listing } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Deterministic IDs for consistent testing
const ALICE_ID = '27347f6d-d992-44cb-b39e-6c18c90f72f8'; // Matches sample token
const BOB_ID = 'd75f9638-3436-4299-b369-1c9c0379d77f';
const CHARLIE_ID = 'a123b456-7890-1234-5678-90abcdef1234';

async function main() {
  console.log('Starting seed...');

  // 1. Cleanup
  await prisma.transaction.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  const password = await bcrypt.hash('password123', 10);

  const alice = await prisma.user.create({
    data: {
      id: ALICE_ID,
      email: 'alice@example.com',
      password,
      name: 'Alice Seller',
    },
  });

  const bob = await prisma.user.create({
    data: {
      id: BOB_ID,
      email: 'bob@example.com',
      password,
      name: 'Bob Buyer',
    },
  });
  
  const charlie = await prisma.user.create({
    data: {
      id: CHARLIE_ID,
      email: 'charlie@example.com',
      password,
      name: 'Charlie User',
    },
  });

  console.log('Users created');

  // 3. Create Products (Listings in DB)
  const productsData = [
    {
      title: 'iPhone 15 Pro',
      description: 'Brand new, sealed box. 256GB storage. Blue Titanium.',
      price: 999,
      category: 'Electronics',
      condition: Condition.NEW,
      sellerId: alice.id,
      images: ['https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=800'],
      status: ListingStatus.ACTIVE,
    },
    {
      title: 'MacBook Air M2',
      description: 'Used for 3 months. Perfect condition. 8GB/256GB.',
      price: 850,
      category: 'Electronics',
      condition: Condition.LIKE_NEW,
      sellerId: alice.id,
      images: ['https://images.pexels.com/photos/303383/pexels-photo-303383.jpeg?auto=compress&cs=tinysrgb&w=800'],
      status: ListingStatus.ACTIVE,
    },
    {
      title: 'Vintage Leather Jacket',
      description: 'Genuine leather, size M. Good condition with some wear.',
      price: 120,
      category: 'Clothing',
      condition: Condition.GOOD,
      sellerId: charlie.id,
      images: ['https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&w=800'],
      status: ListingStatus.ACTIVE,
    },
    {
      title: 'Sony WH-1000XM5',
      description: 'Noise cancelling headphones. Silver.',
      price: 280,
      category: 'Electronics',
      condition: Condition.LIKE_NEW,
      sellerId: charlie.id,
      images: ['https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800'],
      status: ListingStatus.ACTIVE,
    },
    {
      title: 'Mountain Bike',
      description: 'Trek Marlin 5. Needs minor tune up.',
      price: 350,
      category: 'Sports',
      condition: Condition.FAIR,
      sellerId: charlie.id,
      images: ['https://placehold.co/400'],
      status: ListingStatus.ACTIVE,
    },
    {
      title: 'Gaming PC',
      description: 'RTX 3070, Ryzen 5 5600X, 16GB RAM.',
      price: 900,
      category: 'Electronics',
      condition: Condition.GOOD,
      sellerId: alice.id,
      images: ['https://images.pexels.com/photos/777001/pexels-photo-777001.jpeg?auto=compress&cs=tinysrgb&w=800'],
      status: ListingStatus.ACTIVE,
    },
  ];

  const products: Listing[] = [];
  for (const p of productsData) {
    const product = await prisma.listing.create({ data: p });
    products.push(product);
  }

  console.log('✅ Products created');

  // 4. Create Offers
  // Bob offers on Alice's iPhone
  await prisma.offer.create({
    data: {
      amount: 950,
      message: 'Can you do $950? Cash ready.',
      listingId: products[0].id, // iPhone
      buyerId: bob.id,
      status: OfferStatus.PENDING,
    },
  });

  // Bob offers on Alice's MacBook
  await prisma.offer.create({
    data: {
      amount: 800,
      message: 'Would you take 800?',
      listingId: products[1].id, // MacBook
      buyerId: bob.id,
      status: OfferStatus.PENDING,
    },
  });

   // Charlie offers on Alice's iPhone too
   await prisma.offer.create({
    data: {
      amount: 900,
      message: 'Interested.',
      listingId: products[0].id, // iPhone
      buyerId: charlie.id,
      status: OfferStatus.PENDING,
    },
  });
  
  // Bob offers on Charlie's Headphones
  await prisma.offer.create({
    data: {
      amount: 250,
      message: '250 and I pick up today',
      listingId: products[3].id, // Headphones
      buyerId: bob.id,
      status: OfferStatus.PENDING,
    },
  });

  console.log('Offers created');

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
