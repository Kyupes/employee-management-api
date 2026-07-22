/** @param {import('node-pg-migrate').MigrationBuilder}
pgm */

exports.up = (pgm) => {
    pgm.createTable('users', {
        id: { type: 'serial', primaryKey: true },
        email: { type: 'VARCHAR(255)', notNull: true, unique: true },
        password_hash: { type: 'VARCHAR(255)', notNull: true },
        created_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('CURRENT_TIMESTAMP')} ,
        role: { type: 'VARCHAR(10)', notNull: true, default: 'user', check: "role IN ('user', 'admin')"}
    });

    pgm.createTable('employees', {
        id: { type: 'serial', primaryKey: true },
        name: { type: 'VARCHAR(255)', notNull: true },
        role: { type: 'VARCHAR(255)', notNull: true },
        salary: { type: 'INTEGER', notNull: true },
        active: { type: 'BOOLEAN', notNull: true },
        userId: { type: 'INTEGER', notNull: true, references: 'users', onDelete: 'CASCADE' }
    });

    pgm.createIndex('employees', 'userId');
};

/** @param {import('node-pg-migrate').MigrationBuilder}
pgm */

exports.down = (pgm) => {
    pgm.dropTable('employees');
    pgm.dropTable('users');
};