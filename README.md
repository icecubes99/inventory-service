<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).


# Inventory and Procurement Management System

## Project Description

This project aims to develop a comprehensive, digitized system for managing material flow, procurement, inventory, and payment processes across a **Central Warehouse** and multiple **Distributed Sites**. The system centralizes control while enabling distributed requesting and receiving capabilities.

## Purpose

The primary goal is to streamline and automate the existing manual workflows for requesting, purchasing, receiving, and tracking materials. Key objectives include:

*   Providing real-time visibility into inventory levels across all locations.
*   Standardizing the material request and procurement process.
*   Improving accuracy in receiving and inventory updates.
*   Integrating the procurement process with accounting for payment management.
*   Enabling traceability of material movements and document flows.

## Key Features

*   **User Management:** Define different user roles (Admin, Purchaser, Inventory Master, Accounting, Foreman, Warehouse Manager) with role-based access control.
*   **Location Management:** Define and manage Central Warehouse and Site locations, including status and assignment of users/managers.
*   **Item Management:** Define and manage materials, including unique codes, descriptions, units of measurement, and status.
*   **Supplier Management:** Manage supplier information, including contact details, payment terms, status, and potentially linking to an internal manager.
*   **Material Request (MRF):** Sites can create and submit MRFs for materials, specifying quantity, need date, and classification (Borrow/Consume). Warehouse Managers can approve or reject requests.
*   **Purchase Order (PO):** Purchasing department (at Central Warehouse) can create POs to suppliers based on material needs. Supports linking to suppliers and managing line items.
*   **Delivery Receipt (DR):** Record material receipts from Suppliers (linked to POs) and internal transfers between locations (Central Warehouse to Site, Site to Site). DRs trigger inventory updates.
*   **Inventory Tracking:** Maintain real-time inventory levels for each item at each location.
*   **Inventory Transaction History:** Record detailed logs of all changes to inventory levels (receipts, issues, adjustments, transfers).
*   **Invoice Processing:** Record and track invoices received from suppliers, potentially linking them to related POs/DRs for verification.
*   **Payment Voucher (PV):** Accounting creates PVs to authorize payments based on processed invoices. Requires approval from the Warehouse Manager.
*   **Soft Deletes:** Important records are soft-deleted (marked as inactive) rather than permanently removed, preserving historical data and enabling recovery.
*   **Status Tracking:** Key entities and documents have status fields to indicate their current state in their lifecycle.
*   **Reporting:** Generate reports on inventory levels, movements, procurement activities, etc.

## Technical Stack

*   **Backend:** NestJS (Node.js framework)
*   **ORM:** Prisma
*   **Database:** PostgreSQL (configured via `DATABASE_URL`)
*   **Containerization:** Docker (recommended for consistent development and deployment)
*   **Frontend:** Next.js

## Data Model Overview (Prisma Schema)

The system's data is structured around the following key models and their relationships:

*   **`User`**: Represents system users with roles, status, and soft delete.
    *   `requestedBy` (`Mrf`): A User can request many MRFs. An MRF is requested by one User.
    *   `approvedBy` (`Mrf`, `PaymentVoucher`): A User can approve many MRFs/PVs. An MRF/PV is approved by one User (optional).
    *   `UserAssignedLocation` (`Location`): A User can be assigned to one Location (optional). A Location can have many assigned Users. (e.g., Site staff assigned to a Site).
    *   `LocationManager` (`Location`): A User can manage many Locations. A Location is managed by one User (optional). (e.g., Warehouse Manager for Central Warehouse).
    *   `ManagedSuppliers` (`Supplier`): A User can manage many Suppliers. A Supplier is managed by one User (optional). (e.g., Purchaser managing supplier relationships).
    *   `InventoryTransactionCreator` (`InventoryTransaction`): A User can initiate/record many Inventory Transactions. A Transaction is recorded by one User (optional).

*   **`Location`**: Represents the Central Warehouse or a Site, with type, status, and soft delete.
    *   `MrfFromLocation` (`Mrf`): A Location (Site) can originate many MRFs. An MRF originates from one Location.
    *   `DeliveryToLocation` (`DeliveryReceipt`): A Location can receive many Delivery Receipts. A DR is directed to one Location.
    *   `DeliveryFromLocation` (`DeliveryReceipt`): A Location can send many Delivery Receipts (Internal transfers). A DR originates from one Location (optional, null for supplier DRs).
    *   `InventoryItem` (`InventoryItem`): A Location has many Inventory Items (stock levels for different items at that place). An Inventory Item record belongs to one Location.

*   **`Item`**: Represents a material, with code, description, unit, status, and soft delete.
    *   Used in line items (`MrfLineItem`, `PoLineItem`, `DrLineItem`) and `InventoryItem`. An Item can appear on many line items and be tracked in many Inventory Items.

*   **`Supplier`**: Represents a vendor, with name, terms, contact info, status, soft delete, and link to internal manager.
    *   `PurchaseOrder` (`PurchaseOrder`): A Supplier receives many POs. A PO is for one Supplier.
    *   `Invoice` (`Invoice`): A Supplier sends many Invoices. An Invoice is from one Supplier.

*   **`Mrf`**: Material Request Form (Document), with status, classification (Borrow/Consume), soft delete, and links to requesting User and Location.
    *   `MrfLineItem` (`MrfLineItem`): An MRF contains many Line Items. A Line Item belongs to one MRF.
    *   *Traceability:* Complex Many-to-Many links to `Po` and `Dr` (likely at the line item level) are needed for full fulfillment tracking but are not fully detailed in this core schema version.

