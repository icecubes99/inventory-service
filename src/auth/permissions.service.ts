import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, LocationType } from '@prisma/client';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async canManageLocation(
    userId: string,
    locationId: string,
  ): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        managedLocations: {
          where: { id: locationId },
        },
      },
    });

    if (!user) return false;

    // ADMIN can manage any location
    if (user.role === Role.ADMIN) return true;

    // Check if user is specifically assigned as manager of this location
    return user.managedLocations.some((location) => location.id === locationId);
  }

  async canManageAnyWarehouse(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        managedLocations: {
          where: { type: LocationType.WAREHOUSE, deletedAt: null },
        },
      },
    });

    if (!user) return false;

    // ADMIN can manage any warehouse
    if (user.role === Role.ADMIN) return true;

    // Check if user manages any warehouse and has the WAREHOUSE_MANAGER role
    // Or if they are an ADMIN (already covered)
    // Or if their role is WAREHOUSE_MANAGER and they are assigned to at least one warehouse
    return (
      user.role === Role.WAREHOUSE_MANAGER && user.managedLocations.length > 0
    );
  }

  async canManageAnySite(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        managedLocations: {
          where: { type: LocationType.SITE, deletedAt: null },
        },
      },
    });

    if (!user) return false;

    // ADMIN can manage any site
    if (user.role === Role.ADMIN) return true;

    // Check if user manages any site and has the SITE_MANAGER role
    // Or if they are an ADMIN (already covered)
    // Or if their role is SITE_MANAGER and they are assigned to at least one site
    return user.role === Role.SITE_MANAGER && user.managedLocations.length > 0;
  }

  /**
   * Checks if a user has a role that allows them to create locations.
   * Currently, ADMIN and WAREHOUSE_MANAGER can create locations.
   * SITE_MANAGER might also be able to create sites they are responsible for,
   * but the initial setup is often done by a WAREHOUSE_MANAGER or ADMIN.
   */
  async canCreateLocation(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) return false;

    return user.role === Role.ADMIN || user.role === Role.WAREHOUSE_MANAGER;
  }
}
