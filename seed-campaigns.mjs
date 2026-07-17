/**
 * Seed 5 sample fundraising campaigns.
 * Run: node seed-campaigns.mjs
 */
import "dotenv/config";
import mysql from "mysql2/promise";

const conn = await mysql.createConnection(process.env.DATABASE_URL);

const campaigns = [
  {
    slug: "school-fees-2025-" + Date.now().toString(36),
    title: "School Fees for 100 Children",
    excerpt: "Help us pay school fees so 100 children can stay in class and not be sent home.",
    description: "Many families in Zimbabwe cannot afford the school fees required to keep their children enrolled. Without fees paid, children are turned away at the gate. Your donation directly covers fees for a child for an entire term.",
    coverImageUrl: "/manus-storage/hope-rising-classroom_629dc9e0.jpg",
    goalCents: 1000000,  // $10,000
    raisedCents: 342500, // $3,425
    currency: "USD",
    donateUrl: "https://donate.raisely.com/hope-rising-education",
    deadline: new Date("2025-12-31"),
    isActive: true,
    isFeatured: true,
    sortOrder: 1,
  },
  {
    slug: "books-and-supplies-2025-" + (Date.now() + 1).toString(36),
    title: "Books & School Supplies Drive",
    excerpt: "Provide textbooks, pencils, and notebooks to children who have none.",
    description: "Hundreds of children attend school without a single textbook or pencil. This campaign funds bulk purchases of textbooks, exercise books, pens, and pencils distributed directly to students at partner schools.",
    coverImageUrl: "/manus-storage/hope-rising-books-distribution_7b3c2a1d.jpg",
    goalCents: 500000,  // $5,000
    raisedCents: 187500, // $1,875
    currency: "USD",
    donateUrl: "https://donate.raisely.com/hope-rising-education",
    deadline: new Date("2025-11-30"),
    isActive: true,
    isFeatured: true,
    sortOrder: 2,
  },
  {
    slug: "feeding-program-2025-" + (Date.now() + 2).toString(36),
    title: "School Feeding Program",
    excerpt: "A hot meal every school day keeps children in class and able to learn.",
    description: "Hunger is one of the biggest barriers to education. Children who arrive at school without food cannot concentrate. This campaign funds a daily hot meal for 200 children at three partner schools for one full term.",
    coverImageUrl: "/manus-storage/hope-rising-food-aid_a4f1e8b2.jpg",
    goalCents: 750000,  // $7,500
    raisedCents: 95000,  // $950
    currency: "USD",
    donateUrl: "https://donate.raisely.com/hope-rising-education",
    deadline: new Date("2026-03-31"),
    isActive: true,
    isFeatured: true,
    sortOrder: 3,
  },
  {
    slug: "school-uniforms-2025-" + (Date.now() + 3).toString(36),
    title: "School Uniforms for 50 Students",
    excerpt: "Without a uniform, children are turned away from school. Help us change that.",
    description: "In Zimbabwe, school uniforms are mandatory. Families who cannot afford them are forced to keep their children home. This campaign provides complete uniform sets — shirt, trousers/skirt, shoes, and socks — to 50 children.",
    coverImageUrl: "/manus-storage/hope-rising-school-uniforms_d9e2c7f4.jpg",
    goalCents: 250000,  // $2,500
    raisedCents: 62500,  // $625
    currency: "USD",
    donateUrl: "https://donate.raisely.com/hope-rising-education",
    deadline: new Date("2025-10-31"),
    isActive: true,
    isFeatured: false,
    sortOrder: 4,
  },
  {
    slug: "teacher-training-2025-" + (Date.now() + 4).toString(36),
    title: "Teacher Training Workshop",
    excerpt: "Equip teachers with the skills to deliver our My Best Me curriculum.",
    description: "The My Best Me curriculum is only as effective as the teachers who deliver it. This campaign funds a 3-day intensive training workshop for 30 teachers from partner schools, covering trauma-informed teaching, emotional intelligence, and curriculum delivery.",
    coverImageUrl: "/manus-storage/hope-rising-group-tshirts_f9863d83.jpg",
    goalCents: 300000,  // $3,000
    raisedCents: 0,
    currency: "USD",
    donateUrl: "https://donate.raisely.com/hope-rising-education",
    deadline: new Date("2026-06-30"),
    isActive: true,
    isFeatured: false,
    sortOrder: 5,
  },
];

for (const c of campaigns) {
  await conn.execute(
    `INSERT INTO campaigns (slug, title, excerpt, description, coverImageUrl, goalCents, raisedCents, currency, donateUrl, deadline, isActive, isFeatured, sortOrder, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [c.slug, c.title, c.excerpt, c.description, c.coverImageUrl, c.goalCents, c.raisedCents, c.currency, c.donateUrl, c.deadline, c.isActive ? 1 : 0, c.isFeatured ? 1 : 0, c.sortOrder]
  );
  console.log(`✓ Seeded: ${c.title}`);
}

await conn.end();
console.log("\n✅ All 5 campaigns seeded successfully.");
