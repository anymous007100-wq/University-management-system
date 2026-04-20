let currentView = 'home';
let currentUser = null;
let systemData = null;

const el = id => document.getElementById(id);
const hideElement = element => element?.classList.add('hidden');
const showElement = element => element?.classList.remove('hidden');

function switchView(viewName) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
        view.classList.add('hidden');
    });
    
    const targetView = el(`${viewName}-view`);
    if (targetView) {
        targetView.classList.remove('hidden');
        targetView.classList.add('active');
    }
    
    currentView = viewName;
}

function showHome() {
    switchView('home');
}

function showLogin(userType) {
    switchView('login');
    
    const loginTitle = el('login-title');
    const loginSubtitle = el('login-subtitle');
    
    if (userType === 'student') {
        loginTitle.textContent = 'Student Login';
        loginSubtitle.textContent = 'Enter your student credentials to continue';
    } else if (userType === 'admin') {
        loginTitle.textContent = 'Admin Login';
        loginSubtitle.textContent = 'Enter your admin credentials to continue';
    }
    
    el('login-form').dataset.userType = userType;
    
    hideElement(el('login-error'));
}

function showDashboard(user) {
    currentUser = user;
    switchView('dashboard');
    
    el('dashboard-title').textContent = `${user.role === 'student' ? 'Student' : 'Admin'} Dashboard`;
    el('user-name').textContent = user.name;
    
    generateSidebar(user.role);
    
    if (user.role === 'student') {
        loadStudentData();
        showSection('profile');
    } else if (user.role === 'admin') {
        loadAdminData();
        showSection('users');
    }
}

function logout() {
    currentUser = null;
    clearSidebar();
    showHome();
}

function showSection(sectionName) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
        hideElement(section);
    });
    
    const targetSection = el(`${sectionName}-section`);
    if (targetSection) {
        showElement(targetSection);
        targetSection.classList.add('active');
    }
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeNavItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
}

async function authenticateUser(userId, password, userType) {
    if (!systemData) {
        await loadData();
    }
    
    const user = systemData.users.find(u => 
        u.id === userId && 
        u.password === password && 
        u.type === userType &&
        u.role === userType
    );
    
    return user;
}

function generateSidebar(role) {
    const sidebarLinks = el('sidebar-links');
    if (!sidebarLinks) return;
    
    sidebarLinks.innerHTML = '';
    
    const menuItems = getMenuItems(role);
    
    menuItems.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'nav-item';
        if (index === 0) li.classList.add('active');
        li.dataset.section = item.section;
        
        const a = document.createElement('a');
        a.href = '#';
        a.onclick = () => showSection(item.section);
        a.textContent = `${item.icon} ${item.label}`;
        
        li.appendChild(a);
        sidebarLinks.appendChild(li);
    });
}

function clearSidebar() {
    const sidebarLinks = el('sidebar-links');
    if (sidebarLinks) {
        sidebarLinks.innerHTML = '';
    }
}

function getMenuItems(role) {
    if (role === 'student') {
        return [
            { section: 'profile', label: 'Profile', icon: 'Profile' },
            { section: 'notices', label: 'Notice Board', icon: 'Notice Board' },
            { section: 'courses', label: 'Course Registration', icon: 'Course Registration' },
            { section: 'records', label: 'Academic Records', icon: 'Academic Records' },
            { section: 'fees', label: 'Fees & Payments', icon: 'Fees & Payments' }
        ];
    } else if (role === 'admin') {
        return [
            { section: 'users', label: 'User Management', icon: 'User Management' },
            { section: 'course-management', label: 'Course & Dept Management', icon: 'Course & Dept Management' },
            { section: 'results', label: 'Result Processing', icon: 'Result Processing' },
            { section: 'financial', label: 'Financial Oversight', icon: 'Financial Oversight' }
        ];
    }
    return [];
}

async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('Failed to load data');
        }
        systemData = await response.json();
        return true;
    } catch (error) {
        console.error('Error loading data:', error);
        return false;
    }
}

function loadStudentData() {
    if (!currentUser || !systemData) return;
    
    el('student-name').textContent = currentUser.name;
    el('student-id').textContent = currentUser.id;
    el('student-email').textContent = currentUser.email;
    el('student-program').textContent = currentUser.program || 'Computer Science';
    el('student-year').textContent = currentUser.year || '3rd Year';
    el('student-gpa').textContent = currentUser.gpa || '3.8';
    
    loadNotices();
    loadCourses();
    loadRecords();
    loadFees();
}

function loadNotices() {
    const noticeList = el('notice-list');
    if (!noticeList || !systemData?.notices) return;
    
    noticeList.innerHTML = systemData.notices.map(notice => `
        <div class="notice-item">
            <h3>${notice.title}</h3>
            <div class="notice-date">${notice.date}</div>
            <p>${notice.content}</p>
        </div>
    `).join('');
}

