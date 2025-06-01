import {
  PrismaClient,
  Role,
  LocationType,
  LocationStatus,
  UserStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data (in reverse dependency order)
  await prisma.user.deleteMany({});
  await prisma.location.deleteMany({});

  console.log('🧹 Cleaned existing data');

  // Hash password for all test users
  const hashedPassword = await bcrypt.hash('password123', 10);
  console.log('🔐 Password hashed for test users');

  // Step 1: Create locations without managers first
  const locationsData = [
    {
      name: 'Central Warehouse Manila',
      type: LocationType.WAREHOUSE,
      status: LocationStatus.ACTIVE,
    },
    {
      name: 'Central Warehouse Cebu',
      type: LocationType.WAREHOUSE,
      status: LocationStatus.ACTIVE,
    },
    {
      name: 'BGC Construction Site',
      type: LocationType.SITE,
      status: LocationStatus.ACTIVE,
    },
    {
      name: 'Makati Tower Project',
      type: LocationType.SITE,
      status: LocationStatus.ACTIVE,
    },
    {
      name: 'Ortigas Commercial Complex',
      type: LocationType.SITE,
      status: LocationStatus.UNDER_MAINTENANCE,
    },
    {
      name: 'Alabang Residential Project',
      type: LocationType.SITE,
      status: LocationStatus.ACTIVE,
    },
  ];

  await prisma.location.createMany({
    data: locationsData,
  });

  const createdLocations = await prisma.location.findMany({
    orderBy: { name: 'asc' },
  });

  console.log(`✅ Created ${createdLocations.length} locations`);

  // Step 2: Create users
  const usersData = [
    {
      username: 'admin',
      passwordHash: hashedPassword,
      name: 'System Administrator',
      email: 'admin@company.com',
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
    {
      username: 'wh_manager_manila',
      passwordHash: hashedPassword,
      name: 'Jose Santos',
      email: 'jose.santos@company.com',
      role: Role.WAREHOUSE_MANAGER,
      status: UserStatus.ACTIVE,
      locationId: createdLocations.find(
        (l) => l.name === 'Central Warehouse Manila',
      )?.id,
    },
    {
      username: 'wh_manager_cebu',
      passwordHash: hashedPassword,
      name: 'Maria Garcia',
      email: 'maria.garcia@company.com',
      role: Role.WAREHOUSE_MANAGER,
      status: UserStatus.ACTIVE,
      locationId: createdLocations.find(
        (l) => l.name === 'Central Warehouse Cebu',
      )?.id,
    },
    {
      username: 'site_manager_bgc',
      passwordHash: hashedPassword,
      name: 'Robert Cruz',
      email: 'robert.cruz@company.com',
      role: Role.SITE_MANAGER,
      status: UserStatus.ACTIVE,
      locationId: createdLocations.find(
        (l) => l.name === 'BGC Construction Site',
      )?.id,
    },
    {
      username: 'site_manager_makati',
      passwordHash: hashedPassword,
      name: 'Anna Reyes',
      email: 'anna.reyes@company.com',
      role: Role.SITE_MANAGER,
      status: UserStatus.ACTIVE,
      locationId: createdLocations.find(
        (l) => l.name === 'Makati Tower Project',
      )?.id,
    },
    {
      username: 'site_manager_ortigas',
      passwordHash: hashedPassword,
      name: 'Miguel Torres',
      email: 'miguel.torres@company.com',
      role: Role.SITE_MANAGER,
      status: UserStatus.ACTIVE,
      locationId: createdLocations.find(
        (l) => l.name === 'Ortigas Commercial Complex',
      )?.id,
    },
    {
      username: 'site_manager_alabang',
      passwordHash: hashedPassword,
      name: 'Carmen Dela Cruz',
      email: 'carmen.delacruz@company.com',
      role: Role.SITE_MANAGER,
      status: UserStatus.ACTIVE,
      locationId: createdLocations.find(
        (l) => l.name === 'Alabang Residential Project',
      )?.id,
    },
    {
      username: 'inventory_master',
      passwordHash: hashedPassword,
      name: 'Luis Mendoza',
      email: 'luis.mendoza@company.com',
      role: Role.INVENTORY_MASTER,
      status: UserStatus.ACTIVE,
      locationId: createdLocations.find(
        (l) => l.name === 'Central Warehouse Manila',
      )?.id,
    },
    {
      username: 'purchaser1',
      passwordHash: hashedPassword,
      name: 'Sofia Hernandez',
      email: 'sofia.hernandez@company.com',
      role: Role.PURCHASER,
      status: UserStatus.ACTIVE,
      locationId: createdLocations.find(
        (l) => l.name === 'Central Warehouse Manila',
      )?.id,
    },
    {
      username: 'purchaser2',
      passwordHash: hashedPassword,
      name: 'Carlos Villanueva',
      email: 'carlos.villanueva@company.com',
      role: Role.PURCHASER,
      status: UserStatus.ACTIVE,
      locationId: createdLocations.find(
        (l) => l.name === 'Central Warehouse Cebu',
      )?.id,
    },
    {
      username: 'accounting1',
      passwordHash: hashedPassword,
      name: 'Diana Flores',
      email: 'diana.flores@company.com',
      role: Role.ACCOUNTING,
      status: UserStatus.ACTIVE,
    },
    {
      username: 'accounting2',
      passwordHash: hashedPassword,
      name: 'Benjamin Ramos',
      email: 'benjamin.ramos@company.com',
      role: Role.ACCOUNTING,
      status: UserStatus.ACTIVE,
    },
    {
      username: 'foreman_bgc1',
      passwordHash: hashedPassword,
      name: 'Ricardo Aquino',
      email: 'ricardo.aquino@company.com',
      role: Role.FOREMAN,
      status: UserStatus.ACTIVE,
      locationId: createdLocations.find(
        (l) => l.name === 'BGC Construction Site',
      )?.id,
    },
    {
      username: 'foreman_bgc2',
      passwordHash: hashedPassword,
      name: 'Elena Castro',
      email: 'elena.castro@company.com',
      role: Role.FOREMAN,
      status: UserStatus.ACTIVE,
      locationId: createdLocations.find(
        (l) => l.name === 'BGC Construction Site',
      )?.id,
    },
    {
      username: 'foreman_makati',
      passwordHash: hashedPassword,
      name: 'Gabriel Silva',
      email: 'gabriel.silva@company.com',
      role: Role.FOREMAN,
      status: UserStatus.ACTIVE,
      locationId: createdLocations.find(
        (l) => l.name === 'Makati Tower Project',
      )?.id,
    },
    {
      username: 'foreman_alabang',
      passwordHash: hashedPassword,
      name: 'Isabel Morales',
      email: 'isabel.morales@company.com',
      role: Role.FOREMAN,
      status: UserStatus.ACTIVE,
      locationId: createdLocations.find(
        (l) => l.name === 'Alabang Residential Project',
      )?.id,
    },
  ];

  await prisma.user.createMany({
    data: usersData,
  });

  const createdUsers = await prisma.user.findMany({
    orderBy: { name: 'asc' },
  });

  console.log(`✅ Created ${createdUsers.length} users`);

  // Step 3: Update locations with managers
  const locationManagerMappings = [
    {
      locationName: 'Central Warehouse Manila',
      managerUsername: 'wh_manager_manila',
    },
    {
      locationName: 'Central Warehouse Cebu',
      managerUsername: 'wh_manager_cebu',
    },
    {
      locationName: 'BGC Construction Site',
      managerUsername: 'site_manager_bgc',
    },
    {
      locationName: 'Makati Tower Project',
      managerUsername: 'site_manager_makati',
    },
    {
      locationName: 'Ortigas Commercial Complex',
      managerUsername: 'site_manager_ortigas',
    },
    {
      locationName: 'Alabang Residential Project',
      managerUsername: 'site_manager_alabang',
    },
  ];

  for (const mapping of locationManagerMappings) {
    const location = createdLocations.find(
      (l) => l.name === mapping.locationName,
    );
    const manager = createdUsers.find(
      (u) => u.username === mapping.managerUsername,
    );

    if (location && manager) {
      await prisma.location.update({
        where: { id: location.id },
        data: { managerId: manager.id },
      });
    }
  }

  console.log('✅ Updated locations with managers');

  // Display summary
  const finalUsers = await prisma.user.findMany({
    include: {
      location: {
        select: { name: true, type: true },
      },
      managedLocations: {
        select: { name: true, type: true },
      },
    },
    orderBy: { role: 'asc' },
  });

  const finalLocations = await prisma.location.findMany({
    include: {
      manager: {
        select: { name: true, username: true },
      },
      assignedUsers: {
        select: { name: true, username: true, role: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  console.log('\n📊 SEEDING SUMMARY:');
  console.log('===================');

  console.log('\n👥 USERS BY ROLE:');
  const usersByRole = finalUsers.reduce(
    (acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  for (const [role, count] of Object.entries(usersByRole)) {
    console.log(`  ${role}: ${count} users`);
  }

  console.log('\n🏢 LOCATIONS:');
  for (const location of finalLocations) {
    console.log(`  📍 ${location.name} (${location.type})`);
    console.log(`     Manager: ${location.manager?.name || 'None'}`);
    console.log(`     Assigned Users: ${location.assignedUsers.length}`);
    if (location.assignedUsers.length > 0) {
      for (const user of location.assignedUsers) {
        console.log(`       - ${user.name} (${user.role})`);
      }
    }
    console.log('');
  }

  console.log('\n🔑 DEFAULT LOGIN CREDENTIALS:');
  console.log('Username: admin | Password: password123');
  console.log('Username: wh_manager_manila | Password: password123');
  console.log('Username: site_manager_bgc | Password: password123');
  console.log('(All users have password: password123)');

  console.log('\n🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .then(() => {
    prisma.$disconnect();
  });
