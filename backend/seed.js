require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = require('./models/User');
  const Product = require('./models/Product');

  // Find or create a mock user to act as seller
  let seller = await User.findOne({});
  if (!seller) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('password123', 10);
    seller = await User.create({
      name: 'Nitin Mathur',
      email: 'nitinmathur@example.com',
      password: hashedPassword,
      college: 'Main Campus',
      department: 'Computer Science',
      year: '3rd Year',
      phone: '9876543210',
    });
  }

  // Clear existing products
  await Product.deleteMany({});

  const products = [
    // === ELECTRONICS (10) ===
    {
      title: "Samsung Galaxy A14 5G",
      description: "Samsung Galaxy A14 5G in excellent condition, used for 6 months. Comes with original charger and box. Dual SIM, 64GB storage.",
      category: "Electronics",
      subcategory: "Mobile Phones",
      price: 8000,
      condition: "Like New",
      specifications: JSON.stringify({ dorm: "Hostel B", swap: false, details: "64GB, Black, Charger included" }),
      images: [{ url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=60", publicId: "mock_samsung" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Sony WH-1000XM4",
      description: "Industry leading noise canceling headphones. Pristine silver color. Battery backup of 30 hours. Used occasionally during study sessions.",
      category: "Electronics",
      subcategory: "Audio & Headphones",
      price: 12000,
      condition: "Like New",
      specifications: JSON.stringify({ dorm: "Library Block", swap: false, details: "Silver, carrying case, cables" }),
      images: [{ url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&auto=format&fit=crop&q=60", publicId: "mock_sony" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Dell Inspiron 15 Laptop",
      description: "Intel i5, 8GB RAM, 512GB SSD. Perfect for coding, assignments, and online classes. Good battery health (around 4 hours).",
      category: "Electronics",
      subcategory: "Laptops",
      price: 25000,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel C", swap: false, details: "Windows 11, charger included" }),
      images: [{ url: "https://images.unsplash.com/photo-1496181130204-7552cc15494d?w=600&auto=format&fit=crop&q=60", publicId: "mock_dell" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "iPad Air (4th Gen) 64GB Wi-Fi",
      description: "Space Grey, 64GB. Screen has a tempered glass protector. Excellent for taking notes with Apple Pencil (not included). No scratches.",
      category: "Electronics",
      subcategory: "Tablets",
      price: 28000,
      condition: "Like New",
      specifications: JSON.stringify({ dorm: "Hostel A", swap: false, details: "Original box and USB-C cable" }),
      images: [{ url: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=60", publicId: "mock_ipad" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Kindle Paperwhite (10th Gen)",
      description: "8GB storage, waterproof, built-in light. Perfect for reading textbooks and novels. Battery lasts for weeks.",
      category: "Electronics",
      subcategory: "E-Readers",
      price: 4500,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel B", swap: true, details: "Black, comes with a blue flip cover" }),
      images: [{ url: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=60", publicId: "mock_kindle" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Mechanical Gaming Keyboard",
      description: "Redragon K552 mechanical keyboard with blue switches. Tactile feedback, rainbow LED backlit. Used for 1 year.",
      category: "Electronics",
      subcategory: "Computer Accessories",
      price: 1500,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel A", swap: true, details: "Wired, RGB, Blue switches" }),
      images: [{ url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=60", publicId: "mock_keyboard" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Logitech MX Master 3S Mouse",
      description: "Ergonomic wireless mouse, ultra-quiet clicks, 8K DPI. Extremely comfortable for long hours of programming and editing.",
      category: "Electronics",
      subcategory: "Computer Accessories",
      price: 5500,
      condition: "Like New",
      specifications: JSON.stringify({ dorm: "Hostel C", swap: false, details: "Black, USB receiver and charging cable" }),
      images: [{ url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=60", publicId: "mock_mouse" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "JBL Flip 6 Bluetooth Speaker",
      description: "Powerful sound, IP67 waterproof and dustproof. Great for room parties or outdoor hangouts. 12 hours playtime.",
      category: "Electronics",
      subcategory: "Audio",
      price: 6000,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel B", swap: false, details: "Red color, excellent bass" }),
      images: [{ url: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=60", publicId: "mock_jbl" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Canon EOS Rebel T7 DSLR Camera",
      description: "Comes with 18-55mm lens, battery, charger, and a 64GB SD card. Perfect starter camera for campus photography clubs.",
      category: "Electronics",
      subcategory: "Cameras",
      price: 22000,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Main Campus Block", swap: false, details: "24.1 Megapixel, Wi-Fi enabled" }),
      images: [{ url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=60", publicId: "mock_canon" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Mi 20000mAh Power Bank",
      description: "18W Fast Charging, triple port output. Can charge a standard phone 4-5 times. Essential for power cuts.",
      category: "Electronics",
      subcategory: "Mobile Accessories",
      price: 900,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel D", swap: true, details: "Black, dual input (Micro-USB and Type-C)" }),
      images: [{ url: "https://images.unsplash.com/photo-1609592424109-dd9892f1b17c?w=600&auto=format&fit=crop&q=60", publicId: "mock_powerbank" }],
      sellerId: seller._id,
      status: "available"
    },

    // === BOOKS (10) ===
    {
      title: "Engineering Physics Textbook",
      description: "Engineering Physics textbook by Gaur & Gupta. Very useful for first-year B.Tech students. Clean pages, no highlights.",
      category: "Books",
      subcategory: "Textbooks",
      price: 350,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Library Block", swap: true, details: "Gaur & Gupta, 8th edition" }),
      images: [{ url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=60", publicId: "mock_physics" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Introduction to Algorithms (CLRS)",
      description: "The classic 'Introduction to Algorithms' by Cormen, Leiserson, Rivest, and Stein. 3rd edition. Essential for DSA class.",
      category: "Books",
      subcategory: "Textbooks",
      price: 800,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel A", swap: false, details: "Hardcover, slightly worn edges" }),
      images: [{ url: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop&q=60", publicId: "mock_clrs" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Calculus: Early Transcendentals",
      description: "Calculus textbook by James Stewart, 8th edition. Used for Math 1 and Math 2 courses. Some pencil markings inside.",
      category: "Books",
      subcategory: "Textbooks",
      price: 600,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel B", swap: true, details: "Paperback, clean cover" }),
      images: [{ url: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=600&auto=format&fit=crop&q=60", publicId: "mock_calculus" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Clean Code by Robert C. Martin",
      description: "Clean Code: A Handbook of Agile Software Craftsmanship. A must-read for any aspiring software engineer.",
      category: "Books",
      subcategory: "Programming",
      price: 500,
      condition: "Like New",
      specifications: JSON.stringify({ dorm: "Hostel C", swap: true, details: "Pristine condition, paperback" }),
      images: [{ url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=60", publicId: "mock_cleancode" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Cracking the Coding Interview",
      description: "189 Programming Questions and Solutions by Gayle Laakmann McDowell. 6th Edition. Extremely helpful for placement prep.",
      category: "Books",
      subcategory: "Career Prep",
      price: 450,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel A", swap: false, details: "No highlights, minor wear on spine" }),
      images: [{ url: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=60", publicId: "mock_cracking" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Concepts of Physics Vol 1 & 2",
      description: "Classic HC Verma books for physics fundamentals. Great for clearing basics. Selling as a set of two books.",
      category: "Books",
      subcategory: "Academic",
      price: 400,
      condition: "Fair",
      specifications: JSON.stringify({ dorm: "Hostel B", swap: true, details: "Both volumes, readable pages" }),
      images: [{ url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=60", publicId: "mock_hcv" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Sapiens: A Brief History of Humankind",
      description: "Non-fiction book by Yuval Noah Harari. Read once, selling it so someone else can enjoy. Amazing perspective on history.",
      category: "Books",
      subcategory: "Non-Fiction",
      price: 200,
      condition: "Like New",
      specifications: JSON.stringify({ dorm: "Hostel C", swap: true, details: "Paperback, perfect condition" }),
      images: [{ url: "https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=600&auto=format&fit=crop&q=60", publicId: "mock_sapiens" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Atomic Habits",
      description: "An Easy & Proven Way to Build Good Habits & Break Bad Ones by James Clear. Highly recommended for students.",
      category: "Books",
      subcategory: "Self-Help",
      price: 250,
      condition: "Like New",
      specifications: JSON.stringify({ dorm: "Hostel A", swap: true, details: "Paperback, clean pages" }),
      images: [{ url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=60", publicId: "mock_atomichabits" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Organic Chemistry Study Guide",
      description: "Study guide and solutions manual for Organic Chemistry. Useful for chemical engineering students.",
      category: "Books",
      subcategory: "Textbooks",
      price: 300,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel B", swap: true, details: "Comes with molecular model kit" }),
      images: [{ url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=60", publicId: "mock_chemistrybook" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Official GRE Quantitative Reasoning Practice",
      description: "Official guide by ETS. Contains real test questions. Helpful if you are planning for higher studies.",
      category: "Books",
      subcategory: "Exam Prep",
      price: 350,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel D", swap: false, details: "No pen marks inside, pencil marks erased" }),
      images: [{ url: "https://images.unsplash.com/photo-1491841538654-846b986f9479?w=600&auto=format&fit=crop&q=60", publicId: "mock_gre" }],
      sellerId: seller._id,
      status: "available"
    },

    // === FURNITURE (10) ===
    {
      title: "Study Desk with Drawers",
      description: "Spacious wooden study table with three sliding drawers. Fits desktop, keyboard, and books easily.",
      category: "Furniture",
      subcategory: "Tables & Desks",
      price: 2500,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel A", swap: false, details: "Wooden, 120x60cm" }),
      images: [{ url: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&auto=format&fit=crop&q=60", publicId: "mock_desk" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Glass Top Dining Table",
      description: "Glass top dining table with four metallic chairs. Glass is in perfect condition, no scratches.",
      category: "Furniture",
      subcategory: "Tables & Desks",
      price: 6000,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Main Canteen Area", swap: false, details: "Glass top, 4 chairs" }),
      images: [{ url: "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=600&auto=format&fit=crop&q=60", publicId: "mock_dining" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Ergonomic Office Chair",
      description: "Mesh back ergonomic chair with adjustable height, headrest, and armrests. Excellent lumbar support for coding sessions.",
      category: "Furniture",
      subcategory: "Chairs",
      price: 3500,
      condition: "Like New",
      specifications: JSON.stringify({ dorm: "Hostel C", swap: false, details: "Black mesh, heavy duty wheels" }),
      images: [{ url: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=600&auto=format&fit=crop&q=60", publicId: "mock_chair" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Single Metal Foldable Cot",
      description: "Foldable steel cot with a soft mattress. Super easy to carry and store. Perfect for hostel rooms with limited space.",
      category: "Furniture",
      subcategory: "Beds",
      price: 1800,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel B", swap: false, details: "3x6 feet, steel frame, mattress included" }),
      images: [{ url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&auto=format&fit=crop&q=60", publicId: "mock_cot" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Comfy Bean Bag with Beans",
      description: "Black leatherette bean bag, XXL size. Fully filled with beans, extremely comfortable. Minor wear on bottom.",
      category: "Furniture",
      subcategory: "Seating",
      price: 800,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel D", swap: true, details: "Black, XXL size, no leaks" }),
      images: [{ url: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600&auto=format&fit=crop&q=60", publicId: "mock_beanbag" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Plastic Stackable Chairs (Set of 2)",
      description: "Supreme quality plastic chairs. Very sturdy and lightweight. Great for balconies or extra visitors.",
      category: "Furniture",
      subcategory: "Chairs",
      price: 500,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel A", swap: true, details: "Brown plastic, set of 2" }),
      images: [{ url: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&auto=format&fit=crop&q=60", publicId: "mock_plasticchairs" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Metal Book Rack / Shelf",
      description: "4-tier metal frame storage shelf. Can hold a lot of heavy books and files. Assembly tools included.",
      category: "Furniture",
      subcategory: "Shelves & Cabinets",
      price: 1200,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel B", swap: false, details: "4-tier, Black metal, collapsible" }),
      images: [{ url: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=600&auto=format&fit=crop&q=60", publicId: "mock_bookrack" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Bedside Wooden Table",
      description: "Small side table with one drawer and an open compartment. Perfect size to keep near the bed for a lamp and books.",
      category: "Furniture",
      subcategory: "Tables & Desks",
      price: 900,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel C", swap: true, details: "Dark wood, 40x40cm" }),
      images: [{ url: "https://images.unsplash.com/photo-1532372320978-9b4d8a3e0245?w=600&auto=format&fit=crop&q=60", publicId: "mock_sidetable" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Collapsible Fabric Wardrobe",
      description: "Portable wardrobe with zippered cover and metal rods. Has hanging spaces and shelving. Very clean.",
      category: "Furniture",
      subcategory: "Shelves & Cabinets",
      price: 1000,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel D", swap: false, details: "Blue fabric cover, metal structure" }),
      images: [{ url: "https://images.unsplash.com/photo-1558882224-cca166733360?w=600&auto=format&fit=crop&q=60", publicId: "mock_wardrobe" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Full Length Standing Mirror",
      description: "Solid wood frame standing mirror. Can be leaned against the wall or hung. Perfect reflection, no distortions.",
      category: "Furniture",
      subcategory: "Home Decor",
      price: 1500,
      condition: "Like New",
      specifications: JSON.stringify({ dorm: "Hostel A", swap: false, details: "5 feet tall, wooden frame" }),
      images: [{ url: "https://images.unsplash.com/photo-1617806118233-18e1db207f62?w=600&auto=format&fit=crop&q=60", publicId: "mock_mirror" }],
      sellerId: seller._id,
      status: "available"
    },

    // === CLOTHING (10) ===
    {
      title: "Winter Fleece Hoodie",
      description: "Cozy warm fleece hoodie, dark blue. Ideal for cold winter months in the library. Size: L. Perfect condition, washed and clean.",
      category: "Clothing",
      subcategory: "Hoodies & Jackets",
      price: 800,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel B", swap: true, details: "Size L, Blue, fleece material" }),
      images: [{ url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=60", publicId: "mock_hoodie" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Classic Denim Jacket",
      description: "Levis denim jacket in light wash. Extremely stylish and goes with everything. Size: M. Selling because it doesn't fit me anymore.",
      category: "Clothing",
      subcategory: "Jackets",
      price: 1500,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel C", swap: true, details: "Size M, Light blue, 100% cotton" }),
      images: [{ url: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=60", publicId: "mock_denim" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Leather Varsity Jacket",
      description: "Black and white leather sleeve varsity jacket. Very trendy streetwear aesthetic. Size: XL.",
      category: "Clothing",
      subcategory: "Jackets",
      price: 2000,
      condition: "Like New",
      specifications: JSON.stringify({ dorm: "Hostel A", swap: false, details: "Size XL, Wool body, faux leather sleeves" }),
      images: [{ url: "https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?w=600&auto=format&fit=crop&q=60", publicId: "mock_varsity" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Nike Air Zoom Running Shoes",
      description: "Black Nike running shoes, size US 9 (UK 8). Lightly used for jogging, soles are in great condition. Very comfortable.",
      category: "Clothing",
      subcategory: "Footwear",
      price: 2500,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Sports Complex", swap: false, details: "Size UK 8, Black/White, Zoom Air cushioning" }),
      images: [{ url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60", publicId: "mock_nike" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Official College Hoodie",
      description: "University branded gray pullover hoodie. Very comfortable fabric. Size: S. Rarely worn.",
      category: "Clothing",
      subcategory: "Hoodies & Jackets",
      price: 600,
      condition: "Like New",
      specifications: JSON.stringify({ dorm: "Hostel A", swap: true, details: "Size S, Gray, Official merch" }),
      images: [{ url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=60", publicId: "mock_collegehoodie" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Quechua Waterproof Raincoat",
      description: "Decathlon raincoat, fully waterproof, neon blue. Includes carrying pouch. Fits easily in college backpack. Size: M.",
      category: "Clothing",
      subcategory: "Activewear",
      price: 700,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel D", swap: true, details: "Size M, Blue, Decathlon" }),
      images: [{ url: "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=600&auto=format&fit=crop&q=60", publicId: "mock_raincoat" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Formal Placement Blazer",
      description: "Raymond black slim fit formal blazer. Used only once for placement interview. Dry cleaned and ready to wear. Size: 40.",
      category: "Clothing",
      subcategory: "Formals",
      price: 3000,
      condition: "Like New",
      specifications: JSON.stringify({ dorm: "Hostel C", swap: false, details: "Size 40 (M), Black, slim fit" }),
      images: [{ url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=60", publicId: "mock_blazer" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Chelsea Leather Boots",
      description: "Brown leather Chelsea boots. Stylish look, comfortable rubber sole. Fits size UK 9.",
      category: "Clothing",
      subcategory: "Footwear",
      price: 1800,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel B", swap: false, details: "Size UK 9, Suede brown leather" }),
      images: [{ url: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&auto=format&fit=crop&q=60", publicId: "mock_boots" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Classic Canvas Backpack",
      description: "Herschel style mustard yellow canvas backpack. Laptop sleeve inside. Perfect everyday college bag.",
      category: "Clothing",
      subcategory: "Bags",
      price: 900,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel A", swap: true, details: "Yellow, 20L volume, fits 15 inch laptop" }),
      images: [{ url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=60", publicId: "mock_backpack" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Puma Sports Tracksuit",
      description: "Full tracksuit (jacket and track pants). Navy blue with white piping. Great for early morning workouts. Size: L.",
      category: "Clothing",
      subcategory: "Activewear",
      price: 1600,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Sports Complex", swap: true, details: "Size L, Navy blue, polyester blend" }),
      images: [{ url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=60", publicId: "mock_tracksuit" }],
      sellerId: seller._id,
      status: "available"
    },

    // === SPORTS (10) ===
    {
      title: "Decathlon Hybrid Bicycle",
      description: "Decathlon Riverside hybrid cycle. Great for riding around the campus and hostels. 7 gears, front suspension. Very smooth ride.",
      category: "Sports",
      subcategory: "Bicycles",
      price: 7500,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Sports Complex", swap: false, details: "7 speed, hybrid, Riverside" }),
      images: [{ url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop&q=60", publicId: "mock_cycle" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Yonex Muscle Power Badminton Racket",
      description: "Yonex badminton racket with full cover. Strung with BG65 strings recently. High tension. Great smash control.",
      category: "Sports",
      subcategory: "Badminton",
      price: 1100,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Sports Complex", swap: true, details: "G4 grip, BG65 strings at 24lbs" }),
      images: [{ url: "https://images.unsplash.com/photo-1613918431201-5264b971a80c?w=600&auto=format&fit=crop&q=60", publicId: "mock_racket" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Spalding TF-150 Basketball",
      description: "Official size 7 indoor/outdoor basketball. Solid grip and excellent bounce. Only used a couple of times on the campus court.",
      category: "Sports",
      subcategory: "Basketball",
      price: 700,
      condition: "Like New",
      specifications: JSON.stringify({ dorm: "Hostel D", swap: true, details: "Size 7, rubber cover" }),
      images: [{ url: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&auto=format&fit=crop&q=60", publicId: "mock_basketball" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Nivia Football (Size 5)",
      description: "Nivia hand-stitched football. Perfect shape and pressure retention. Great for evening matches in the main ground.",
      category: "Sports",
      subcategory: "Football",
      price: 450,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Sports Complex", swap: true, details: "Size 5, 32 panels" }),
      images: [{ url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=60", publicId: "mock_football" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Yoga Mat (6mm Thickness)",
      description: "Anti-slip yoga mat with carrying strap. Perfect for workouts in your hostel room or gym. Light grey color.",
      category: "Sports",
      subcategory: "Fitness & Gym",
      price: 350,
      condition: "Like New",
      specifications: JSON.stringify({ dorm: "Hostel B", swap: true, details: "6mm thick, EVA foam, carry strap included" }),
      images: [{ url: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&auto=format&fit=crop&q=60", publicId: "mock_yogamat" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Adjustable Dumbbells (Pair of 10kg)",
      description: "Chrome weights with threaded spinlocks. Easily adjust weight configuration up to 10kg per dumbbell. Heavy duty.",
      category: "Sports",
      subcategory: "Fitness & Gym",
      price: 1800,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel C", swap: false, details: "20kg total, chrome bars, rubber grip" }),
      images: [{ url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=60", publicId: "mock_dumbbells" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "English Willow Cricket Bat",
      description: "SG Scorer English Willow cricket bat. Has a clean face with 6 straight grains. Fitted with a new octopus grip.",
      category: "Sports",
      subcategory: "Cricket",
      price: 2800,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel D", swap: false, details: "Short handle, English Willow, knocked in" }),
      images: [{ url: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&auto=format&fit=crop&q=60", publicId: "mock_bat" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Table Tennis Racket Set",
      description: "GKI Kung Fu table tennis racket with 3 orange balls and a carrying case. Rubbers have decent spin and control.",
      category: "Sports",
      subcategory: "Table Tennis",
      price: 500,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel A", swap: true, details: "1 racket, 3 balls, zipped cover" }),
      images: [{ url: "https://images.unsplash.com/photo-1534158914592-062992fbe900?w=600&auto=format&fit=crop&q=60", publicId: "mock_tt" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Skateboard (Canadian Maple)",
      description: "Complete 31-inch double kick deck skateboard. ABEC-7 bearings, high speed. Great for cruising through campus walkways.",
      category: "Sports",
      subcategory: "Skateboarding",
      price: 1500,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Library Block", swap: false, details: "8-ply maple wood, PU wheels" }),
      images: [{ url: "https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=600&auto=format&fit=crop&q=60", publicId: "mock_skateboard" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Swimming Goggles & Cap Set",
      description: "Speedo anti-fog swimming goggles and a silicone swim cap. Very tight sealing, no leakage. Used for one semester.",
      category: "Sports",
      subcategory: "Swimming",
      price: 400,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Sports Complex", swap: true, details: "Anti-fog goggles, black silicone cap" }),
      images: [{ url: "https://images.unsplash.com/photo-1519766304817-4f37bda74a27?w=600&auto=format&fit=crop&q=60", publicId: "mock_swim" }],
      sellerId: seller._id,
      status: "available"
    },

    // === ACCESSORIES (10) ===
    {
      title: "Noise Smartwatch",
      description: "Noise smartwatch, jet black, 1.4 inch touch display. Heart rate, SpO2 tracking, multiple sports modes. Used for 2 months.",
      category: "Accessories",
      subcategory: "Watches",
      price: 1200,
      condition: "Like New",
      specifications: JSON.stringify({ dorm: "Sports Complex", swap: false, details: "1.4 inch screen, Black, 7 days battery" }),
      images: [{ url: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=60", publicId: "mock_watch" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Leather Wallet (Wildhorn)",
      description: "Wildhorn genuine leather bi-fold wallet for men. 8 card slots, 2 currency compartments. Box included, never used.",
      category: "Accessories",
      subcategory: "Wallets & Bags",
      price: 400,
      condition: "New",
      specifications: JSON.stringify({ dorm: "Hostel A", swap: true, details: "Brown leather, RFID blocking" }),
      images: [{ url: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=60", publicId: "mock_wallet" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Ray-Ban Classic Wayfarer",
      description: "Classic black frame Wayfarer sunglasses with green polarized lenses. Fits average size faces. Comes with leather pouch.",
      category: "Accessories",
      subcategory: "Eyewear",
      price: 3500,
      condition: "Like New",
      specifications: JSON.stringify({ dorm: "Hostel B", swap: false, details: "Black frame, polarized, UV protection" }),
      images: [{ url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=60", publicId: "mock_glasses" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "15.6-inch Laptop Sleeve Case",
      description: "Nylon fabric water resistant laptop sleeve. Thick padding inside to protect laptop from falls. Front pocket for charger.",
      category: "Accessories",
      subcategory: "Bags & Sleeves",
      price: 300,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel C", swap: true, details: "Dark grey, fits up to 15.6 inch laptops" }),
      images: [{ url: "https://images.unsplash.com/photo-1512756290489-ec064d786519?w=600&auto=format&fit=crop&q=60", publicId: "mock_sleeve" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Large Desk Pad / Keyboard Mat",
      description: "Extended size mouse pad (900x400mm). Smooth fabric top, non-slip rubber base. Fits keyboard and mouse easily. Stitch edges.",
      category: "Accessories",
      subcategory: "Desk Accessories",
      price: 350,
      condition: "Like New",
      specifications: JSON.stringify({ dorm: "Hostel A", swap: true, details: "Map pattern, 90x40cm, stitched edges" }),
      images: [{ url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=60", publicId: "mock_deskpad" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Swiss Army Multi-tool Keychain",
      description: "Victorinox Classic SD Swiss Army knife. Has small blade, scissors, nail file, screwdriver, tweezers, and toothpick. Very handy.",
      category: "Accessories",
      subcategory: "Tools",
      price: 800,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel B", swap: true, details: "Red, 7 functions" }),
      images: [{ url: "https://images.unsplash.com/photo-1590157130429-0cb522237bb1?w=600&auto=format&fit=crop&q=60", publicId: "mock_multitool" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Anti-theft Laptop Backpack",
      description: "Waterproof anti-theft backpack with hidden zipper design and built-in USB charging port. Multi-compartment interior.",
      category: "Accessories",
      subcategory: "Wallets & Bags",
      price: 1000,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel C", swap: false, details: "Grey, fit 15.6 inch laptop, USB port" }),
      images: [{ url: "https://images.unsplash.com/photo-1577733966973-d680bffd2e80?w=600&auto=format&fit=crop&q=60", publicId: "mock_antitheft" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Stainless Steel Insulated Flask",
      description: "Vacuum insulated double-walled water bottle. Keeps water cold for 24 hours and hot for 12 hours. Sweat-free exterior.",
      category: "Accessories",
      subcategory: "Utilities",
      price: 500,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel D", swap: true, details: "750ml, matte black, food-grade steel" }),
      images: [{ url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=60", publicId: "mock_flask" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "LED Desk Lamp with USB Charger",
      description: "Touch control reading light with 3 brightness modes. Flexible neck to adjust lighting angle. USB powered.",
      category: "Accessories",
      subcategory: "Desk Accessories",
      price: 450,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel A", swap: true, details: "White, touch dimmable, USB outlet" }),
      images: [{ url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=60", publicId: "mock_lamp" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Octopus Phone Tripod",
      description: "Flexible leg tripod stand with universal phone holder and Bluetooth remote shutter. Great for vlogging and recording labs.",
      category: "Accessories",
      subcategory: "Mobile Accessories",
      price: 300,
      condition: "Like New",
      specifications: JSON.stringify({ dorm: "Hostel B", swap: true, details: "Flexible legs, remote control included" }),
      images: [{ url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=60", publicId: "mock_tripod" }],
      sellerId: seller._id,
      status: "available"
    },

    // === OTHER (10) ===
    {
      title: "Pigeon Electric Kettle (1.5L)",
      description: "1.5 Litre capacity electric multi-cooker kettle. Heats water, prepares tea/coffee or instant noodles within minutes.",
      category: "Other",
      subcategory: "Appliances",
      price: 600,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel B", swap: false, details: "1.5L, Stainless steel, 1500W" }),
      images: [{ url: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&auto=format&fit=crop&q=60", publicId: "mock_kettle" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Philips Salon Hair Dryer",
      description: "1000W hair dryer with concentrator nozzle. Compact design with foldable handle for easy storage in hostel cupboard.",
      category: "Other",
      subcategory: "Personal Care",
      price: 600,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel A", swap: true, details: "1000W, Pink/White, 2 speed settings" }),
      images: [{ url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=60", publicId: "mock_hairdryer" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Foldable Ironing Board",
      description: "Compact ironing board with iron rest stand. Cotton cover has heat-resistant lining. Adjustable height legs.",
      category: "Other",
      subcategory: "Home Utilities",
      price: 450,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel C", swap: false, details: "Collapsible legs, grey fabric cover" }),
      images: [{ url: "https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=600&auto=format&fit=crop&q=60", publicId: "mock_ironingboard" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Bajaj Blow Hot Room Heater",
      description: "Fan forced room heater. Two heat settings (1000W and 2000W) with automatic thermal cutout safety feature.",
      category: "Other",
      subcategory: "Appliances",
      price: 1000,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel D", swap: false, details: "2000W, White, dual stand option" }),
      images: [{ url: "https://images.unsplash.com/photo-1614631446501-abcf76949eca?w=600&auto=format&fit=crop&q=60", publicId: "mock_heater" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Rechargeable Emergency Lantern",
      description: "High brightness LED emergency lantern. Has overcharge protection. Battery back up lasts for 6 hours.",
      category: "Other",
      subcategory: "Appliances",
      price: 350,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel B", swap: true, details: "Rechargeable, handle strap, dimmable knob" }),
      images: [{ url: "https://images.unsplash.com/photo-1507697364665-69eec30ea71e?w=600&auto=format&fit=crop&q=60", publicId: "mock_lantern" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Yamaha F280 Acoustic Guitar",
      description: "Yamaha F280 natural finish acoustic guitar. Great sound, comfortable action. Comes with guitar bag, a few picks and strap.",
      category: "Other",
      subcategory: "Musical Instruments",
      price: 5500,
      condition: "Like New",
      specifications: JSON.stringify({ dorm: "Hostel A", swap: false, details: "Natural wood color, carrying bag included" }),
      images: [{ url: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=60", publicId: "mock_guitar" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Scientific Calculator Casio fx-991EX",
      description: "Classwiz scientific calculator with 552 functions. Extremely useful for engineering and math courses. Solar powered.",
      category: "Other",
      subcategory: "Stationery",
      price: 900,
      condition: "Like New",
      specifications: JSON.stringify({ dorm: "Hostel C", swap: false, details: "Dual power (Solar + Battery), sliding case" }),
      images: [{ url: "https://images.unsplash.com/photo-1603513492128-ba909bca7477?w=600&auto=format&fit=crop&q=60", publicId: "mock_calculator" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Engineering Drawing Board",
      description: "Standard drawing board with T-square. Perfect for first-year engineering graphics course. Smooth pine wood.",
      category: "Other",
      subcategory: "Stationery",
      price: 500,
      condition: "Good",
      specifications: JSON.stringify({ dorm: "Hostel A", swap: true, details: "Imperial size board, wooden T-square" }),
      images: [{ url: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&auto=format&fit=crop&q=60", publicId: "mock_drawingboard" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Mini USB Desk Fan",
      description: "Ultra quiet desktop table cooling fan. Powered by USB cable. Has adjustable head and three speeds.",
      category: "Other",
      subcategory: "Appliances",
      price: 300,
      condition: "Like New",
      specifications: JSON.stringify({ dorm: "Hostel B", swap: true, details: "Dark blue, 3-speed, USB powered" }),
      images: [{ url: "https://images.unsplash.com/photo-1618944847828-82e943c3dba7?w=600&auto=format&fit=crop&q=60", publicId: "mock_fan" }],
      sellerId: seller._id,
      status: "available"
    },
    {
      title: "Collapsible Canvas Laundry Basket",
      description: "Round fabric organizer hamper with handles. Large capacity, waterproof lining inside. Easy to fold when empty.",
      category: "Other",
      subcategory: "Home Utilities",
      price: 250,
      condition: "Like New",
      specifications: JSON.stringify({ dorm: "Hostel D", swap: true, details: "Grey, round canvas bag, collapsible" }),
      images: [{ url: "https://images.unsplash.com/photo-1545180853-7cd4c948276f?w=600&auto=format&fit=crop&q=60", publicId: "mock_laundry" }],
      sellerId: seller._id,
      status: "available"
    }
  ];

  await Product.create(products);
  console.log(`Seeding complete! Added ${products.length} products.`);
  process.exit(0);
}

run().catch(console.error);