function loadCourses() {
    const courseList = el('course-list');
    if (!courseList || !systemData?.courses) return;
    
    courseList.innerHTML = systemData.courses.map(course => `
        <div class="course-item">
            <h3>${course.title}</h3>
            <p><strong>Code:</strong> ${course.code}</p>
            <p><strong>Credits:</strong> ${course.credits}</p>
            <p><strong>Instructor:</strong> ${course.instructor}</p>
        </div>
    `).join('');
}

function loadRecords() {
    const recordsContainer = el('records-section').querySelector('.records-container');
    if (!recordsContainer || !systemData?.academicRecords) return;
    
    recordsContainer.innerHTML = systemData.academicRecords.map(record => `
        <div style="width: 100%; margin-bottom: 2rem;">
            <h3 style="color: #2c3e50; margin-bottom: 1rem;">${record.semester}</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #3498db; color: white;">
                        <th style="padding: 0.75rem; text-align: left;">Code</th>
                        <th style="padding: 0.75rem; text-align: left;">Title</th>
                        <th style="padding: 0.75rem; text-align: left;">Credits</th>
                        <th style="padding: 0.75rem; text-align: left;">Grade</th>
                    </tr>
                </thead>
                <tbody>
                    ${record.courses.map(course => `
                        <tr style="border-bottom: 1px solid #ecf0f1;">
                            <td style="padding: 0.75rem;">${course.code}</td>
                            <td style="padding: 0.75rem;">${course.title}</td>
                            <td style="padding: 0.75rem;">${course.credits}</td>
                            <td style="padding: 0.75rem;">${course.grade}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <p style="margin-top: 1rem; color: #2c3e50;"><strong>Semester GPA:</strong> ${record.gpa} | <strong>Credits Earned:</strong> ${record.creditsEarned}</p>
        </div>
    `).join('');
}

function loadFees() {
    const feesContainer = el('fees-section').querySelector('.fees-container');
    if (!feesContainer || !systemData?.fees) return;
    
    feesContainer.innerHTML = systemData.fees.map(fee => `
        <div style="width: 100%; margin-bottom: 2rem; background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);">
            <h3 style="color: #2c3e50; margin-bottom: 1rem;">${fee.semester}</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 1rem;">
                <tbody>
                    <tr style="border-bottom: 1px solid #ecf0f1;">
                        <td style="padding: 0.5rem; color: #7f8c8d;">Tuition Fee</td>
                        <td style="padding: 0.5rem; text-align: right;">$${fee.tuitionFee}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ecf0f1;">
                        <td style="padding: 0.5rem; color: #7f8c8d;">Lab Fee</td>
                        <td style="padding: 0.5rem; text-align: right;">$${fee.labFee}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ecf0f1;">
                        <td style="padding: 0.5rem; color: #7f8c8d;">Library Fee</td>
                        <td style="padding: 0.5rem; text-align: right;">$${fee.libraryFee}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ecf0f1; font-weight: bold;">
                        <td style="padding: 0.5rem;">Total Fee</td>
                        <td style="padding: 0.5rem; text-align: right;">$${fee.totalFee}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ecf0f1; color: #27ae60;">
                        <td style="padding: 0.5rem;">Paid Amount</td>
                        <td style="padding: 0.5rem; text-align: right;">$${fee.paidAmount}</td>
                    </tr>
                    <tr style="color: #e74c3c; font-weight: bold;">
                        <td style="padding: 0.5rem;">Due Amount</td>
                        <td style="padding: 0.5rem; text-align: right;">$${fee.dueAmount}</td>
                    </tr>
                </tbody>
            </table>
            <p style="color: #2c3e50;"><strong>Status:</strong> ${fee.status} | <strong>Payment Date:</strong> ${fee.paymentDate}</p>
        </div>
    `).join('');
}

function loadAdminData() {
    if (!systemData) return;
    
    loadUsersTable();
    loadCoursesTable();
    loadResults();
    loadFinancial();
}

function loadUsersTable() {
    const usersTableBody = el('users-tbody');
    if (!usersTableBody || !systemData?.users) return;
    
    usersTableBody.innerHTML = systemData.users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.type}</td>
            <td>${user.email}</td>
            <td>
                <button onclick="editUser('${user.id}')" style="margin-right: 5px;">Edit</button>
                <button onclick="deleteUser('${user.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

function loadCoursesTable() {
    const coursesTableBody = el('courses-tbody');
    if (!coursesTableBody || !systemData?.courses) return;
    
    coursesTableBody.innerHTML = systemData.courses.map(course => `
        <tr>
            <td>${course.code}</td>
            <td>${course.title}</td>
            <td>${course.credits}</td>
            <td>${course.department}</td>
            <td>${course.instructor}</td>
        </tr>
    `).join('');
}

function loadResults() {
    const resultsContainer = el('results-section').querySelector('.admin-container');
    if (!resultsContainer || !systemData?.results) return;
    
    resultsContainer.innerHTML = systemData.results.map(result => `
        <div style="width: 100%; margin-bottom: 2rem; background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);">
            <h3 style="color: #2c3e50; margin-bottom: 1rem;">${result.studentName} (${result.studentId}) - ${result.semester}</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 1rem;">
                <thead>
                    <tr style="background: #3498db; color: white;">
                        <th style="padding: 0.75rem; text-align: left;">Code</th>
                        <th style="padding: 0.75rem; text-align: left;">Title</th>
                        <th style="padding: 0.75rem; text-align: left;">Credits</th>
                        <th style="padding: 0.75rem; text-align: left;">Grade</th>
                        <th style="padding: 0.75rem; text-align: left;">Grade Point</th>
                    </tr>
                </thead>
                <tbody>
                    ${result.courses.map(course => `
                        <tr style="border-bottom: 1px solid #ecf0f1;">
                            <td style="padding: 0.75rem;">${course.code}</td>
                            <td style="padding: 0.75rem;">${course.title}</td>
                            <td style="padding: 0.75rem;">${course.credits}</td>
                            <td style="padding: 0.75rem;">${course.grade}</td>
                            <td style="padding: 0.75rem;">${course.gradePoint}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <p style="color: #2c3e50;"><strong>Semester GPA:</strong> ${result.gpa} | <strong>Status:</strong> ${result.status}</p>
        </div>
    `).join('');
}

function loadFinancial() {
    const financialContainer = el('financial-section').querySelector('.admin-container');
    if (!financialContainer || !systemData?.financial) return;
    
    financialContainer.innerHTML = systemData.financial.map(fin => `
        <div style="width: 100%; margin-bottom: 2rem; background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);">
            <h3 style="color: #2c3e50; margin-bottom: 1rem;">${fin.semester}</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 1rem;">
                <tbody>
                    <tr style="border-bottom: 1px solid #ecf0f1; color: #27ae60;">
                        <td style="padding: 0.5rem; color: #7f8c8d;">Total Revenue</td>
                        <td style="padding: 0.5rem; text-align: right;">$${fin.totalRevenue}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ecf0f1;">
                        <td style="padding: 0.5rem; color: #7f8c8d;">Tuition Revenue</td>
                        <td style="padding: 0.5rem; text-align: right;">$${fin.tuitionRevenue}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ecf0f1;">
                        <td style="padding: 0.5rem; color: #7f8c8d;">Other Fees</td>
                        <td style="padding: 0.5rem; text-align: right;">$${fin.otherFees}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ecf0f1; color: #e74c3c;">
                        <td style="padding: 0.5rem; color: #7f8c8d;">Total Expenses</td>
                        <td style="padding: 0.5rem; text-align: right;">$${fin.totalExpenses}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ecf0f1;">
                        <td style="padding: 0.5rem; color: #7f8c8d;">Faculty Salaries</td>
                        <td style="padding: 0.5rem; text-align: right;">$${fin.facultySalaries}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ecf0f1;">
                        <td style="padding: 0.5rem; color: #7f8c8d;">Operational Costs</td>
                        <td style="padding: 0.5rem; text-align: right;">$${fin.operationalCosts}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ecf0f1; font-weight: bold; color: #27ae60;">
                        <td style="padding: 0.5rem;">Net Income</td>
                        <td style="padding: 0.5rem; text-align: right;">$${fin.netIncome}</td>
                    </tr>
                    <tr style="font-weight: bold;">
                        <td style="padding: 0.5rem; color: #7f8c8d;">Collection Rate</td>
                        <td style="padding: 0.5rem; text-align: right;">${fin.collectionRate}%</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `).join('');
}

function editUser(userId) {
    alert(`Edit user functionality for user ${userId} would be implemented here.`);
}

function deleteUser(userId) {
    if (confirm(`Are you sure you want to delete user ${userId}?`)) {
        alert(`Delete user functionality for user ${userId} would be implemented here.`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = el('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const userId = el('user-id').value;
            const password = el('password').value;
            const userType = loginForm.dataset.userType;
            
            if (!userId || !password) {
                showElement(el('login-error'));
                return;
            }
            
            const user = await authenticateUser(userId, password, userType);
            
            if (user) {
                hideElement(el('login-error'));
                loginForm.reset();
                showDashboard(user);
            } else {
                showElement(el('login-error'));
            }
        });
    }
    
    loadData();
});