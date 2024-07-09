[Nest] 91946  - 07/09/2024, 2:25:16 PM   ERROR [TypeOrmModule] Unable to connect to the database. Retrying (1)...
TypeORMError: Entity metadata for Manager#user was not found. Check if you specified a correct entity object and if it's connected in the connection options.
    at <anonymous> (/Users/subvind/Projects/fleetvrp/node_modules/typeorm/metadata-builder/src/metadata-builder/EntityMetadataBuilder.ts:1121:23)
    at Array.forEach (<anonymous>)
    at EntityMetadataBuilder.computeInverseProperties (/Users/subvind/Projects/fleetvrp/node_modules/typeorm/metadata-builder/src/metadata-builder/EntityMetadataBuilder.ts:1111:34)
    at <anonymous> (/Users/subvind/Projects/fleetvrp/node_modules/typeorm/metadata-builder/src/metadata-builder/EntityMetadataBuilder.ts:158:18)
    at Array.forEach (<anonymous>)
    at EntityMetadataBuilder.build (/Users/subvind/Projects/fleetvrp/node_modules/typeorm/metadata-builder/src/metadata-builder/EntityMetadataBuilder.ts:157:25)
    at ConnectionMetadataBuilder.buildEntityMetadatas (/Users/subvind/Projects/fleetvrp/node_modules/typeorm/connection/src/connection/ConnectionMetadataBuilder.ts:106:11)
    at DataSource.buildMetadatas (/Users/subvind/Projects/fleetvrp/node_modules/typeorm/data-source/src/data-source/DataSource.ts:710:13)
    at DataSource.initialize (/Users/subvind/Projects/fleetvrp/node_modules/typeorm/data-source/src/data-source/DataSource.ts:263:13)