const db = require('./src/config/database');

const students = [
    { enroll: '251100107071', first: 'MAHI', last: 'PATEL', mid: 'KIRANKUMAR', dob: '2008-04-15', bg: 'B+Ve', phone: '6351477730', addr: 'Morli, Talav Faliya, Ta- Gandevi, Dist- Navsari - 396310' },
    { enroll: '251100107072', first: 'MANAN', last: 'PATEL', mid: 'SHASHIKANT', dob: '2006-12-12', bg: 'O+Ve', phone: '8780987778', addr: 'Antalia, G.I.D.C. Bilimora, Opp. Gujrat Swa Mill, Gandevi, Navsari - 396321' },
    { enroll: '251100107073', first: 'MANKUMAR', last: 'PATEL', mid: 'ASHOKBHAI', dob: '2008-02-21', bg: 'O+Ve', phone: '7862871892', addr: 'Malvan Agar Faliya, Ta- Valsad, Dist- Valsad - 396385' },
    { enroll: '251100107074', first: 'MAYANK', last: 'PATEL', mid: 'SATISHBHAI', dob: '2008-01-25', bg: 'B+Ve', phone: '9313738774', addr: 'Malvan Agar Faliya, Ta- Valsad, Dist- Valsad - 396385' },
    { enroll: '251100107075', first: 'MEET', last: 'PATEL', mid: 'UMESHBHAI', dob: '2007-07-18', bg: 'O+Ve', phone: '9408143365', addr: 'Nandarkha (Patel Faliya), Ta- Gandevi, Dist- Navsari - 396325' }
];

async function update() {
    for (const s of students) {
        try {
            const userRes = await db.query(
                `UPDATE users 
                 SET first_name = $1, last_name = $2, birthday = $3, blood_type = $4, phone = $5, address = $6 
                 WHERE enrollment_no = $7 RETURNING id`,
                [s.first, s.last, s.dob, s.bg, s.phone, s.addr, s.enroll]
            );

            if (userRes.rows.length > 0) {
                const userId = userRes.rows[0].id;
                await db.query(
                    'UPDATE student_parent_infos SET father_name = $1 WHERE student_id = $2',
                    [s.mid, userId]
                );
                console.log(`✅ Updated ${s.enroll}: ${s.first} ${s.mid} ${s.last}`);
            } else {
                console.log(`❌ Student ${s.enroll} not found`);
            }
        } catch (err) {
            console.error(`❌ Error updating ${s.enroll}:`, err.message);
        }
    }
    console.log('Update finished!');
    process.exit(0);
}

update();
