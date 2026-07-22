require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...');

        const firstUserResult = await pool.query(`
            INSERT INTO users (email, password_hash, role)
            VALUES ('first_user@test.com', '$2b$10$t9caSjKchXp1InL3tFLeceehC0Tqriy.8TmxJBIxd/vF0OVMGEWxC', 'user')
            RETURNING id;
            `);
        const userId1 = firstUserResult.rows[0].id;
        console.log('✅ Created user with ID:', userId1);

        const secondUserResult = await pool.query(`
            INSERT INTO users (email, password_hash, role)
            VALUES ('second_user@test.com', '$2b$10$fNW5VXw9LgiRL358dm.sOuVvneGF6/vTlPD/Z1VG3JCG4z1zTnnmy', 'user')
            RETURNING id;
            `);
        const userId2 = secondUserResult.rows[0].id;
        console.log('✅ Created user with ID:', userId2);

        const thirdUserResult = await pool.query(`
            INSERT INTO users (email, password_hash, role)
            VALUES ('third_user@test.com', '$2b$10$q32RyekJhCIFNMkGKvC6OO7BE3o6QmyoKzqzmKP.0tCPvTLOb6/Ly', 'user')
            RETURNING id;
            `);
        const userId3 = thirdUserResult.rows[0].id;
        console.log('✅ Created user with ID:', userId3);

        const adminUserResult = await pool.query(`
            INSERT INTO users (email, password_hash, role)
            VALUES ('admin@test.com', '$2b$10$zIB8eEZQlxug3gtp9FbZx.35l1AXXXBP2jk/yHvHDrITQxMPVCrQK', 'admin')
            RETURNING id;
            `);
        const adminId = adminUserResult.rows[0].id;
        console.log('✅ Created admin user with ID:', adminId);


        await pool.query(`
            INSERT INTO employees (name, role, salary, active, "userId")
            VALUES
            ('Alice Johnson', 'Backend Developer', 5200, true, $1),
            ('Bruno Silva', 'Frontend Developer', 4800, true, $1),
            ('Carlos Mendes', 'Full Stack Developer', 6700, false, $1),
            ('Diana Costa', 'QA Engineer', 4300, true, $1),
            ('Ethan Walker', 'DevOps Engineer', 7800, true, $1),
            ('Fernanda Lima', 'Backend Developer', 6100, false, $1),
            ('Gabriel Souza', 'Mobile Developer', 5900, true, $1),
            ('Hannah Scott', 'UI/UX Designer', 4600, true, $1),
            ('Igor Almeida', 'Data Engineer', 8200, true, $1),
            ('Julia Martins', 'Project Manager', 8500, false, $1);
            `, [userId1]);
        console.log('✅ Created sample employees for user with id:', userId1);

        await pool.query(`
            INSERT INTO employees (name, role, salary, active, "userId")
            VALUES
            ('Kevin Brown', 'Backend Developer', 5500, true, $1),
            ('Larissa Rocha', 'Business Analyst', 4900, true, $1),
            ('Mateus Ferreira', 'System Administrator', 6200, false, $1),
            ('Natalie Green', 'QA Engineer', 4700, true, $1),
            ('Otavio Ribeiro', 'Backend Developer', 7300, true, $1),
            ('Patricia Gomes', 'HR Specialist', 4200, true, $1),
            ('Rafaela Nunes', 'Frontend Developer', 5100, false, $1),
            ('Samuel Oliveira', 'Data Scientist', 9400, true, $1),
            ('Tatiana Pereira', 'Product Manager', 8900, true, $1),
            ('Ulysses Carter', 'Backend Developer', 6800, false, $1);
            `, [userId2]);
        console.log('✅ Created sample employees for user with id:', userId2);

        await pool.query(`
            INSERT INTO employees (name, role, salary, active, "userId")
            VALUES
            ('Vanessa Barbosa', 'Scrum Master', 7300, true, $1),
            ('William Turner', 'Cloud Engineer', 8700, true, $1),
            ('Xavier Lopes', 'Support Engineer', 3900, false, $1),
            ('Yasmin Cardoso', 'Database Administrator', 7600, true, $1),
            ('Zachary Evans', 'Full Stack Developer', 7000, true, $1),
            ('Amanda Teixeira', 'Backend Developer', 5600, true, $1),
            ('Diego Ramos', 'DevOps Engineer', 8100, false, $1),
            ('Elisa Moreira', 'QA Engineer', 4500, true, $1),
            ('Felipe Duarte', 'Backend Developer', 6400, true, $1),
            ('Quentin Hall', 'Security Engineer', 9100, true, $1);
            `, [userId3]);
        console.log('✅ Created sample employees for user with id:', userId3);

        console.log('🎉 Database seeding completed successfully!');
    } catch (err) {
        console.error('❌ Error seeding database:', err);
    } finally {
        await pool.end();
    }
};

seedDatabase();