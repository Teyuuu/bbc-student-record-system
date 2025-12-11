// Curriculum data
const curriculum = {
    "1st Year": {
        "1st Sem": ["English 1", "Music 1", "Anthropology - Doctrine of Man", "Personal Evangelism", "Baptist Distinctive"],
        "2nd Sem": ["Bibliology - Doctrine of the Bible", "English 2", "Music 2", "Hermeneutics", "Old Testament Survey", "Soteriology - Doctrine of Salvation", "Ecclesiology - Doctrine of the Church"]
    },
    "2nd Year": {
        "1st Sem": ["Life of Christ", "Doctrine of Prayer and Fasting", "New Testament Survey", "Biblical Character"],
        "2nd Sem": ["Angelology - Doctrine of Angels and Doctrine of Satan", "Hamartiology - Doctrine of Sin", "Eschatology - Doctrine of the Last Things"]
    },
    "3rd Year": {
        "1st Sem": ["Christology - Doctrine of Christ", "Bible Manners and Customs", "Pneumatology - Doctrine of the Holy Spirit", "Problem Texts, Apologetics, Defense of the KJV"],
        "2nd Sem": ["Homiletics - The Art of Preaching", "Teaching for Results", "Bible History", "Pastoral Epistles", "Israelology - Doctrine of Israel", "Mission Immersion - Practical"]
    }
};

// Flatten all subjects
const allSubjects = [];
Object.keys(curriculum).forEach(year => {
    Object.keys(curriculum[year]).forEach(sem => {
        curriculum[year][sem].forEach(name => {
            allSubjects.push({year, sem, name});
        });
    });
});

// Data storage
let students = JSON.parse(localStorage.getItem('berean_students')) || [];
let nextId = students.length > 0 ? Math.max(...students.map(s => parseInt(s.studentNo))) + 1 : 1;

// Admin credentials
const adminUsername = 'admin';
const adminPassword = 'admin123';

// Helper functions
function saveStudents() {
    localStorage.setItem('berean_students', JSON.stringify(students));
}

function showAlert(message, type = 'success') {
    const alertBox = document.getElementById('alertBox');
    if (alertBox) {
        alertBox.className = `alert alert-${type}`;
        alertBox.textContent = message;
        alertBox.style.display = 'block';
        setTimeout(() => alertBox.style.display = 'none', 3000);
    } else {
        alert(message);
    }
}

function showSection(sectionId) {
    document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active'));
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }
    
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const navBtn = document.querySelector(`[data-section="${sectionId}"]`);
    if (navBtn) {
        navBtn.classList.add('active');
    }
}

function createStudentObject(prefix) {
    return {
        studentNo: String(nextId).padStart(4, '0'),
        fullName: document.getElementById(prefix + 'fullName').value.trim(),
        nickname: document.getElementById(prefix + 'nickname')?.value.trim() || '',
        dob: document.getElementById(prefix + 'dob')?.value || '',
        age: document.getElementById(prefix + 'age')?.value || '',
        civilStatus: document.getElementById(prefix + 'civilStatus')?.value.trim() || '',
        nationality: document.getElementById(prefix + 'nationality')?.value.trim() || '',
        presentAddress: document.getElementById(prefix + 'presentAddress')?.value.trim() || '',
        mobileNo: document.getElementById(prefix + 'mobileNo')?.value.trim() || '',
        occupation: document.getElementById(prefix + 'occupation')?.value.trim() || '',
        businessAddress: document.getElementById(prefix + 'businessAddress')?.value.trim() || '',
        businessTel: document.getElementById(prefix + 'businessTel')?.value.trim() || '',
        schoolGraduated: document.getElementById(prefix + 'schoolGraduated')?.value.trim() || '',
        dateGraduated: document.getElementById(prefix + 'dateGraduated')?.value || '',
        degreeAwards: document.getElementById(prefix + 'degreeAwards')?.value.trim() || '',
        charRefName: document.getElementById(prefix + 'charRefName')?.value.trim() || '',
        refContact: document.getElementById(prefix + 'refContact')?.value.trim() || '',
        emergencyName: document.getElementById(prefix + 'emergencyName')?.value.trim() || '',
        emergencyAddress: document.getElementById(prefix + 'emergencyAddress')?.value.trim() || '',
        emergencyNo: document.getElementById(prefix + 'emergencyNo')?.value.trim() || '',
        relation: document.getElementById(prefix + 'relation')?.value.trim() || '',
        homeChurch: document.getElementById(prefix + 'homeChurch')?.value.trim() || '',
        churchAddress: document.getElementById(prefix + 'churchAddress')?.value.trim() || '',
        pastorName: document.getElementById(prefix + 'pastorName')?.value.trim() || '',
        dateSaved: document.getElementById(prefix + 'dateSaved')?.value || '',
        dateBaptized: document.getElementById(prefix + 'dateBaptized')?.value || '',
        ministries: document.getElementById(prefix + 'ministries')?.value.trim() || '',
        specialSkills: document.getElementById(prefix + 'specialSkills')?.value.trim() || '',
        instruments: document.getElementById(prefix + 'instruments')?.value.trim() || '',
        reasonEnrolling: document.getElementById(prefix + 'reasonEnrolling')?.value.trim() || '',
        healthInfo: document.getElementById(prefix + 'healthInfo')?.value.trim() || '',
        testimony: document.getElementById(prefix + 'testimony')?.value.trim() || ''
    };
}

