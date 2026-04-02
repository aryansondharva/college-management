const db = require('./src/config/database');
const bcrypt = require('bcryptjs');

const students = [
    // Image 3 - Section A (251100107001 to 025)
    { enroll: '251100107001', first: 'ARYAN', last: 'SONDHARVA', gender: 'male' },
    { enroll: '251100107002', first: 'ASHWIN', last: 'NACHIKET KAMLESH', gender: 'male' },
    { enroll: '251100107003', first: 'AYUSHKUMAR', last: 'ASHOKKUMAR RAJPUR', gender: 'male' },
    { enroll: '251100107004', first: 'KAVYA', last: 'ANILBHAI BAROT', gender: 'male' },
    { enroll: '251100107005', first: 'ANKIT', last: 'LAXMAN CHAUHAN', gender: 'male' },
    { enroll: '251100107006', first: 'NISHID', last: 'RASIKBHAI CHOTALIYA', gender: 'male' },
    { enroll: '251100107007', first: 'DURVA', last: 'NIRAVKUMAR DESAI', gender: 'female' },
    { enroll: '251100107008', first: 'JAYESH', last: 'KANUBHAI DESHMUKH', gender: 'male' },
    { enroll: '251100107009', first: 'DESHMUKH', last: 'RITESH KIRAN', gender: 'male' },
    { enroll: '251100107010', first: 'JEMISH', last: 'DHARMESHKUMAR GANDHI', gender: 'male' },
    { enroll: '251100107011', first: 'GANDHI', last: 'NEEL RAJESHBHAI', gender: 'male' },
    { enroll: '251100107012', first: 'JADAV', last: 'SMIT CHANDRASINH', gender: 'male' },
    { enroll: '251100107013', first: 'JANISH', last: 'RAKESHKUMAR PATEL', gender: 'male' },
    { enroll: '251100107014', first: 'SHREY', last: 'DHYESHBHAI KANSARA', gender: 'male' },
    { enroll: '251100107015', first: 'SHLOK', last: 'ASHOKBHAI KANTARIYA', gender: 'male' },
    { enroll: '251100107016', first: 'KATI', last: 'HETALBEN KHIMJIBHAI', gender: 'female' },
    { enroll: '251100107017', first: 'KAZI', last: 'AALIYA MUSTAK-ALI', gender: 'female' },
    { enroll: '251100107018', first: 'ABHISHEK', last: 'BABULAL KHATAJ', gender: 'male' },
    { enroll: '251100107019', first: 'HETVI', last: 'GIRISHBHAI LAD', gender: 'female' },
    { enroll: '251100107020', first: 'JURI', last: 'DAYANANDBHAI LAD', gender: 'female' },
    { enroll: '251100107021', first: 'MAHEK', last: 'JAYBHAI PATEL', gender: 'female' },
    { enroll: '251100107022', first: 'GUPTA', last: 'MAHEK SUJIV', gender: 'female' },
    { enroll: '251100107023', first: 'MAKWANA', last: 'DHRUVI AMITBHAI', gender: 'female' },
    { enroll: '251100107024', first: 'MANSURI', last: 'UBEDBHAI CHOUDHARY', gender: 'male' },
    { enroll: '251100107025', first: 'PALAK', last: 'RAJESH MISHRA', gender: 'female' },

    // Image 5 - Section A (251100107026 to 050)
    { enroll: '251100107026', first: 'MISTRY', last: 'EKTA CHANDRAKANT', gender: 'female' },
    { enroll: '251100107027', first: 'VISHAL', last: 'NILESHBHAI MISTRY', gender: 'male' },
    { enroll: '251100107028', first: 'SUNAINA', last: 'RIYAZ MULLA', gender: 'female' },
    { enroll: '251100107029', first: 'MANN', last: 'DHAVAL NAIK', gender: 'male' },
    { enroll: '251100107030', first: 'RAJI', last: 'DIXIT NAIK', gender: 'female' },
    { enroll: '251100107031', first: 'NIKEE', last: 'KAMLESHBHAI PATEL', gender: 'female' },
    { enroll: '251100107032', first: 'PARMAR', last: 'NIDHI GOVIND', gender: 'female' },
    { enroll: '251100107033', first: 'YATRI', last: 'JAYESHBHAI PARMAR', gender: 'female' },
    { enroll: '251100107034', first: 'FENIL', last: 'JAYESHBHAI PATEL', gender: 'male' },
    { enroll: '251100107035', first: 'ABHAY', last: 'BHAVESHBHAI PATEL', gender: 'male' },
    { enroll: '251100107036', first: 'ADITYA', last: 'SHAILESHKUMAR PATEL', gender: 'male' },
    { enroll: '251100107037', first: 'PATEL', last: 'ARCHIBEN RAJESHBHAI', gender: 'female' },
    { enroll: '251100107038', first: 'PATEL', last: 'ARIK ARUNBHAI', gender: 'male' },
    { enroll: '251100107039', first: 'ARYAN', last: 'NILESHBHAI PATEL', gender: 'male' },
    { enroll: '251100107040', first: 'PATEL', last: 'ASIFKUMAR ANILBHAI', gender: 'male' },
    { enroll: '251100107041', first: 'AYUSHI', last: 'SHILEYBHAI PATEL', gender: 'female' },
    { enroll: '251100107042', first: 'AYUSHI', last: 'VIKAS PATEL', gender: 'female' },
    { enroll: '251100107043', first: 'BHUMIKA', last: 'VINODKUMAR PATEL', gender: 'female' },
    { enroll: '251100107044', first: 'CHIRAG', last: 'HARSHADBHAI PATEL', gender: 'male' },
    { enroll: '251100107045', first: 'DHARA', last: 'SURESHCHANDRA PATEL', gender: 'female' },
    { enroll: '251100107046', first: 'DHARMEE', last: 'JATINKUMAR PATEL', gender: 'female' },
    { enroll: '251100107047', first: 'DHEYKUMAR', last: 'JAYESHBHAI PATEL', gender: 'male' },
    { enroll: '251100107048', first: 'DHRUV', last: 'NITESHBHAI PATEL', gender: 'male' },
    { enroll: '251100107049', first: 'DHRUVI', last: 'MANOJKUMAR PATEL', gender: 'female' },
    { enroll: '251100107050', first: 'DISHA', last: 'SANJAYKUMAR PATEL', gender: 'female' },

    // Image 2 - Section A (251100107051 to 071)
    { enroll: '251100107051', first: 'DRASHTI', last: 'CHINUBHAI PATEL', gender: 'female' },
    { enroll: '251100107052', first: 'HELI', last: 'YOGESHBHAI PATEL', gender: 'female' },
    { enroll: '251100107053', first: 'HEREE', last: 'UMENDRAKUMAR PATEL', gender: 'female' },
    { enroll: '251100107054', first: 'HERI', last: 'JAYENDRAKUMAR PATEL', gender: 'male' },
    { enroll: '251100107055', first: 'HERINKUMAR', last: 'ARJUNBHAI PATEL', gender: 'male' },
    { enroll: '251100107056', first: 'PATEL', last: 'HERRY MUKESHBHAI', gender: 'male' },
    { enroll: '251100107057', first: 'PATEL', last: 'HINAL KAUSHIKKUMAR', gender: 'female' },
    { enroll: '251100107058', first: 'ISHITA', last: 'DIVYESHKUMAR PATEL', gender: 'female' },
    { enroll: '251100107059', first: 'JASH', last: 'GANPATBHAI PATEL', gender: 'male' },
    { enroll: '251100107060', first: 'PATEL', last: 'JEET ARUNBHAI', gender: 'male' },
    { enroll: '251100107061', first: 'JENIL', last: 'RAJESHKUMAR PATEL', gender: 'male' },
    { enroll: '251100107062', first: 'PATEL', last: 'JIYA MITESH', gender: 'female' },
    { enroll: '251100107063', first: 'KARANBHAI', last: 'SHANKARBHAI PATEL', gender: 'male' },
    { enroll: '251100107064', first: 'KHUSHI', last: 'MUKUNDBHAI PATEL', gender: 'female' },
    { enroll: '251100107065', first: 'KRISHKUMAR', last: 'MUKESHKUMAR PATEL', gender: 'male' },
    { enroll: '251100107066', first: 'KRISHKUMAR', last: 'RASHMIKANT PATEL', gender: 'male' },
    { enroll: '251100107067', first: 'KRUZIL', last: 'MINESHKUMAR PATEL', gender: 'male' },
    { enroll: '251100107068', first: 'LAY', last: 'DIPEPBHAI PATEL', gender: 'male' },
    { enroll: '251100107069', first: 'LIZA', last: 'KANTIBHAI PATEL', gender: 'female' },
    { enroll: '251100107070', first: 'MAHEK', last: 'PRITESHBHAI PATEL', gender: 'female' },
    { enroll: '251100107071', first: 'MAHEK', last: 'KIRANKUMAR PATEL', gender: 'female' },

    // The Missing Row (072 - 075)
    { enroll: '251100107072', first: 'MANAN', last: 'SHASHIKANT PATEL', gender: 'male' },
    { enroll: '251100107073', first: 'MANKUMAR', last: 'ASHOKBHAI PATEL', gender: 'male' },
    { enroll: '251100107074', first: 'PATEL', last: 'MAYANK SATISHBHAI', gender: 'male' },
    { enroll: '251100107075', first: 'MEET', last: 'UMESHBHAI PATEL', gender: 'male' },

    // Image 1 - Section B (251100107076 to 100)
    { enroll: '251100107076', first: 'MIRAL', last: 'BAKULBHAI PATEL', gender: 'female' },
    { enroll: '251100107077', first: 'PATEL', last: 'NAITIK JITENDRA', gender: 'male' },
    { enroll: '251100107078', first: 'POOJABEN', last: 'JAGDISHBHAI PATEL', gender: 'female' },
    { enroll: '251100107079', first: 'PRACHI', last: 'RASIKBHAI PATEL', gender: 'female' },
    { enroll: '251100107080', first: 'PRATHAMKUMAR', last: 'JAYATIBHAI PATEL', gender: 'male' },
    { enroll: '251100107081', first: 'RAJ', last: 'SHAILESHBHAI PATEL', gender: 'male' },
    { enroll: '251100107082', first: 'RITIKA', last: 'ASHOKKUMAR PATEL', gender: 'female' },
    { enroll: '251100107083', first: 'PATEL', last: 'RIYAKUMAR CHANDUBHAI', gender: 'male' },
    { enroll: '251100107084', first: 'RUTVI', last: 'NARESHBHAI PATEL', gender: 'female' },
    { enroll: '251100107085', first: 'SHRADDHA', last: 'SHAILESHBHAI PATEL', gender: 'female' },
    { enroll: '251100107086', first: 'SHRIYANSHI', last: 'KAPILBHAI PATEL', gender: 'female' },
    { enroll: '251100107087', first: 'SIDDHI', last: 'SANJAYKUMAR PATEL', gender: 'female' },
    { enroll: '251100107088', first: 'TISHA', last: 'ALKESHBHAI PATEL', gender: 'female' },
    { enroll: '251100107089', first: 'TISHA', last: 'RAJESHKUMAR PATEL', gender: 'female' },
    { enroll: '251100107090', first: 'TIYA', last: 'DILIPBHAI PATEL', gender: 'female' },
    { enroll: '251100107091', first: 'PATEL', last: 'UNNATIBEN RAJESHBHAI', gender: 'female' },
    { enroll: '251100107092', first: 'PATEL', last: 'VAIDEHI VINAYKUMAR', gender: 'female' },
    { enroll: '251100107093', first: 'VANSH', last: 'PRAFULKUMAR PATEL', gender: 'male' },
    { enroll: '251100107094', first: 'PATEL', last: 'VANSHIKA KIRANBHAI', gender: 'female' },
    { enroll: '251100107095', first: 'VRAJ', last: 'BHAVINKUMAR PATEL', gender: 'male' },
    { enroll: '251100107096', first: 'PATEL', last: 'VYOM RAMESHBHAI', gender: 'male' },
    { enroll: '251100107097', first: 'PATEL', last: 'YAKSH DHARMESHBHAI', gender: 'male' },
    { enroll: '251100107098', first: 'PATEL', last: 'YUTIBEN BHAVESHKUMAR', gender: 'female' },
    { enroll: '251100107099', first: 'PATEL', last: 'MARRY SHEHULKUMAR', gender: 'female' },
    { enroll: '251100107100', first: 'PATHAN', last: 'FARAKHAN SAIKHAN', gender: 'male' },

    // Image 4 - Section B (251100107101 to 125)
    { enroll: '251100107101', first: 'PAWAR', last: 'SUYASH DINESHBHAI', gender: 'male' },
    { enroll: '251100107102', first: 'RABADIYA', last: 'ADITYA DIPAKBHAI', gender: 'male' },
    { enroll: '251100107103', first: 'RAI', last: 'JAYESHBHAI PATEL', gender: 'male' },
    { enroll: '251100107104', first: 'NAYAK', last: 'RAJ PREM', gender: 'male' },
    { enroll: '251100107105', first: 'RAJPUROHIT', last: 'PRAMITSINGH KIRWANSINGH', gender: 'male' },
    { enroll: '251100107106', first: 'DEVASHISH', last: 'KALPESHBHAI RAJPUT', gender: 'male' },
    { enroll: '251100107107', first: 'RAJPUT', last: 'RAJVEER PUSHPRAJ', gender: 'male' },
    { enroll: '251100107108', first: 'RAJVI', last: 'KAMLESHKUMAR PATEL', gender: 'female' },
    { enroll: '251100107109', first: 'RIYAN', last: 'JABIRBHAI GADATIA', gender: 'male' },
    { enroll: '251100107110', first: 'GAYATRIBEN', last: 'RAMESHBHAI SAKA', gender: 'female' },
    { enroll: '251100107111', first: 'SHAH', last: 'SHAURYA PARIMALKUMAR', gender: 'male' },
    { enroll: '251100107112', first: 'SHARMA', last: 'ADITYA MANISH', gender: 'male' },
    { enroll: '251100107113', first: 'MAYANK', last: 'MANOJ SINGH', gender: 'male' },
    { enroll: '251100107114', first: 'NISHITKUMAR', last: 'RAJENDRABHAI SINGH', gender: 'male' },
    { enroll: '251100107115', first: 'TAKSHIN', last: 'FAKIRMAHAMMAD', gender: 'male' },
    { enroll: '251100107116', first: 'ARYAN', last: 'LAXMANBHAI TAILOR', gender: 'male' },
    { enroll: '251100107117', first: 'TANDEL', last: 'AASTHA DILIPKUMAR', gender: 'female' },
    { enroll: '251100107118', first: 'ANGEL', last: 'KHANDUBHAI TANDEL', gender: 'female' },
    { enroll: '251100107119', first: 'TANDEL', last: 'AYUSHI KISHORBHAI', gender: 'female' },
    { enroll: '251100107120', first: 'BHUMI', last: 'KIRITBHAI TANDEL', gender: 'female' },
    { enroll: '251100107121', first: 'TANDEL', last: 'DHRUTI MAHENDRA', gender: 'female' },
    { enroll: '251100107122', first: 'TANDEL', last: 'FALAK DAYARAMBHAI', gender: 'female' },
    { enroll: '251100107123', first: 'HENSI', last: 'HITESHBHAI TANDEL', gender: 'female' },
    { enroll: '251100107124', first: 'JEEL', last: 'ASHOKBHAI TANDEL', gender: 'female' },
    { enroll: '251100107125', first: 'TANDEL', last: 'MAITRI TEJAS', gender: 'female' },

    // Final Page - Section B (251100107126 to 142)
    { enroll: '251100107126', first: 'TANDEL', last: 'MANSI BHAGESHBHAI', gender: 'female' },
    { enroll: '251100107127', first: 'TANDEL', last: 'NANDANI NILAMKUMAR', gender: 'female' },
    { enroll: '251100107128', first: 'NEEL', last: 'KIRTIKUMAR TANDEL', gender: 'male' },
    { enroll: '251100107129', first: 'TANDEL', last: 'NIDHI ISHWARBHAI', gender: 'female' },
    { enroll: '251100107130', first: 'NIDHIBEN', last: 'KANUBHAI TANDEL', gender: 'female' },
    { enroll: '251100107131', first: 'TANDEL', last: 'NIRBHIKA PARESHBHAI', gender: 'female' },
    { enroll: '251100107132', first: 'PRAKRUTI', last: 'PRAVINCHANDRA TANDEL', gender: 'female' },
    { enroll: '251100107133', first: 'SENINA', last: 'RAJNIKANT TANDEL', gender: 'female' },
    { enroll: '251100107134', first: 'VAIBHAV', last: 'DINESH TIWARI', gender: 'male' },
    { enroll: '251100107135', first: 'TUSHIL', last: 'RAMESHBHAI PATEL', gender: 'male' },
    { enroll: '251100107136', first: 'KUMKUM', last: 'JITENDRA VARMA', gender: 'female' },
    { enroll: '251100107137', first: 'VINIT', last: 'JAGDISH RAVAT', gender: 'male' },
    { enroll: '251100107138', first: 'PATEL', last: 'VISHWABEN KAILASHBHAI', gender: 'female' },
    { enroll: '251100107139', first: 'YADAV', last: 'GUDDU HARIRAM', gender: 'male' },
    { enroll: '251100107140', first: 'HETVI', last: 'MAHESHBHAI ZALAVADIYA', gender: 'female' },
    { enroll: '251100107141', first: 'ZALAVADIYA', last: 'SUJAL PARESHBHAI', gender: 'male' },
    { enroll: '251100107142', first: 'ZEEL', last: 'RAVINDRAKUMAR PATEL', gender: 'female' },
];

