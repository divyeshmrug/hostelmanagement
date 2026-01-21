/**
 * Lumina Hostel Management System - Multi-Role Core Logic
 */

const App = {
    // Data Model
    state: {
        superAdmin: { id: 'divyesh112006', password: '123' }, // Custom Super Admin UID format
        hostels: [], // { id, name, rectorPassword, rectorName, rectorId, rectorEmail, totalRooms, rooms: [{ number, type: 'AC'|'Non-AC', floor, capacity, occupants: [], amenities: [], rent, status: 'Vacant'|'Occupied'|'Maintenance' }], phone }
        students: [], // { id, name, hostelId, room, password, joinedDate, phone, email, guardianName, guardianPhone, guardianRelation, bloodGroup, emergencyContact, lastLogin }
        pendingStudents: [], // { id, name, hostelId, password, requestDate }
        messReviews: [], // { id, hostelId, studentName, rating, comment, date }
        complaints: [], // { id, type, description, status, studentId, hostelId, date }
        notices: [], // { id, title, content, hostelId, date }
        leaves: [], // { id, studentId, hostelId, type, startDate, endDate, reason, status, requestDate }
        messMenus: [], // { id, hostelId, breakfast, lunch, dinner, lastUpdated }
        fees: [], // { id, studentId, hostelId, amount, dueDate, status: 'paid'|'pending'|'overdue', paidDate, reminderSent }
        chats: [], // { from, to, message, timestamp }
        amenities: [], // { id, type, studentId, timeSlot, date }
        systemReports: [] // { id, reporterId, role, issue, date, status: 'New'|'In Progress'|'Fixed' }
    },

    helpers: {
        generateStudentId(name, hostelName, registeredCount) {
            const sPrefix = name.substring(0, 2).toUpperCase();
            const hPrefix = hostelName.substring(0, 2).toUpperCase();
            const year = new Date().getFullYear();
            const count = String(registeredCount).padStart(2, '0');
            const random = Math.floor(100 + Math.random() * 900); // 3 digits
            return `${sPrefix}${hPrefix}${year}${count}${random}`;
        },
        generateRectorId(rectorName, hostelName) {
            const rName = rectorName.replace(/\s+/g, '');
            const hName = hostelName.substring(0, 4);
            const random = Math.floor(10000 + Math.random() * 90000); // 5 digits
            return `${rName}${hName}${random}`;
        },
        generateAdminId(adminName) {
            return `${adminName}112006`;
        },
        getAIResponse(query, conversationHistory = []) {
            const q = query.toLowerCase().trim();
            const user = App.currentUser;
            const state = App.state;

            // Contextual data
            const hostel = state.hostels.find(h => h.id === user.data.hostelId);
            const menu = state.messMenus.find(m => m.hostelId === user.data.hostelId);
            const userFees = state.fees.filter(f => f.studentId === user.data.id);
            const notices = state.notices.filter(n => n.hostelId === user.data.hostelId).slice(-3);
            const myComplaints = state.complaints.filter(c => c.studentId === user.data.id);
            const myLeaves = state.leaves.filter(l => l.studentId === user.data.id);
            const pendingFees = userFees.filter(f => f.status !== 'paid');
            const hostelStudents = state.students.filter(s => s.hostelId === user.data.hostelId);

            // Intent Detection
            const intents = {
                greeting: /^(hi|hello|hey|good morning|good evening|good afternoon|sup|yo)/,
                farewell: /^(bye|goodbye|see you|thanks|thank you|ok|okay)/,
                help: /(help|what can you do|assist|support|guide)/,
                fees: /(fee|payment|pay|due|pending|amount|money|rupee|₹)/,
                mess: /(mess|food|menu|breakfast|lunch|dinner|meal|eat)/,
                notice: /(notice|announcement|news|update|inform)/,
                leave: /(leave|gate pass|permission|go home|vacation|holiday)/,
                complaint: /(complaint|issue|problem|broken|not working|repair|maintenance)/,
                room: /(room|roommate|hostel mate|who lives|accommodation)/,
                health: /(health|sick|ill|doctor|medical|emergency|hospital|medicine)/,
                academic: /(study|exam|test|assignment|homework|grade|marks|college|class)/,
                social: /(friend|lonely|bored|activity|event|fun|party)/,
                technical: /(app|how to|tutorial|use|feature|button|click)/,
                personal: /(how are you|who are you|your name|what are you)/,
                time: /(time|date|day|today|tomorrow|when)/,
                weather: /(weather|rain|hot|cold|temperature)/
            };

            // Detect primary intent
            let primaryIntent = 'general';
            for (const [intent, pattern] of Object.entries(intents)) {
                if (pattern.test(q)) {
                    primaryIntent = intent;
                    break;
                }
            }

            // Check for context from previous conversation
            const lastMessage = conversationHistory.length > 0 ? conversationHistory[conversationHistory.length - 1] : null;
            const hasContext = lastMessage && (q.includes('yes') || q.includes('no') || q.includes('how') || q.includes('what') || q.includes('more'));

            // Response Generation based on Intent
            switch (primaryIntent) {
                case 'greeting':
                    const greetings = [
                        `Hello ${user.data.name}! 😊 I'm Lumina AI, your personal hostel assistant. How can I help you today?`,
                        `Hey ${user.data.name}! 👋 Great to see you! What can I assist you with?`,
                        `Hi there! I'm here to make your hostel life easier. What would you like to know?`,
                        `Hello! I'm Lumina AI, ready to help with anything from fees to food to fun! What's on your mind?`
                    ];
                    return greetings[Math.floor(Math.random() * greetings.length)];

                case 'farewell':
                    const farewells = [
                        `You're welcome! Feel free to ask me anything anytime. Have a great day! 😊`,
                        `Happy to help! Take care and enjoy your day at ${hostel ? hostel.name : 'the hostel'}! 👋`,
                        `Glad I could assist! Don't hesitate to reach out if you need anything else. Bye! 🌟`,
                        `Anytime! Wishing you a wonderful day ahead! 🎉`
                    ];
                    return farewells[Math.floor(Math.random() * farewells.length)];

                case 'help':
                    return `I'm your AI assistant and I can help you with:\n\n` +
                        `💰 **Fees & Payments** - Check pending fees, payment status\n` +
                        `🍽️ **Mess & Food** - Today's menu, timings, reviews\n` +
                        `📢 **Notices** - Latest announcements and updates\n` +
                        `🚪 **Gate Pass** - Apply for leave, check status\n` +
                        `🔧 **Complaints** - Report issues, track status\n` +
                        `🏠 **Room Info** - Your room details, hostel mates\n` +
                        `📚 **Study Help** - Tips, time management, motivation\n` +
                        `🏥 **Health** - Emergency contacts, medical help\n` +
                        `❓ **App Guide** - How to use features\n\n` +
                        `Just ask me anything! I'm here 24/7 to help. 😊`;

                case 'fees':
                    if (userFees.length === 0) {
                        return `You don't have any fee records yet. Once your fees are assigned, I'll help you track and manage them! 💰`;
                    }
                    if (pendingFees.length === 0) {
                        return `🎉 Excellent news! All your fees are paid up. You're all clear!\n\nWould you like to see your payment history?`;
                    }
                    const nextFee = pendingFees[0];
                    let feeResponse = `💰 **Fee Status Update**\n\n`;
                    feeResponse += `You have **${pendingFees.length} pending fee(s)**:\n\n`;
                    feeResponse += `📌 Next Payment:\n`;
                    feeResponse += `   Amount: ₹${nextFee.amount}\n`;
                    feeResponse += `   Due Date: ${nextFee.dueDate}\n\n`;
                    feeResponse += `💡 **Tip**: You can pay your fees in the 'Fees' section. Click on the fee to see payment options!\n\n`;
                    if (pendingFees.length > 1) {
                        feeResponse += `You have ${pendingFees.length - 1} more pending fee(s). Stay on top of them to avoid late fees!`;
                    }
                    return feeResponse;

                case 'mess':
                    if (!menu) {
                        return `😕 The mess menu hasn't been updated yet for today. \n\nUsually, the rector updates it in the morning. You can check back later or visit the 'Mess' section for updates!\n\nWould you like me to tell you about mess timings or how to submit a review?`;
                    }
                    let messResponse = `🍽️ **Today's Mess Menu at ${hostel ? hostel.name : 'your hostel'}**\n\n`;
                    messResponse += `☀️ **Breakfast**: ${menu.breakfast}\n`;
                    messResponse += `🌞 **Lunch**: ${menu.lunch}\n`;
                    messResponse += `🌙 **Dinner**: ${menu.dinner}\n\n`;
                    messResponse += `Last updated: ${menu.lastUpdated}\n\n`;
                    messResponse += `💭 Don't forget to share your feedback in the Mess section! Your reviews help improve the food quality.`;
                    return messResponse;

                case 'notice':
                    if (notices.length === 0) {
                        return `📢 No recent notices for your hostel right now. You're all caught up!\n\nI'll let you know when there are new announcements. You can also check the 'Notices' section anytime.`;
                    }
                    const latestNotice = notices[notices.length - 1];
                    let noticeResponse = `📢 **Latest Notice**\n\n`;
                    noticeResponse += `**${latestNotice.title}**\n`;
                    noticeResponse += `${latestNotice.content}\n\n`;
                    noticeResponse += `Posted: ${latestNotice.date}\n\n`;
                    if (notices.length > 1) {
                        noticeResponse += `📋 You have ${notices.length} recent notices. Check the 'Notices' section to see all of them!`;
                    }
                    return noticeResponse;

                case 'leave':
                    const pendingLeaves = myLeaves.filter(l => l.status === 'Pending');
                    const approvedLeaves = myLeaves.filter(l => l.status === 'Approved');

                    let leaveResponse = `🚪 **Gate Pass & Leave Information**\n\n`;
                    if (pendingLeaves.length > 0) {
                        leaveResponse += `⏳ You have ${pendingLeaves.length} pending leave request(s) waiting for rector approval.\n\n`;
                    }
                    if (approvedLeaves.length > 0) {
                        leaveResponse += `✅ You have ${approvedLeaves.length} approved leave(s).\n\n`;
                    }
                    leaveResponse += `📝 **How to apply for leave:**\n`;
                    leaveResponse += `1. Go to 'Gate Pass' section\n`;
                    leaveResponse += `2. Fill in the dates and reason\n`;
                    leaveResponse += `3. Submit for rector approval\n`;
                    leaveResponse += `4. You'll be notified once it's reviewed\n\n`;
                    leaveResponse += `💡 **Tip**: Apply at least 2-3 days in advance for better chances of approval!`;
                    return leaveResponse;

                case 'complaint':
                    if (q.includes('how') || q.includes('file') || q.includes('submit')) {
                        return `🔧 **How to File a Complaint**\n\n` +
                            `1. Go to the 'Complaints' section\n` +
                            `2. Select complaint type (Maintenance, Food, Cleanliness, etc.)\n` +
                            `3. Describe the issue in detail\n` +
                            `4. Submit - Your rector will be notified\n` +
                            `5. Track status in the same section\n\n` +
                            `⚡ **For emergencies** (electrical, plumbing), mark it as urgent!\n\n` +
                            `Your complaints are taken seriously and usually resolved within 24-48 hours.`;
                    }
                    if (myComplaints.length === 0) {
                        return `You haven't filed any complaints yet. If you're facing any issues with your room, mess, or facilities, don't hesitate to report them in the 'Complaints' section!\n\nI can guide you through the process if you'd like. 😊`;
                    }
                    const pendingComplaints = myComplaints.filter(c => c.status === 'Pending');
                    let complaintResponse = `🔧 **Your Complaints Status**\n\n`;
                    complaintResponse += `Total complaints: ${myComplaints.length}\n`;
                    if (pendingComplaints.length > 0) {
                        complaintResponse += `⏳ Pending: ${pendingComplaints.length}\n\n`;
                        complaintResponse += `Your pending complaints are being reviewed. The rector typically responds within 24 hours.`;
                    } else {
                        complaintResponse += `✅ All your complaints have been addressed!\n\n`;
                        complaintResponse += `If you have any new issues, feel free to file another complaint.`;
                    }
                    return complaintResponse;

                case 'room':
                    const roommates = hostelStudents.filter(s => s.room === user.data.room && s.id !== user.data.id);
                    let roomResponse = `🏠 **Your Room Information**\n\n`;
                    roomResponse += `Room Number: **${user.data.room}**\n`;
                    roomResponse += `Hostel: **${hostel ? hostel.name : 'N/A'}**\n`;
                    roomResponse += `Your UID: **${user.data.id}**\n\n`;
                    if (roommates.length > 0) {
                        roomResponse += `👥 **Roommates:**\n`;
                        roommates.forEach(rm => {
                            roomResponse += `   • ${rm.name} (${rm.id})\n`;
                        });
                    } else {
                        roomResponse += `You currently don't have any roommates listed. You might be in a single room or your roommate info hasn't been updated yet.`;
                    }
                    return roomResponse;

                case 'health':
                    return `🏥 **Health & Medical Assistance**\n\n` +
                        `**Emergency Contacts:**\n` +
                        `🚑 Ambulance: 108\n` +
                        `🏥 Hostel Medical Room: Contact Rector\n` +
                        `📞 Rector: Available in Settings\n\n` +
                        `**For Medical Issues:**\n` +
                        `• Minor issues: Visit hostel medical room\n` +
                        `• Serious issues: Call 108 immediately\n` +
                        `• Mental health: Reach out to hostel counselor\n\n` +
                        `**Feeling unwell?**\n` +
                        `1. Inform your rector via complaint/message\n` +
                        `2. Apply for medical leave if needed\n` +
                        `3. Keep your guardian informed\n\n` +
                        `💚 Your health is priority! Don't hesitate to seek help.`;

                case 'academic':
                    return `📚 **Study Tips & Academic Support**\n\n` +
                        `**Time Management:**\n` +
                        `• Create a study schedule and stick to it\n` +
                        `• Use the Pomodoro technique (25 min study, 5 min break)\n` +
                        `• Prioritize difficult subjects during peak focus hours\n\n` +
                        `**Exam Preparation:**\n` +
                        `• Start revision at least 2 weeks before exams\n` +
                        `• Make summary notes and flashcards\n` +
                        `• Practice previous year papers\n` +
                        `• Form study groups with hostel mates\n\n` +
                        `**Staying Motivated:**\n` +
                        `• Set small, achievable goals\n` +
                        `• Reward yourself after completing tasks\n` +
                        `• Take regular breaks to avoid burnout\n` +
                        `• Remember: You've got this! 💪\n\n` +
                        `Need help with anything specific? Just ask!`;

                case 'social':
                    return `🎉 **Social Life & Activities**\n\n` +
                        `**Making Friends:**\n` +
                        `• Join hostel common areas during free time\n` +
                        `• Participate in hostel events and activities\n` +
                        `• Be friendly and approachable\n` +
                        `• Start conversations in the mess or study rooms\n\n` +
                        `**Feeling Lonely?**\n` +
                        `• Reach out to your roommates\n` +
                        `• Join study groups or hobby clubs\n` +
                        `• Attend hostel gatherings\n` +
                        `• Talk to the hostel counselor if needed\n\n` +
                        `**Fun Activities:**\n` +
                        `• Check the Notices section for upcoming events\n` +
                        `• Organize game nights with hostel mates\n` +
                        `• Explore nearby areas on weekends\n\n` +
                        `Remember: Everyone feels this way sometimes. You're not alone! 🤗`;

                case 'technical':
                    return `💻 **App Usage Guide**\n\n` +
                        `**Navigation:**\n` +
                        `• Use the sidebar menu to switch between sections\n` +
                        `• Dashboard shows your quick overview\n` +
                        `• Each section has specific features\n\n` +
                        `**Key Features:**\n` +
                        `📊 **Dashboard**: Overview of your hostel life\n` +
                        `💰 **Fees**: View and pay pending fees\n` +
                        `🍽️ **Mess**: Menu, reviews, feedback\n` +
                        `📢 **Notices**: Important announcements\n` +
                        `🚪 **Gate Pass**: Apply for leave\n` +
                        `🔧 **Complaints**: Report issues\n` +
                        `💬 **Chat**: Message your rector\n` +
                        `🤖 **AI Assistant**: That's me! Ask anything\n\n` +
                        `**Need specific help?** Just tell me which feature you want to learn about!`;

                case 'personal':
                    if (q.includes('how are you')) {
                        return `I'm doing great, thank you for asking! 😊 I'm always here and ready to help you.\n\nMore importantly, how are YOU doing? Is there anything I can help you with today?`;
                    }
                    if (q.includes('who are you') || q.includes('what are you')) {
                        return `I'm **Lumina AI**, your intelligent hostel assistant! 🤖✨\n\n` +
                            `I'm here to make your hostel life easier by helping you with:\n` +
                            `• Managing fees and payments\n` +
                            `• Checking mess menus and notices\n` +
                            `• Filing complaints and leave applications\n` +
                            `• Providing study tips and emotional support\n` +
                            `• Answering questions about hostel life\n\n` +
                            `Think of me as your 24/7 hostel buddy who's always ready to help! 😊`;
                    }
                    return `I'm Lumina AI, your personal hostel assistant! I'm here to help make your hostel experience better. What can I do for you today?`;

                case 'time':
                    const now = new Date();
                    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                    const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                    return `🕐 **Current Time**: ${timeStr}\n📅 **Date**: ${dateStr}\n\nIs there anything else you'd like to know?`;

                case 'weather':
                    return `I don't have access to live weather data, but I can suggest:\n\n` +
                        `☀️ Check your phone's weather app\n` +
                        `🌐 Visit weather.com or similar sites\n` +
                        `📱 Ask your hostel mates about current conditions\n\n` +
                        `Is there anything else I can help you with?`;

                default:
                    // General conversation and fallback
                    if (q.includes('thank')) {
                        return `You're very welcome! 😊 I'm always here if you need anything else. Have a great day!`;
                    }
                    if (q.includes('joke')) {
                        const jokes = [
                            `Why did the student bring a ladder to the hostel? Because they wanted to go to high school! 😄`,
                            `What's a hostel student's favorite type of music? Anything with good "dorm-beats"! 🎵`,
                            `Why don't hostel students ever get lost? Because they always find their way back to the mess! 🍽️😂`
                        ];
                        return jokes[Math.floor(Math.random() * jokes.length)];
                    }

                    // Smart fallback with suggestions
                    return `I'm not quite sure about that, but I'm here to help! 🤔\n\n` +
                        `I can assist you with:\n` +
                        `• Checking your fees and payments\n` +
                        `• Today's mess menu\n` +
                        `• Recent notices and announcements\n` +
                        `• Applying for gate pass/leave\n` +
                        `• Filing complaints\n` +
                        `• Study tips and motivation\n` +
                        `• Health and emergency info\n\n` +
                        `Try asking me something like:\n` +
                        `"What's for lunch?" or "Do I have pending fees?" or "How do I apply for leave?"\n\n` +
                        `What would you like to know? 😊`;
            }
        },
        searchData(type, query) {
            const q = query.toLowerCase().trim();
            if (!q) return type === 'rectors' ? App.state.hostels : App.state.students;

            if (type === 'rectors') {
                return App.state.hostels.filter(h =>
                    h.rectorName.toLowerCase().includes(q) ||
                    h.name.toLowerCase().includes(q) ||
                    (h.rectorId && h.rectorId.toLowerCase().includes(q))
                );
            } else if (type === 'students') {
                return App.state.students.filter(s =>
                    s.name.toLowerCase().includes(q) ||
                    s.id.toLowerCase().includes(q) ||
                    (s.email && s.email.toLowerCase().includes(q))
                );
            }
            return [];
        }
    },

    currentUser: null, // { role: 'super_admin' | 'rector' | 'student', data: ... }

    // Initialization
    init() {
        this.loadState();
        if (this.state.hostels.length === 0) {
            this.seedDemoData();
        }
        this.render();
    },

    loadState() {
        const savedData = localStorage.getItem('luminaHostelData_v2');
        if (savedData) {
            try {
                const loaded = JSON.parse(savedData);
                this.state = { ...this.state, ...loaded };
                // Enforce Super Admin Override
                this.state.superAdmin = { id: 'divyesh112006', password: '123' };
            } catch (e) {
                console.error("Data Corruption Detected. resetting state.", e);
                // If parse fails, we continue with default/empty state to allow re-seeding
                localStorage.removeItem('luminaHostelData_v2');
            }

            // Fix: Ensure arrays exist to prevent crashes
            if (!this.state.hostels) this.state.hostels = [];
            if (!this.state.students) this.state.students = [];
            if (!this.state.pendingStudents) this.state.pendingStudents = [];
            if (!this.state.messReviews) this.state.messReviews = [];
            if (!this.state.complaints) this.state.complaints = [];
            if (!this.state.notices) this.state.notices = [];
            if (!this.state.leaves) this.state.leaves = [];
            if (!this.state.messMenus) this.state.messMenus = [];
            if (!this.state.fees) this.state.fees = [];
            if (!this.state.chats) this.state.chats = [];
            if (!this.state.amenities) this.state.amenities = [];
            if (!this.state.systemReports) this.state.systemReports = [];

            // Seed Custom Users if they don't exist
            // 1. Nilesh (Rector)
            if (!this.state.hostels.find(h => h.id === 'nilesh')) {
                this.state.hostels.push({
                    id: 'nilesh',
                    name: 'Nilesh Hostel',
                    rectorName: 'Nilesh',
                    rectorId: 'nilesh',
                    rectorEmail: 'nilesh@hostel.com',
                    rectorPassword: '123',
                    totalRooms: 50,
                    rooms: Array.from({ length: 50 }, (_, i) => ({ id: (101 + i).toString(), capacity: 2, occupants: [] })),
                    avatar: null
                });
            }

            // 2. Manav (Student)
            if (!this.state.students.find(s => s.id === 'manav')) {
                // Ensure there is a hostel for Manav to join (Nilesh's hostel)
                const targetHostel = this.state.hostels.find(h => h.id === 'nilesh');
                if (targetHostel) {
                    // Find an available room in Nilesh Hostel
                    const room101 = targetHostel.rooms.find(r => r.id === '101');
                    if (room101) {
                        room101.occupants.push('manav');
                    }

                    this.state.students.push({
                        id: 'manav',
                        name: 'Manav',
                        password: '123',
                        hostelId: 'nilesh',
                        // hostelName: 'Nilesh Hostel', // This property is derived, not stored
                        room: '101',
                        joinedDate: new Date().toLocaleDateString(),
                        avatar: null,
                        phone: '9876543210'
                    });
                }
            }

            this.saveState();
        } else {
            // Initialize fresh state with Custom Users
            this.state.hostels = [{
                id: 'nilesh',
                name: 'Nilesh Hostel',
                rectorName: 'Nilesh',
                rectorId: 'nilesh',
                rectorEmail: 'nilesh@hostel.com',
                rectorPassword: '123',
                totalRooms: 50,
                rooms: Array.from({ length: 50 }, (_, i) => ({ id: (101 + i).toString(), capacity: 2, occupants: [] })),
                avatar: null
            }];

            // Manav will be in room 101
            const nileshHostel = this.state.hostels.find(h => h.id === 'nilesh');
            if (nileshHostel) {
                const room101 = nileshHostel.rooms.find(r => r.id === '101');
                if (room101) {
                    room101.occupants.push('manav');
                }
            }

            this.state.students = [{
                id: 'manav',
                name: 'Manav',
                password: '123',
                hostelId: 'nilesh',
                hostelName: 'Nilesh Hostel', // This property is derived, not stored
                room: '101',
                joinedDate: new Date().toLocaleDateString(),
                avatar: null,
                phone: '9876543210'
            }];



            this.state.pendingStudents = [];
            this.state.messReviews = [];
            this.state.complaints = [];
            this.state.notices = [];
            this.state.leaves = [];
            this.state.systemReports = [];
            this.saveState();

            // Check for v1 data migration (Legacy)
            const v1Data = localStorage.getItem('luminaHostelData');
            if (v1Data) {
                try {
                    const old = JSON.parse(v1Data);
                    if (old.hostel) {
                        this.state.hostels.push({
                            id: 'H101',
                            name: old.hostel.name,
                            rectorPassword: old.hostel.password,
                            totalRooms: old.hostel.totalRooms || 20,
                            rooms: old.rooms || []
                        });
                        if (Array.isArray(old.students)) {
                            old.students.forEach(s => {
                                this.state.students.push({ ...s, hostelId: 'H101' });
                            });
                        }
                        this.saveState();
                    }
                } catch (e) { console.error("Migration failed", e); }
            }
        }
    },

    saveState() {
        localStorage.setItem('luminaHostelData_v2', JSON.stringify(this.state));
    },

    seedDemoData() {
        // Create Demo Hostel with enhanced room structure
        const hostelId = 'H101';
        const rooms = Array.from({ length: 10 }, (_, i) => {
            const roomNum = i + 101;
            const floor = Math.floor(i / 4) + 1;
            const isAC = i % 3 === 0; // Every 3rd room is AC

            return {
                number: roomNum.toString(),
                type: isAC ? 'AC' : 'Non-AC',
                floor: floor,
                capacity: 2,
                occupants: [],
                amenities: isAC
                    ? ['WiFi', 'Attached Bathroom', 'Geyser']
                    : ['WiFi', 'Attached Bathroom'],
                rent: isAC ? 8000 : 6000,
                status: 'Vacant'
            };
        });

        const demoHostel = {
            id: hostelId,
            name: 'Sunshine Demo Dorms',
            rectorName: 'Demo Rector',
            rectorId: 'rector_demo',
            rectorEmail: 'rector@demo.com',
            rectorPassword: 'rector',
            phone: '0987654321',
            totalRooms: 10,
            rooms: rooms
        };

        // Create Demo Student with enhanced profile
        const student = {
            id: 'S101',
            name: 'Rahul Sharma (Demo)',
            hostelId: hostelId,
            room: '101',
            password: 'student',
            phone: '1234567890',
            email: 'rahul@demo.com',
            guardianName: 'Mr. Sharma',
            guardianPhone: '9876543210',
            guardianRelation: 'Father',
            bloodGroup: 'O+',
            emergencyContact: '9876543210',
            joinedDate: new Date().toLocaleDateString(),
            lastLogin: new Date().toLocaleString()
        };
        demoHostel.rooms[0].occupants.push('S101');
        demoHostel.rooms[0].status = 'Occupied';

        this.state.hostels.push(demoHostel);
        this.state.students.push(student);
        this.saveState();
        console.log("Demo Data Seeded with Enhanced Room Structure");
    },

    // --- Actions ---

    // Super Admin Actions
    createHostel(name, rectorName, rectorEmail, rectorPassword, roomCount) {
        const hostelId = 'H' + (this.state.hostels.length + 101);
        const rectorId = this.helpers.generateRectorId(rectorName, name);

        // Create rooms with enhanced structure
        const rooms = Array.from({ length: parseInt(roomCount) }, (_, i) => {
            const roomNum = i + 101;
            const floor = Math.floor(i / 4) + 1;
            const isAC = i % 4 === 0; // Every 4th room is AC by default

            return {
                number: roomNum.toString(),
                type: isAC ? 'AC' : 'Non-AC',
                floor: floor,
                capacity: 2,
                occupants: [],
                amenities: isAC
                    ? ['WiFi', 'Attached Bathroom', 'Geyser']
                    : ['WiFi', 'Attached Bathroom'],
                rent: isAC ? 8000 : 6000,
                status: 'Vacant'
            };
        });

        const newHostel = {
            id: hostelId,
            name,
            rectorName,
            rectorEmail,
            rectorId,
            rectorPassword,
            totalRooms: parseInt(roomCount),
            rooms
        };

        this.state.hostels.push(newHostel);
        this.saveState();
        return { hostelId, rectorId };
    },

    reportSystemIssue(issue) {
        const reporterId = this.currentUser.role === 'super_admin' ? this.state.superAdmin.id : this.currentUser.data.id;
        const report = {
            id: 'REP' + Date.now(),
            reporterId: reporterId,
            role: this.currentUser.role,
            issue: issue,
            date: new Date().toLocaleDateString(),
            status: 'New'
        };
        this.state.systemReports.push(report);
        this.saveState();
        return { success: true, message: "Thank you for the report! Admin will look into it." };
    },

    updateRoomSettings(hostelId, roomNumber, updates) {
        const hostel = this.state.hostels.find(h => h.id === hostelId);
        if (!hostel) return { success: false, message: 'Hostel not found' };

        const room = hostel.rooms.find(r => r.number === roomNumber);
        if (!room) return { success: false, message: 'Room not found' };

        // Update room properties
        if (updates.type) room.type = updates.type;
        if (updates.floor) room.floor = updates.floor;
        if (updates.rent) room.rent = updates.rent;
        if (updates.amenities) room.amenities = updates.amenities;
        if (updates.status) room.status = updates.status;

        this.saveState();
        return { success: true, message: 'Room updated successfully!' };
    },

    addFloor(hostelId) {
        const hostel = this.state.hostels.find(h => h.id === hostelId);
        if (!hostel) return { success: false, message: 'Hostel not found' };

        const currentMaxFloor = Math.max(...hostel.rooms.map(r => r.floor || 1));
        const newFloor = currentMaxFloor + 1;

        // Add 4 rooms for the new floor
        const startRoomNum = newFloor * 100 + 1; // e.g., 201

        for (let i = 0; i < 4; i++) {
            const roomNum = startRoomNum + i;
            hostel.rooms.push({
                number: roomNum.toString(),
                type: 'Non-AC',
                floor: newFloor,
                capacity: 2,
                occupants: [],
                amenities: ['WiFi', 'Attached Bathroom'],
                rent: 6000,
                status: 'Vacant'
            });
        }

        hostel.totalRooms += 4;
        this.saveState();
        return { success: true, message: `Floor ${newFloor} added with 4 rooms!` };
    },

    removeFloor(hostelId, floorNum) {
        const hostel = this.state.hostels.find(h => h.id === hostelId);
        if (!hostel) return { success: false, message: 'Hostel not found' };

        // Check for occupants
        const roomsOnFloor = hostel.rooms.filter(r => r.floor === floorNum);
        const hasOccupants = roomsOnFloor.some(r => r.occupants.length > 0);

        if (hasOccupants) {
            return { success: false, message: `Cannot remove Floor ${floorNum} because some rooms are occupied!` };
        }

        // Remove rooms
        hostel.rooms = hostel.rooms.filter(r => r.floor !== floorNum);
        hostel.totalRooms = hostel.rooms.length;
        this.saveState();
        return { success: true, message: `Floor ${floorNum} removed successfully.` };
    },

    updateReportStatus(reportId, status) {
        const report = this.state.systemReports.find(r => r.id === reportId);
        if (report) {
            report.status = status;
            this.saveState();
            return true;
        }
        return false;
    },

    deleteHostel(hostelId) {
        this.state.hostels = this.state.hostels.filter(h => h.id !== hostelId);
        // Clean up related data
        this.state.students = this.state.students.filter(s => s.hostelId !== hostelId);
        this.state.pendingStudents = this.state.pendingStudents.filter(s => s.hostelId !== hostelId);
        this.state.complaints = this.state.complaints.filter(c => c.hostelId !== hostelId);
        this.state.notices = this.state.notices.filter(n => n.hostelId !== hostelId);
        this.state.leaves = this.state.leaves.filter(l => l.hostelId !== hostelId);
        this.state.messMenus = this.state.messMenus.filter(m => m.hostelId !== hostelId);
        this.saveState();
        return { success: true, message: "Hostel and all related data deleted." };
    },

    deleteStudent(studentId) {
        const student = this.state.students.find(s => s.id === studentId);
        if (!student) return { success: false, message: "Student not found" };

        const hostel = this.state.hostels.find(h => h.id === student.hostelId);
        if (hostel) {
            const room = hostel.rooms.find(r => r.id === student.room);
            if (room) {
                room.occupants = room.occupants.filter(id => id !== studentId);
            }
        }

        this.state.students = this.state.students.filter(s => s.id !== studentId);
        this.saveState();
        return { success: true, message: "Student removed from hostel." };
    },

    updateMessMenu(hostelId, menu) {
        const index = this.state.messMenus.findIndex(m => m.hostelId === hostelId);
        const menuData = {
            id: 'MENU' + hostelId,
            hostelId,
            ...menu,
            lastUpdated: new Date().toLocaleDateString()
        };

        if (index > -1) {
            this.state.messMenus[index] = menuData;
        } else {
            this.state.messMenus.push(menuData);
        }
        this.saveState();
        return { success: true, message: "Mess menu updated!" };
    },

    // Student Actions
    signUpStudent(name, email, hostelId, password, phone) {
        const hostel = this.state.hostels.find(h => h.id === hostelId);
        if (!hostel) return { success: false, message: 'Invalid Hostel ID' };

        // Check if already registered
        if (this.state.students.find(s => (s.name === name || s.email === email) && s.hostelId === hostelId)) {
            return { success: false, message: 'Account already exists' };
        }

        const requestId = 'REQ' + Date.now().toString().slice(-4);
        this.state.pendingStudents.push({
            id: requestId,
            name,
            email,
            hostelId,
            password,
            phone,
            requestDate: new Date().toLocaleDateString()
        });

        this.saveState();
        return { success: true, message: 'Registration sent for approval!' };
    },

    submitMessReview(studentId, hostelId, rating, comment) {
        const student = this.state.students.find(s => s.id === studentId);
        if (!student) return { success: false, message: "Student not found" };

        this.state.messReviews.push({
            id: 'REV' + Date.now(),
            hostelId,
            studentId, // Link review to student
            studentName: student.name,
            rating,
            comment,
            date: new Date().toLocaleDateString()
        });
        this.saveState();
        return { success: true, message: "Review submitted!" };
    },

    submitComplaint(studentId, hostelId, type, description) {
        this.state.complaints.push({
            id: 'CMP' + Date.now(),
            studentId,
            hostelId,
            type,
            description,
            status: 'Pending',
            date: new Date().toLocaleDateString()
        });
        this.saveState();
        return { success: true, message: "Complaint submitted successfully!" };
    },

    // Rector Actions
    postNotice(hostelId, title, content) {
        this.state.notices.push({
            id: 'NOT' + Date.now(),
            hostelId,
            title,
            content,
            date: new Date().toLocaleDateString()
        });
        this.saveState();
        return { success: true, message: "Notice posted successfully!" };
    },

    resolveComplaint(complaintId) {
        const complaint = this.state.complaints.find(c => c.id === complaintId);
        if (complaint) {
            complaint.status = 'Resolved';
            this.saveState();
            return { success: true, message: "Complaint marked as resolved." };
        }
        return { success: false, message: "Complaint not found." };
    },

    applyLeave(studentId, hostelId, type, startDate, endDate, reason) {
        this.state.leaves.push({
            id: 'LEAVE' + Date.now(),
            studentId,
            hostelId,
            type,
            startDate,
            endDate,
            reason,
            status: 'Pending',
            requestDate: new Date().toLocaleDateString()
        });
        this.saveState();
        return { success: true, message: "Leave application submitted!" };
    },

    updateLeaveStatus(leaveId, status) {
        const leave = this.state.leaves.find(l => l.id === leaveId);
        if (leave) {
            leave.status = status;
            this.saveState();
            return { success: true, message: `Leave application ${status.toLowerCase()}.` };
        }
        return { success: false, message: "Leave application not found." };
    },

    // Fee Management
    addFeeRecord(studentId, hostelId, amount, dueDate) {
        const feeId = 'FEE' + Date.now();
        this.state.fees.push({
            id: feeId,
            studentId,
            hostelId,
            amount: parseFloat(amount),
            dueDate,
            status: 'pending',
            paidDate: null,
            reminderSent: false
        });
        this.saveState();
        return { success: true, message: "Fee record created successfully!", feeId };
    },

    updateFeeStatus(feeId, status, paidDate = null) {
        const fee = this.state.fees.find(f => f.id === feeId);
        if (fee) {
            fee.status = status;
            if (status === 'paid' && paidDate) {
                fee.paidDate = paidDate;
            }
            this.saveState();
            return { success: true, message: `Fee status updated to ${status}.` };
        }
        return { success: false, message: "Fee record not found." };
    },

    updateFeeRecord(feeId, amount, dueDate) {
        const fee = this.state.fees.find(f => f.id === feeId);
        if (fee) {
            fee.amount = parseFloat(amount);
            fee.dueDate = dueDate;
            this.saveState();
            return { success: true, message: "Fee record updated successfully!" };
        }
        return { success: false, message: "Fee record not found." };
    },

    payFeeByStudent(feeId) {
        const fee = this.state.fees.find(f => f.id === feeId);
        if (fee) {
            fee.status = 'paid';
            fee.paidDate = new Date().toLocaleDateString();
            this.saveState();
            return { success: true, message: "Payment successful! You can now view your receipt." };
        }
        return { success: false, message: "Fee record not found." };
    },

    sendFeeReminder(studentId, feeId) {
        const fee = this.state.fees.find(f => f.id === feeId);
        const student = this.state.students.find(s => s.id === studentId);

        if (fee && student) {
            // Create notification for student
            this.state.notices.push({
                id: 'FEEREM' + Date.now(),
                hostelId: student.hostelId,
                title: '💰 Fee Payment Reminder',
                content: `Dear ${student.name}, please pay your hostel fee of ₹${fee.amount} by ${fee.dueDate}. Status: ${fee.status.toUpperCase()}`,
                date: new Date().toLocaleDateString()
            });

            fee.reminderSent = true;
            this.saveState();
            return { success: true, message: "Reminder sent successfully!" };
        }
        return { success: false, message: "Fee or student not found." };
    },

    deleteFeeRecord(feeId) {
        const index = this.state.fees.findIndex(f => f.id === feeId);
        if (index !== -1) {
            this.state.fees.splice(index, 1);
            this.saveState();
            return { success: true, message: "Fee record deleted successfully." };
        }
        return { success: false, message: "Fee record not found." };
    },

    // Chat Actions
    sendChatMessage(recipientId, message) {
        if (!message.trim()) return { success: false, message: "Message cannot be empty" };

        const userMessage = {
            from: this.currentUser.data.id,
            to: recipientId,
            message: message.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        this.state.chats.push(userMessage);

        // Handle AI Assistant Response
        if (recipientId === 'AI_ASSISTANT') {
            setTimeout(() => {
                const aiResponse = {
                    from: 'AI_ASSISTANT',
                    to: this.currentUser.data.id,
                    message: this.helpers.getAIResponse(message.trim()),
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                this.state.chats.push(aiResponse);
                this.saveState();
                if (this.currentView === 'chat') {
                    this.renderChatView('AI_ASSISTANT');
                }
            }, 1000);
        }

        this.saveState();
        return { success: true };
    },

    generateReceipt(feeId) {
        const fee = this.state.fees.find(f => f.id === feeId);
        if (!fee || fee.status !== 'paid') return;

        const student = this.state.students.find(s => s.id === fee.studentId);
        const hostel = this.state.hostels.find(h => h.id === fee.hostelId);

        const receiptHTML = `
            <div id="receiptModal" style="position:fixed; inset:0; background:rgba(0,0,0,0.8); display:flex; align-items:center; justify-content:center; z-index:9999; backdrop-filter:blur(10px);">
                <div class="glass-panel" style="width: 90%; max-width: 500px; padding: 40px; background: white; color: #0f172a; position: relative;">
                    <button onclick="document.getElementById('receiptModal').remove()" style="position:absolute; top:20px; right:20px; background:none; border:none; font-size:1.5rem; cursor:pointer; color:#64748b;">&times;</button>
                    
                    <div style="text-align: center; border-bottom: 2px dashed #e2e8f0; padding-bottom: 20px; margin-bottom: 20px;">
                        <h2 style="color: #6366f1; font-family: 'Outfit';">Lumina Hostel</h2>
                        <p style="font-size: 0.9rem; color: #64748b;">OFFICIAL FEE RECEIPT</p>
                    </div>

                    <div style="display: grid; gap: 12px; font-size: 0.95rem;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #64748b;">Receipt No:</span>
                            <span style="font-weight: 600; font-family: monospace;">REC-${fee.id.slice(-6)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #64748b;">Date:</span>
                            <span style="font-weight: 600;">${fee.paidDate}</span>
                        </div>
                        <hr style="border:0; border-top: 1px solid #f1f5f9;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #64748b;">Student Name:</span>
                            <span style="font-weight: 600;">${student ? student.name : 'N/A'}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #64748b;">Student UID:</span>
                            <span style="font-weight: 600; font-family: monospace;">${fee.studentId}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #64748b;">Hostel:</span>
                            <span style="font-weight: 600;">${hostel ? hostel.name : 'N/A'}</span>
                        </div>
                         <div style="display: flex; justify-content: space-between;">
                            <span style="color: #64748b;">Room:</span>
                            <span style="font-weight: 600;">${student ? student.room : 'N/A'}</span>
                        </div>
                        <hr style="border:0; border-top: 1px solid #f1f5f9;">
                        <div style="display: flex; justify-content: space-between; font-size: 1.2rem; margin-top: 10px;">
                            <span style="font-weight: 700;">TOTAL AMOUNT:</span>
                            <span style="font-weight: 700; color: #10b981;">₹${fee.amount}</span>
                        </div>
                    </div>

                    <div style="margin-top: 30px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                        <p style="font-size: 0.8rem; color: #94a3b8;">This is a computer-generated receipt.</p>
                        <button onclick="window.print()" style="margin-top: 15px; background: #6366f1; color: white; border: none; padding: 8px 20px; border-radius: 8px; cursor: pointer; font-weight: 600;">Print Receipt</button>
                    </div>
                </div>
            </div>
        `;

        const div = document.createElement('div');
        div.innerHTML = receiptHTML;
        document.body.appendChild(div.firstElementChild);
    },


    approveStudent(requestId, roomNumber) {
        const reqIndex = this.state.pendingStudents.findIndex(r => r.id === requestId);
        if (reqIndex === -1) return false;

        const req = this.state.pendingStudents[reqIndex];
        const hostel = this.state.hostels.find(h => h.id === req.hostelId);
        const room = hostel.rooms.find(r => r.id === roomNumber);

        if (!room) return { success: false, message: 'Invalid Room' };
        if (room.occupants.length >= room.capacity) return { success: false, message: 'Room Full' };

        // Create Student
        const studentId = this.helpers.generateStudentId(req.name, hostel.name, this.state.students.length);
        const newStudent = {
            id: studentId,
            name: req.name,
            email: req.email,
            hostelId: req.hostelId,
            room: roomNumber,
            password: req.password,
            phone: req.phone,
            joinedDate: new Date().toLocaleDateString()
        };

        this.state.students.push(newStudent);
        room.occupants.push(studentId);
        this.state.pendingStudents.splice(reqIndex, 1);

        this.saveState();
        this.render();
        return { success: true, message: `Student Approved! UID: ${studentId}` };
    },

    attachMessEvents() {
        const toggleBtn = document.getElementById('toggleMenuEditor');
        const editor = document.getElementById('menuEditorForm');
        if (toggleBtn && editor) {
            toggleBtn.addEventListener('click', () => {
                editor.style.display = editor.style.display === 'none' ? 'block' : 'none';
            });
        }

        const form = document.getElementById('saveMenuForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const menu = {
                    breakfast: document.getElementById('menuBreakfast').value,
                    lunch: document.getElementById('menuLunch').value,
                    dinner: document.getElementById('menuDinner').value
                };
                this.updateMessMenu(this.currentUser.data.id, menu);
                alert("Menu Updated!");
                this.renderRectorContent('mess');
            });
        }
    },

    rejectStudent(requestId) {
        this.state.pendingStudents = this.state.pendingStudents.filter(r => r.id !== requestId);
        this.saveState();
        this.render();
    },

    addStudentDirectly(name, hostelId, roomNumber, password) {
        const hostel = this.state.hostels.find(h => h.id === hostelId);
        const room = hostel.rooms.find(r => r.id === roomNumber);

        if (!room) return { success: false, message: 'Invalid Room' };
        if (room.occupants.length >= room.capacity) return { success: false, message: 'Room Full' };

        const studentId = this.helpers.generateStudentId(name, hostel.name, this.state.students.length);
        const newStudent = {
            id: studentId,
            name,
            hostelId,
            room: roomNumber,
            password: password,
            joinedDate: new Date().toLocaleDateString()
        };

        this.state.students.push(newStudent);
        room.occupants.push(studentId);
        this.saveState();
        this.render();
        return { success: true, message: `Student Added! UID: ${studentId}` };
    },

    // Auth
    login(identifier, password) {
        const iden = identifier.toLowerCase();

        // 1. Super Admin
        if ((iden === this.state.superAdmin.id.toLowerCase() || iden === 'divyesh' || iden === 'admin@hostel.com') && password === this.state.superAdmin.password) {
            this.currentUser = { role: 'super_admin', name: 'Super Admin' };
            this.render();
            return { success: true };
        }

        // 2. Rector (Login using Rector ID, Name, or Email)
        const hostel = this.state.hostels.find(h => {
            const matchesId = (h.rectorId && h.rectorId.toLowerCase() === iden) || (h.id && h.id.toLowerCase() === iden);
            const matchesName = (h.rectorName && h.rectorName.toLowerCase() === iden) || (h.name && h.name.toLowerCase() === iden);
            const matchesEmail = h.rectorEmail && h.rectorEmail.toLowerCase() === iden;
            return (matchesId || matchesName || matchesEmail) && h.rectorPassword === password;
        });

        if (hostel) {
            this.currentUser = { role: 'rector', data: hostel };
            this.render();
            return { success: true };
        }

        // 3. Student (Login using Student UID, Name, or Email)
        const student = this.state.students.find(s => {
            const matchesId = s.id && s.id.toLowerCase() === iden;
            const matchesName = s.name && s.name.toLowerCase() === iden;
            const matchesEmail = s.email && s.email.toLowerCase() === iden;
            return (matchesId || matchesName || matchesEmail) && s.password === password;
        });

        if (student) {
            const hostel = this.state.hostels.find(h => h.id === student.hostelId);
            this.currentUser = { role: 'student', data: student, hostelName: hostel ? hostel.name : 'Unknown' };
            this.render();
            return { success: true };
        }

        return { success: false, message: 'Invalid Credentials' };
    },

    recoverPassword(identifier, phone) {
        const iden = identifier.toLowerCase();

        // Check Super Admin
        if ((iden === this.state.superAdmin.id.toLowerCase() || iden === 'divyesh' || iden === 'admin@hostel.com')) {
            return { success: true, password: this.state.superAdmin.password, role: 'Super Admin' };
        }

        // Check Rectors
        const hostel = this.state.hostels.find(h => {
            const matchesId = (h.rectorId && h.rectorId.toLowerCase() === iden) || (h.id && h.id.toLowerCase() === iden);
            const matchesEmail = h.rectorEmail && h.rectorEmail.toLowerCase() === iden;
            const matchesPhone = h.phone === phone;
            return (matchesId || matchesEmail) && matchesPhone;
        });

        if (hostel) {
            return { success: true, password: hostel.rectorPassword, role: 'Rector' };
        }

        // Check Students
        const student = this.state.students.find(s => {
            const matchesId = s.id && s.id.toLowerCase() === iden;
            const matchesEmail = s.email && s.email.toLowerCase() === iden;
            const matchesPhone = s.phone === phone;
            return (matchesId || matchesEmail) && matchesPhone;
        });

        if (student) {
            return { success: true, password: student.password, role: 'Student' };
        }

        return { success: false, message: 'User not found or phone number mismatch.' };
    },

    logout() {
        this.currentUser = null;
        this.render();
    },

    exportDatabase() {
        this.exportToCSV();
    },

    exportToCSV() {
        // Helper function to convert array of objects to CSV
        const arrayToCSV = (data, headers) => {
            if (!data || data.length === 0) return headers.join(',') + '\n(No data)';

            const csvRows = [];
            csvRows.push(headers.join(','));

            for (const row of data) {
                const values = headers.map(header => {
                    const val = row[header] || '';
                    // Escape quotes and wrap in quotes if contains comma or newline
                    const escaped = String(val).replace(/"/g, '""');
                    return escaped.includes(',') || escaped.includes('\n') ? `"${escaped}"` : escaped;
                });
                csvRows.push(values.join(','));
            }
            return csvRows.join('\n');
        };

        // Build comprehensive CSV export
        let csvContent = '=== LUMINA HOSTEL MANAGEMENT SYSTEM - DATABASE EXPORT ===\n';
        csvContent += `Export Date: ${new Date().toLocaleString()}\n\n`;

        // Hostels & Rectors
        csvContent += '--- HOSTELS & RECTORS ---\n';
        const hostelData = this.state.hostels.map(h => ({
            'Hostel ID': h.id,
            'Hostel Name': h.name,
            'Rector Name': h.rectorName || 'N/A',
            'Rector UID': h.rectorId || 'N/A',
            'Rector Email': h.rectorEmail || 'N/A',
            'Rector Password': h.rectorPassword,
            'Total Rooms': h.totalRooms,
            'Phone': h.phone || 'N/A'
        }));
        csvContent += arrayToCSV(hostelData, ['Hostel ID', 'Hostel Name', 'Rector Name', 'Rector UID', 'Rector Email', 'Rector Password', 'Total Rooms', 'Phone']) + '\n\n';

        // Students
        csvContent += '--- STUDENTS ---\n';
        const studentData = this.state.students.map(s => {
            const hostel = this.state.hostels.find(h => h.id === s.hostelId);
            return {
                'Student UID': s.id,
                'Name': s.name,
                'Hostel': hostel ? hostel.name : s.hostelId,
                'Room': s.room,
                'Password': s.password,
                'Phone': s.phone || 'N/A',
                'Email': s.email || 'N/A',
                'Joined Date': s.joinedDate || 'N/A'
            };
        });
        csvContent += arrayToCSV(studentData, ['Student UID', 'Name', 'Hostel', 'Room', 'Password', 'Phone', 'Email', 'Joined Date']) + '\n\n';

        // System Reports (Bug Fixes)
        csvContent += '--- SYSTEM REPORTS (BUG FIXES) ---\n';
        const reportData = this.state.systemReports.map(r => ({
            'Report ID': r.id,
            'Reporter UID': r.reporterId,
            'Role': r.role,
            'Issue': r.issue,
            'Date': r.date,
            'Status': r.status
        }));
        csvContent += arrayToCSV(reportData, ['Report ID', 'Reporter UID', 'Role', 'Issue', 'Date', 'Status']) + '\n\n';

        // Complaints
        csvContent += '--- COMPLAINTS ---\n';
        const complaintData = this.state.complaints.map(c => ({
            'ID': c.id,
            'Type': c.type,
            'Description': c.description,
            'Status': c.status,
            'Student ID': c.studentId,
            'Hostel ID': c.hostelId,
            'Date': c.date
        }));
        csvContent += arrayToCSV(complaintData, ['ID', 'Type', 'Description', 'Status', 'Student ID', 'Hostel ID', 'Date']) + '\n\n';

        // Fees
        csvContent += '--- FEES ---\n';
        const feeData = this.state.fees.map(f => ({
            'ID': f.id,
            'Student ID': f.studentId,
            'Hostel ID': f.hostelId,
            'Amount': f.amount,
            'Due Date': f.dueDate,
            'Status': f.status,
            'Paid Date': f.paidDate || 'N/A'
        }));
        csvContent += arrayToCSV(feeData, ['ID', 'Student ID', 'Hostel ID', 'Amount', 'Due Date', 'Status', 'Paid Date']) + '\n\n';

        // Download as CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", URL.createObjectURL(blob));
        downloadAnchorNode.setAttribute("download", `lumina_database_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();

        alert('Database exported successfully as CSV file!');
    },

    exportToExcel() {
        if (typeof XLSX === 'undefined') return alert('Excel export library not loaded. Please refresh or check connection.');

        const wb = XLSX.utils.book_new();
        wb.Props = {
            Title: "Lumina Database Export",
            Subject: "System Data",
            Author: "Lumina Admin",
            CreatedDate: new Date()
        };

        // 1. Hostels & Rectors
        const hostelData = this.state.hostels.map(h => ({
            'Hostel ID': h.id,
            'Hostel Name': h.name,
            'Rector Name': h.rectorName || 'N/A',
            'Rector UID': h.rectorId || 'N/A',
            'Rector Email': h.rectorEmail || 'N/A',
            'Rector Password': h.rectorPassword,
            'Total Rooms': h.totalRooms,
            'Phone': h.phone || 'N/A'
        }));
        const wsHostels = XLSX.utils.json_to_sheet(hostelData);
        XLSX.utils.book_append_sheet(wb, wsHostels, "Hostels");

        // 2. Students
        const studentData = this.state.students.map(s => {
            const hostel = this.state.hostels.find(h => h.id === s.hostelId);
            return {
                'UID': s.id,
                'Name': s.name,
                'Hostel': hostel ? hostel.name : s.hostelId,
                'Room': s.room,
                'Password': s.password,
                'Phone': s.phone || 'N/A',
                'Email': s.email || 'N/A',
                'Joined': s.joinedDate || 'N/A'
            };
        });
        const wsStudents = XLSX.utils.json_to_sheet(studentData);
        XLSX.utils.book_append_sheet(wb, wsStudents, "Students");

        // 3. Complaints
        const complaintData = this.state.complaints.map(c => ({
            'ID': c.id,
            'Type': c.type,
            'Description': c.description,
            'Status': c.status,
            'Student ID': c.studentId,
            'Hostel ID': c.hostelId,
            'Date': c.date
        }));
        const wsComplaints = XLSX.utils.json_to_sheet(complaintData);
        XLSX.utils.book_append_sheet(wb, wsComplaints, "Complaints");

        // 4. Fees
        const feeData = this.state.fees.map(f => ({
            'ID': f.id,
            'Student ID': f.studentId,
            'Hostel ID': f.hostelId,
            'Amount': f.amount,
            'Due Date': f.dueDate,
            'Status': f.status,
            'Paid Date': f.paidDate || 'N/A'
        }));
        const wsFees = XLSX.utils.json_to_sheet(feeData);
        XLSX.utils.book_append_sheet(wb, wsFees, "Fees");

        // Save File
        XLSX.writeFile(wb, `lumina_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
    },

    exportToPDF() {
        if (typeof jspdf === 'undefined') return alert('PDF library not loaded. Please refresh.');

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Title
        doc.setFontSize(20);
        doc.text('Lumina Hostel Management - System Report', pageWidth / 2, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 30, { align: 'center' });

        let currentY = 40;

        // Helper to add section title
        const addSectionTitle = (title) => {
            doc.setFontSize(14);
            doc.setTextColor(236, 72, 153); // Secondary color
            doc.text(title, 14, currentY + 10);
            doc.setTextColor(0, 0, 0); // Reset
            return currentY + 15;
        };

        // 1. Hostels
        currentY = addSectionTitle('Hostels & Rectors');
        const hostelHeaders = [['ID', 'Name', 'Rector', 'Rooms', 'Phone']];
        const hostelRows = this.state.hostels.map(h => [h.id, h.name, h.rectorName, h.totalRooms, h.phone || '-']);

        doc.autoTable({
            startY: currentY,
            head: hostelHeaders,
            body: hostelRows,
            theme: 'grid',
            headStyles: { fillColor: [99, 102, 241] } // Primary color
        });
        currentY = doc.lastAutoTable.finalY + 10;

        // 2. Students Summary (First 50 to avoid overflow)
        // Check filtering for active page or just recent? Let's show up to 100 for now or summary.
        // Let's just dump appropriate amount.
        currentY = addSectionTitle(`Students (Total: ${this.state.students.length})`);
        const studentHeaders = [['UID', 'Name', 'Hostel', 'Room', 'Phone']];
        const studentRows = this.state.students.map(s => {
            const h = this.state.hostels.find(x => x.id === s.hostelId);
            return [s.id, s.name, h ? h.name : s.hostelId, s.room, s.phone || '-'];
        });

        doc.autoTable({
            startY: currentY,
            head: studentHeaders,
            body: studentRows,
            theme: 'grid',
            headStyles: { fillColor: [236, 72, 153] }
        });
        currentY = doc.lastAutoTable.finalY + 10;

        // Add new page if needed logic handled by autotable roughly, but for sections:
        if (currentY > 250) { doc.addPage(); currentY = 20; }

        // 3. Complaints
        currentY = addSectionTitle(`Active Complaints`);
        const complaints = this.state.complaints.filter(c => c.status !== 'Resolved');
        const compHeaders = [['ID', 'Type', 'Description', 'Student', 'Status']];
        const compRows = complaints.map(c => [c.id, c.type, c.description, c.studentId, c.status]);

        doc.autoTable({
            startY: currentY,
            head: compHeaders,
            body: compRows,
            theme: 'grid',
            headStyles: { fillColor: [244, 63, 94] }
        });

        doc.save(`lumina_report_${new Date().toISOString().slice(0, 10)}.pdf`);
    },

    generateBulkReceipts() {
        const hostelId = this.currentUser.data.id;
        const students = this.state.students.filter(s => s.hostelId === hostelId);
        const paidFees = this.state.fees.filter(f => f.hostelId === hostelId && f.status === 'paid');

        if (paidFees.length === 0) {
            alert("No paid fee records found for this hostel.");
            return;
        }

        let html = `
            <div id="bulkReceiptOverlay" style="position:fixed; inset:0; background:rgba(0,0,0,0.9); z-index:99999; overflow-y:auto; padding:40px; color:black;">
                <div style="max-width:800px; margin:0 auto; background:white; padding:40px; border-radius:12px; position:relative;">
                    <button onclick="document.getElementById('bulkReceiptOverlay').remove()" style="position:absolute; top:20px; right:20px; border:none; background:none; font-size:2rem; cursor:pointer;">&times;</button>
                    <header style="text-align:center; border-bottom:2px solid #eee; padding-bottom:20px; margin-bottom:40px;">
                        <h1 style="color:#6366f1;">Lumina Hostel - Bulk Fee Receipts</h1>
                        <p style="color:#666;">Generated on ${new Date().toLocaleDateString()}</p>
                        <button onclick="window.print()" class="no-print" style="margin-top:10px; padding:10px 20px; background:#6366f1; color:white; border:none; border-radius:6px; cursor:pointer;">Print All Receipts</button>
                    </header>
                    <style>
                        @media print { .no-print { display: none; } #bulkReceiptOverlay { position:static !important; padding:0 !important; } }
                        .receipt-card { border:1px dashed #ccc; padding:20px; margin-bottom:30px; page-break-inside: avoid; }
                    </style>
        `;

        paidFees.forEach(fee => {
            const student = students.find(s => s.id === fee.studentId);
            html += `
                <div class="receipt-card">
                    <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                        <strong>Receipt No: REC-${fee.id.slice(-6)}</strong>
                        <span>Date: ${fee.paidDate}</span>
                    </div>
                    <div style="margin-bottom:10px;">Student: <strong>${student ? student.name : 'Unknown'} (${fee.studentId})</strong></div>
                    <div style="margin-bottom:10px;">Room: ${student ? student.room : 'N/A'}</div>
                    <div style="display:flex; justify-content:space-between; font-size:1.2rem; border-top:1px solid #eee; padding-top:10px;">
                        <strong>Total Paid:</strong>
                        <strong style="color:#10b981;">₹${fee.amount}</strong>
                    </div>
                </div>
            `;
        });

        html += `</div></div>`;
        const div = document.createElement('div');
        div.innerHTML = html;
        document.body.appendChild(div.firstElementChild);
    },

    // --- Rendering ---
    render() {
        try {
            const app = document.getElementById('app');
            if (!app) return;

            if (!this.currentUser) {
                app.innerHTML = Views.auth(this.state.hostels || []);
                this.attachAuthEvents();
                return;
            }

            if (this.currentUser.role === 'super_admin') {
                app.innerHTML = Views.superAdmin(this.state);
                this.attachSuperAdminEvents();
            } else if (this.currentUser.role === 'rector') {
                // Safety check for data
                if (!this.currentUser.data) throw new Error("Rector data missing");
                app.innerHTML = Views.rector(this.state, this.currentUser.data);
                this.attachRectorEvents();
            } else if (this.currentUser.role === 'student') {
                app.innerHTML = Views.student(this.currentUser);
                this.attachStudentEvents();
            }
        } catch (e) {
            console.error("Critical Render Error:", e);
            const app = document.getElementById('app');
            if (app) {
                app.innerHTML = `
                <div style="display:flex; justify-content:center; align-items:center; height:100vh; flex-direction:column; color:white;">
                    <h2>System Error</h2>
                    <p>${e.message}</p>
                    <button onclick="localStorage.clear(); location.reload();" style="margin-top:20px; padding:10px 20px; background:#ef4444; color:white; border:none; border-radius:8px; cursor:pointer;">Reset System</button>
                    <pre style="margin-top:20px; background:rgba(0,0,0,0.5); padding:10px; border-radius:8px; font-size:0.8rem; text-align:left;">${e.stack}</pre>
                </div>`;
            }
        }
    },

    // --- Events ---
    attachAuthEvents() {
        // Toggle Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));

                e.target.classList.add('active');
                document.getElementById(e.target.dataset.target).classList.add('active');
            });
        });

        // Sign In
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const result = this.login(
                document.getElementById('loginId').value,
                document.getElementById('loginPass').value
            );
            if (!result.success) alert(result.message);
        });

        // Forgot Password
        document.getElementById('forgotPassBtn').addEventListener('click', () => {
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            document.getElementById('forgotPasswordPanel').classList.add('active');
        });

        // Forgot Password Form Submit
        const forgotPassForm = document.getElementById('forgotPassForm');
        if (forgotPassForm) {
            forgotPassForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const iden = document.getElementById('recoverId').value;
                const phone = document.getElementById('recoverPhone').value;
                const result = this.recoverPassword(iden, phone);

                const resultDiv = document.getElementById('recoveryResult');
                resultDiv.style.display = 'block';

                if (result.success) {
                    resultDiv.style.background = 'rgba(16, 185, 129, 0.2)';
                    resultDiv.style.border = '1px solid #10b981';
                    resultDiv.innerHTML = `
                        <div style="color: #10b981; font-weight: 600;">Account Found (${result.role})</div>
                        <div style="margin-top: 10px; color: white;">Your Password: <span style="font-family: monospace; background: rgba(255,255,255,0.1); padding: 2px 5px; border-radius: 4px;">${result.password}</span></div>
                    `;
                } else {
                    resultDiv.style.background = 'rgba(239, 68, 68, 0.2)';
                    resultDiv.style.border = '1px solid #ef4444';
                    resultDiv.innerHTML = `<div style="color: #f87171;">${result.message}</div>`;
                }
            });
        }

        // Sign Up
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const result = this.signUpStudent(
                    document.getElementById('regName').value,
                    document.getElementById('regEmail').value,
                    document.getElementById('regHostel').value,
                    document.getElementById('regPass').value,
                    document.getElementById('regPhone').value
                );
                alert(result.message);
                if (result.success) {
                    // Switch to login tab
                    document.querySelector('[data-target="loginPanel"]').click();
                }
            });
        }
    },

    attachSuperAdminEvents() {
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                e.target.closest('.nav-item').classList.add('active');

                const view = e.target.closest('.nav-item').dataset.view;
                this.renderSuperAdminContent(view);
            });
        });

        // Initialize with Dashboard
        this.renderSuperAdminContent('dashboard');
    },

    renderSuperAdminContent(view) {
        const content = document.getElementById('content-area');
        if (!content) return;

        if (view === 'dashboard') {
            content.innerHTML = Components.adminStats(this.state.hostels, this.state.students, this.state.complaints);
        } else if (view === 'hostels') {
            content.innerHTML = Components.adminHostelManagement(this.state.hostels);
            // Re-attach form listener for Hostel Creation
            const form = document.getElementById('createHostelForm');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const res = this.createHostel(
                        document.getElementById('hName').value,
                        document.getElementById('hRector').value,
                        document.getElementById('hRectorEmail').value,
                        document.getElementById('hPass').value,
                        document.getElementById('hRooms').value
                    );
                    alert(`Hostel Created!\nHostel ID: ${res.hostelId}\nRector UID: ${res.rectorId}`);
                    this.renderSuperAdminContent('hostels'); // Reload view
                });
            }

            // Delete Hostel
            document.querySelectorAll('.btn-delete-hostel').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.dataset.id;
                    if (confirm(`Are you sure you want to delete Hostel ${id}? This will remove ALL students and data associated with it!`)) {
                        this.deleteHostel(id);
                        this.renderSuperAdminContent('hostels');
                    }
                });
            });
        } else if (view === 'rectors') {
            content.innerHTML = Components.adminRectorList(this.state.hostels);
            this.attachAdminSearchEvents('rectors');
        } else if (view === 'all-students') {
            content.innerHTML = Components.adminStudentList(this.state.students, this.state.hostels);
            this.attachAdminSearchEvents('students');
        } else if (view === 'bug-reports') {
            content.innerHTML = Components.adminSystemReports(this.state.systemReports);
            this.attachAdminReportEvents();
        } else if (view === 'settings') {
            content.innerHTML = Components.adminSettings();
            this.attachSettingsEvents();
        }
    },

    attachAdminSearchEvents(type) {
        const searchInput = document.getElementById('adminSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const results = this.helpers.searchData(type, e.target.value);
                const tableBody = document.querySelector('#adminSearchTable tbody');
                if (type === 'rectors') {
                    tableBody.innerHTML = results.map(h => `
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <td style="padding: 15px; font-family:monospace;">${h.rectorId || 'N/A'}</td>
                            <td style="padding: 15px; font-weight: 600;">${h.rectorName || 'N/A'}</td>
                            <td style="padding: 15px;">${h.name}</td>
                            <td style="padding: 15px;">${h.rectorEmail || 'N/A'}</td>
                            <td style="padding: 15px;">${h.rectorPassword}</td>
                        </tr>
                    `).join('') || '<tr><td colspan="5" style="padding:20px; text-align:center; opacity:0.6;">No rectors found.</td></tr>';
                } else {
                    tableBody.innerHTML = results.map(s => {
                        const hostel = this.state.hostels.find(h => h.id === s.hostelId);
                        return `
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <td style="padding: 15px; font-family:monospace;">${s.id}</td>
                                <td style="padding: 15px; font-weight: 600;">${s.name}</td>
                                <td style="padding: 15px; color:var(--primary-light);">${hostel ? hostel.name : s.hostelId}</td>
                                <td style="padding: 15px;">${s.room}</td>
                                <td style="padding: 15px;">${s.password}</td>
                            </tr>
                        `;
                    }).join('') || '<tr><td colspan="5" style="padding:20px; text-align:center; opacity:0.6;">No students found.</td></tr>';
                }
            });
        }
    },

    attachAdminReportEvents() {
        document.querySelectorAll('.btn-update-report').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const currentStatus = e.target.dataset.status;

                // Create a dropdown for status selection
                const statusOptions = ['New', 'In Progress', 'Fixed'];
                const select = document.createElement('select');
                select.style.cssText = 'background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border); color: white; padding: 5px 10px; border-radius: 6px; cursor: pointer;';

                statusOptions.forEach(status => {
                    const option = document.createElement('option');
                    option.value = status;
                    option.textContent = status;
                    option.selected = status === currentStatus;
                    option.style.cssText = 'background: #1a1a2e; color: white;';
                    select.appendChild(option);
                });

                // Replace button with dropdown temporarily
                const originalButton = e.target;
                originalButton.style.display = 'none';
                originalButton.parentNode.insertBefore(select, originalButton);
                select.focus();

                // Handle selection
                select.addEventListener('change', () => {
                    const newStatus = select.value;
                    if (newStatus !== currentStatus) {
                        this.updateReportStatus(id, newStatus);
                        this.renderSuperAdminContent('bug-reports');
                    } else {
                        select.remove();
                        originalButton.style.display = '';
                    }
                });

                // Handle blur (clicking outside)
                select.addEventListener('blur', () => {
                    select.remove();
                    originalButton.style.display = '';
                });
            });
        });
    },

    attachReportEvents() {
        const form = document.getElementById('reportIssueForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const issue = document.getElementById('issueDesc').value;
                const res = this.reportSystemIssue(issue);
                alert(res.message);
                if (this.currentUser.role === 'rector') {
                    this.renderRectorContent('dashboard');
                } else if (this.currentUser.role === 'student') {
                    this.renderStudentContent('dashboard');
                } else {
                    this.renderSuperAdminContent('dashboard');
                }
            });
        }
    },

    // User Settings Actions
    updatePassword(currentPass, newPass) {
        if (!this.currentUser) return { success: false, message: "Not logged in" };

        let user = this.currentUser.data;
        // Verify current password
        const storedPass = this.currentUser.role === 'rector' ? user.rectorPassword : user.password;

        if (storedPass !== currentPass) {
            return { success: false, message: "Incorrect current password" };
        }

        // Update password
        if (this.currentUser.role === 'rector') {
            const hostel = this.state.hostels.find(h => h.id === user.id);
            if (hostel) hostel.rectorPassword = newPass;
        } else if (this.currentUser.role === 'student') {
            const student = this.state.students.find(s => s.id === user.id);
            if (student) student.password = newPass;
        }

        this.saveState();
        return { success: true, message: "Password updated successfully!" };
    },

    updateAvatar(base64Image) {
        if (!this.currentUser) return { success: false, message: "Not logged in" };

        let user = this.currentUser.data;
        if (this.currentUser.role === 'rector') {
            const hostel = this.state.hostels.find(h => h.id === user.id);
            if (hostel) hostel.avatar = base64Image;
        } else if (this.currentUser.role === 'student') {
            const student = this.state.students.find(s => s.id === user.id);
            if (student) student.avatar = base64Image;
        }

        // Update current session user data too so UI updates immediately
        this.currentUser.data.avatar = base64Image;
        this.saveState();
        this.render(); // Re-render to show new avatar
        return { success: true, message: "Profile photo updated!" };
    },

    attachRectorEvents() {
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                e.target.closest('.nav-item').classList.add('active');

                const view = e.target.closest('.nav-item').dataset.view;
                this.renderRectorContent(view);
            });
        });

        // Initial default view
        this.renderRectorContent('dashboard');
    },

    renderRectorContent(view) {
        try {
            const content = document.getElementById('content-area');
            if (!content) return;

            const hostel = this.currentUser.data;
            if (!hostel) {
                content.innerHTML = '<p class="text-error">Error: Hostel data missing.</p>';
                return;
            }

            const hostelStudents = this.state.students.filter(s => s.hostelId === hostel.id) || [];
            const hostelPending = this.state.pendingStudents.filter(s => s.hostelId === hostel.id) || [];

            // Ensure we work with the latest rooms reference from state
            let currentHostelState = this.state.hostels.find(h => h.id === hostel.id);
            if (!currentHostelState) {
                console.warn("Hostel state desync, using session data");
                currentHostelState = hostel;
            }

            if (view === 'dashboard') {
                const pendingComplaints = this.state.complaints.filter(c => c.hostelId === hostel.id && c.status === 'Pending') || [];
                const pendingLeaves = this.state.leaves.filter(l => l.hostelId === hostel.id && l.status === 'Pending') || [];
                const menu = this.state.messMenus.find(m => m.hostelId === hostel.id);
                const reviews = this.state.messReviews.filter(r => r.hostelId === hostel.id) || [];
                content.innerHTML = Components.rectorStats(currentHostelState, hostelStudents, hostelPending, pendingComplaints, pendingLeaves, !!menu, reviews);
            } else if (view === 'students') {
                content.innerHTML = Components.studentManagement(currentHostelState, hostelStudents, hostelPending);
                this.attachStudentManagementEvents();
            } else if (view === 'rooms') {
                content.innerHTML = Components.roomGrid(currentHostelState);
                this.attachRoomEditListeners();
            } else if (view === 'fees') {
                const fees = this.state.fees.filter(f => f.hostelId === hostel.id) || [];
                content.innerHTML = Components.feesManagement(hostelStudents, fees, hostel.id);
                this.attachFeesEvents();
            } else if (view === 'mess') {
                const reviews = this.state.messReviews.filter(r => r.hostelId === hostel.id) || [];
                const menu = this.state.messMenus.find(m => m.hostelId === hostel.id);
                content.innerHTML = Components.messReviews(reviews.reverse(), menu, this.currentUser.role);
                this.attachMessEvents();
            } else if (view === 'settings') {
                content.innerHTML = Components.settings();
                this.attachSettingsEvents();
            } else if (view === 'complaints') {
                const complaints = this.state.complaints.filter(c => c.hostelId === hostel.id) || [];
                content.innerHTML = Components.complaintsList(complaints.reverse(), true);
                this.attachComplaintEvents(true);
            } else if (view === 'notices') {
                const notices = this.state.notices.filter(n => n.hostelId === hostel.id) || [];
                content.innerHTML = Components.noticeBoard(notices.reverse(), true);
                this.attachNoticeEvents(true);
            } else if (view === 'leaves') {
                const leaves = this.state.leaves.filter(l => l.hostelId === hostel.id) || [];
                content.innerHTML = Components.leaveRequests(leaves.reverse());
                this.attachLeaveEvents(true);
            } else if (view === 'ai') {
                content.innerHTML = Components.aiAssistantInterface();
                this.attachAiEvents();
            } else if (view === 'report') {
                content.innerHTML = Components.reportSystemIssue();
                this.attachReportEvents();
            }
        } catch (e) {
            console.error("Rector Render Error:", e);
            document.getElementById('content-area').innerHTML = `<div style="color:red; padding:20px;">System Error: ${e.message}</div>`;
        }
    },

    attachRoomEditListeners() {
        // 1. Edit Room Button - Open Modal
        document.querySelectorAll('.btn-edit-room').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const roomNum = e.currentTarget.dataset.room;
                const hostel = this.state.hostels.find(h => h.id === this.currentUser.data.hostelId);
                const room = hostel.rooms.find(r => r.number === roomNum);

                if (room) {
                    document.getElementById('editRoomNumber').value = room.number;
                    document.getElementById('editRoomType').value = room.type;
                    document.getElementById('editRoomFloor').value = room.floor || 1;
                    document.getElementById('editRoomRent').value = room.rent || (room.type === 'AC' ? 8000 : 6000);
                    document.getElementById('editRoomStatus').value = room.status || 'Vacant';

                    // Amenities
                    document.querySelectorAll('.amenity-check').forEach(ck => ck.checked = false);
                    if (room.amenities) {
                        room.amenities.forEach(am => {
                            const found = Array.from(document.querySelectorAll('.amenity-check')).find(ck => ck.value === am);
                            if (found) found.checked = true;
                        });
                    }

                    document.getElementById('editRoomModal').style.display = 'flex';
                }
            });
        });

        // 2. Modal Actions
        const closeModal = () => {
            document.getElementById('editRoomModal').style.display = 'none';
        };

        const closeBtn = document.getElementById('closeEditModal');
        if (closeBtn) closeBtn.addEventListener('click', closeModal);

        const cancelBtn = document.getElementById('cancelEditModal');
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

        const form = document.getElementById('editRoomForm');
        if (form) {
            // Remove old listeners to prevent duplicates (cloning technique)
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);

            newForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const hostelId = this.currentUser.data.hostelId;
                const roomNum = document.getElementById('editRoomNumber').value;

                const updates = {
                    type: document.getElementById('editRoomType').value,
                    floor: parseInt(document.getElementById('editRoomFloor').value),
                    rent: parseInt(document.getElementById('editRoomRent').value),
                    status: document.getElementById('editRoomStatus').value,
                    amenities: Array.from(document.querySelectorAll('.amenity-check:checked')).map(ck => ck.value)
                };

                const res = this.updateRoomSettings(hostelId, roomNum, updates);
                alert(res.message);
                if (res.success) {
                    closeModal();
                    this.renderRectorContent('rooms');
                }
            });
        }

        // 3. Quick Toggle AC/Non-AC
        document.querySelectorAll('.toggle-room-type').forEach(badge => {
            badge.addEventListener('click', (e) => {
                const roomNum = e.currentTarget.dataset.room;
                const currentType = e.currentTarget.dataset.current;
                const newType = currentType === 'AC' ? 'Non-AC' : 'AC';

                if (confirm(`Switch Room ${roomNum} to ${newType}?`)) {
                    // Update type and also apply default amenities/rent for that type
                    const defaultAmenities = newType === 'AC'
                        ? ['WiFi', 'Attached Bathroom', 'Geyser']
                        : ['WiFi', 'Attached Bathroom'];
                    const defaultRent = newType === 'AC' ? 8000 : 6000;

                    this.updateRoomSettings(this.currentUser.data.hostelId, roomNum, {
                        type: newType,
                        amenities: defaultAmenities,
                        rent: defaultRent
                    });
                    this.renderRectorContent('rooms');
                }
            });
        });

        // 4. Manage Floors Logic
        const floorsModal = document.getElementById('manageFloorsModal');
        const openFloorsBtn = document.getElementById('btnManageFloors');
        const closeFloorsBtn = document.getElementById('closeFloorsModal');

        if (openFloorsBtn) {
            openFloorsBtn.addEventListener('click', () => {
                if (floorsModal) {
                    // Update stats
                    const hostel = this.state.hostels.find(h => h.id === this.currentUser.data.hostelId);
                    const floorCounts = {};
                    hostel.rooms.forEach(r => {
                        const f = r.floor || 1;
                        floorCounts[f] = (floorCounts[f] || 0) + 1;
                    });
                    const statsHtml = Object.entries(floorCounts)
                        .sort((a, b) => Number(a[0]) - Number(b[0]))
                        .map(([f, count]) => `<div style="padding:4px 0; border-bottom:1px solid rgba(255,255,255,0.05);">Layer ${f}: <strong>${count} rooms</strong></div>`)
                        .join('');
                    const statsContainer = document.getElementById('floorStats');
                    if (statsContainer) statsContainer.innerHTML = statsHtml || 'No rooms found.';

                    floorsModal.style.display = 'flex';
                }
            });
        }

        if (closeFloorsBtn) {
            closeFloorsBtn.addEventListener('click', () => {
                if (floorsModal) floorsModal.style.display = 'none';
            });
        }

        const btnAddFloor = document.getElementById('btnAddFloor');
        if (btnAddFloor) {
            // Use standard addEventListener but handle potential duplicates if re-attached?
            // Since we re-render the button each time, it's a fresh element.
            btnAddFloor.onclick = () => {
                const hostelId = this.currentUser.data.hostelId;
                const res = this.addFloor(hostelId);
                alert(res.message);
                if (res.success) {
                    this.renderRectorContent('rooms');
                }
            };
        }

        const btnRemoveFloor = document.getElementById('btnRemoveFloor');
        if (btnRemoveFloor) {
            btnRemoveFloor.onclick = () => {
                const hostelId = this.currentUser.data.hostelId;
                const hostel = this.state.hostels.find(h => h.id === hostelId);
                const maxFloor = Math.max(...hostel.rooms.map(r => r.floor || 1));

                if (confirm(`Are you sure you want to remove Floor ${maxFloor} (Top Floor)?`)) {
                    const res = this.removeFloor(hostelId, maxFloor);
                    if (!res.success) alert(res.message); // Only alert on error or success message
                    else alert(res.message);

                    if (res.success) {
                        this.renderRectorContent('rooms');
                    }
                }
            };
        }
    },

    attachComplaintEvents(isRector = false) {
        if (!isRector) {
            const toggle = document.getElementById('toggleComplaintForm');
            const formDiv = document.getElementById('newComplaintForm');
            if (toggle && formDiv) {
                toggle.addEventListener('click', () => {
                    formDiv.style.display = formDiv.style.display === 'none' ? 'block' : 'none';
                });
            }

            const form = document.getElementById('submitComplaintForm');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const type = document.getElementById('compType').value;
                    const desc = document.getElementById('compDesc').value;
                    const res = this.submitComplaint(this.currentUser.data.id, this.currentUser.data.hostelId, type, desc);
                    alert(res.message);
                    this.renderStudentContent('complaints');
                });
            }
        } else {
            document.querySelectorAll('.btn-resolve').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    if (confirm("Mark this complaint as resolved?")) {
                        const res = this.resolveComplaint(e.target.dataset.id);
                        alert(res.message);
                        this.renderRectorContent('complaints');
                    }
                });
            });
        }
    },

    attachLeaveEvents(isRector = false) {
        if (!isRector) {
            const toggle = document.getElementById('toggleLeaveForm');
            const formDiv = document.getElementById('newLeaveForm');
            if (toggle && formDiv) {
                toggle.addEventListener('click', () => {
                    formDiv.style.display = formDiv.style.display === 'none' ? 'block' : 'none';
                });
            }

            const form = document.getElementById('submitLeaveForm');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const type = document.getElementById('leaveType').value;
                    const reason = document.getElementById('leaveReason').value;
                    const start = document.getElementById('leaveStart').value;
                    const end = document.getElementById('leaveEnd').value;

                    const res = this.applyLeave(this.currentUser.data.id, this.currentUser.data.hostelId, type, start, end, reason);
                    alert(res.message);
                    this.renderStudentContent('leaves');
                });
            }
        } else {
            document.querySelectorAll('.btn-approve-leave').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    if (confirm("Approve this leave request?")) {
                        const res = this.updateLeaveStatus(e.target.dataset.id, 'Approved');
                        alert(res.message);
                        this.renderRectorContent('leaves');
                    }
                });
            });

            document.querySelectorAll('.btn-reject-leave').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    if (confirm("Reject this leave request?")) {
                        const res = this.updateLeaveStatus(e.target.dataset.id, 'Rejected');
                        alert(res.message);
                        this.renderRectorContent('leaves');
                    }
                });
            });
        }
    },

    attachNoticeEvents(isRector = false) {
        if (isRector) {
            const toggle = document.getElementById('toggleNoticeForm');
            const formDiv = document.getElementById('newNoticeForm');
            if (toggle && formDiv) {
                toggle.addEventListener('click', () => {
                    formDiv.style.display = formDiv.style.display === 'none' ? 'block' : 'none';
                });
            }

            const form = document.getElementById('postNoticeForm');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const title = document.getElementById('noticeTitle').value;
                    const content = document.getElementById('noticeContent').value;
                    const res = this.postNotice(this.currentUser.data.id, title, content); // Hostel ID is same as Rector ID
                    alert(res.message);
                    this.renderRectorContent('notices');
                });
            }
        }
    },

    attachSettingsEvents() {
        // Password Change
        const passForm = document.getElementById('changePassForm');
        if (passForm) {
            passForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const curr = document.getElementById('currPass').value;
                const newP = document.getElementById('newPass').value;
                const confP = document.getElementById('confirmPass').value;

                if (newP !== confP) return alert("New passwords do not match!");
                if (newP.length < 6) return alert("Password too short!");

                const res = this.updatePassword(curr, newP);
                alert(res.message);
                if (res.success) passForm.reset();
            });
        }

        // Avatar Upload
        const fileInput = document.getElementById('avatarUpload');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                if (file.size > 1024 * 1024) return alert("File too large! Max 1MB.");

                const reader = new FileReader();
                reader.onloadend = () => {
                    const res = this.updateAvatar(reader.result);
                    alert(res.message);
                    // Update preview
                    const preview = document.getElementById('settingsAvatarPreview');
                    preview.style.backgroundImage = `url(${reader.result})`;
                    preview.style.backgroundSize = 'cover';
                    preview.style.color = 'transparent';
                };
                reader.readAsDataURL(file);
            });
        }

        // Load current avatar into preview if exists
        const user = this.currentUser.data;
        const currentAvatar = this.currentUser.role === 'rector' ? user.avatar : user.avatar;
        if (currentAvatar) {
            const preview = document.getElementById('settingsAvatarPreview');
            if (preview) {
                preview.style.backgroundImage = `url(${currentAvatar})`;
                preview.style.backgroundSize = 'cover';
                preview.style.color = 'transparent';
            }
        }

        // Database Export (Super Admin Only)
        const exportCsvBtn = document.getElementById('exportCsvBtn');
        if (exportCsvBtn) exportCsvBtn.addEventListener('click', () => this.exportToCSV());

        const exportExcelBtn = document.getElementById('exportExcelBtn');
        if (exportExcelBtn) exportExcelBtn.addEventListener('click', () => this.exportToExcel());

        const exportPdfBtn = document.getElementById('exportPdfBtn');
        if (exportPdfBtn) exportPdfBtn.addEventListener('click', () => this.exportToPDF());

        // Admin Reset
        const adminResetForm = document.getElementById('adminResetForm');
        if (adminResetForm) {
            adminResetForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const iden = document.getElementById('resetIdentifier').value.toLowerCase();
                const newPass = document.getElementById('resetNewPass').value;

                // Search in Hostels (Rectors)
                const hostel = this.state.hostels.find(h =>
                    (h.rectorId && h.rectorId.toLowerCase() === iden) ||
                    (h.rectorEmail && h.rectorEmail.toLowerCase() === iden)
                );

                if (hostel) {
                    hostel.rectorPassword = newPass;
                    this.saveState();
                    alert(`Password for Rector ${hostel.rectorName} reset successfully!`);
                    adminResetForm.reset();
                    return;
                }

                // Search in Students
                const student = this.state.students.find(s =>
                    (s.id && s.id.toLowerCase() === iden) ||
                    (s.email && s.email.toLowerCase() === iden)
                );

                if (student) {
                    student.password = newPass;
                    this.saveState();
                    alert(`Password for Student ${student.name} reset successfully!`);
                    adminResetForm.reset();
                    return;
                }

                alert("User not found (Check UID or Email)");
            });
        }
    },

    attachFeesEvents() {
        const toggleBulk = document.getElementById('toggleBulkFee');
        const bulkFormDiv = document.getElementById('bulkFeeForm');
        if (toggleBulk && bulkFormDiv) {
            toggleBulk.addEventListener('click', () => {
                bulkFormDiv.style.display = bulkFormDiv.style.display === 'none' ? 'block' : 'none';
            });
        }

        const downloadBtn = document.getElementById('downloadAllReceipts');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.generateBulkReceipts());
        }

        const bulkForm = document.getElementById('submitBulkFeeForm');
        if (bulkForm) {
            bulkForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const amount = document.getElementById('bulkAmount').value;
                const dueDate = document.getElementById('bulkDueDate').value;
                const hostel = this.currentUser.data;
                const students = this.state.students.filter(s => s.hostelId === hostel.id);

                students.forEach(s => {
                    // Only add if no record exists or it's paid
                    const existing = this.state.fees.find(f => f.studentId === s.id && f.status !== 'paid');
                    if (!existing) {
                        this.addFeeRecord(s.id, hostel.id, amount, dueDate);
                    }
                });
                alert("Bulk fee records created for all students!");
                this.renderRectorContent('fees');
            });
        }

        document.querySelectorAll('.btn-add-fee').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sId = e.currentTarget.dataset.studentId;
                const amount = prompt("Enter Fee Amount:");
                if (!amount) return;
                const date = prompt("Enter Due Date (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
                if (date) {
                    this.addFeeRecord(sId, this.currentUser.data.id, amount, date);
                    this.renderRectorContent('fees');
                }
            });
        });

        document.querySelectorAll('.btn-mark-paid').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const fId = e.currentTarget.dataset.feeId;
                if (confirm("Mark this fee as paid?")) {
                    this.updateFeeStatus(fId, 'paid', new Date().toLocaleDateString());
                    this.renderRectorContent('fees');
                }
            });
        });

        document.querySelectorAll('.btn-send-reminder').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sId = e.currentTarget.dataset.studentId;
                const fId = e.currentTarget.dataset.feeId;
                const res = this.sendFeeReminder(sId, fId);
                alert(res.message);
                this.renderRectorContent('fees');
            });
        });

        document.querySelectorAll('.btn-update-fee').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const fId = e.currentTarget.dataset.feeId;
                const oldAmount = e.currentTarget.dataset.amount;
                const oldDate = e.currentTarget.dataset.date;

                const amount = prompt("Update Fee Amount:", oldAmount);
                if (amount === null) return;
                const date = prompt("Update Due Date (YYYY-MM-DD):", oldDate);
                if (date) {
                    this.updateFeeRecord(fId, amount, date);
                    this.renderRectorContent('fees');
                }
            });
        });

        document.querySelectorAll('.btn-delete-fee').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const fId = e.currentTarget.dataset.feeId;
                if (confirm("Are you sure you want to delete this fee record permanentely?")) {
                    const res = this.deleteFeeRecord(fId);
                    if (res.success) {
                        this.renderRectorContent('fees');
                    } else {
                        alert(res.message);
                    }
                }
            });
        });
    },

    attachStudentFeeEvents() {
        document.querySelectorAll('.btn-pay-now').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const fId = e.currentTarget.dataset.feeId;
                const amount = e.currentTarget.dataset.amount;
                // Instead of direct payment, show options
                const feeCard = e.currentTarget.closest('div');
                const existingOptions = feeCard.querySelector('.payment-selection');
                if (existingOptions) {
                    existingOptions.remove();
                    return;
                }

                const optionsHTML = `
                    <div class="payment-selection animate-fade-in">
                        <button class="btn-primary btn-sim-pay" data-fee-id="${fId}" style="font-size: 0.8rem; padding: 10px;">Simulate Online</button>
                        <button class="btn-primary btn-qr-pay" data-fee-id="${fId}" data-amount="${amount}" style="font-size: 0.8rem; padding: 10px; background: var(--secondary);">Cash or Scanner</button>
                    </div>
                `;
                e.currentTarget.insertAdjacentHTML('afterend', optionsHTML);

                // Attach nested events
                feeCard.querySelector('.btn-sim-pay').addEventListener('click', () => {
                    if (confirm("Proceed with simulated online payment?")) {
                        const res = this.payFeeByStudent(fId);
                        alert(res.message);
                        this.renderStudentContent('fees');
                    }
                });

                feeCard.querySelector('.btn-qr-pay').addEventListener('click', () => {
                    this.showQRCodeModal(amount, fId);
                });
            });
        });

        document.querySelectorAll('.btn-view-receipt').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const fId = e.currentTarget.dataset.feeId;
                this.generateReceipt(fId);
            });
        });
    },

    attachStudentManagementEvents() {
        // Approvals
        document.querySelectorAll('.btn-approve').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const reqId = e.target.dataset.id;
                const room = prompt("Assign Room Number:");
                if (room) {
                    const res = this.approveStudent(reqId, room);
                    if (res && !res.success) alert(res.message);
                }
            });
        });

        document.querySelectorAll('.btn-reject').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (confirm('Reject this request?')) {
                    this.rejectStudent(e.target.dataset.id);
                }
            });
        });

        // Manual Add Student
        const toggleBtn = document.getElementById('toggleAddStudent');
        const formDiv = document.getElementById('addStudentForm');
        const form = document.getElementById('manualAddForm');

        if (toggleBtn && formDiv) {
            toggleBtn.addEventListener('click', () => {
                formDiv.style.display = formDiv.style.display === 'none' ? 'block' : 'none';
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const result = this.addStudentDirectly(
                    document.getElementById('newSName').value,
                    this.currentUser.data.id,
                    document.getElementById('newSRoom').value,
                    document.getElementById('newSPass').value
                );
                alert(result.message);
                this.renderRectorContent('students');
            });
        }

        // View Guardian
        document.querySelectorAll('.btn-view-guardian').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const s = this.state.students.find(st => st.id === e.target.dataset.id);
                if (s && s.guardian) {
                    alert(`Guardian Details for ${s.name}:\n\nName: ${s.guardian.name}\nRelation: ${s.guardian.relation}\nPhone: ${s.guardian.phone}\nAddress: ${s.guardian.address}`);
                } else {
                    alert("Guardian details not provided by student yet.");
                }
            });
        });

        // Delete Student
        document.querySelectorAll('.btn-delete-student').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                if (confirm(`Remove student ${id} from this hostel?`)) {
                    this.deleteStudent(id);
                    this.renderRectorContent('students');
                }
            });
        });
    },

    attachStudentEvents() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                const navItem = e.target.closest('.nav-item');
                navItem.classList.add('active');

                const view = navItem.dataset.view;
                this.renderStudentContent(view);
            });
        });
    },

    showQRCodeModal(amount, feeId) {
        const modalHTML = `
            <div class="qr-modal-overlay" id="qrModal">
                <div class="glass-panel qr-modal-content">
                    <h3 style="margin-bottom: 10px;">Scan to Pay</h3>
                    <p style="font-size: 0.9rem; color: var(--text-muted);">Pay ₹${amount} using any UPI App</p>
                    
                    <div class="qr-image-container">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=merchant@upi&pn=LuminaHostel&am=${amount}&cu=INR&tn=HostelFee`)}" alt="Payment QR Code">
                    </div>
                    
                    <div class="qr-timer">
                        <i class="bi bi-clock-history"></i> QR code valid for 5:00 minutes
                    </div>

                    <div style="display: grid; gap: 10px;">
                        <button class="btn-primary" id="confirmQRBtn" style="background: #10b981;">I have paid</button>
                        <button class="btn-primary" id="closeQRBtn" style="background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border);">Cancel</button>
                    </div>
                </div>
            </div>
        `;

        const div = document.createElement('div');
        div.innerHTML = modalHTML;
        document.body.appendChild(div.firstElementChild);

        document.getElementById('closeQRBtn').addEventListener('click', () => {
            document.getElementById('qrModal').remove();
        });

        document.getElementById('confirmQRBtn').addEventListener('click', () => {
            if (confirm("Confirm that you have scanned and paid ₹" + amount + "?")) {
                const res = this.payFeeByStudent(feeId);
                alert("Payment Success! The rector will verify your cash/scanner receipt.");
                document.getElementById('qrModal').remove();
                this.renderStudentContent('fees');
            }
        });
    },

    renderStudentContent(view) {
        const mainContent = document.querySelector('main.content');
        if (!mainContent) return;

        this.currentView = view;
        const user = this.currentUser;

        if (view === 'dashboard') {
            const notices = this.state.notices.filter(n => n.hostelId === user.data.hostelId).reverse().slice(0, 2);
            mainContent.innerHTML = `
                 <div class="glass-panel" style="padding: 40px; text-align: center;">
                    <div style="width: 100px; height: 100px; background: rgba(139, 92, 246, 0.2); color: var(--accent); margin: 0 auto 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 3rem;">
                        ${user.data.avatar
                    ? `<div style="width:100%; height:100%; border-radius:50%; background:url(${user.data.avatar}) center/cover;"></div>`
                    : '<i class="bi bi-house-heart-fill"></i>'
                }
                    </div>
                    <h1>${user.hostelName || 'Your Hostel'}</h1>
                    <p style="color: var(--text-muted); margin-bottom: 40px;">Welcome to your digital home.</p>
                    
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 600px; margin: 0 auto 30px;">
                        <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 16px;">
                            <div style="font-size: 0.9rem; color: var(--text-muted);">Room Number</div>
                            <div style="font-size: 1.5rem; font-weight: 700;">${user.data.room || 'N/A'}</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 16px;">
                            <div style="font-size: 0.9rem; color: var(--text-muted);">Student UID</div>
                            <div style="font-size: 1.5rem; font-weight: 700; font-family: monospace;">${user.data.id || 'N/A'}</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 16px;">
                            <div style="font-size: 0.9rem; color: var(--text-muted);">Joined</div>
                            <div style="font-size: 1.5rem; font-weight: 700;">${user.data.joinedDate || '-'}</div>
                        </div>
                    </div>

                    <div style="max-width: 600px; margin: 0 auto; text-align: left;">
                        <h4 style="margin-bottom: 15px;"><i class="bi bi-megaphone"></i> Latest Notices</h4>
                        ${notices.length > 0 ? notices.map(n => `
                            <div style="background: rgba(139, 92, 246, 0.1); border-left: 4px solid var(--accent); padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                                <div style="font-weight: 600; margin-bottom: 5px;">${n.title}</div>
                                <div style="font-size: 0.85rem; opacity: 0.8;">${n.content}</div>
                                <div style="font-size: 0.75rem; opacity: 0.5; margin-top: 5px;">${n.date}</div>
                            </div>
                        `).join('') : '<div style="opacity:0.5; font-style:italic;">No active notices.</div>'}
                    </div>
                 </div>
             `;
        } else if (view === 'mates') {
            const mates = this.state.students.filter(s => s.hostelId === user.data.hostelId);
            mainContent.innerHTML = `
                <div class="glass-panel" style="padding: 30px;">
                    <h2 style="margin-bottom: 25px;"><i class="bi bi-people-fill"></i> Your Hostel Mates</h2>
                    <div class="table-container">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="text-align: left; opacity: 0.7; border-bottom: 1px solid var(--glass-border);">
                                    <th style="padding: 15px;">Name</th>
                                    <th style="padding: 15px;">Room</th>
                                    <th style="padding: 15px;">Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${mates.map(m => `
                                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                        <td style="padding: 15px;">
                                            <div style="display:flex; align-items:center; gap:10px;">
                                                <div class="avatar" style="width:30px; height:30px; font-size:0.8rem; background: var(--accent); ${m.avatar ? `background-image: url(${m.avatar}); background-size: cover; color:transparent;` : ''}">${m.name ? m.name[0] : 'S'}</div>
                                                ${m.name} ${m.id === user.data.id ? '<span style="font-size:0.7rem; background:var(--accent); padding:2px 6px; border-radius:10px; color:white;">You</span>' : ''}
                                            </div>
                                        </td>
                                        <td style="padding: 15px;">${m.room}</td>
                                        <td style="padding: 15px;">${m.joinedDate}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } else if (view === 'guardian') {
            const student = user.data;
            mainContent.innerHTML = `
                <div class="glass-panel" style="max-width: 600px; margin: 0 auto; padding: 30px;">
                    <h2 style="margin-bottom: 25px;"><i class="bi bi-person-heart"></i> Guardian Details</h2>
                    <p style="color: var(--text-muted); margin-bottom: 30px;">This information is only visible to you and your Hostel Rector.</p>
                    
                    <form id="guardianForm" style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                        <div class="form-group" style="grid-column: span 2;">
                            <label class="form-label">Guardian Name</label>
                            <input type="text" id="gName" class="form-input" value="${student.guardian ? student.guardian.name : ''}" placeholder="Full Name of Guardian" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Relation</label>
                            <input type="text" id="gRelation" class="form-input" value="${student.guardian ? student.guardian.relation : ''}" placeholder="e.g. Father, Mother" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Phone Number</label>
                            <input type="tel" id="gPhone" class="form-input" value="${student.guardian ? student.guardian.phone : ''}" placeholder="10-digit number" required>
                        </div>
                        <div class="form-group" style="grid-column: span 2;">
                            <label class="form-label">Full Address</label>
                            <textarea id="gAddress" class="form-input" rows="3" placeholder="Permanent Home Address" required>${student.guardian ? student.guardian.address : ''}</textarea>
                        </div>
                        <button type="submit" class="btn-primary" style="grid-column: span 2; padding: 15px;">Update Guardian Details</button>
                    </form>
                </div>
            `;
            // Attach Event
            const gForm = document.getElementById('guardianForm');
            if (gForm) {
                gForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const guardian = {
                        name: document.getElementById('gName').value,
                        relation: document.getElementById('gRelation').value,
                        phone: document.getElementById('gPhone').value,
                        address: document.getElementById('gAddress').value
                    };
                    const st = this.state.students.find(s => s.id === user.data.id);
                    if (st) {
                        st.guardian = guardian;
                        this.saveState();
                        alert("Guardian details updated successfully!");
                    }
                });
            }
        } else if (view === 'mess') {
            const reviews = this.state.messReviews.filter(r => r.hostelId === user.data.hostelId) || [];
            const myReviews = reviews.filter(r => r.studentId === user.data.id);
            const menu = this.state.messMenus.find(m => m.hostelId === user.data.hostelId);
            mainContent.innerHTML = Components.studentMess(myReviews.reverse(), menu);

            // Attach Event
            const form = document.getElementById('messReviewForm');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const rating = document.querySelector('input[name="rating"]:checked').value;
                    const comment = document.getElementById('messComment').value;
                    const res = this.submitMessReview(user.data.id, user.data.hostelId, parseInt(rating), comment);
                    alert(res.message);
                    this.renderStudentContent('mess'); // Refresh to show new review
                });
            }
        } else if (view === 'fees') {
            const studentFees = this.state.fees.filter(f => f.studentId === user.data.id) || [];
            mainContent.innerHTML = Components.studentFees(studentFees, user.data);
            this.attachStudentFeeEvents();
        } else if (view === 'settings') {
            mainContent.innerHTML = Components.settings();
            this.attachSettingsEvents();
        } else if (view === 'complaints') {
            const complaints = this.state.complaints.filter(c => c.studentId === user.data.id) || [];
            mainContent.innerHTML = Components.complaintsList(complaints.reverse(), false);
            this.attachComplaintEvents(false);
        } else if (view === 'chat') {
            this.renderChatView();
        } else if (view === 'notices') {
            const notices = this.state.notices.filter(n => n.hostelId === user.data.hostelId) || [];
            mainContent.innerHTML = Components.noticeBoard(notices.reverse(), false);
        } else if (view === 'leaves') {
            const leaves = this.state.leaves.filter(l => l.studentId === user.data.id) || [];
            mainContent.innerHTML = Components.leaveApplication(leaves.reverse());
            this.attachLeaveEvents(false);
        } else if (view === 'ai') {
            mainContent.innerHTML = Components.aiView();
            this.attachAiEvents();
        } else if (view === 'health') {
            mainContent.innerHTML = Components.medicalProfile(user.data);
            this.attachMedicalEvents();
        } else if (view === 'amenities') {
            const bookings = this.state.amenities.filter(b => b.studentId === user.data.id) || [];
            mainContent.innerHTML = Components.amenitiesBooking(bookings.reverse(), user.data.id);
            this.attachAmenitiesEvents();
        } else if (view === 'report') {
            mainContent.innerHTML = Components.reportSystemIssue();
            this.attachReportEvents();
        }
    },

    attachMedicalEvents() {
        const form = document.getElementById('medicalForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const medicalInfo = {
                    bloodGroup: document.getElementById('mBlood').value,
                    emergencyPhone: document.getElementById('mEmergency').value,
                    allergies: document.getElementById('mAllergies').value
                };
                const student = this.state.students.find(s => s.id === this.currentUser.data.id);
                if (student) {
                    student.medicalInfo = medicalInfo;
                    this.saveState();
                    alert("Health Profile updated successfully!");
                }
            });
        }
    },

    attachAmenitiesEvents() {
        document.querySelectorAll('.booking-form').forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const type = form.dataset.type;
                const timeSlot = form.querySelector('.slot-select').value;
                const studentId = this.currentUser.data.id;

                const booking = {
                    id: 'BK' + Date.now(),
                    type,
                    studentId,
                    timeSlot,
                    date: new Date().toLocaleDateString()
                };

                this.state.amenities.push(booking);
                this.saveState();
                alert(`Booking confirmed for ${type} at ${timeSlot}!`);
                this.renderStudentContent('amenities');
            });
        });
    },

    renderChatView(selectedId = null) {
        const mainContent = document.querySelector('main.content');
        if (!mainContent) return;

        const students = this.state.students.filter(s => s.hostelId === this.currentUser.data.hostelId && s.id !== this.currentUser.data.id);
        const contacts = [...students];

        mainContent.innerHTML = Components.chatView(contacts, selectedId);
        this.attachChatEvents(contacts);

        // Improved Scroll to bottom
        setTimeout(() => {
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }, 50);
    },

    attachChatEvents(contacts) {
        // Contact selection
        document.querySelectorAll('.chat-contact').forEach(contact => {
            contact.addEventListener('click', () => {
                const id = contact.dataset.id;
                this.renderChatView(id);
            });
        });

        // Chat form submission
        const chatForm = document.getElementById('chatForm');
        if (chatForm) {
            chatForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const recipientId = document.getElementById('recipientId').value;
                const messageInput = document.getElementById('chatMsgInput');
                const message = messageInput.value;

                if (message.trim()) {
                    this.sendChatMessage(recipientId, message);
                    messageInput.value = '';
                    this.renderChatView(recipientId);
                }
            });
        }
    },

    attachAiEvents() {
        const aiForm = document.getElementById('aiChatForm');
        if (aiForm) {
            aiForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const input = document.getElementById('aiMsgInput');
                const message = input.value.trim();
                if (!message) return;

                // Add User Message
                this.state.chats.push({
                    from: this.currentUser.data.id,
                    to: 'AI_ASSISTANT',
                    message,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                });

                input.value = '';
                this.renderAiChat();

                // Get conversation history for context
                const aiChats = this.state.chats.filter(c =>
                    (c.from === this.currentUser.data.id && c.to === 'AI_ASSISTANT') ||
                    (c.from === 'AI_ASSISTANT' && c.to === this.currentUser.data.id)
                );

                // Get AI Response with conversation history
                setTimeout(() => {
                    const response = this.helpers.getAIResponse(message, aiChats);
                    this.state.chats.push({
                        from: 'AI_ASSISTANT',
                        to: this.currentUser.data.id,
                        message: response,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    });
                    this.saveState();
                    this.renderAiChat();
                }, 800);
            });
        }
    },

    renderAiChat() {
        const container = document.getElementById('aiMessages');
        if (!container) return;

        const aiChats = this.state.chats.filter(c =>
            (c.from === this.currentUser.data.id && c.to === 'AI_ASSISTANT') ||
            (c.from === 'AI_ASSISTANT' && c.to === this.currentUser.data.id)
        );

        container.innerHTML = aiChats.map(m => {
            const isMe = m.from === this.currentUser.data.id;
            return `
                <div style="display: flex; flex-direction: column; align-items: ${isMe ? 'flex-end' : 'flex-start'};">
                    <div style="max-width: 85%; padding: 12px 18px; border-radius: 18px; border-bottom-${isMe ? 'right' : 'left'}-radius: 4px; background: ${isMe ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'rgba(255,255,255,0.08)'}; color: white; font-size: 0.95rem; box-shadow: 0 4px 15px rgba(0,0,0,0.1); line-height: 1.5; white-space: pre-line;">
                        ${m.message}
                    </div>
                    <div style="font-size: 0.65rem; opacity: 0.5; margin-top: 5px; padding: 0 5px;">${m.timestamp}</div>
                </div>
            `;
        }).join('') || '<div style="flex: 1; display:flex; align-items:center; justify-content:center; opacity:0.4; font-style:italic; text-align:center;">I am your Lumina AI. Ask me anything about your hostel!</div>';

        // Fix Scroll
        requestAnimationFrame(() => {
            container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        });
    },
};

const Views = {
    auth: (hostels) => `
        <div class="glass-panel" style="max-width: 900px; width: 95%; display: flex; overflow: hidden; min-height: 500px;">
            <!-- Left Side: Login Form -->
            <div style="flex: 1; padding: 40px; border-right: 1px solid var(--glass-border);">
                 <div class="auth-header" style="margin-bottom: 30px; display: flex; gap: 10px;">
                    <button class="tab-btn active" data-target="loginPanel" style="flex:1; padding: 10px; border-radius:8px; border:none; background:rgba(255,255,255,0.05); color:white; font-weight:600; cursor:pointer;">
                        <i class="bi bi-box-arrow-in-right"></i> Sign In
                    </button>
                    <button class="tab-btn" data-target="signupPanel" style="flex:1; padding: 10px; border-radius:8px; border:none; background:rgba(255,255,255,0.05); color:white; font-weight:600; cursor:pointer;">
                        <i class="bi bi-person-plus"></i> Sign Up
                    </button>
                </div>

                <!-- Login Panel -->
                <div id="loginPanel" class="auth-form active">
                    <h2 style="margin-bottom: 20px;">Welcome Back</h2>
                    <form id="loginForm">
                        <div class="form-group">
                            <label class="form-label">Full Name / Email / UID</label>
                            <input type="text" id="loginId" class="form-input" placeholder="Enter your identifier" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Password</label>
                            <input type="password" id="loginPass" class="form-input" placeholder="••••••••" required>
                        </div>
                        <div style="text-align: right; margin-bottom: 20px;">
                            <button type="button" id="forgotPassBtn" style="background:none; border:none; color:var(--accent); cursor:pointer; font-size:0.9rem;">Forgot Password?</button>
                        </div>
                        <button type="submit" class="btn-primary" style="width: 100%;">Sign In</button>
                    </form>
                </div>

                <!-- Sign Up Panel -->
                <div id="signupPanel" class="auth-form">
                    <h2 style="margin-bottom: 20px;">Create Account</h2>
                    <form id="signupForm">
                        <div class="form-group">
                            <label class="form-label">Full Name</label>
                            <input type="text" id="regName" class="form-input" placeholder="John Doe" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Email Address</label>
                            <input type="email" id="regEmail" class="form-input" placeholder="john@example.com" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Select Campus</label>
                            <select id="regHostel" class="form-input" style="appearance: none;" required>
                                <option value="" disabled selected>Choose Campus...</option>
                                ${hostels.map(h => `<option value="${h.id}" style="color:black;">${h.name}</option>`).join('')}
                            </select>
                        </div>
                         <div class="form-group">
                            <label class="form-label">Phone Number</label>
                            <input type="tel" id="regPhone" class="form-input" placeholder="10-digit number" required>
                        </div>
                         <div class="form-group">
                            <label class="form-label">Password</label>
                            <input type="password" id="regPass" class="form-input" required>
                        </div>
                        <button type="submit" class="btn-primary" style="width: 100%;">Register</button>
                    </form>
                </div>

                <!-- Forgot Password Panel -->
                <div id="forgotPasswordPanel" class="auth-form">
                    <h2 style="margin-bottom: 20px;">Recover Password</h2>
                    <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 20px;">Enter your details to retrieve your password.</p>
                    <form id="forgotPassForm">
                        <div class="form-group">
                            <label class="form-label">Email / UID</label>
                            <input type="text" id="recoverId" class="form-input" placeholder="Enter Email or UID" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Registered Phone Number</label>
                            <input type="tel" id="recoverPhone" class="form-input" placeholder="10-digit number" required>
                        </div>
                        <button type="submit" class="btn-primary" style="width: 100%; margin-top: 10px;">Retrieve Password</button>
                        <button type="button" class="tab-btn" data-target="loginPanel" style="width: 100%; margin-top: 10px; background: none; border: 1px solid var(--glass-border); color: white; padding: 10px; border-radius: 8px; cursor: pointer;">Back to Sign In</button>
                    </form>
                    <div id="recoveryResult" style="margin-top: 20px; padding: 15px; border-radius: 8px; display: none;"></div>
                </div>
            </div>

            <!-- Right Side: Clean Visual -->
            <div style="flex: 1; position: relative; overflow: hidden; display: flex; align-items: flex-end; padding: 40px; background: url('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80') center/cover;">
                 <div style="position: absolute; inset:0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);"></div>
                 <div style="position: relative; z-index: 1;">
                    <h1 style="font-size: 2.5rem; margin-bottom: 15px; background: linear-gradient(135deg, #fff, #a5b4fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Lumina Hostel</h1>
                    <p style="font-size: 1.1rem; opacity: 0.9;">Experience premium student living with seamless management.</p>
                </div>
            </div>
        </div>
        <style>
            .tab-btn.active { background: var(--primary) !important; opacity: 1 !important; }
            .auth-form { display: none; }
            .auth-form.active { display: block !important; animation: fadeIn 0.4s ease; }
            .demo-btn:hover { background: rgba(255,255,255,0.1) !important; transform: translateX(5px); }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            
            @media (max-width: 800px) {
                .glass-panel { flex-direction: column; }
                .glass-panel > div { border-right: none; border-bottom: 1px solid var(--glass-border); }
            }
        </style>
    `,

    superAdmin: (state) => `
        <div class="dashboard-layout">
            <nav class="sidebar glass-panel">
                <div class="brand"><i class="bi bi-shield-lock-fill"></i> Super Admin</div>
                    <div class="nav-section">
                        <div class="nav-item active" data-view="dashboard"><i class="bi bi-speedometer2"></i> Dashboard</div>
                        <div class="nav-item" data-view="hostels"><i class="bi bi-building"></i> Hostels</div>
                        <div class="nav-item" data-view="rectors"><i class="bi bi-person-badge"></i> All Rectors</div>
                        <div class="nav-item" data-view="all-students"><i class="bi bi-people"></i> All Students</div>
                        <div class="nav-item" data-view="bug-reports"><i class="bi bi-bug"></i> Bug Fixes ${App.state.systemReports.filter(r => r.status === 'New').length > 0 ? `<span class="badge-count">${App.state.systemReports.filter(r => r.status === 'New').length}</span>` : ''}</div>
                        <div class="nav-item" data-view="settings"><i class="bi bi-gear"></i> Settings</div>
                    </div>
                 <div class="user-profile">
                      <div class="avatar" style="background: linear-gradient(135deg, #f59e0b, #d97706); font-weight:700;">D</div>
                      <div class="info">
                         <div class="name">Divyesh</div>
                         <div style="font-size:0.75rem; opacity:0.9; font-family:monospace; color:var(--accent); margin: 2px 0;">UID: divyesh112006</div>
                         <button id="logoutBtn" style="background:none; border:none; color: var(--secondary); cursor:pointer; font-size: 0.8rem; padding:0;">Logout</button>
                     </div>
                 </div>
            </nav>
            <main class="content">
                <header class="top-bar glass-panel">
                    <h3>Platform Administration</h3>
                    <div class="date">${new Date().toLocaleDateString()}</div>
                </header>
                <div id="content-area"></div>
            </main>
        </div>
    `,

    rector: (state, hostel) => {
        if (!hostel) return '<div style="color:white; padding:20px;">Error: Invalid Hostel Configuration</div>';
        return `
        <div class="dashboard-layout">
            <nav class="sidebar glass-panel">
                <div class="brand">
                    <i class="bi bi-building"></i> ${hostel.name || 'My Hostel'}
                </div>
                <div class="nav-links">
                    <div class="nav-item active" data-view="dashboard"><i class="bi bi-grid-1x2-fill"></i> Dashboard</div>
                    <div class="nav-item" data-view="students"><i class="bi bi-people-fill"></i> Students</div>
                    <div class="nav-item" data-view="rooms"><i class="bi bi-door-open-fill"></i> Rooms</div>
                    <div class="nav-item" data-view="fees"><i class="bi bi-cash-coin"></i> Fees</div>
                    <div class="nav-item" data-view="mess"><i class="bi bi-egg-fried"></i> Mess</div>
                 <div class="nav-item" data-view="complaints"><i class="bi bi-exclamation-circle"></i> Complaints</div>
                 <div class="nav-item" data-view="notices"><i class="bi bi-megaphone"></i> Notices</div>
                     <div class="nav-item" data-view="leaves"><i class="bi bi-pass-fill"></i> Leave Requests</div>
                     <div class="nav-item" data-view="ai"><i class="bi bi-robot"></i> AI Assistant</div>
                     <div class="nav-item" data-view="report"><i class="bi bi-bug"></i> Report Issue</div>
                     <div class="nav-item" data-view="settings"><i class="bi bi-gear-fill"></i> Settings</div>
                </div>
                 <div class="user-profile">
                     <div class="avatar" style="${hostel.avatar ? `background-image: url(${hostel.avatar}); background-size: cover; text-indent: -9999px;` : ''}">R</div>
                     <div class="info">
                        <div class="name">${hostel.rectorName || 'Rector Admin'}</div>
                        <div class="role" style="font-family:monospace; font-size: 0.75rem; opacity:0.9; color:var(--accent); margin: 2px 0;">UID: ${hostel.rectorId || hostel.id}</div>
                        <button id="logoutBtn" style="background:none; border:none; color: var(--secondary); cursor:pointer; font-size: 0.8rem; padding:0;">Logout</button>
                    </div>
                </div>
            </nav>
            <main class="content">
                <header class="top-bar glass-panel">
                    <h3>Hostel Management</h3>
                    <div class="date">${new Date().toLocaleDateString()}</div>
                </header>
                <div id="content-area"></div>
            </main>
        </div>
    `},

    student: (user) => {
        if (!user || !user.data) return '<div class="text-error">Error: Student data missing</div>';
        return `
         <div class="dashboard-layout">
            <nav class="sidebar glass-panel">
                <div class="brand"><i class="bi bi-mortarboard-fill"></i> Student Portal</div>
                <div class="nav-links">
                     <div class="nav-item active" data-view="dashboard"><i class="bi bi-grid-1x2-fill"></i> Dashboard</div>
                     <div class="nav-item" data-view="mates"><i class="bi bi-people-fill"></i> Hostel Mates</div>
                     <div class="nav-item" data-view="guardian"><i class="bi bi-person-heart"></i> Guardian Info</div>
                     <div class="nav-item" data-view="fees"><i class="bi bi-cash-coin"></i> Fees</div>
                     <div class="nav-item" data-view="mess"><i class="bi bi-egg-fried"></i> Mess</div>
                     <div class="nav-item" data-view="complaints"><i class="bi bi-exclamation-circle"></i> Complaints</div>
                      <div class="nav-item" data-view="notices"><i class="bi bi-megaphone"></i> Notices</div>
                      <div class="nav-item" data-view="leaves"><i class="bi bi-pass-fill"></i> Gate Pass</div>
                      <div class="nav-item" data-view="amenities"><i class="bi bi-calendar-check-fill"></i> Amenities</div>
                      <div class="nav-item" data-view="health"><i class="bi bi-heart-pulse-fill"></i> Health Profile</div>
                       <div class="nav-item" data-view="chat"><i class="bi bi-chat-dots-fill"></i> Chat</div>
                       <div class="nav-item" data-view="ai"><i class="bi bi-robot"></i> AI Assistant</div>
                       <div class="nav-item" data-view="report"><i class="bi bi-bug"></i> Report Issue</div>
                       <div class="nav-item" data-view="settings"><i class="bi bi-gear-fill"></i> Settings</div>
                </div>
                 <div class="user-profile">
                     <div class="avatar" style="background: var(--accent); ${user.data.avatar ? `background-image: url(${user.data.avatar}); background-size: cover; color:transparent;` : ''}">
                        ${user.data.name ? user.data.name[0] : 'S'}
                     </div>
                     <div class="info">
                        <div class="name">${user.data.name || 'Student'}</div>
                        <div class="role" style="font-family:monospace; font-size: 0.75rem; opacity:0.9; color:var(--accent); margin: 2px 0;">UID: ${user.data.id || 'N/A'}</div>
                        <button id="logoutBtn" style="background:none; border:none; color: var(--secondary); cursor:pointer; font-size: 0.8rem; padding:0;">Logout</button>
                    </div>
                 </div>
            </nav>
            <main class="content">
                <header class="top-bar glass-panel">
                    <h3>Student Dashboard</h3>
                    <div class="date">${new Date().toLocaleDateString()}</div>
                </header>
                <div id="content-area">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 600px; margin: 0 auto;">
                        <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 16px;">
                            <div style="font-size: 0.9rem; color: var(--text-muted);">Room Number</div>
                            <div style="font-size: 1.5rem; font-weight: 700;">${user.data.room || 'N/A'}</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 16px;">
                            <div style="font-size: 0.9rem; color: var(--text-muted);">Student ID</div>
                            <div style="font-size: 1.5rem; font-weight: 700;">${user.data.id || 'N/A'}</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 16px;">
                            <div style="font-size: 0.9rem; color: var(--text-muted);">Joined</div>
                            <div style="font-size: 1.5rem; font-weight: 700;">${user.data.joinedDate || '-'}</div>
                        </div>
                    </div>
                 </div>
            </main>
        </div>
    `
    }
};

const Components = {
    adminHostelManagement: (hostels) => `
        <div class="glass-panel" style="padding: 30px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 30px;">
                <h2>Hostel Registry</h2>
            </div>

            <!-- Create New Hostel -->
            <div style="background: rgba(255,255,255,0.05); border-radius: 16px; padding: 25px; margin-bottom: 30px; border: 1px dashed var(--glass-border);">
                <h4 style="margin-bottom: 20px; color: var(--primary-light);"><i class="bi bi-plus-circle"></i> Register Hostel & Rector Account</h4>
                <form id="createHostelForm" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; align-items:end;">
                    <div><label class="form-label">Hostel Name</label><input type="text" id="hName" class="form-input" required></div>
                    <div><label class="form-label">Rector Name</label><input type="text" id="hRector" class="form-input" required></div>
                    <div><label class="form-label">Rector Email</label><input type="email" id="hRectorEmail" class="form-input" required></div>
                    <div><label class="form-label">Rector Password</label><input type="text" id="hPass" class="form-input" required></div>
                    <div><label class="form-label">Total Rooms</label><input type="number" id="hRooms" class="form-input" required></div>
                    <button class="btn-primary">Create Hostel</button>
                </form>
            </div>

            <!-- List -->
            <div class="table-container">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="text-align: left; opacity: 0.7; border-bottom: 1px solid var(--glass-border);">
                            <th style="padding: 15px;">Hostel ID</th>
                            <th style="padding: 15px;">Hostel Name</th>
                            <th style="padding: 15px;">Rector Name / UID</th>
                            <th style="padding: 15px;">Rooms</th>
                            <th style="padding: 15px;">Occupancy</th>
                            <th style="padding: 15px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${hostels.map(h => {
        const occ = h.rooms.filter(r => r.occupants.length > 0).length;
        return `
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <td style="padding: 15px; font-family:monospace;">${h.id}</td>
                                <td style="padding: 15px; font-weight: 600;">${h.name}</td>
                                <td style="padding: 15px;">
                                    <div style="font-weight:600;">${h.rectorName || 'N/A'}</div>
                                    <div style="font-size:0.75rem; opacity:0.7; font-family:monospace;">${h.rectorId || 'N/A'}</div>
                                </td>
                                <td style="padding: 15px;">${h.totalRooms}</td>
                                <td style="padding: 15px;">${occ} / ${h.totalRooms}</td>
                                <td style="padding: 15px;">
                                    <button class="btn-delete-hostel" data-id="${h.id}" style="background:rgba(239, 68, 68, 0.2); color:#f87171; border:1px solid rgba(239, 68, 68, 0.3); padding:5px 10px; border-radius:6px; cursor:pointer;">Delete</button>
                                </td>
                            </tr>
                            `;
    }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `,

    adminStats: (hostels, students, complaints) => {
        const totalRooms = hostels.reduce((sum, h) => sum + h.totalRooms, 0);
        const totalCapacity = totalRooms * 2;
        const totalOccupancy = students.length;
        const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;
        const pendingComplaints = complaints.filter(c => c.status === 'Pending').length;

        return `
        <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
             <div class="stat-card glass-panel" style="padding: 20px; border-radius: 16px; display: flex; align-items: center; gap: 20px;">
                <div class="icon" style="width: 50px; height: 50px; border-radius: 12px; background: rgba(99, 102, 241, 0.2); color: #6366f1; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;"><i class="bi bi-building"></i></div>
                <div class="info">
                    <div class="label" style="font-size: 0.9rem; color: var(--text-muted);">Total Hostels</div>
                    <div class="value" style="font-size: 1.5rem; font-weight: 700;">${hostels.length}</div>
                </div>
            </div>
             <div class="stat-card glass-panel" style="padding: 20px; border-radius: 16px; display: flex; align-items: center; gap: 20px;">
                <div class="icon" style="width: 50px; height: 50px; border-radius: 12px; background: rgba(16, 185, 129, 0.2); color: #10b981; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;"><i class="bi bi-people"></i></div>
                <div class="info">
                    <div class="label" style="font-size: 0.9rem; color: var(--text-muted);">Total Students</div>
                    <div class="value" style="font-size: 1.5rem; font-weight: 700;">${students.length}</div>
                </div>
            </div>
             <div class="stat-card glass-panel" style="padding: 20px; border-radius: 16px; display: flex; align-items: center; gap: 20px;">
                <div class="icon" style="width: 50px; height: 50px; border-radius: 12px; background: rgba(236, 72, 153, 0.2); color: var(--secondary); display: flex; align-items: center; justify-content: center; font-size: 1.5rem;"><i class="bi bi-pie-chart-fill"></i></div>
                <div class="info">
                    <div class="label" style="font-size: 0.9rem; color: var(--text-muted);">Occupancy Rate</div>
                    <div class="value" style="font-size: 1.5rem; font-weight: 700;">${occupancyRate}%</div>
                </div>
            </div>
             <div class="stat-card glass-panel" style="padding: 20px; border-radius: 16px; display: flex; align-items: center; gap: 20px;">
                <div class="icon" style="width: 50px; height: 50px; border-radius: 12px; background: rgba(245, 158, 11, 0.2); color: #f59e0b; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;"><i class="bi bi-bug"></i></div>
                <div class="info">
                    <div class="label" style="font-size: 0.9rem; color: var(--text-muted);">Bug Reports</div>
                    <div class="value" style="font-size: 1.5rem; font-weight: 700;">${App.state.systemReports.filter(r => r.status === 'New').length}</div>
                </div>
            </div>
        </div>
        `;
    },

    adminRectorList: (hostels) => `
        <div class="glass-panel" style="padding: 30px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 30px;">
                <h2>Rector Directory</h2>
                <div class="search-box">
                    <i class="bi bi-search" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); opacity: 0.5;"></i>
                    <input type="text" id="adminSearchInput" class="form-input" placeholder="Search by name, ID or hostel..." style="padding-left: 40px; width: 300px;">
                </div>
            </div>

            <div class="table-container">
                <table id="adminSearchTable" style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="text-align: left; opacity: 0.7; border-bottom: 1px solid var(--glass-border);">
                            <th style="padding: 15px;">Rector UID</th>
                            <th style="padding: 15px;">Name</th>
                            <th style="padding: 15px;">Hostel Name</th>
                            <th style="padding: 15px;">Email</th>
                            <th style="padding: 15px;">Current Password</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${hostels.map(h => `
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <td style="padding: 15px; font-family:monospace;">${h.rectorId || 'N/A'}</td>
                                <td style="padding: 15px; font-weight: 600;">${h.rectorName || 'N/A'}</td>
                                <td style="padding: 15px; color:var(--primary-light);">${h.name}</td>
                                <td style="padding: 15px;">${h.rectorEmail || 'N/A'}</td>
                                <td style="padding: 15px;">${h.rectorPassword}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `,

    adminStudentList: (students, hostels) => `
        <div class="glass-panel" style="padding: 30px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 30px;">
                <h2>Global Student Directory</h2>
                <div class="search-box">
                    <i class="bi bi-search" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); opacity: 0.5;"></i>
                    <input type="text" id="adminSearchInput" class="form-input" placeholder="Search by name or UID..." style="padding-left: 40px; width: 300px;">
                </div>
            </div>

            <div class="table-container">
                <table id="adminSearchTable" style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="text-align: left; opacity: 0.7; border-bottom: 1px solid var(--glass-border);">
                            <th style="padding: 15px;">UID</th>
                            <th style="padding: 15px;">Name</th>
                            <th style="padding: 15px;">Hostel</th>
                            <th style="padding: 15px;">Room</th>
                            <th style="padding: 15px;">Current Password</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students.map(s => {
        const hostel = hostels.find(h => h.id === s.hostelId);
        return `
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <td style="padding: 15px; font-family:monospace;">${s.id}</td>
                                <td style="padding: 15px; font-weight: 600;">${s.name}</td>
                                <td style="padding: 15px; color:var(--primary-light);">${hostel ? hostel.name : s.hostelId}</td>
                                <td style="padding: 15px;">${s.room}</td>
                                <td style="padding: 15px;">${s.password}</td>
                            </tr>
                        `;
    }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `,

    adminSystemReports: (reports) => `
        <div class="glass-panel" style="padding: 30px;">
            <h2 style="margin-bottom: 30px;"><i class="bi bi-bug-fill"></i> System Issue Reports</h2>
            
            <div class="table-container">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="text-align: left; opacity: 0.7; border-bottom: 1px solid var(--glass-border);">
                            <th style="padding: 15px;">Date</th>
                            <th style="padding: 15px;">Reporter</th>
                            <th style="padding: 15px;">Role</th>
                            <th style="padding: 15px;">Issue</th>
                            <th style="padding: 15px;">Status</th>
                            <th style="padding: 15px;">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reports.length > 0 ? reports.map(r => `
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <td style="padding: 15px;">${r.date}</td>
                                <td style="padding: 15px; font-family:monospace;">${r.reporterId}</td>
                                <td style="padding: 15px;"><span class="badge" style="background:rgba(139, 92, 246, 0.2); color:var(--accent);">${r.role}</span></td>
                                <td style="padding: 15px; max-width: 300px;">${r.issue}</td>
                                <td style="padding: 15px;">
                                    <span class="status-pill" style="background:${r.status === 'Fixed' ? '#10b981' : r.status === 'In Progress' ? '#f59e0b' : '#ef4444'}; color:white; padding:4px 10px; border-radius:12px; font-size:0.75rem;">${r.status}</span>
                                </td>
                                <td style="padding: 15px;">
                                    <button class="btn-update-report" data-id="${r.id}" data-status="${r.status}" style="background:rgba(255,255,255,0.1); border:1px solid var(--glass-border); color:white; padding:5px 10px; border-radius:6px; cursor:pointer;">Update</button>
                                </td>
                            </tr>
                        `).join('') : '<tr><td colspan="6" style="padding:20px; text-align:center; opacity:0.6;">No reports found.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `,

    aiAssistantInterface: () => `
        <div class="glass-panel" style="height: calc(100vh - 180px); display: flex; flex-direction: column;">
            <div style="padding: 20px; border-bottom: 1px solid var(--glass-border); display: flex; align-items: center; gap: 15px;">
                <div style="width: 45px; height: 45px; border-radius: 12px; background: linear-gradient(135deg, var(--primary), var(--accent)); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: white;">
                    <i class="bi bi-robot"></i>
                </div>
                <div>
                    <h3 style="margin: 0;">Lumina AI Assistant</h3>
                    <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);"><span style="color: #10b981;">●</span> Online | Powered by LuminaCore</p>
                </div>
            </div>
            
            <div id="aiMessages" style="flex: 1; overflow-y: auto; padding: 25px; display: flex; flex-direction: column; gap: 20px;">
                <!-- Messages will be injected here -->
            </div>

            <div style="padding: 20px; border-top: 1px solid var(--glass-border); background: rgba(0,0,0,0.2);">
                <form id="aiChatForm" style="display: flex; gap: 15px;">
                    <input type="text" id="aiMsgInput" class="form-input" placeholder="Ask me about students, fees, or system issues..." style="flex: 1; background: rgba(255,255,255,0.05); border-radius: 12px; padding: 15px 20px;" autocomplete="off">
                    <button type="submit" class="btn-primary" style="width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; padding: 0;">
                        <i class="bi bi-send-fill" style="font-size: 1.2rem;"></i>
                    </button>
                </form>
            </div>
        </div>
    `,

    reportSystemIssue: () => `
        <div class="glass-panel" style="max-width: 600px; margin: 0 auto; padding: 40px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="width: 70px; height: 70px; border-radius: 20px; background: rgba(239, 68, 68, 0.1); color: #ef4444; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin: 0 auto 20px;">
                    <i class="bi bi-bug-fill"></i>
                </div>
                <h2>Report System Issue</h2>
                <p style="color: var(--text-muted);">Found a bug or have a suggestion? Let the Super Admin know.</p>
            </div>

            <form id="reportIssueForm">
                <div class="form-group">
                    <label class="form-label">Issue Description</label>
                    <textarea id="issueDesc" class="form-input" rows="6" placeholder="Please describe the issue in detail..." required style="resize: none;"></textarea>
                </div>
                <div style="background: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin-bottom: 25px;">
                    <p style="font-size: 0.85rem; color: #fbbf24; margin: 0;">Your UID and Role will be sent automatically with this report.</p>
                </div>
                <button type="submit" class="btn-primary" style="width: 100%; padding: 15px;">Submit Report</button>
            </form>
        </div>
    `,

    globalStudentList: (students, hostels) => `
        <div class="glass-panel" style="padding: 20px;">
            <h3><i class="bi bi-globe"></i> Global Student Directory</h3>
            <p style="color:var(--text-muted); margin-bottom:20px;">Complete list of ${students.length} students across ${hostels.length} hostels.</p>
            
            <div class="table-container">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="text-align: left; opacity: 0.7; border-bottom: 1px solid var(--glass-border);">
                            <th style="padding: 15px;">UID</th>
                            <th style="padding: 15px;">Name</th>
                            <th style="padding: 15px;">Hostel</th>
                            <th style="padding: 15px;">Room</th>
                            <th style="padding: 15px;">Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students.length > 0 ? students.map(s => {
        // Find hostel name for better readability
        const hostel = hostels.find(h => h.id === s.hostelId);
        const hostelName = hostel ? hostel.name : s.hostelId;
        return `
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <td style="padding: 15px; font-family:monospace;">${s.id}</td>
                                <td style="padding: 15px; font-weight: 600;">${s.name}</td>
                                <td style="padding: 15px; color:var(--primary-light);">${hostelName}</td>
                                <td style="padding: 15px;">${s.room}</td>
                                <td style="padding: 15px;">${s.joinedDate || '-'}</td>
                            </tr>
                            `;
    }).join('') : '<tr><td colspan="5" style="padding:20px; text-align:center; opacity:0.6;">No students found.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `,

    adminSettings: () => `
        <div class="glass-panel" style="max-width: 600px; margin: 0 auto; padding: 30px;">
            <h2 style="margin-bottom: 30px;"><i class="bi bi-gear"></i> Admin Settings</h2>
            
            <div style="margin-bottom: 40px;">
               <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 15px; border-radius: 8px;">
                   <h4 style="color: #f87171; margin-bottom: 10px;"><i class="bi bi-shield-exclamation"></i> Security Notice</h4>
                   <p style="font-size: 0.9rem; opacity: 0.9;">As Super Admin, you have full access to the system. Please ensure your password is strong and secure.</p>
               </div>
            </div>

            <div>
                <h4 style="margin-bottom: 15px; color: var(--primary-light);">Change Super Admin Password</h4>
                <form id="adminPassForm">
                    <div class="form-group">
                        <label class="form-label">Current Password</label>
                        <input type="password" id="adminCurrPass" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">New Password</label>
                        <input type="password" id="adminNewPass" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Confirm New Password</label>
                        <input type="password" id="adminConfirmPass" class="form-input" required>
                    </div>
                    <button type="submit" class="btn-primary">Update Password</button>
                </form>
            </div>

            <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid var(--glass-border);">
                <h4 style="margin-bottom: 15px; color: var(--secondary);"><i class="bi bi-download"></i> System Data Export</h4>
                <p style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 20px;">Download a complete backup of the system database in your preferred format.</p>
                <div style="display: flex; gap: 10px;">
                    <button id="exportCsvBtn" class="btn-primary" style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #34d399; flex: 1;">
                        <i class="bi bi-filetype-csv"></i> Export CSV
                    </button>
                    <button id="exportExcelBtn" class="btn-primary" style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #34d399; flex: 1;">
                        <i class="bi bi-file-earmark-spreadsheet"></i> Export Excel
                    </button>
                    <button id="exportPdfBtn" class="btn-primary" style="background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #f87171; flex: 1;">
                        <i class="bi bi-file-earmark-pdf"></i> Export PDF
                    </button>
                </div>
            </div>
        </div>
    `,
    rectorStats: (hostel, students, pending, complaints = [], leaves = [], menuSet = false, reviews = []) => {
        if (!hostel) return '<div style="padding:20px;">Loading stats...</div>';

        const capacity = (hostel.totalRooms || 0) * 2;
        const occupancy = capacity > 0 ? Math.round((students.length / capacity) * 100) : 0;

        // Calculate Ratings for Pie Chart
        const ratings = [0, 0, 0, 0, 0]; // 1, 2, 3, 4, 5 stars
        reviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) ratings[r.rating - 1]++; });
        const totalReviews = reviews.length;

        let chartGradient = 'conic-gradient(';
        if (totalReviews === 0) {
            chartGradient += 'rgba(255,255,255,0.1) 0% 100%)';
        } else {
            let current = 0;
            const colors = ['#ef4444', '#f59e0b', '#fbbf24', '#10b981', '#059669'];
            ratings.forEach((val, i) => {
                const percent = (val / totalReviews) * 100;
                chartGradient += `${colors[i]} ${current}% ${current + percent}%, `;
                current += percent;
            });
            chartGradient = chartGradient.slice(0, -2) + ')';
        }

        return `
        <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 25px;">
             <div class="stat-card glass-panel" style="padding: 20px; border-radius: 16px; display: flex; align-items: center; gap: 20px;">
                <div class="icon" style="width: 50px; height: 50px; border-radius: 12px; background: rgba(99, 102, 241, 0.2); color: #6366f1; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;"><i class="bi bi-person-badge"></i></div>
                <div class="info">
                    <div class="label" style="font-size: 0.9rem; color: var(--text-muted);">Rector UID</div>
                    <div class="value" style="font-size: 1.2rem; font-weight: 700; font-family: monospace;">${hostel.rectorId || hostel.id}</div>
                </div>
            </div>
             <div class="stat-card glass-panel" style="padding: 20px; border-radius: 16px; display: flex; align-items: center; gap: 20px;">
                <div class="icon" style="width: 50px; height: 50px; border-radius: 12px; background: rgba(16, 185, 129, 0.2); color: #10b981; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;"><i class="bi bi-people"></i></div>
                <div class="info">
                    <div class="label" style="font-size: 0.9rem; color: var(--text-muted);">Total Students</div>
                    <div class="value" style="font-size: 1.5rem; font-weight: 700;">${students.length}</div>
                </div>
            </div>
             <div class="stat-card glass-panel" style="padding: 20px; border-radius: 16px; display: flex; align-items: center; gap: 20px;">
                <div class="icon" style="width: 50px; height: 50px; border-radius: 12px; background: rgba(245, 158, 11, 0.2); color: #f59e0b; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;"><i class="bi bi-hourglass-split"></i></div>
                <div class="info">
                    <div class="label" style="font-size: 0.9rem; color: var(--text-muted);">Admission Requests</div>
                    <div class="value" style="font-size: 1.5rem; font-weight: 700;">${pending ? pending.length : 0}</div>
                </div>
            </div>
             <div class="stat-card glass-panel" style="padding: 20px; border-radius: 16px; display: flex; align-items: center; gap: 20px;">
                <div class="icon" style="width: 50px; height: 50px; border-radius: 12px; background: rgba(236, 72, 153, 0.2); color: var(--secondary); display: flex; align-items: center; justify-content: center; font-size: 1.5rem;"><i class="bi bi-bed"></i></div>
                <div class="info">
                    <div class="label" style="font-size: 0.9rem; color: var(--text-muted);">Occupancy</div>
                    <div class="value" style="font-size: 1.5rem; font-weight: 700;">${occupancy}%</div>
                </div>
            </div>
             <div class="stat-card glass-panel" style="padding: 20px; border-radius: 16px; display: flex; align-items: center; gap: 20px;">
                <div class="icon" style="width: 50px; height: 50px; border-radius: 12px; background: rgba(239, 68, 68, 0.2); color: #ef4444; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;"><i class="bi bi-exclamation-circle"></i></div>
                <div class="info">
                    <div class="label" style="font-size: 0.9rem; color: var(--text-muted);">New Complaints</div>
                    <div class="value" style="font-size: 1.5rem; font-weight: 700;">${complaints.length}</div>
                </div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 20px;">
            <!-- Mess Feedback Pie Chart -->
            <div class="glass-panel" style="padding: 25px; border-radius: 16px; text-align: center;">
                <h4 style="margin-bottom: 20px;"><i class="bi bi-pie-chart"></i> Mess Feedback</h4>
                <div style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
                    <div style="width: 120px; height: 120px; border-radius: 50%; background: ${chartGradient}; border: 4px solid rgba(255,255,255,0.1); position: relative;">
                        <div style="position: absolute; inset: 20%; background: var(--bg-dark); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: white;">
                            ${totalReviews}
                        </div>
                    </div>
                    <div style="width: 100%; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-size: 0.7rem;">
                        <div style="display: flex; align-items: center; gap: 5px;"><span style="width:8px; height:8px; border-radius:2px; background:#059669;"></span> 5 ★</div>
                        <div style="display: flex; align-items: center; gap: 5px;"><span style="width:8px; height:8px; border-radius:2px; background:#10b981;"></span> 4 ★</div>
                        <div style="display: flex; align-items: center; gap: 5px;"><span style="width:8px; height:8px; border-radius:2px; background:#fbbf24;"></span> 3 ★</div>
                        <div style="display: flex; align-items: center; gap: 5px;"><span style="width:8px; height:8px; border-radius:2px; background:#f59e0b;"></span> 2 ★</div>
                        <div style="display: flex; align-items: center; gap: 5px;"><span style="width:8px; height:8px; border-radius:2px; background:#ef4444;"></span> 1 ★</div>
                    </div>
                </div>
            </div>

            <!-- Recent Notifications -->
            <div class="glass-panel" style="padding: 25px; border-radius: 16px;">
                 <h4 style="margin-bottom: 15px;"><i class="bi bi-bell"></i> Action Items</h4>
                 <div style="display: grid; gap: 10px;">
                     ${complaints.length > 0 ? `<div style="padding: 12px; background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; border-radius: 8px; font-size: 0.9rem;">You have <strong>${complaints.length}</strong> unanswered complaints.</div>` : ''}
                     ${leaves.length > 0 ? `<div style="padding: 12px; background: rgba(16, 185, 129, 0.1); border-left: 4px solid #10b981; border-radius: 8px; font-size: 0.9rem;">You have <strong>${leaves.length}</strong> pending leave applications.</div>` : ''}
                     ${!menuSet ? `<div style="padding: 12px; background: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; border-radius: 8px; font-size: 0.9rem;">Today's mess menu is not yet posted.</div>` : ''}
                     ${complaints.length === 0 && leaves.length === 0 && menuSet ? '<div style="opacity: 0.6; padding: 20px; text-align: center;">All clear! No pending actions.</div>' : ''}
                 </div>
            </div>
        </div>
        `;
    },

    studentManagement: (hostel, students, pending) => `
        <div class="glass-panel" style="padding: 20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
                <h3>Student Management</h3>
                <button id="toggleAddStudent" style="background:var(--primary); color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer;"><i class="bi bi-person-plus"></i> Add Student</button>
            </div>

            <!-- Add Student Form (Hidden by default) -->
            <div id="addStudentForm" style="display:none; margin-bottom: 30px; background:rgba(255,255,255,0.05); padding:20px; border-radius:12px; border:1px dashed var(--glass-border);">
                 <h4 style="margin-bottom:15px; color:var(--primary-light);">Manually Add Student</h4>
                 <form id="manualAddForm" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:15px;">
                    <input type="text" id="newSName" class="form-input" placeholder="Student Name" required>
                    <input type="text" id="newSRoom" class="form-input" placeholder="Room Number (e.g. 101)" required>
                    <input type="password" id="newSPass" class="form-input" placeholder="Set Password" required>
                    <button type="submit" class="btn-primary">Add Student</button>
                 </form>
            </div>

            <!-- Pending Requests -->
            ${pending.length > 0 ? `
                <div style="margin-bottom: 40px; border: 1px solid #f59e0b; background: rgba(245, 158, 11, 0.1); border-radius: 16px; padding: 20px;">
                    <h4 style="color: #f59e0b; margin-bottom: 15px;"><i class="bi bi-exclamation-circle-fill"></i> Pre-Registration Requests</h4>
                    <div style="display: grid; gap: 10px;">
                        ${pending.map(req => `
                            <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.2); padding: 10px 15px; border-radius: 8px;">
                                <div>
                                    <div style="font-weight: 600;">${req.name}</div>
                                    <div style="font-size: 0.8rem; opacity: 0.7;">Applied: ${req.requestDate}</div>
                                </div>
                                <div style="display: flex; gap: 10px;">
                                    <button class="btn-approve" data-id="${req.id}" style="padding: 5px 15px; border-radius: 6px; border:none; background: #10b981; color: white; cursor: pointer;">Approve</button>
                                    <button class="btn-reject" data-id="${req.id}" style="padding: 5px 15px; border-radius: 6px; border:none; background: #ef4444; color: white; cursor: pointer;">Reject</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <h3>All Students (${students.length})</h3>
            <div class="table-container" style="margin-top: 20px;">
                 <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="text-align: left; opacity: 0.7; border-bottom: 1px solid var(--glass-border);">
                            <th style="padding: 15px;">UID</th>
                            <th style="padding: 15px;">Name</th>
                            <th style="padding: 15px;">Room</th>
                            <th style="padding: 15px;">Joined</th>
                            <th style="padding: 15px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students.map(s => `
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <td style="padding: 15px; font-family:monospace;">${s.id}</td>
                                <td style="padding: 15px; font-weight: 600;">${s.name}</td>
                                <td style="padding: 15px;">${s.room}</td>
                                <td style="padding: 15px;">${s.joinedDate || '-'}</td>
                                <td style="padding: 15px;">
                                    <div style="display:flex; gap:5px;">
                                        <button class="btn-view-guardian" data-id="${s.id}" style="background:rgba(99, 102, 241, 0.2); color:#a5b4fc; border:1px solid rgba(99, 102, 241, 0.3); padding:5px 10px; border-radius:6px; cursor:pointer;"><i class="bi bi-eye"></i> Guardian</button>
                                        <button class="btn-delete-student" data-id="${s.id}" style="background:rgba(239, 68, 68, 0.2); color:#f87171; border:1px solid rgba(239, 68, 68, 0.3); padding:5px 10px; border-radius:6px; cursor:pointer;">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `,

    messReviews: (reviews, menu = null, userRole = 'rector') => `
        <div class="glass-panel" style="padding: 20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
                <h3>Hostel Mess</h3>
                <button id="toggleMenuEditor" style="background:var(--primary); color:white; border:none; padding:8px 16px; border-radius:8px; cursor:pointer;"><i class="bi bi-pencil-square"></i> Update Today's Menu</button>
            </div>

            <!-- Menu Card -->
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">
                <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:12px; border-top: 4px solid #fbbf24;">
                    <h5 style="color:#fbbf24;"><i class="bi bi-sun"></i> Breakfast</h5>
                    <p style="font-size:0.9rem; margin-top:5px;">${menu ? menu.breakfast : 'Not set'}</p>
                </div>
                <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:12px; border-top: 4px solid #10b981;">
                    <h5 style="color:#10b981;"><i class="bi bi-brightness-high"></i> Lunch</h5>
                    <p style="font-size:0.9rem; margin-top:5px;">${menu ? menu.lunch : 'Not set'}</p>
                </div>
                <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:12px; border-top: 4px solid #6366f1;">
                    <h5 style="color:#6366f1;"><i class="bi bi-moon-stars"></i> Dinner</h5>
                    <p style="font-size:0.9rem; margin-top:5px;">${menu ? menu.dinner : 'Not set'}</p>
                </div>
            </div>

            <div id="menuEditorForm" style="display:none; margin-bottom: 30px; background:rgba(0,0,0,0.2); padding:20px; border-radius:12px; border:1px dashed var(--glass-border);">
                <h4 style="margin-bottom:15px;">Update Mess Menu</h4>
                <form id="saveMenuForm" style="display:grid; gap:15px;">
                    <input type="text" id="menuBreakfast" class="form-input" placeholder="Breakfast (e.g. Poha, Tea)" value="${menu ? menu.breakfast : ''}" required>
                    <input type="text" id="menuLunch" class="form-input" placeholder="Lunch (e.g. Thali, Rice)" value="${menu ? menu.lunch : ''}" required>
                    <input type="text" id="menuDinner" class="form-input" placeholder="Dinner (e.g. Dal, Roti)" value="${menu ? menu.dinner : ''}" required>
                    <button type="submit" class="btn-primary">Save Menu</button>
                </form>
            </div>

            <h4 style="margin-bottom: 20px;">Student Reviews</h4>
            <div class="review-list">
                ${reviews.length > 0 ? reviews.map(r => `
                    <div class="review-card" style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; margin-bottom: 10px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom: 5px;">
                            <strong style="color: var(--accent);">${userRole === 'rector' ? 'Student' : r.studentName}</strong>
                            <span style="opacity: 0.6; font-size: 0.8rem;">${r.date}</span>
                        </div>
                        <div style="color: #f59e0b; margin-bottom: 5px;">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
                        <p style="font-size: 0.9rem; line-height: 1.4;">${r.comment}</p>
                    </div>
                `).join('') : '<div style="opacity: 0.6; text-align: center;">No reviews yet.</div>'}
            </div>
        </div>
        `,

    studentMess: (myReviews, menu = null) => `
        <div class="glass-panel" style="padding: 20px;">
            <h3><i class="bi bi-egg-fried"></i> Mess Portal</h3>
            
            <!-- Today's Menu -->
            <div style="margin-top: 20px; background: rgba(139, 92, 246, 0.1); border-radius: 16px; padding: 25px; border: 1px solid rgba(139, 92, 246, 0.2);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h4 style="color: var(--accent);">Today's Mess Menu</h4>
                    <span style="font-size: 0.8rem; opacity: 0.7;">Updated: ${menu ? menu.lastUpdated : 'Never'}</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px;">
                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px;">
                        <div style="font-size: 0.8rem; color: #fbbf24; margin-bottom: 5px;"><i class="bi bi-sun"></i> Breakfast</div>
                        <div style="font-weight: 600;">${menu ? menu.breakfast : 'Bread Butter/Tea'}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px;">
                        <div style="font-size: 0.8rem; color: #10b981; margin-bottom: 5px;"><i class="bi bi-brightness-high"></i> Lunch</div>
                        <div style="font-weight: 600;">${menu ? menu.lunch : 'Full Thali'}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px;">
                        <div style="font-size: 0.8rem; color: #6366f1; margin-bottom: 5px;"><i class="bi bi-moon-stars"></i> Dinner</div>
                        <div style="font-weight: 600;">${menu ? menu.dinner : 'Dal Rice/Sabzi'}</div>
                    </div>
                </div>
            </div>

            <!-- Review Section -->
            <div style="margin-top: 30px; display: grid; grid-template-columns: 1fr 1.5fr; gap: 30px;">
                <div>
                    <h4>Share Feedback</h4>
                    <form id="messReviewForm" style="margin-top: 15px; background: rgba(0,0,0,0.2); padding: 20px; border-radius: 16px;">
                        <div class="form-group">
                            <label class="form-label">Rating</label>
                            <div class="rating-input">
                                 <input type="radio" name="rating" value="5" id="r5">
                                 <label for="r5"><i class="bi bi-star-fill"></i></label>
                                 <input type="radio" name="rating" value="4" id="r4">
                                 <label for="r4"><i class="bi bi-star-fill"></i></label>
                                 <input type="radio" name="rating" value="3" id="r3">
                                 <label for="r3"><i class="bi bi-star-fill"></i></label>
                                 <input type="radio" name="rating" value="2" id="r2">
                                 <label for="r2"><i class="bi bi-star-fill"></i></label>
                                 <input type="radio" name="rating" value="1" id="r1">
                                 <label for="r1"><i class="bi bi-star-fill"></i></label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Comment</label>
                            <textarea id="messComment" class="form-input" placeholder="How was the food today?" style="min-height: 100px;" required></textarea>
                        </div>
                        <button type="submit" class="btn-primary" style="width: 100%;">Submit Review</button>
                    </form>
                </div>
                <div>
                    <h4>My History</h4>
                    <div style="margin-top: 15px; display: grid; gap: 10px;">
                        ${myReviews.length > 0 ? myReviews.map(r => `
                            <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 12px;">
                                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; opacity: 0.7;">
                                    <span>${r.date}</span>
                                    <span style="color: #f59e0b;">${'★'.repeat(r.rating)}</span>
                                </div>
                                <div style="font-size: 1rem; margin-top: 5px;">${r.comment}</div>
                            </div>
                        `).join('') : '<p style="opacity:0.5; text-align:center; padding-top:20px;">No reviews yet.</p>'}
                    </div>
                </div>
            </div>
        </div>
    `,

    medicalProfile: (student) => `
        <div class="glass-panel" style="max-width: 600px; margin: 0 auto; padding: 30px;">
            <h2 style="margin-bottom: 25px;"><i class="bi bi-heart-pulse-fill"></i> Health & Emergency Profile</h2>
            <p style="color: var(--text-muted); margin-bottom: 30px;">This information is critical for emergencies.</p>
            
            <form id="medicalForm" style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                <div class="form-group">
                    <label class="form-label">Blood Group</label>
                    <select id="mBlood" class="form-input">
                        <option value="" disabled ${!student.medicalInfo ? 'selected' : ''}>Select...</option>
                        ${['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => `<option value="${bg}" ${student.medicalInfo && student.medicalInfo.bloodGroup === bg ? 'selected' : ''}>${bg}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Emergency Phone</label>
                    <input type="tel" id="mEmergency" class="form-input" value="${student.medicalInfo ? student.medicalInfo.emergencyPhone : ''}" placeholder="Police/Hospital/Parent" required>
                </div>
                <div class="form-group" style="grid-column: span 2;">
                    <label class="form-label">Allergies / Medical Conditions</label>
                    <textarea id="mAllergies" class="form-input" rows="3" placeholder="None, or list allergies (e.g. Peanuts, Penicillin)">${student.medicalInfo ? student.medicalInfo.allergies : ''}</textarea>
                </div>
                <button type="submit" class="btn-primary" style="grid-column: span 2; padding: 15px;">Update Health Profile</button>
            </form>
        </div>
    `,

    amenitiesBooking: (bookings, studentId) => {
        const slots = ["06:00 AM", "08:00 AM", "04:00 PM", "06:00 PM", "08:00 PM"];
        const types = [
            { id: 'gym', name: 'Gymnasium', icon: 'bi-bicycle', color: '#10b981' },
            { id: 'study', name: 'Study Hall', icon: 'bi-book', color: '#6366f1' },
            { id: 'laundry', name: 'Laundry Room', icon: 'bi-water', color: '#06b6d4' }
        ];

        return `
        <div class="glass-panel" style="padding: 20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3><i class="bi bi-calendar-check"></i> Amenities Booking</h3>
                <span style="opacity:0.7; font-size:0.9rem;">Book your slot for today</span>
            </div>

            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:20px; margin-bottom:30px;">
                ${types.map(t => `
                    <div style="background:rgba(255,255,255,0.05); border-radius:16px; padding:20px; border-top: 4px solid ${t.color};">
                        <div style="display:flex; align-items:center; gap:15px; margin-bottom:15px;">
                            <div style="width:40px; height:40px; background:${t.color}22; color:${t.color}; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.2rem;">
                                <i class="bi ${t.icon}"></i>
                            </div>
                            <h4 style="margin:0;">${t.name}</h4>
                        </div>
                        <form class="booking-form" data-type="${t.id}">
                            <select class="form-input slot-select" style="margin-bottom:10px;" required>
                                <option value="" disabled selected>Select Time Slot...</option>
                                ${slots.map(s => `<option value="${s}">${s}</option>`).join('')}
                            </select>
                            <button type="submit" class="btn-primary" style="width:100%; background:${t.color}; border:none;">Book Now</button>
                        </form>
                    </div>
                `).join('')}
            </div>

            <h4>Your Recent Bookings</h4>
            <div style="margin-top:15px; display:grid; gap:10px;">
                ${bookings.length > 0 ? bookings.map(b => {
            const type = types.find(t => t.id === b.type) || types[0];
            return `
                        <div style="background:rgba(255,255,255,0.03); padding:15px; border-radius:12px; display:flex; justify-content:space-between; align-items:center;">
                            <div style="display:flex; align-items:center; gap:12px;">
                                <i class="bi ${type.icon}" style="color:${type.color};"></i>
                                <div>
                                    <div style="font-weight:600;">${type.name}</div>
                                    <div style="font-size:0.8rem; opacity:0.6;">${b.date} at ${b.timeSlot}</div>
                                </div>
                            </div>
                            <span style="font-size:0.75rem; background:rgba(16, 185, 129, 0.1); color:#10b981; padding:4px 10px; border-radius:10px;">Confirmed</span>
                        </div>
                    `;
        }).join('') : '<p style="opacity:0.5; text-align:center; padding:20px;">No active bookings found.</p>'}
            </div>
        </div>
        `;
    },

    complaintsList: (complaints, isRector = false) => `
        <div class="glass-panel" style="padding: 20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
                <h3>Complaints & Maintenance</h3>
                ${!isRector ? `
                <button id="toggleComplaintForm" style="background:var(--primary); color:white; border:none; padding:8px 16px; border-radius:8px; cursor:pointer;">
                    <i class="bi bi-plus-circle"></i> New Complaint
                </button>
                ` : ''}
            </div>

            ${!isRector ? `
            <div id="newComplaintForm" style="display:none; margin-bottom: 20px; background:rgba(255,255,255,0.05); padding:15px; border-radius:12px;">
                <form id="submitComplaintForm">
                    <select id="compType" class="form-input" style="margin-bottom:10px;" required>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Electricity">Electricity</option>
                        <option value="Other">Other</option>
                    </select>
                    <textarea id="compDesc" class="form-input" placeholder="Describe the issue..." style="margin-bottom:10px; min-height:80px;" required></textarea>
                    <button type="submit" class="btn-primary">Submit</button>
                </form>
            </div>
            ` : ''}

            <div class="list">
                ${complaints.length > 0 ? complaints.map(c => `
                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; margin-bottom: 10px; border-left: 4px solid ${c.status === 'Resolved' ? '#10b981' : '#f59e0b'};">
                        <div style="display:flex; justify-content:space-between; margin-bottom: 5px;">
                            <span style="font-weight:600; color:var(--primary-light);">${c.type}</span>
                            <span style="font-size:0.8rem; padding:2px 8px; border-radius:4px; background:${c.status === 'Resolved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}; color:${c.status === 'Resolved' ? '#34d399' : '#fbbf24'};">${c.status}</span>
                        </div>
                        <p style="font-size:0.9rem; margin-bottom:5px;">${c.description}</p>
                        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; opacity:0.6;">
                            <span>${c.date}</span>
                            ${isRector && c.status === 'Pending' ? `
                                <button class="btn-resolve" data-id="${c.id}" style="background:#10b981; border:none; color:white; padding:4px 8px; border-radius:4px; cursor:pointer;">Mark Resolved</button>
                            ` : ''}
                        </div>
                    </div>
                `).join('') : '<p style="opacity:0.6; text-align:center;">No complaints found.</p>'}
            </div>
        </div>
    `,

    noticeBoard: (notices, isRector = false) => `
        <div class="glass-panel" style="padding: 20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
                <h3><i class="bi bi-megaphone-fill"></i> Notice Board</h3>
                ${isRector ? `
                <button id="toggleNoticeForm" style="background:var(--primary); color:white; border:none; padding:8px 16px; border-radius:8px; cursor:pointer;">
                    <i class="bi bi-plus-circle"></i> Post Notice
                </button>
                ` : ''}
            </div>

            ${isRector ? `
            <div id="newNoticeForm" style="display:none; margin-bottom: 20px; background:rgba(255,255,255,0.05); padding:15px; border-radius:12px;">
                <form id="postNoticeForm">
                    <input type="text" id="noticeTitle" class="form-input" placeholder="Notice Title" style="margin-bottom:10px;" required>
                    <textarea id="noticeContent" class="form-input" placeholder="Write notice content here..." style="margin-bottom:10px; min-height:80px;" required></textarea>
                    <button type="submit" class="btn-primary">Post Notice</button>
                </form>
            </div>
            ` : ''}

            <div class="list">
                ${notices.length > 0 ? notices.map(n => `
                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; margin-bottom: 15px;">
                        <h4 style="margin-bottom: 8px; color: var(--secondary);">${n.title}</h4>
                        <p style="font-size: 0.95rem; line-height: 1.5; margin-bottom: 10px;">${n.content}</p>
                        <div style="font-size: 0.8rem; opacity: 0.5; text-align: right;">${n.date}</div>
                    </div>
                `).join('') : '<p style="opacity:0.6; text-align:center;">No notices posted yet.</p>'}
            </div>
        </div>
    `,

    leaveApplication: (leaves) => `
        <div class="glass-panel" style="padding: 20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
                <h3><i class="bi bi-pass-fill"></i> Gate Pass / Leave Application</h3>
                <button id="toggleLeaveForm" style="background:var(--primary); color:white; border:none; padding:8px 16px; border-radius:8px; cursor:pointer;">
                    <i class="bi bi-plus-circle"></i> Apply for Leave
                </button>
            </div>

            <div id="newLeaveForm" style="display:none; margin-bottom: 25px; background:rgba(255,255,255,0.05); padding:20px; border-radius:12px; border:1px dashed var(--glass-border);">
                <h4 style="margin-bottom:15px; color:var(--primary-light);">New Leave Request</h4>
                <form id="submitLeaveForm">
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:15px;">
                        <input type="text" id="leaveType" class="form-input" placeholder="Type (e.g., Home Visit, Outing)" required>
                        <input type="text" id="leaveReason" class="form-input" placeholder="Reason" required>
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:15px;">
                        <div>
                            <label style="font-size:0.8rem; opacity:0.7; display:block; margin-bottom:5px;">Start Date</label>
                            <input type="date" id="leaveStart" class="form-input" required>
                        </div>
                        <div>
                            <label style="font-size:0.8rem; opacity:0.7; display:block; margin-bottom:5px;">End Date</label>
                            <input type="date" id="leaveEnd" class="form-input" required>
                        </div>
                    </div>
                    <button type="submit" class="btn-primary">Submit Application</button>
                </form>
            </div>

            <div class="list">
                <h4 style="margin-bottom:15px; opacity:0.8;">My Applications</h4>
                ${leaves.length > 0 ? leaves.map(l => {
        const statusColor = l.status === 'Approved' ? '#10b981' : (l.status === 'Rejected' ? '#ef4444' : '#f59e0b');
        const progress = l.status === 'Approved' ? '100%' : (l.status === 'Rejected' ? '100%' : '50%');

        return `
                    <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 16px; margin-bottom: 20px; position:relative; overflow:hidden;">
                         ${l.status === 'Approved' ? '<div style="position:absolute; top:0; right:0; background:#10b981; color:white; padding:2px 10px; font-size:0.7rem; border-bottom-left-radius:8px;">DIGITAL PASS ACTIVE</div>' : ''}
                        <div style="display:flex; justify-content:space-between; align-items: flex-start; margin-bottom: 20px;">
                            <div>
                                <div style="font-weight:600; color:var(--secondary); font-size:1.1rem;">${l.type}</div>
                                <div style="font-size: 0.85rem; opacity: 0.7;">Applied: ${l.requestDate}</div>
                            </div>
                             <span style="font-size:0.8rem; padding:5px 12px; border-radius:20px; 
                                background:${statusColor}22; 
                                color:${statusColor}; font-weight:600;">
                                ${l.status}
                            </span>
                        </div>

                        <!-- Visual Timeline -->
                        <div style="position: relative; height: 40px; margin: 10px 0 20px;">
                            <div style="position: absolute; top: 15px; left: 0; right: 0; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px;"></div>
                            <div style="position: absolute; top: 15px; left: 0; width: ${progress}; height: 4px; background: ${statusColor}; border-radius: 2px; transition: width 0.5s ease;"></div>
                            
                            <div style="display: flex; justify-content: space-between; position: relative; z-index: 1;">
                                <div style="text-align: center;">
                                    <div style="width: 12px; height: 12px; border-radius: 50%; background: ${statusColor}; border: 3px solid rgba(255,255,255,0.1); margin: 11px auto 5px;"></div>
                                    <div style="font-size: 0.7rem; opacity: 0.6;">Applied</div>
                                </div>
                                <div style="text-align: center;">
                                    <div style="width: 12px; height: 12px; border-radius: 50%; background: ${l.status !== 'Pending' ? statusColor : 'rgba(255,255,255,0.2)'}; border: 3px solid rgba(255,255,255,0.1); margin: 11px auto 5px;"></div>
                                    <div style="font-size: 0.7rem; opacity: 0.6;">Review</div>
                                </div>
                                <div style="text-align: center;">
                                    <div style="width: 12px; height: 12px; border-radius: 50%; background: ${l.status !== 'Pending' ? statusColor : 'rgba(255,255,255,0.2)'}; border: 3px solid rgba(255,255,255,0.1); margin: 11px auto 5px;"></div>
                                    <div style="font-size: 0.7rem; opacity: 0.6;">${l.status === 'Rejected' ? 'Rejected' : 'Finalized'}</div>
                                </div>
                            </div>
                        </div>

                        <div style="font-size: 0.9rem; margin-bottom: 8px;"><strong>Reason:</strong> ${l.reason}</div>
                        <div style="font-size: 0.8rem; opacity: 0.6;">
                            <i class="bi bi-calendar"></i> Validity: ${l.startDate} to ${l.endDate}
                        </div>
                    </div>
                `;
    }).join('') : '<p style="opacity:0.6; text-align:center;">No leave applications yet.</p>'}
            </div>
        </div>
    `,

    leaveRequests: (leaves) => `
        <div class="glass-panel" style="padding: 20px;">
            <h3><i class="bi bi-pass-fill"></i> Leave Requests</h3>
            <div class="list" style="margin-top:20px;">
                ${leaves.length > 0 ? leaves.map(l => `
                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; margin-bottom: 15px; border-left: 4px solid ${l.status === 'Approved' ? '#10b981' : l.status === 'Rejected' ? '#ef4444' : '#f59e0b'};">
                        <div style="display:flex; justify-content:space-between; margin-bottom: 5px;">
                            <span style="font-weight:600;">Student ID: ${l.studentId}</span>
                             <span style="font-size:0.8rem; padding:2px 8px; border-radius:4px; background:rgba(255,255,255,0.1);">${l.status}</span>
                        </div>
                        <div style="font-weight:600; color:var(--secondary); margin-bottom:5px;">${l.type}</div>
                        <p style="font-size:0.9rem; margin-bottom:10px;">${l.reason}</p>
                         <div style="font-size: 0.8rem; opacity: 0.6; margin-bottom:10px;">
                            <i class="bi bi-calendar"></i> ${l.startDate} to ${l.endDate}
                        </div>
                        ${l.status === 'Pending' ? `
                            <div style="display:flex; gap:10px; justify-content:flex-end;">
                                <button class="btn-approve-leave" data-id="${l.id}" style="background:#10b981; border:none; color:white; padding:5px 15px; border-radius:6px; cursor:pointer;">Approve</button>
                                <button class="btn-reject-leave" data-id="${l.id}" style="background:#ef4444; border:none; color:white; padding:5px 15px; border-radius:6px; cursor:pointer;">Reject</button>
                            </div>
                        ` : ''}
                    </div>
                `).join('') : '<p style="opacity:0.6; text-align:center;">No pending leave requests.</p>'}
            </div>
        </div>
    `,


    chatView: (contacts, selectedId = null) => {
        const chats = App.state.chats || [];
        const messages = selectedId ? chats.filter(c =>
            (c.from === App.currentUser.data.id && c.to === selectedId) ||
            (c.from === selectedId && c.to === App.currentUser.data.id)
        ) : [];
        const selectedStudent = contacts.find(s => s.id === selectedId);

        return `
        <div class="glass-panel chat-container" style="display: grid; grid-template-columns: 280px 1fr; height: 600px; overflow: hidden; padding: 0;">
            <!-- Contacts Sidebar -->
            <div class="chat-sidebar" style="border-right: 1px solid var(--glass-border); display: flex; flex-direction: column;">
                <div style="padding: 20px; border-bottom: 1px solid var(--glass-border);">
                    <h4 style="margin: 0;"><i class="bi bi-people-fill"></i> Contacts</h4>
                </div>
                <div class="contacts-list" style="flex: 1; overflow-y: auto;">
                    ${contacts.map(s => `
                        <div class="chat-contact ${s.id === selectedId ? 'active' : ''}" data-id="${s.id}" style="padding: 15px 20px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.03); transition: var(--transition);">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div class="avatar-small" style="width: 35px; height: 35px; border-radius: 8px; background: var(--accent); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem;">
                                    ${s.name[0]}
                                </div>
                                <div style="flex: 1; overflow: hidden;">
                                    <div style="font-weight: 600; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${s.name}</div>
                                    <div style="font-size: 0.7rem; opacity: 0.6;">Room ${s.room}</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Chat Window -->
            <div class="chat-window" style="display: flex; flex-direction: column; background: rgba(0,0,0,0.1);">
                ${selectedId ? `
                    <div class="chat-header" style="padding: 15px 25px; border-bottom: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02);">
                        <div>
                            <h4 style="margin: 0;">${selectedStudent?.name || 'Chat'}</h4>
                            <div style="font-size: 0.75rem; opacity: 0.6;">UID: ${selectedId}</div>
                        </div>
                    </div>
                    <div id="chatMessages" style="flex: 1; overflow-y: auto; padding: 25px; display: flex; flex-direction: column; gap: 15px;">
                        ${messages.length > 0 ? messages.map(m => {
            const isMe = m.from === App.currentUser.data.id;
            return `
                                <div style="display: flex; flex-direction: column; align-items: ${isMe ? 'flex-end' : 'flex-start'}; margin-bottom: 5px;">
                                    <div style="max-width: 80%; padding: 10px 16px; border-radius: 20px; border-bottom-${isMe ? 'right' : 'left'}-radius: 4px; background: ${isMe ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'rgba(255,255,255,0.08)'}; color: white; font-size: 0.95rem; box-shadow: 0 4px 15px rgba(0,0,0,0.1); line-height: 1.4;">
                                        ${m.message}
                                    </div>
                                    <div style="font-size: 0.65rem; opacity: 0.5; margin-top: 4px; margin-${isMe ? 'right' : 'left'}: 5px;">${m.timestamp}</div>
                                </div>
                            `;
        }).join('') : '<div style="flex: 1; display:flex; align-items:center; justify-content:center; opacity:0.4; font-style:italic;">No messages yet. Start a conversation!</div>'}
                    </div>
                    <form id="chatForm" style="padding: 20px; border-top: 1px solid var(--glass-border); display: flex; gap: 15px; background: rgba(255,255,255,0.02);">
                        <input type="hidden" id="recipientId" value="${selectedId}">
                        <input type="text" id="chatMsgInput" class="form-input" placeholder="Type your message..." autocomplete="off" required style="border-radius: 25px; padding: 12px 25px;">
                        <button type="submit" class="btn-primary" style="border-radius: 50%; width: 45px; height: 45px; padding: 0; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <i class="bi bi-send-fill"></i>
                        </button>
                    </form>
                ` : `
                    <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px; opacity: 0.5;">
                        <i class="bi bi-chat-quote" style="font-size: 4rem; margin-bottom: 20px;"></i>
                        <h3>Select a mate to start chatting</h3>
                        <p>Stay connected with your fellow hostel mates.</p>
                    </div>
                `}
            </div>
        </div>
        <style>
            .chat-contact:hover { background: rgba(255,255,255,0.05); }
            .chat-contact.active { background: rgba(99, 102, 241, 0.15); border-left: 3px solid var(--primary); }
            #chatMessages::-webkit-scrollbar { width: 6px; }
            #chatMessages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        </style>
        `;
    },

    aiView: () => {
        return `
        <div class="glass-panel" style="display: flex; flex-direction: column; height: 600px; max-width: 800px; margin: 0 auto; overflow: hidden; padding: 0;">
            <div class="ai-header" style="padding: 20px 30px; border-bottom: 1px solid var(--glass-border); background: linear-gradient(90deg, rgba(139, 92, 246, 0.1), transparent); display: flex; align-items: center; gap: 15px;">
                <div style="width: 45px; height: 45px; border-radius: 12px; background: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: white;">
                    <i class="bi bi-robot"></i>
                </div>
                <div>
                    <h3 style="margin: 0;">Lumina AI Assistant</h3>
                    <div style="font-size: 0.8rem; color: #10b981;"><i class="bi bi-patch-check-fill"></i> System Connected & Online</div>
                </div>
            </div>

            <div id="aiMessages" style="flex: 1; overflow-y: auto; padding: 30px; display: flex; flex-direction: column; gap: 20px;">
                <!-- Messages will be injected by renderAiChat -->
            </div>

            <form id="aiChatForm" style="padding: 25px; border-top: 1px solid var(--glass-border); display: flex; gap: 15px; background: rgba(0,0,0,0.1);">
                <input type="text" id="aiMsgInput" class="form-input" placeholder="Ask me about fees, mess menu, or notices..." autocomplete="off" required style="border-radius: 30px; padding: 15px 30px;">
                <button type="submit" class="btn-primary" style="border-radius: 50%; width: 55px; height: 55px; padding: 0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 1.2rem;">
                    <i class="bi bi-send-fill"></i>
                </button>
            </form>
        </div>
        <script>
            // This is a hack to trigger initial render since navigation just injected the HTML
            setTimeout(() => { if(typeof App !== 'undefined') App.renderAiChat(); }, 50);
        </script>
        `;
    },

    settings: () => {
        const user = App.currentUser;
        const student = user.role === 'student' ? user.data : null;
        const isAdmin = user.role === 'super_admin';

        return `
        <div class="glass-panel" style="max-width: 650px; margin: 0 auto; padding: 30px;">
            <h2 style="margin-bottom: 30px;"><i class="bi bi-gear"></i> Settings</h2>
            
            <div style="margin-bottom: 40px;">
                <h4 style="margin-bottom: 15px; color: var(--primary-light);">Profile Photo</h4>
                <div style="display: flex; align-items: center; gap: 20px;">
                    <div id="settingsAvatarPreview" class="avatar" style="width: 80px; height: 80px; font-size: 2rem; background: var(--accent);">
                        ${user.role === 'student' && user.data.avatar ? `<img src="${user.data.avatar}" style="width:100%; height:100%; border-radius:12px; object-fit:cover;">` : (user.data.name ? user.data.name[0] : 'S')}
                    </div>
                    <div>
                        <input type="file" id="avatarUpload" accept="image/*" style="display: none;">
                        <button onclick="document.getElementById('avatarUpload').click()" class="btn-primary" style="margin-bottom: 5px;">Upload Photo</button>
                        <div style="font-size: 0.8rem; opacity: 0.7;">Supported: JPG, PNG (Max 1MB)</div>
                    </div>
                </div>
            </div>

            <div style="margin-bottom: 40px; background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; border: 1px solid var(--glass-border);">
                <h4 style="margin-bottom: 15px; color: var(--primary-light);">Account Details</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <div style="font-size: 0.8rem; opacity: 0.7;">Full Name</div>
                        <div style="font-weight: 600;">${user.data.name || user.data.rectorName || 'Super Admin'}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.8rem; opacity: 0.7;">User UID</div>
                        <div style="font-weight: 600; font-family: monospace; color: var(--accent);">${user.role === 'rector' ? (user.data.rectorId || user.data.id) : (user.data.id || 'N/A')}</div>
                    </div>
                    ${user.role !== 'super_admin' ? `
                    <div>
                        <div style="font-size: 0.8rem; opacity: 0.7;">Role</div>
                        <div style="font-weight: 600; text-transform: capitalize;">${user.role}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.8rem; opacity: 0.7;">Email</div>
                        <div style="font-weight: 600; font-size: 0.9rem;">${user.data.email || user.data.rectorEmail || 'N/A'}</div>
                    </div>
                    ` : ''}
                </div>
            </div>

            ${isAdmin ? `
            <hr style="border: 0; border-top: 1px solid var(--glass-border); margin: 30px 0;">
            <div style="margin-bottom: 40px; background: rgba(16, 185, 129, 0.05); padding: 20px; border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.2);">
                <h4 style="margin-bottom: 15px; color: #10b981;"><i class="bi bi-database-down"></i> Database Backup</h4>
                <p style="font-size: 0.8rem; opacity: 0.7; margin-bottom: 15px;">Download the complete database including all users, hostels, and complaints.</p>
                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                    <a href="/api/backup" target="_blank" class="btn-primary" style="background:#10b981; text-decoration:none; display:inline-flex;">
                        <i class="bi bi-cloud-download"></i> MongoDB Backup
                    </a>
                    <button onclick="App.exportToJSON()" class="btn-primary" style="background:rgba(255,255,255,0.1);">
                        <i class="bi bi-filetype-json"></i> Local Backup
                    </button>
                </div>
            </div>

            <div style="margin-bottom: 40px; background: rgba(239, 68, 68, 0.05); padding: 20px; border-radius: 12px; border: 1px solid rgba(239, 68, 68, 0.2);">
                <h4 style="margin-bottom: 15px; color: #f87171;"><i class="bi bi-shield-lock"></i> Universal Password Reset</h4>
                <p style="font-size: 0.8rem; opacity: 0.7; margin-bottom: 15px;">Change any Rector or Student's password using their UID or Email.</p>
                <form id="adminResetForm" style="display:grid; gap:15px;">
                    <input type="text" id="resetIdentifier" class="form-input" placeholder="Enter UID or Email" required>
                    <input type="password" id="resetNewPass" class="form-input" placeholder="New Password" required>
                    <button type="submit" class="btn-primary" style="background:#ef4444;">Reset Password</button>
                </form>
            </div>
            ` : ''}

            <hr style="border: 0; border-top: 1px solid var(--glass-border); margin: 30px 0;">

            <div>
                <h4 style="margin-bottom: 15px; color: var(--primary-light);">Change Your Password</h4>
                <form id="changePassForm">
                    <div class="form-group">
                        <label class="form-label">Current Password</label>
                        <input type="password" id="currPass" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">New Password</label>
                        <input type="password" id="newPass" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Confirm New Password</label>
                        <input type="password" id="confirmPass" class="form-input" required>
                    </div>
                    <button type="submit" class="btn-primary">Update Password</button>
                </form>
            </div>
        </div>
        `;
    },

    // Enhanced Room Grid with Edit Controls - Replace existing roomGrid function

    roomGrid: (hostel) => {
        if (!hostel || !hostel.rooms) {
            return `<div class="glass-panel" style="padding: 20px;"><p>No rooms available</p></div>`;
        }

        const roomCards = hostel.rooms.map(room => {
            const isFull = room.occupants.length >= room.capacity;
            const isEmpty = room.occupants.length === 0;
            const color = isFull ? '#ec4899' : (isEmpty ? 'var(--glass-border)' : '#6366f1');
            const bg = isFull ? 'rgba(236, 72, 153, 0.15)' : (isEmpty ? 'rgba(255, 255, 255, 0.03)' : 'rgba(99, 102, 241, 0.15)');
            const isAC = room.type === 'AC';
            const statusColor = room.status === 'Occupied' ? '#10b981' : (room.status === 'Maintenance' ? '#ef4444' : '#6b7280');

            const occupantsList = room.occupants.length > 0
                ? room.occupants.map(id => {
                    const s = App.state.students.find(st => st.id === id);
                    return s ? `<div style="padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">👤 ${s.name}</div>` : '';
                }).join('')
                : '<span style="opacity:0.5; font-style: italic;">No occupants</span>';

            const amenityIcons = {
                'WiFi': '📶',
                'Attached Bathroom': '🚿',
                'Geyser': '♨️',
                'Balcony': '🏞️',
                'Study Table': '📚',
                'Wardrobe': '👔',
                'Window': '🪟'
            };

            const amenitiesList = room.amenities && room.amenities.length > 0
                ? room.amenities.map(amenity =>
                    `<span style="background: rgba(255,255,255,0.08); padding: 4px 8px; border-radius: 6px; font-size: 0.7rem; display: inline-flex; align-items: center; gap: 4px; margin: 2px;">${amenityIcons[amenity] || '✓'} ${amenity}</span>`
                ).join('')
                : '<span style="opacity:0.5; font-size: 0.7rem;">No amenities listed</span>';

            return `
            <div style="background: ${bg}; border: 1px solid ${color}; padding: 20px; border-radius: 16px; transition: all 0.3s; position: relative;" 
                 onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.2)';" 
                 onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                
                <!-- Edit Button (Top Right) -->
                <button class="btn-edit-room" data-room="${room.number}" 
                        style="position: absolute; top: 10px; right: 10px; background: rgba(99, 102, 241, 0.2); border: 1px solid #6366f1; color: #a5b4fc; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 0.75rem; display: flex; align-items: center; gap: 5px; z-index: 10;"
                        title="Edit room settings">
                    <i class="bi bi-pencil-square"></i> Edit
                </button>

                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px; padding-right: 70px;">
                    <div>
                        <div style="font-weight: 700; font-size: 1.3rem; margin-bottom: 5px;">Room ${room.number}</div>
                        <div style="font-size: 0.75rem; opacity: 0.7;">Floor ${room.floor || 1}</div>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 5px;">
                        <!-- Inline AC/Non-AC Toggle -->
                        <span class="toggle-room-type" data-room="${room.number}" data-current="${room.type}"
                              style="background: ${isAC ? 'rgba(59, 130, 246, 0.2)' : 'rgba(251, 191, 36, 0.2)'}; color: ${isAC ? '#60a5fa' : '#fbbf24'}; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; cursor: pointer; user-select: none;"
                              title="Click to toggle AC/Non-AC">
                            ${isAC ? '❄️ AC' : '🌡️ Non-AC'}
                        </span>
                        <span style="background: rgba(${statusColor === '#10b981' ? '16, 185, 129' : (statusColor === '#ef4444' ? '239, 68, 68' : '107, 114, 128')}, 0.2); color: ${statusColor}; padding: 3px 8px; border-radius: 8px; font-size: 0.7rem;">
                            ${room.status || 'Vacant'}
                        </span>
                    </div>
                </div>

                <div style="margin-bottom: 15px; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-size: 0.8rem; opacity: 0.8;">Occupancy</span>
                        <span style="font-weight: 600;">${room.occupants.length}/${room.capacity}</span>
                    </div>
                    <div style="font-size: 0.75rem; line-height: 1.6;">
                        ${occupantsList}
                    </div>
                </div>

                <div style="margin-bottom: 12px;">
                    <div style="font-size: 0.75rem; opacity: 0.7; margin-bottom: 8px;">Amenities:</div>
                    <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                        ${amenitiesList}
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <span style="font-size: 0.75rem; opacity: 0.7;">Monthly Rent</span>
                    <span style="font-weight: 700; font-size: 1.1rem; color: var(--accent);">₹${room.rent || (isAC ? '8,000' : '6,000')}</span>
                </div>
            </div>
        `;
        }).join('');

        return `
        <div class="glass-panel" style="padding: 30px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <div>
                    <h3>🏠 Room Management</h3>
                    <p style="color: var(--text-muted); margin: 5px 0 0 0;">Live status of ${hostel.totalRooms} rooms • Click badges to toggle AC/Non-AC • Click Edit for more options</p>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <button id="btnManageFloors" class="btn-primary" style="font-size: 0.85rem; padding: 8px 15px; display: flex; align-items: center; gap: 5px;">
                        <i class="bi bi-layers"></i> Manage Floors
                    </button>
                    <div style="width: 1px; height: 25px; background: var(--glass-border); margin: 0 5px;"></div>
                    <div style="display: flex; gap: 15px; font-size: 0.85rem;">
                        <div style="display: flex; align-items: center; gap: 5px;">
                            <div style="width: 12px; height: 12px; border-radius: 3px; background: rgba(99, 102, 241, 0.3); border: 1px solid #6366f1;"></div>
                            <span>Partially Occupied</span>
                        </div>
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <div style="width: 12px; height: 12px; border-radius: 3px; background: rgba(236, 72, 153, 0.3); border: 1px solid #ec4899;"></div>
                        <span>Full</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <div style="width: 12px; height: 12px; border-radius: 3px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--glass-border);"></div>
                        <span>Vacant</span>
                    </div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
                ${roomCards}
            </div>
        </div>

        <!-- Edit Room Modal -->
        <div id="editRoomModal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);">
            <div class="glass-panel" style="max-width: 500px; width: 90%; padding: 30px; position: relative;">
                <button id="closeEditModal" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; opacity: 0.7;">&times;</button>
                
                <h3 style="margin-bottom: 25px;">✏️ Edit Room Settings</h3>
                
                <form id="editRoomForm">
                    <input type="hidden" id="editRoomNumber">
                    
                    <div class="form-group" style="margin-bottom: 20px;">
                        <label class="form-label">Room Type</label>
                        <select id="editRoomType" class="form-input" style="width: 100%;">
                            <option value="AC">❄️ AC Room</option>
                            <option value="Non-AC">🌡️ Non-AC Room</option>
                        </select>
                    </div>

                    <div class="form-group" style="margin-bottom: 20px;">
                        <label class="form-label">Floor Number</label>
                        <input type="number" id="editRoomFloor" class="form-input" min="1" max="20" style="width: 100%;">
                    </div>

                    <div class="form-group" style="margin-bottom: 20px;">
                        <label class="form-label">Monthly Rent (₹)</label>
                        <input type="number" id="editRoomRent" class="form-input" min="1000" step="500" style="width: 100%;">
                    </div>

                    <div class="form-group" style="margin-bottom: 20px;">
                        <label class="form-label">Room Status</label>
                        <select id="editRoomStatus" class="form-input" style="width: 100%;">
                            <option value="Vacant">🟢 Vacant</option>
                            <option value="Occupied">🔵 Occupied</option>
                            <option value="Maintenance">🔴 Maintenance</option>
                        </select>
                    </div>

                    <div class="form-group" style="margin-bottom: 25px;">
                        <label class="form-label">Amenities</label>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                <input type="checkbox" class="amenity-check" value="WiFi" style="width: 16px; height: 16px;">
                                <span>📶 WiFi</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                <input type="checkbox" class="amenity-check" value="Attached Bathroom" style="width: 16px; height: 16px;">
                                <span>🚿 Bathroom</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                <input type="checkbox" class="amenity-check" value="Geyser" style="width: 16px; height: 16px;">
                                <span>♨️ Geyser</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                <input type="checkbox" class="amenity-check" value="Balcony" style="width: 16px; height: 16px;">
                                <span>🏞️ Balcony</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                <input type="checkbox" class="amenity-check" value="Study Table" style="width: 16px; height: 16px;">
                                <span>📚 Study Table</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                <input type="checkbox" class="amenity-check" value="Wardrobe" style="width: 16px; height: 16px;">
                                <span>👔 Wardrobe</span>
                            </label>
                        </div>
                    </div>

                    <div style="display: flex; gap: 10px;">
                        <button type="submit" class="btn-primary" style="flex: 1;">💾 Save Changes</button>
                        <button type="button" id="cancelEditModal" class="btn-primary" style="flex: 1; background: rgba(239, 68, 68, 0.2); border-color: #ef4444;">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    },

    manageFloorsModal: () => `
    <div id="manageFloorsModal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);">
        <div class="glass-panel" style="max-width: 450px; width: 90%; padding: 30px; position: relative;">
            <button id="closeFloorsModal" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; opacity: 0.7;">&times;</button>
            
            <h3 style="margin-bottom: 25px;">🏢 Manage Floors</h3>
            
            <div style="margin-bottom: 25px;">
                <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 15px;">Add a new floor (adds 4 rooms automatically) or remove the top floor.</p>
                
                <div style="display: flex; gap: 15px;">
                    <button id="btnAddFloor" class="btn-primary" style="flex: 1; background: rgba(16, 185, 129, 0.2); border-color: #10b981; color: #34d399;">
                        <i class="bi bi-plus-lg"></i> Add Floor
                    </button>
                    <button id="btnRemoveFloor" class="btn-primary" style="flex: 1; background: rgba(239, 68, 68, 0.2); border-color: #ef4444; color: #f87171;">
                        <i class="bi bi-dash-lg"></i> Remove Top Floor
                    </button>
                </div>
            </div>

            <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 10px;">
                <h4 style="margin-bottom: 10px; font-size: 0.9rem;">Current Configuration</h4>
                <div id="floorStats" style="font-size: 0.85rem; opacity: 0.8;">
                    Loading stats...
                </div>
            </div>
        </div>
    </div>
`,








    feesManagement: (students, fees, hostelId) => `
    < div class="glass-panel" style = "padding: 20px;" >
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3><i class="bi bi-cash-coin"></i> Fees Management</h3>
                <div style="display: flex; gap: 10px;">
                    <button id="downloadAllReceipts" class="btn-primary" style="background: var(--secondary); border-color: var(--secondary);"><i class="bi bi-download"></i> All Receipts</button>
                    <button id="toggleBulkFee" class="btn-primary"><i class="bi bi-plus-circle"></i> Add Bulk Fees</button>
                </div>
            </div>

            <div id="bulkFeeForm" style="display: none; margin-bottom: 20px; background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px;">
                <h4 style="margin-bottom: 15px;">Set Fees for All Students</h4>
                <form id="submitBulkFeeForm" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                    <div class="form-group">
                        <label class="form-label">Amount (₹)</label>
                        <input type="number" id="bulkAmount" class="form-input" placeholder="5000" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Due Date</label>
                        <input type="date" id="bulkDueDate" class="form-input" required>
                    </div>
                    <div class="form-group" style="display: flex; align-items: flex-end;">
                        <button type="submit" class="btn-primary" style="width: 100%;">Create for All</button>
                    </div>
                </form>
            </div>

            <div class="table-container">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="text-align: left; opacity: 0.7; border-bottom: 1px solid var(--glass-border);">
                            <th style="padding: 15px;">Student</th>
                            <th style="padding: 15px;">UID</th>
                            <th style="padding: 15px;">Room</th>
                            <th style="padding: 15px;">Amount</th>
                            <th style="padding: 15px;">Due Date</th>
                            <th style="padding: 15px;">Status</th>
                            <th style="padding: 15px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students.map(s => {
        const studentFee = fees.find(f => f.studentId === s.id);
        const statusColor = studentFee ? (studentFee.status === 'paid' ? '#10b981' : (studentFee.status === 'overdue' ? '#ef4444' : '#f59e0b')) : '#6b7280';
        const statusBg = studentFee ? (studentFee.status === 'paid' ? 'rgba(16, 185, 129, 0.2)' : (studentFee.status === 'overdue' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)')) : 'rgba(107, 114, 128, 0.2)';

        return `
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <td style="padding: 15px;">${s.name}</td>
                                <td style="padding: 15px; font-family: monospace; font-size: 0.9rem;">${s.id}</td>
                                <td style="padding: 15px;">${s.room}</td>
                                <td style="padding: 15px; font-weight: 600;">${studentFee ? '₹' + studentFee.amount : '-'}</td>
                                <td style="padding: 15px;">${studentFee ? studentFee.dueDate : '-'}</td>
                                <td style="padding: 15px;">
                                    <span style="padding: 4px 10px; border-radius: 6px; background: ${statusBg}; color: ${statusColor}; font-size: 0.85rem; text-transform: capitalize;">
                                        ${studentFee ? studentFee.status : 'No Record'}
                                    </span>
                                </td>
                                <td style="padding: 15px;">
                                    <div style="display: flex; gap: 5px;">
                                        ${!studentFee ? `
                                            <button class="btn-add-fee" data-student-id="${s.id}" style="background: rgba(99, 102, 241, 0.2); color: #a5b4fc; border: 1px solid rgba(99, 102, 241, 0.3); padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
                                                <i class="bi bi-plus"></i> Add
                                            </button>
                                        ` : `
                                            ${studentFee.status !== 'paid' ? `
                                                <button class="btn-mark-paid" data-fee-id="${studentFee.id}" style="background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
                                                    <i class="bi bi-check-circle"></i> Paid
                                                </button>
                                                <button class="btn-send-reminder" data-student-id="${s.id}" data-fee-id="${studentFee.id}" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
                                                    <i class="bi bi-bell"></i> Remind
                                                </button>
                                                <button class="btn-update-fee" data-fee-id="${studentFee.id}" data-amount="${studentFee.amount}" data-date="${studentFee.dueDate}" style="background: rgba(139, 92, 246, 0.2); color: #a5b4fc; border: 1px solid rgba(139, 92, 246, 0.3); padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
                                                    <i class="bi bi-pencil"></i> Edit
                                                </button>
                                                <button class="btn-delete-fee" data-fee-id="${studentFee.id}" style="background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 0.85rem;" title="Delete Record">
                                                    <i class="bi bi-trash"></i>
                                                </button>
                                            ` : `
                                                <div style="display:flex; flex-direction:column; gap:2px;">
                                                    <div style="display:flex; align-items:center; gap:5px;">
                                                        <span style="color: #10b981; font-size: 0.8rem;">✓ Paid on ${studentFee.paidDate}</span>
                                                        <button class="btn-delete-fee" data-fee-id="${studentFee.id}" style="background: rgba(239, 68, 68, 0.1); color: #f87171; border: none; padding: 2px 5px; border-radius: 4px; cursor: pointer; font-size: 0.75rem;" title="Delete Paid Record">
                                                            <i class="bi bi-trash"></i>
                                                        </button>
                                                    </div>
                                                    <button class="btn-view-receipt" data-fee-id="${studentFee.id}" style="background:rgba(255,255,255,0.1); border:1px solid var(--glass-border); color:white; font-size:0.7rem; padding:2px 5px; border-radius:4px; cursor:pointer;">Receipt</button>
                                                </div>
                                            `}
                                        `}
                                    </div>
                                </td>
                            </tr>
                        `}).join('')}
                    </tbody >
                </table >
            </div >
        </div >
    `,

    studentFees: (fees, student) => `
    < div class="glass-panel" style = "max-width: 800px; margin: 0 auto; padding: 30px;" >
        <h2 style="margin-bottom: 25px;"><i class="bi bi-cash-coin"></i> My Fees</h2>
            
            ${fees.length > 0 ? `
                <div style="display: grid; gap: 20px;">
                    ${fees.map(fee => {
        const isOverdue = new Date(fee.dueDate) < new Date() && fee.status !== 'paid';
        const statusColor = fee.status === 'paid' ? '#10b981' : (isOverdue ? '#ef4444' : '#f59e0b');
        const statusBg = fee.status === 'paid' ? 'rgba(16, 185, 129, 0.1)' : (isOverdue ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)');

        return `
                        <div style="background: ${statusBg}; border-left: 4px solid ${statusColor}; padding: 20px; border-radius: 12px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <div>
                                    <div style="font-size: 2rem; font-weight: 700; color: ${statusColor};">₹${fee.amount}</div>
                                    <div style="font-size: 0.9rem; opacity: 0.8; margin-top: 5px;">
                                        Due Date: ${fee.dueDate}
                                    </div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="padding: 8px 16px; border-radius: 8px; background: ${statusColor}; color: white; font-weight: 600; text-transform: uppercase; font-size: 0.85rem;">
                                        ${fee.status}
                                    </div>
                                    ${fee.status === 'paid' && fee.paidDate ? `
                                        <div style="font-size: 0.8rem; opacity: 0.7; margin-top: 5px;">
                                            Paid on: ${fee.paidDate}
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                            
                            ${fee.status !== 'paid' ? `
                                <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; font-size: 0.9rem; margin-bottom: 15px;">
                                    <i class="bi bi-info-circle"></i> Please pay your fees by the due date to avoid late charges.
                                    ${isOverdue ? '<br><strong style="color: #ef4444;">⚠️ This fee is overdue!</strong>' : ''}
                                </div>
                                <button class="btn-pay-now btn-primary" data-fee-id="${fee.id}" data-amount="${fee.amount}" style="width: 100%;">Pay Now (₹${fee.amount})</button>
                            ` : `
                                <div style="background: rgba(16, 185, 129, 0.2); padding: 12px; border-radius: 8px; font-size: 0.9rem; color: #34d399; margin-bottom: 15px;">
                                    <i class="bi bi-check-circle-fill"></i> Payment received. Thank you!
                                </div>
                                <button class="btn-view-receipt btn-primary" data-fee-id="${fee.id}" style="width: 100%; background:rgba(255,255,255,0.1); border:1px solid var(--glass-border);">View Receipt</button>
                            `}
                        </div>
                    `}).join('')}
                </div>
            ` : `
                <div style="text-align: center; padding: 60px 20px; opacity: 0.6;">
                    <i class="bi bi-cash-coin" style="font-size: 4rem; margin-bottom: 20px; display: block;"></i>
                    <h3>No Fee Records</h3>
                    <p>You don't have any fee records at the moment.</p>
                </div>
            `}
        </div >
    `

};

// Safe Initialization
document.addEventListener('DOMContentLoaded', () => {
    try {
        App.init();
    } catch (e) {
        console.error("Initialization Failed:", e);
        document.body.innerHTML = `
    < div style = "color:white; text-align:center; padding:50px; font-family:sans-serif;" >
                    <h1>Startup Error</h1>
                    <p>${e.message}</p>
                    <button onclick="localStorage.clear(); location.reload();" style="padding:10px 20px; background:red; color:white; border:none; border-radius:5px; cursor:pointer;">Reset App Data</button>
                    </div >
    `;
    }
});