function populateStudentSelects() {
    const select = document.getElementById('adminEnrollStudentSelect');
    if (select) {
        select.innerHTML = '<option value="">-- Choose Student --</option>';
        students.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.studentNo;
            opt.textContent = `${s.studentNo} - ${s.fullName}`;
            select.appendChild(opt);
        });
    }
}

function populateSubjectsMulti(selects) {
    selects.forEach(select => {
        if (select) {
            select.innerHTML = '';
            allSubjects.forEach(sub => {
                const opt = document.createElement('option');
                opt.value = JSON.stringify(sub);
                opt.textContent = `${sub.year} ${sub.sem} - ${sub.name}`;
                select.appendChild(opt);
            });
        }
    });
}

function populateAdminStudentsTable() {
    const tbody = document.querySelector('#adminStudentsTable tbody');
    if (tbody) {
        tbody.innerHTML = '';
        students.forEach(student => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${student.studentNo}</td>
                <td>${student.fullName}</td>
                <td>${student.mobileNo || 'N/A'}</td>
                <td class="action-buttons">
                    <button class="btn-view" onclick="showViewModal('${student.studentNo}')">View</button>
                    <button class="btn-edit" onclick="showEditModal('${student.studentNo}')">Edit</button>
                    <button class="btn-delete" onclick="deleteStudent('${student.studentNo}')">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

function showStudentDashboard(student) {
    const nameElem = document.getElementById('studentName');
    const nameTopElem = document.getElementById('studentNameTop');
    const avatarElem = document.getElementById('studentAvatar');
    const countElem = document.getElementById('subjectCount');
    
    if (nameElem) nameElem.textContent = student.fullName;
    if (nameTopElem) nameTopElem.textContent = student.fullName;
    if (avatarElem) avatarElem.textContent = student.fullName.charAt(0).toUpperCase();
    if (countElem) countElem.textContent = (student.enrolledSubjects || []).length;
    
    populateSubjectsMulti([document.getElementById('studentSubjectsMulti')].filter(Boolean));
    populateStudentSubjectsTable(student);
}

function populateStudentSubjectsTable(student) {
    const tbody = document.querySelector('#studentSubjectsTable tbody');
    if (tbody) {
        tbody.innerHTML = '';
        (student.enrolledSubjects || []).forEach(sub => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${sub.year}</td>
                <td>${sub.sem}</td>
                <td>${sub.name}</td>
            `;
            tbody.appendChild(tr);
        });
    }
}

function enrollSubjects(student, type, prefix) {
    if (!student.enrolledSubjects) student.enrolledSubjects = [];
    
    if (type === 'bundle') {
        const yearSelect = document.getElementById(prefix + 'YearSelect');
        const semSelect = document.getElementById(prefix + 'SemSelect');
        if (yearSelect && semSelect) {
            const year = yearSelect.value;
            const sem = semSelect.value;
            const subjects = curriculum[year][sem] || [];
            subjects.forEach(name => {
                const sub = {year, sem, name};
                if (!student.enrolledSubjects.some(s => s.name === name)) {
                    student.enrolledSubjects.push(sub);
                }
            });
        }
    } else {
        const multi = document.getElementById(prefix + 'SubjectsMulti');
        if (multi) {
            Array.from(multi.selectedOptions).forEach(opt => {
                const sub = JSON.parse(opt.value);
                if (!student.enrolledSubjects.some(s => s.name === sub.name)) {
                    student.enrolledSubjects.push(sub);
                }
            });
        }
    }
}

// View Modal
window.showViewModal = function(studentNo) {
    const student = students.find(s => s.studentNo === studentNo);
    const modal = document.getElementById('viewModal');
    const details = document.getElementById('viewDetails');
    
    if (modal && details && student) {
        details.innerHTML = '';
        Object.keys(student).forEach(key => {
            if (key !== 'enrolledSubjects' && key !== 'password') {
                const p = document.createElement('p');
                p.innerHTML = `<strong>${key}:</strong> ${student[key] || 'N/A'}`;
                p.style.marginBottom = '8px';
                details.appendChild(p);
            }
        });
        
        const tbody = document.querySelector('#viewSubjectsTable tbody');
        if (tbody) {
            tbody.innerHTML = '';
            (student.enrolledSubjects || []).forEach(sub => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${sub.year}</td><td>${sub.sem}</td><td>${sub.name}</td>`;
                tbody.appendChild(tr);
            });
        }
        modal.style.display = 'block';
    }
};

// Edit Modal
window.showEditModal = function(studentNo) {
    const student = students.find(s => s.studentNo === studentNo);
    const modal = document.getElementById('editModal');
    const form = document.getElementById('editForm');
    
    if (modal && form && student) {
        document.getElementById('editFullName').value = student.fullName;
        document.getElementById('editNickname').value = student.nickname || '';
        document.getElementById('editDob').value = student.dob || '';
        document.getElementById('editAge').value = student.age || '';
        document.getElementById('editMobileNo').value = student.mobileNo || '';
        document.getElementById('editOccupation').value = student.occupation || '';
        document.getElementById('editPresentAddress').value = student.presentAddress || '';
        document.getElementById('editPassword').value = '';
        form.dataset.studentno = studentNo;
        modal.style.display = 'block';
    }
};

// Delete Student
window.deleteStudent = function(studentNo) {
    if (confirm('Are you sure you want to delete this student?')) {
        students = students.filter(s => s.studentNo !== studentNo);
        saveStudents();
        populateAdminStudentsTable();
        populateStudentSelects();
        showAlert('Student deleted successfully!');
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the login page
    const loginPage = document.getElementById('loginPage');
    const adminDashboard = document.getElementById('adminDashboard');
    const studentDashboard = document.getElementById('studentDashboard');
    
    // Menu toggle
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            const adminSidebar = document.getElementById('adminSidebar');
            const studentSidebar = document.getElementById('studentSidebar');
            if (adminSidebar) adminSidebar.classList.toggle('show');
            if (studentSidebar) studentSidebar.classList.toggle('show');
        });
    }
    
    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.dataset.section) {
                showSection(this.dataset.section);
            }
        });
    });
    
    // Role selection on login page
    const roleSelect = document.getElementById('role');
    if (roleSelect) {
        // Set initial state
        const adminUser = document.getElementById('adminUser');
        const adminPass = document.getElementById('adminPass');
        const studentNoLogin = document.getElementById('studentNoLogin');
        const studentPass = document.getElementById('studentPass');
        
        if (adminUser && adminPass && studentNoLogin && studentPass) {
            adminUser.required = true;
            adminPass.required = true;
            studentNoLogin.required = false;
            studentPass.required = false;
        }
        
        roleSelect.addEventListener('change', function() {
            const adminFields = document.getElementById('adminFields');
            const studentFields = document.getElementById('studentFields');
            
            if (this.value === 'Admin') {
                adminFields.style.display = 'block';
                studentFields.style.display = 'none';
                adminUser.required = true;
                adminPass.required = true;
                studentNoLogin.required = false;
                studentPass.required = false;
            } else {
                adminFields.style.display = 'none';
                studentFields.style.display = 'block';
                adminUser.required = false;
                adminPass.required = false;
                studentNoLogin.required = true;
                studentPass.required = true;
            }
        });
    }
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const role = document.getElementById('role').value;
            
            if (role === 'Admin') {
                const user = document.getElementById('adminUser').value;
                const pass = document.getElementById('adminPass').value;
                if (user === adminUsername && pass === adminPassword) {
                    sessionStorage.setItem('user', JSON.stringify({type: 'admin'}));
                    window.location.href = 'admin.html';
                } else {
                    showAlert('Invalid admin credentials', 'error');
                }
            } else {
                const studentNo = document.getElementById('studentNoLogin').value;
                const pass = document.getElementById('studentPass').value;
                const student = students.find(s => s.studentNo === studentNo && s.password === pass);
                if (student) {
                    sessionStorage.setItem('user', JSON.stringify({type: 'student', studentNo: student.studentNo}));
                    window.location.href = 'student.html';
                } else {
                    showAlert('Invalid student credentials', 'error');
                }
            }
        });
    }
    
    // Show register page
    const showRegisterBtn = document.getElementById('showRegister');
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', function() {
            document.getElementById('loginPage').classList.remove('active');
            document.getElementById('registrationPage').classList.add('active');
            const studentNoInput = document.getElementById('studentNo');
            if (studentNoInput) {
                studentNoInput.value = String(nextId).padStart(4, '0');
            }
        });
    }
    
    // Back to login
    const backToLoginBtn = document.getElementById('backToLogin');
    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', function() {
            document.getElementById('registrationPage').classList.remove('active');
            document.getElementById('loginPage').classList.add('active');
        });
    }
    
    // Student registration
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const student = createStudentObject('');
            student.password = document.getElementById('password').value;
            student.enrolledSubjects = [];
            students.push(student);
            nextId++;
            saveStudents();
            this.reset();
            document.getElementById('registrationPage').classList.remove('active');
            document.getElementById('loginPage').classList.add('active');
            showAlert('Registration successful! Please login.');
        });
    }
    
    // Admin registration form
    const adminRegistrationForm = document.getElementById('adminRegistrationForm');
    if (adminRegistrationForm) {
        adminRegistrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const student = createStudentObject('admin');
            student.password = document.getElementById('adminPassword').value;
            student.enrolledSubjects = [];
            students.push(student);
            nextId++;
            saveStudents();
            populateStudentSelects();
            populateAdminStudentsTable();
            this.reset();
            const studentNoInput = document.getElementById('adminStudentNo');
            if (studentNoInput) {
                studentNoInput.value = String(nextId).padStart(4, '0');
            }
            showAlert('Student registered successfully!');
        });
    }
    
    // Admin enrollment form
    const adminEnrollmentForm = document.getElementById('adminEnrollmentForm');
    if (adminEnrollmentForm) {
        adminEnrollmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const studentNo = document.getElementById('adminEnrollStudentSelect').value;
            const type = document.getElementById('adminEnrollType').value;
            const student = students.find(s => s.studentNo === studentNo);
            if (!student) return showAlert('Student not found.', 'error');
            enrollSubjects(student, type, 'admin');
            saveStudents();
            showAlert('Enrollment successful!');
            this.reset();
            document.getElementById('adminSingleOptions').style.display = 'none';
            document.getElementById('adminBundleOptions').style.display = 'block';
        });
    }
    
    // Student enrollment form
    const studentEnrollmentForm = document.getElementById('studentEnrollmentForm');
    if (studentEnrollmentForm) {
        studentEnrollmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const currentUser = JSON.parse(sessionStorage.getItem('user'));
            const student = students.find(s => s.studentNo === currentUser.studentNo);
            const type = document.getElementById('studentEnrollType').value;
            enrollSubjects(student, type, 'student');
            saveStudents();
            populateStudentSubjectsTable(student);
            const countElem = document.getElementById('subjectCount');
            if (countElem) countElem.textContent = student.enrolledSubjects.length;
            showAlert('Enrollment successful!');
            this.reset();
            document.getElementById('studentSingleOptions').style.display = 'none';
            document.getElementById('studentBundleOptions').style.display = 'block';
        });
    }
    
    // Enroll type change handlers
    ['admin', 'student'].forEach(prefix => {
        const enrollType = document.getElementById(prefix + 'EnrollType');
        if (enrollType) {
            enrollType.addEventListener('change', function() {
                const bundle = document.getElementById(prefix + 'BundleOptions');
                const single = document.getElementById(prefix + 'SingleOptions');
                if (bundle && single) {
                    if (this.value === 'bundle') {
                        bundle.style.display = 'block';
                        single.style.display = 'none';
                    } else {
                        bundle.style.display = 'none';
                        single.style.display = 'block';
                    }
                }
            });
        }
    });
    
    // Search form
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('searchName').value.trim().toLowerCase();
            const student = students.find(s => s.fullName.toLowerCase() === name);
            const results = document.getElementById('searchResults');
            const tbody = document.querySelector('#subjectsTable tbody');
            
            if (tbody) tbody.innerHTML = '';
            
            if (results) {
                if (student && student.enrolledSubjects && student.enrolledSubjects.length > 0) {
                    document.getElementById('resultName').textContent = `${student.fullName} - Subjects Taken`;
                    student.enrolledSubjects.forEach(sub => {
                        if (tbody) {
                            const tr = document.createElement('tr');
                            tr.innerHTML = `<td>${sub.year}</td><td>${sub.sem}</td><td>${sub.name}</td>`;
                            tbody.appendChild(tr);
                        }
                    });
                    results.style.display = 'block';
                } else {
                    results.style.display = 'block';
                    document.getElementById('resultName').textContent = student ? 'No subjects enrolled' : 'Student not found';
                }
            }
        });
    }
    
    // Edit form
    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const studentNo = this.dataset.studentno;
            const student = students.find(s => s.studentNo === studentNo);
            if (student) {
                student.fullName = document.getElementById('editFullName').value.trim();
                student.nickname = document.getElementById('editNickname').value.trim();
                student.dob = document.getElementById('editDob').value;
                student.age = document.getElementById('editAge').value;
                student.mobileNo = document.getElementById('editMobileNo').value.trim();
                student.occupation = document.getElementById('editOccupation').value.trim();
                student.presentAddress = document.getElementById('editPresentAddress').value.trim();
                const newPass = document.getElementById('editPassword').value;
                if (newPass) student.password = newPass;
                saveStudents();
                populateAdminStudentsTable();
                document.getElementById('editModal').style.display = 'none';
                showAlert('Updated successfully!');
            }
        });
    }
    
    // View profile button
    const viewProfileBtn = document.getElementById('viewProfile');
    if (viewProfileBtn) {
        viewProfileBtn.addEventListener('click', function() {
            const currentUser = JSON.parse(sessionStorage.getItem('user'));
            const student = students.find(s => s.studentNo === currentUser.studentNo);
            const details = document.getElementById('profileDetails');
            const modal = document.getElementById('profileModal');
            
            if (details && modal && student) {
                details.innerHTML = '';
                Object.keys(student).forEach(key => {
                    if (key !== 'enrolledSubjects' && key !== 'password') {
                        const p = document.createElement('p');
                        p.innerHTML = `<strong>${key}:</strong> ${student[key] || 'N/A'}`;
                        p.style.marginBottom = '8px';
                        details.appendChild(p);
                    }
                });
                modal.style.display = 'block';
            }
        });
    }
    
    // Close modal buttons
    const closeView = document.getElementById('closeView');
    const closeEdit = document.getElementById('closeEdit');
    const closeProfile = document.getElementById('closeProfile');
    
    if (closeView) closeView.addEventListener('click', () => document.getElementById('viewModal').style.display = 'none');
    if (closeEdit) closeEdit.addEventListener('click', () => document.getElementById('editModal').style.display = 'none');
    if (closeProfile) closeProfile.addEventListener('click', () => document.getElementById('profileModal').style.display = 'none');
    
    // Close modal on outside click
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Logout buttons
    const adminLogout = document.getElementById('adminLogout');
    const studentLogout = document.getElementById('studentLogout');
    
    if (adminLogout) {
        adminLogout.addEventListener('click', function() {
            sessionStorage.clear();
            window.location.href = 'index.html';
        });
    }
    
    if (studentLogout) {
        studentLogout.addEventListener('click', function() {
            sessionStorage.clear();
            window.location.href = 'index.html';
        });
    }
    
    // Initialize based on current page
    if (adminDashboard) {
        const user = JSON.parse(sessionStorage.getItem('user') || 'null');
        if (user && user.type === 'admin') {
            populateStudentSelects();
            populateSubjectsMulti([document.getElementById('adminSubjectsMulti')].filter(Boolean));
            populateAdminStudentsTable();
            const studentNoInput = document.getElementById('adminStudentNo');
            if (studentNoInput) {
                studentNoInput.value = String(nextId).padStart(4, '0');
            }
        }
    }
    
    if (studentDashboard) {
        const user = JSON.parse(sessionStorage.getItem('user') || 'null');
        if (user && user.type === 'student') {
            const student = students.find(s => s.studentNo === user.studentNo);
            if (student) {
                showStudentDashboard(student);
            }
        }
    }
    
    // Initialize student number on registration page
    if (loginPage) {
        const studentNoInput = document.getElementById('studentNo');
        if (studentNoInput) {
            studentNoInput.value = String(nextId).padStart(4, '0');
        }
    }
});