async function seed() {
    const defaultPassword = await bcrypt.hash('student123', 10);
    const sessionId = 3; 
    const classId = 2; // Sem-2
    const sectA = 3;
    const sectB = 4;

    for (const s of students) {
        try {
            // Check if already exists
            const check = await db.query('SELECT id FROM users WHERE enrollment_no = $1', [s.enroll]);
            if (check.rows.length > 0) {
                console.log(`Skipping ${s.enroll} - already exists`);
                continue;
            }

            // --- NAME SEPARATION LOGIC ---
            // ID card format typically: First Mid Last or Last First Mid
            // But user said: Miral Bakulbhai Patel (First Father Last)
            const parts = `${s.first} ${s.last}`.split(' ');
            let firstName = parts[0];
            let fatherName = parts.length > 2 ? parts[1] : ''; // Middle part
            let lastName = parts[parts.length - 1];

            // Re-adjust for users table: keep it as First Last
            // Insert into users
            const userRes = await db.query(
                `INSERT INTO users (first_name, last_name, email, password, gender, role, enrollment_no)
                 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
                [firstName, lastName, `${s.enroll}@college.com`, defaultPassword, s.gender, 'student', s.enroll]
            );
            const userId = userRes.rows[0].id;

            // Insert into student_parent_infos
            if (fatherName) {
                await db.query(
                    `INSERT INTO student_parent_infos (student_id, father_name) VALUES ($1, $2)`,
                    [userId, fatherName]
                );
            }

            // Determine Section
            const enrollNum = parseInt(s.enroll.slice(-3));
            const targetSection = enrollNum <= 71 ? sectA : sectB;

            // Insert academic info
            await db.query(
                `INSERT INTO student_academic_infos (student_id, session_id, class_id, section_id)
                 VALUES ($1, $2, $3, $4)`,
                [userId, sessionId, classId, targetSection]
            );

            console.log(`✅ Seeded ${firstName} (Father: ${fatherName}) ${lastName} -> Sec ${enrollNum <= 71 ? 'A' : 'B'}`);
        } catch (err) {
            console.error(`❌ Error seeding ${s.enroll}:`, err.message);
        }
    }
    console.log('Seeding finished!');
    process.exit(0);
}

seed();