*   **`PurchaseOrder`**: Purchase Order (Document), with status, soft delete, and link to Supplier.
    *   `PoLineItem` (`PoLineItem`): A PO contains many Line Items. A Line Item belongs to one PO.
    *   `DeliveryReceipt` (`DeliveryReceipt`): A PO can have many Delivery Receipts (partial deliveries). A Supplier DR relates to one PO (optional).
    *   *Traceability:* Complex links to `Mrf` and `Invoice` (likely at the line item level) are needed for full tracking.

*   **`DeliveryReceipt`**: Delivery Receipt (Document), with type (Supplier/Internal/Adjustment), status, soft delete, and links to locations (from/to). Supplier DRs link to a PO.
    *   `DrLineItem` (`DrLineItem`): A DR contains many Line Items. A Line Item belongs to one DR.
    *   `DrInventoryTransaction` / `DrLineItemInventoryTransaction` (`InventoryTransaction`): A DR (or DR Line Item) triggers one or more Inventory Transactions.

*   **`Invoice`**: Invoice (Document), with status, soft delete, and link to Supplier. Has a composite unique constraint `@@unique([supplierId, invoiceNumber])`.
    *   `PaymentVoucher` (`PaymentVoucher`): An Invoice can be paid by many PVs, and a PV can pay many Invoices (Many-to-Many).
    *   *Consideration:* An `InvoiceLineItem` model might be added for detailed invoice processing.

*   **`PaymentVoucher`**: Payment Voucher (Document), with status, soft delete, and link to approving User.
    *   `Invoice` (`Invoice`): Many-to-Many with Invoice.

*   **`InventoryItem`**: Represents the current stock level of an Item at a specific Location.
    *   `InventoryTransaction` (`InventoryTransaction`): An Inventory Item record has many historical Transactions. A Transaction relates to one Inventory Item record. Has a composite unique constraint `@@unique([locationId, itemId])`.

*   **`InventoryTransaction`**: Represents a single change to an Inventory Item's quantity, with transaction type, quantity change, resulting quantity, user, timestamp, and links to originating documents/line items (DR, MRF, etc.). Provides historical tracking.

*(Note: Relationships involving `Decimal` types for quantities/amounts and `DateTime?` for soft deletes are implemented as discussed.)*

## How the Application Works (Core Workflows)

1.  **Material Request:** A `User` with a `FOREMAN` role at a `SITE` creates an **MRF** specifying required `Item`s and `quantity` (Borrow/Consume). The MRF is linked to the originating Site (`fromLocation`) and the requesting User (`requestedBy`).
2.  **MRF Approval:** The **MRF** is sent to the `CENTRAL_WAREHOUSE` system. A `User` with the `WAREHOUSE_MANAGER` role reviews the MRF and changes its status to APPROVED or REJECTED, setting the `approvedBy` user and `dateApproved`. They may adjust `approvedQuantity`.
3.  **Fulfillment (from Central Warehouse Stock):** If the MRF is approved and the `CENTRAL_WAREHOUSE` has stock, materials are prepared for dispatch. An `INTERNAL` type **DR** is created, documenting the transfer from the `CENTRAL_WAREHOUSE` (`fromLocation`) to the requesting `SITE` (`toLocation`). The DR references the fulfilled MRF line items (ideally).
4.  **Receiving (at Site):** The receiving Site receives the materials and confirms the **DR**. When the DR status is marked as `RECEIVED` (or `PROCESSED`), the system automatically creates `InventoryTransaction` records and updates the `quantity` in the relevant `InventoryItem` record at the receiving `SITE`.
5.  **Procurement (if C. Warehouse needs stock):** If the `CENTRAL_WAREHOUSE` doesn't have stock (or needs to replenish), the need triggers the procurement process. This might involve the `CENTRAL_WAREHOUSE` system (or a `PURCHASER` user) generating a procurement request internally, leading to the creation of a **PO**.
6.  **Purchase Order Creation:** A `User` with the `PURCHASER` role creates a **PO** for the required `Item`s, linking it to a `Supplier`. The PO details quantities, prices, and payment terms. The status becomes `SENT`.
7.  **Receiving (from Supplier):** The `Supplier` delivers materials to the `CENTRAL_WAREHOUSE`. A `SUPPLIER` type **DR** is created/recorded upon receipt at the `CENTRAL_WAREHOUSE` (`toLocation`). This DR is linked to the relevant **PO**. The DR can reflect partial deliveries.
8.  **Inventory Update (from Supplier DR):** When the Supplier **DR** status is marked as `RECEIVED` (or `PROCESSED`), the system automatically creates `InventoryTransaction` records and updates the `quantity` in the relevant `InventoryItem` record at the `CENTRAL_WAREHOUSE`. The PO status is updated (e.g., to PARTIALLY_RECEIVED or FULLY_RECEIVED).
9.  **Invoicing:** The `Supplier` sends an **Invoice** to the `CENTRAL_WAREHOUSE`. The **Invoice** is recorded in the system, linked to the Supplier, and potentially matched against the related PO(s) and DR(s) by `ACCOUNTING` or `WAREHOUSE_MANAGER` users. Its status progresses (RECEIVED -> PROCESSED -> APPROVED_FOR_PAYMENT).
10. **Payment Authorization:** An `ACCOUNTING` `User` creates a **Payment Voucher (PV)**, linking it to one or more `Invoice`s approved for payment. The PV requires approval from a `WAREHOUSE_MANAGER`.
11. **Payment:** Once the **PV** status is APPROVED, the `ACCOUNTING` `User` can execute the payment (check, transfer) and mark the PV status as `PAID`, recording the date and method.

Inventory levels are constantly tracked via the `InventoryItem` model, and all movements are logged in `InventoryTransaction` for historical analysis. User roles control access and authorized actions at each step. Soft deletes preserve historical data.
