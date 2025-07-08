// This script initializes the database by running Prisma migrations and seeding the database with initial data

import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Simple password hashing function
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Run Prisma migrations and generate client
function runMigrations() {
  try {
    console.log('Running Prisma migrations...');
    execSync('npx prisma migrate dev --name init --schema prisma/schema.prisma', { stdio: 'inherit' });
    console.log('Migrations completed successfully.');
    
    console.log('Generating Prisma client...');
    execSync('npx prisma generate --schema prisma/schema.prisma', { stdio: 'inherit' });
    console.log('Prisma client generated successfully.');
  } catch (error) {
    console.error('Error running migrations or generating client:', error);
    process.exit(1);
  }
}

// Seed the database with initial data
async function seedDatabase() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'file:../prisma/dev.db'
      }
    }
  });

  try {
    console.log('Seeding database with initial data...');

    // Clear existing users and dependent data
    await prisma.user.deleteMany({});
    // Optionally clear other tables if needed (e.g., startups, company members, invitations, milestones, etc.)
    // await prisma.startup.deleteMany({});
    // await prisma.companyMember.deleteMany({});
    // await prisma.invitation.deleteMany({});
    // await prisma.milestone.deleteMany({});

    // Create admin user
    const adminPassword = await hashPassword('admin123');
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: adminPassword,
        name: 'Admin User',
        role: 'ADMIN',
        adminProfile: {
          create: {
            department: 'IT',
            permissions: 'all',
          },
        },
        profile: {
          create: {
            bio: 'System administrator',
          },
        },
      },
    });
    console.log('Created admin user:', admin.email);

    // Create program manager user
    const pmPassword = await hashPassword('manager123');
    const programManager = await prisma.user.create({
      data: {
        email: 'manager@example.com',
        password: pmPassword,
        name: 'Program Manager',
        role: 'PROGRAM_MANAGER',
        programManagerProfile: {
          create: {
            programs: 'Startup Accelerator, Tech Incubator',
            responsibilities: 'Program management, mentorship coordination',
          },
        },
        profile: {
          create: {
            bio: 'Experienced program manager',
          },
        },
      },
    });
    console.log('Created program manager user:', programManager.email);

    // Create mentor user
    const mentorPassword = await hashPassword('mentor123');
    const mentor = await prisma.user.create({
      data: {
        email: 'mentor@example.com',
        password: mentorPassword,
        name: 'Mentor User',
        role: 'MENTOR',
        mentorProfile: {
          create: {
            expertise: 'Software Development, Product Management',
            experience: '10+ years in tech industry',
            availability: 'Weekdays, evenings',
          },
        },
        profile: {
          create: {
            bio: 'Experienced tech mentor',
          },
        },
      },
    });
    console.log('Created mentor user:', mentor.email);

    // Create investor user
    const investorPassword = await hashPassword('investor123');
    const investor = await prisma.user.create({
      data: {
        email: 'investor@example.com',
        password: investorPassword,
        name: 'Investor User',
        role: 'INVESTOR',
        investorProfile: {
          create: {
            companyName: 'Tech Ventures',
            investmentFocus: 'SaaS, AI, Fintech',
            investmentStage: 'Seed, Series A',
            investmentSize: '$50K - $500K',
          },
        },
        profile: {
          create: {
            bio: 'Angel investor with focus on tech startups',
          },
        },
      },
    });
    console.log('Created investor user:', investor.email);

    // (Removed legacy startup user creation - replaced by entrepreneur user)
    // Create judge user
    const judgePassword = await hashPassword('judge123');
    const judge = await prisma.user.create({
      data: {
        email: 'judge@example.com',
        password: judgePassword,
        name: 'Judge User',
        role: 'JUDGE',
        judgeProfile: {
          create: {
            specialty: 'Technical Innovation, Business Model',
            experience: 'Judged 10+ hackathons',
          },
        },
        profile: {
          create: {
            bio: 'Experienced hackathon judge',
          },
        },
      },
    });
    console.log('Created judge user:', judge.email);

    // Create participant user
    const participantPassword = await hashPassword('participant123');
    const participant = await prisma.user.create({
      data: {
        email: 'participant@example.com',
        password: participantPassword,
        name: 'Participant User',
        role: 'PARTICIPANT',
        participantProfile: {
          create: {
            skills: 'JavaScript, React, Node.js',
            interests: 'Web Development, Mobile Apps',
            education: 'Computer Science Degree',
            experience: '2 years of development experience',
          },
        },
        profile: {
          create: {
            bio: 'Passionate developer looking to build innovative solutions',
          },
        },
      },
    });
    console.log('Created participant user:', participant.email);

    // Create entrepreneur user
    const entrepreneurPassword = await hashPassword('c');
    const entrepreneur = await prisma.user.create({
      data: {
        email: 'entrepreneur@example.com',
        password: entrepreneurPassword,
        name: 'Entrepreneur User',
        role: 'ENTREPRENEUR',
        entrepreneurProfile: {
          create: {
            organizationName: 'InnovateX',
            industry: 'Technology',
            focusAreas: 'AI, SaaS, Fintech',
            programLength: '6 months',
            website: 'https://innovatex.example.com',
            description: 'Building the next generation of tech solutions',
          },
        },
        profile: {
          create: {
            bio: 'Entrepreneur passionate about building impactful startups',
            avatar: null,
            phone: '+966500000000',
            address: 'Riyadh, Saudi Arabia',
            city: 'Riyadh',
            country: 'Saudi Arabia',
            position: 'Founder & CEO',
          },
        },
      },
    });
    console.log('Created entrepreneur user:', entrepreneur.email);

    // Create a sample hackathon
    const hackathon = await prisma.hackathon.create({
      data: {
        name: 'هاكاثون التقنية المالية',
        description: 'هاكاثون لتطوير حلول مبتكرة في مجال التقنية المالية',
        startDate: new Date('2025-04-01'),
        endDate: new Date('2025-04-07'),
        location: 'الرياض، المملكة العربية السعودية',
        status: 'UPCOMING',
        teams: {
          create: [
            {
              name: 'فريق AI Innovators',
              members: 4,
              project: 'نظام ذكاء اصطناعي للكشف المبكر عن الأمراض',
              status: 'ACTIVE',
            },
            {
              name: 'فريق Tech Wizards',
              members: 3,
              project: 'منصة لإدارة المشاريع باستخدام الذكاء الاصطناعي',
              status: 'ACTIVE',
            },
          ],
        },
        judges: {
          create: [
            {
              name: 'Judge User',
              specialty: 'Technical Innovation, Business Model',
            },
            {
              name: 'أحمد محمد',
              specialty: 'User Experience, Design',
            },
          ],
        },
        prizes: {
          create: [
            {
              rank: 'المركز الأول',
              amount: '50,000 ريال',
            },
            {
              rank: 'المركز الثاني',
              amount: '30,000 ريال',
            },
            {
              rank: 'المركز الثالث',
              amount: '20,000 ريال',
            },
          ],
        },
        timeline: {
          create: [
            {
              date: new Date('2025-04-01'),
              event: 'بداية الهاكاثون',
            },
            {
              date: new Date('2025-04-03'),
              event: 'عرض التقدم المرحلي',
            },
            {
              date: new Date('2025-04-07'),
              event: 'العروض النهائية وإعلان الفائزين',
            },
          ],
        },
      },
    });
    console.log('Created sample hackathon:', hackathon.name);

    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Main function to initialize the database
async function initDatabase() {
  runMigrations();
  await seedDatabase();
  console.log('Database initialization completed successfully.');
}

// Run the initialization
initDatabase().catch((error) => {
  console.error('Database initialization failed:', error);
  process.exit(1);
});
