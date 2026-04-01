const db = require('./src/config/database');

(async () => {
    try {
        await db.query('DELETE FROM routines');
        console.log('Cleared routines table.');
        
        const class_id = 21; // 2nd Semester on Session 3
        const secRes = await db.query("SELECT id FROM sections WHERE name = 'A' AND class_id = 21");
        const section_id = secRes.rows[0].id; // probably 41 based on previous output id: 41...
        const session_id = 3;

        const coursesRes = await db.query('SELECT id, name FROM courses WHERE class_id = 21');
        
        const coursesMap = {};
        coursesRes.rows.forEach(c => coursesMap[c.name] = c.id);

        const schedule = [
            { day: 'Monday', start: '08:50', end: '09:50', course_id: coursesMap['Basic Mechanical Engineering'], room: 'D7-105' },
            { day: 'Monday', start: '09:50', end: '10:50', course_id: coursesMap['Maths-II'], room: 'D7-105' },
            { day: 'Monday', start: '11:10', end: '13:10', course_id: coursesMap['Programming for Problem Solving'], room: 'Central Computer Lab' },
            { day: 'Monday', start: '13:30', end: '15:30', course_id: coursesMap['Digital Fabrication Workshop'], room: 'D1-202' },

            { day: 'Tuesday', start: '08:50', end: '09:50', course_id: coursesMap['Maths-II'], room: 'D7-105' },
            { day: 'Tuesday', start: '09:50', end: '10:50', course_id: coursesMap['English for Technical Communication'], room: 'D7-105' },
            { day: 'Tuesday', start: '11:10', end: '13:10', course_id: coursesMap['Basic Mechanical Engineering'], room: 'D3-203' },
            { day: 'Tuesday', start: '13:30', end: '15:30', course_id: coursesMap['Design Thinking'], room: 'D7-105' },

            { day: 'Wednesday', start: '08:50', end: '09:50', course_id: coursesMap['Fundamental of AI'], room: 'D7-105' },
            { day: 'Wednesday', start: '09:50', end: '10:50', course_id: coursesMap['Maths-II'], room: 'D7-105' },
            { day: 'Wednesday', start: '11:10', end: '12:10', course_id: coursesMap['Basic Mechanical Engineering'], room: 'D7-105' },
            { day: 'Wednesday', start: '12:10', end: '13:10', course_id: coursesMap['Programming for Problem Solving'], room: 'D7-105' },
            { day: 'Wednesday', start: '13:30', end: '15:30', course_id: coursesMap['Digital Fabrication Workshop'], room: 'D1-202' },

            { day: 'Thursday', start: '08:50', end: '09:50', course_id: coursesMap['Programming for Problem Solving'], room: 'D7-105' },
            { day: 'Thursday', start: '09:50', end: '10:50', course_id: coursesMap['Fundamental of AI'], room: 'D7-105' },
            { day: 'Thursday', start: '11:10', end: '12:10', course_id: coursesMap['Maths-II'], room: 'D7-105' },
            { day: 'Thursday', start: '12:10', end: '13:10', course_id: coursesMap['Basic Mechanical Engineering'], room: 'D7-105' },
            { day: 'Thursday', start: '13:30', end: '15:30', course_id: coursesMap['English for Technical Communication'], room: 'D7-105' },

            { day: 'Friday', start: '08:50', end: '09:50', course_id: coursesMap['Basic Mechanical Engineering'], room: 'D7-105' },
            { day: 'Friday', start: '09:50', end: '10:50', course_id: coursesMap['English for Technical Communication'], room: 'D7-105' },
            { day: 'Friday', start: '11:10', end: '13:10', course_id: coursesMap['Programming for Problem Solving'], room: 'Central Computer Lab' },
            { day: 'Friday', start: '13:30', end: '15:30', course_id: coursesMap['Design Thinking'], room: 'D7-105' }
        ];

        for (const item of schedule) {
            await db.query(
                `INSERT INTO routines (class_id, section_id, session_id, course_id, day_of_week, start_time, end_time, room_no) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [class_id, section_id, session_id, item.course_id, item.day, item.start, item.end, item.room]
            );
        }

        console.log('Successfully inserted routines into correct class 21, section ', section_id);
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
})();
