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
    const iconType = type === 'error' ? 'error' : 'success';
    Swal.fire({
        icon: iconType,
        title: type === 'error' ? 'Error!' : 'Success!',
        text: message,
        confirmButtonColor: '#6ba83d',
        timer: 3000,
        timerProgressBar: true
    });
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
    // Get student number from the field if it exists, otherwise generate new one
    const studentNoField = document.getElementById(prefix + 'StudentNo') || document.getElementById(prefix + 'studentNo');
    const studentNo = studentNoField?.value || String(nextId).padStart(4, '0');
    
    console.log('Creating student with prefix:', prefix, 'Student No:', studentNo); // Debug log
    
    return {
        studentNo: studentNo,
        fullName: document.getElementById(prefix + 'FullName')?.value.trim() || document.getElementById(prefix + 'fullName')?.value.trim() || '',
        nickname: document.getElementById(prefix + 'Nickname')?.value.trim() || document.getElementById(prefix + 'nickname')?.value.trim() || '',
        dob: document.getElementById(prefix + 'Dob')?.value || document.getElementById(prefix + 'dob')?.value || '',
        age: document.getElementById(prefix + 'Age')?.value || document.getElementById(prefix + 'age')?.value || '',
        civilStatus: document.getElementById(prefix + 'CivilStatus')?.value.trim() || document.getElementById(prefix + 'civilStatus')?.value.trim() || '',
        nationality: document.getElementById(prefix + 'Nationality')?.value.trim() || document.getElementById(prefix + 'nationality')?.value.trim() || '',
        presentAddress: document.getElementById(prefix + 'PresentAddress')?.value.trim() || document.getElementById(prefix + 'presentAddress')?.value.trim() || '',
        mobileNo: document.getElementById(prefix + 'MobileNo')?.value.trim() || document.getElementById(prefix + 'mobileNo')?.value.trim() || '',
        occupation: document.getElementById(prefix + 'Occupation')?.value.trim() || document.getElementById(prefix + 'occupation')?.value.trim() || '',
        businessAddress: document.getElementById(prefix + 'BusinessAddress')?.value.trim() || document.getElementById(prefix + 'businessAddress')?.value.trim() || '',
        businessTel: document.getElementById(prefix + 'BusinessTel')?.value.trim() || document.getElementById(prefix + 'businessTel')?.value.trim() || '',
        schoolGraduated: document.getElementById(prefix + 'SchoolGraduated')?.value.trim() || document.getElementById(prefix + 'schoolGraduated')?.value.trim() || '',
        dateGraduated: document.getElementById(prefix + 'DateGraduated')?.value || document.getElementById(prefix + 'dateGraduated')?.value || '',
        degreeAwards: document.getElementById(prefix + 'DegreeAwards')?.value.trim() || document.getElementById(prefix + 'degreeAwards')?.value.trim() || '',
        charRefName: document.getElementById(prefix + 'CharRefName')?.value.trim() || document.getElementById(prefix + 'charRefName')?.value.trim() || '',
        refContact: document.getElementById(prefix + 'RefContact')?.value.trim() || document.getElementById(prefix + 'refContact')?.value.trim() || '',
        emergencyName: document.getElementById(prefix + 'EmergencyName')?.value.trim() || document.getElementById(prefix + 'emergencyName')?.value.trim() || '',
        emergencyAddress: document.getElementById(prefix + 'EmergencyAddress')?.value.trim() || document.getElementById(prefix + 'emergencyAddress')?.value.trim() || '',
        emergencyNo: document.getElementById(prefix + 'EmergencyNo')?.value.trim() || document.getElementById(prefix + 'emergencyNo')?.value.trim() || '',
        relation: document.getElementById(prefix + 'Relation')?.value.trim() || document.getElementById(prefix + 'relation')?.value.trim() || '',
        homeChurch: document.getElementById(prefix + 'HomeChurch')?.value.trim() || document.getElementById(prefix + 'homeChurch')?.value.trim() || '',
        churchAddress: document.getElementById(prefix + 'ChurchAddress')?.value.trim() || document.getElementById(prefix + 'churchAddress')?.value.trim() || '',
        pastorName: document.getElementById(prefix + 'PastorName')?.value.trim() || document.getElementById(prefix + 'pastorName')?.value.trim() || '',
        dateSaved: document.getElementById(prefix + 'DateSaved')?.value || document.getElementById(prefix + 'dateSaved')?.value || '',
        dateBaptized: document.getElementById(prefix + 'DateBaptized')?.value || document.getElementById(prefix + 'dateBaptized')?.value || '',
        ministries: document.getElementById(prefix + 'Ministries')?.value.trim() || document.getElementById(prefix + 'ministries')?.value.trim() || '',
        specialSkills: document.getElementById(prefix + 'SpecialSkills')?.value.trim() || document.getElementById(prefix + 'specialSkills')?.value.trim() || '',
        instruments: document.getElementById(prefix + 'Instruments')?.value.trim() || document.getElementById(prefix + 'instruments')?.value.trim() || '',
        reasonEnrolling: document.getElementById(prefix + 'ReasonEnrolling')?.value.trim() || document.getElementById(prefix + 'reasonEnrolling')?.value.trim() || '',
        healthInfo: document.getElementById(prefix + 'HealthInfo')?.value.trim() || document.getElementById(prefix + 'healthInfo')?.value.trim() || '',
        testimony: document.getElementById(prefix + 'Testimony')?.value.trim() || document.getElementById(prefix + 'testimony')?.value.trim() || ''
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
    const totalStudentsElem = document.getElementById('totalStudents');
    
    if (tbody) {
        tbody.innerHTML = '';
        students.forEach(student => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span class="badge bg-secondary">${student.studentNo}</span></td>
                <td><i class="bi bi-person-fill me-2 text-success"></i>${student.fullName}</td>
                <td><i class="bi bi-phone-fill me-2 text-primary"></i>${student.mobileNo || 'N/A'}</td>
                <td class="text-center">
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-info" onclick="showViewModal('${student.studentNo}')" title="View Details">
                            <i class="bi bi-eye-fill"></i>
                        </button>
                        <button class="btn btn-warning" onclick="showEditModal('${student.studentNo}')" title="Edit Student">
                            <i class="bi bi-pencil-fill"></i>
                        </button>
                        <button class="btn btn-danger" onclick="deleteStudent('${student.studentNo}')" title="Delete Student">
                            <i class="bi bi-trash-fill"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        if (totalStudentsElem) {
            totalStudentsElem.textContent = students.length;
        }
    }
}

// Add search functionality for students table
function setupStudentSearch() {
    const searchInput = document.getElementById('searchStudentInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('#adminStudentsTable tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
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
    const countElem = document.getElementById('studentSubjectCount');
    
    if (tbody) {
        tbody.innerHTML = '';
        const subjects = student.enrolledSubjects || [];
        
        if (subjects.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center text-muted py-4">
                        <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                        <p class="mb-0">No subjects enrolled yet. Click "Enroll Subjects" to get started!</p>
                    </td>
                </tr>
            `;
        } else {
            subjects.forEach(sub => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><span class="badge bg-primary">${sub.year}</span></td>
                    <td><span class="badge bg-info">${sub.sem}</span></td>
                    <td><i class="bi bi-book me-2 text-success"></i>${sub.name}</td>
                `;
                tbody.appendChild(tr);
            });
        }
        
        if (countElem) {
            countElem.textContent = subjects.length;
        }
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
    
    if (student) {
        let detailsHTML = '<div style="text-align: left;">';
        Object.keys(student).forEach(key => {
            if (key !== 'enrolledSubjects' && key !== 'password') {
                detailsHTML += `<p style="margin-bottom: 8px;"><strong>${key}:</strong> ${student[key] || 'N/A'}</p>`;
            }
        });
        detailsHTML += '</div>';
        
        let subjectsHTML = '<h4 style="color: var(--primary-green); margin: 20px 0 10px 0;">Enrolled Subjects</h4>';
        if (student.enrolledSubjects && student.enrolledSubjects.length > 0) {
            subjectsHTML += '<table class="table table-bordered table-hover mt-3">';
            subjectsHTML += '<thead class="table-success"><tr><th>Year</th><th>Semester</th><th>Subject</th></tr></thead><tbody>';
            student.enrolledSubjects.forEach(sub => {
                subjectsHTML += `<tr><td>${sub.year}</td><td>${sub.sem}</td><td>${sub.name}</td></tr>`;
            });
            subjectsHTML += '</tbody></table>';
        } else {
            subjectsHTML += '<p class="text-muted">No subjects enrolled yet.</p>';
        }
        
        Swal.fire({
            title: 'Student Details',
            html: detailsHTML + subjectsHTML,
            width: '800px',
            confirmButtonColor: '#6ba83d',
            confirmButtonText: 'Close'
        });
    }
};

// Edit Modal
window.showEditModal = function(studentNo) {
    const student = students.find(s => s.studentNo === studentNo);
    
    if (student) {
        Swal.fire({
            title: 'Edit Student',
            html: `
                <div class="text-start">
                    <div class="mb-3">
                        <label class="form-label"><i class="bi bi-hash me-2"></i>Student No. *</label>
                        <input type="text" id="swal-studentNo" class="form-control" value="${student.studentNo}" required>
                        <small class="text-muted">Change student number if needed</small>
                    </div>
                    <div class="mb-3">
                        <label class="form-label"><i class="bi bi-person-fill me-2"></i>Full Name *</label>
                        <input type="text" id="swal-fullName" class="form-control" value="${student.fullName}" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label"><i class="bi bi-person-badge me-2"></i>Nickname</label>
                        <input type="text" id="swal-nickname" class="form-control" value="${student.nickname || ''}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label"><i class="bi bi-calendar-event me-2"></i>Date of Birth</label>
                        <input type="date" id="swal-dob" class="form-control" value="${student.dob || ''}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label"><i class="bi bi-123 me-2"></i>Age</label>
                        <input type="number" id="swal-age" class="form-control" value="${student.age || ''}" min="15">
                    </div>
                    <div class="mb-3">
                        <label class="form-label"><i class="bi bi-phone-fill me-2"></i>Mobile No.</label>
                        <input type="text" id="swal-mobile" class="form-control" value="${student.mobileNo || ''}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label"><i class="bi bi-briefcase-fill me-2"></i>Occupation</label>
                        <input type="text" id="swal-occupation" class="form-control" value="${student.occupation || ''}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label"><i class="bi bi-geo-alt-fill me-2"></i>Present Address</label>
                        <input type="text" id="swal-address" class="form-control" value="${student.presentAddress || ''}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label"><i class="bi bi-key-fill me-2"></i>Password (leave blank to keep current)</label>
                        <input type="password" id="swal-password" class="form-control" placeholder="Enter new password">
                    </div>
                </div>
            `,
            width: '600px',
            showCancelButton: true,
            confirmButtonColor: '#6ba83d',
            cancelButtonColor: '#6c757d',
            confirmButtonText: '<i class="bi bi-check-circle me-1"></i> Save Changes',
            cancelButtonText: '<i class="bi bi-x-circle me-1"></i> Cancel',
            preConfirm: () => {
                const newStudentNo = document.getElementById('swal-studentNo').value.trim();
                const fullName = document.getElementById('swal-fullName').value.trim();
                
                if (!newStudentNo) {
                    Swal.showValidationMessage('Student Number is required');
                    return false;
                }
                
                if (!fullName) {
                    Swal.showValidationMessage('Full Name is required');
                    return false;
                }
                
                // Check if new student number already exists (and it's not the current student)
                if (newStudentNo !== studentNo) {
                    const existingStudent = students.find(s => s.studentNo === newStudentNo && s.studentNo !== studentNo);
                    if (existingStudent) {
                        Swal.showValidationMessage('Student Number already exists');
                        return false;
                    }
                }
                
                return {
                    studentNo: newStudentNo,
                    fullName: fullName,
                    nickname: document.getElementById('swal-nickname').value.trim(),
                    dob: document.getElementById('swal-dob').value,
                    age: document.getElementById('swal-age').value,
                    mobileNo: document.getElementById('swal-mobile').value.trim(),
                    occupation: document.getElementById('swal-occupation').value.trim(),
                    presentAddress: document.getElementById('swal-address').value.trim(),
                    password: document.getElementById('swal-password').value
                };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const data = result.value;
                
                // Update student number if changed
                student.studentNo = data.studentNo;
                student.fullName = data.fullName;
                student.nickname = data.nickname;
                student.dob = data.dob;
                student.age = data.age;
                student.mobileNo = data.mobileNo;
                student.occupation = data.occupation;
                student.presentAddress = data.presentAddress;
                if (data.password) student.password = data.password;
                
                saveStudents();
                populateAdminStudentsTable();
                populateStudentSelects();
                
                Swal.fire({
                    icon: 'success',
                    title: 'Updated!',
                    text: 'Student information has been updated successfully.',
                    confirmButtonColor: '#6ba83d',
                    timer: 2000,
                    timerProgressBar: true
                });
            }
        });
    }
};

// Delete Student
window.deleteStudent = function(studentNo) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            students = students.filter(s => s.studentNo !== studentNo);
            saveStudents();
            populateAdminStudentsTable();
            populateStudentSelects();
            showAlert('Student deleted successfully!');
        }
    });
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
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const adminSidebar = document.getElementById('adminSidebar');
            const studentSidebar = document.getElementById('studentSidebar');
            if (adminSidebar) adminSidebar.classList.toggle('show');
            if (studentSidebar) studentSidebar.classList.toggle('show');
        });
        
        // Prevent sidebar from closing when clicking inside it
        const adminSidebar = document.getElementById('adminSidebar');
        const studentSidebar = document.getElementById('studentSidebar');
        
        if (adminSidebar) {
            adminSidebar.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
        
        if (studentSidebar) {
            studentSidebar.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
        
        // Close sidebar when clicking outside (only on mobile)
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 968) {
                const adminSidebar = document.getElementById('adminSidebar');
                const studentSidebar = document.getElementById('studentSidebar');
                
                if (adminSidebar && adminSidebar.classList.contains('show')) {
                    if (!adminSidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                        adminSidebar.classList.remove('show');
                    }
                }
                
                if (studentSidebar && studentSidebar.classList.contains('show')) {
                    if (!studentSidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                        studentSidebar.classList.remove('show');
                    }
                }
            }
        });
        
        // Close sidebar when clicking nav button on mobile
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (window.innerWidth <= 968) {
                    const adminSidebar = document.getElementById('adminSidebar');
                    const studentSidebar = document.getElementById('studentSidebar');
                    if (adminSidebar) adminSidebar.classList.remove('show');
                    if (studentSidebar) studentSidebar.classList.remove('show');
                }
            });
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
                    Swal.fire({
                        icon: 'success',
                        title: 'Login Successful!',
                        text: 'Redirecting to admin dashboard...',
                        confirmButtonColor: '#6ba83d',
                        timer: 1500,
                        timerProgressBar: true,
                        showConfirmButton: false
                    }).then(() => {
                        window.location.href = 'admin.html';
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Login Failed',
                        text: 'Invalid admin credentials',
                        confirmButtonColor: '#6ba83d'
                    });
                }
            } else {
                const studentNo = document.getElementById('studentNoLogin').value;
                const pass = document.getElementById('studentPass').value;
                const student = students.find(s => s.studentNo === studentNo && s.password === pass);
                if (student) {
                    sessionStorage.setItem('user', JSON.stringify({type: 'student', studentNo: student.studentNo}));
                    Swal.fire({
                        icon: 'success',
                        title: 'Welcome ' + student.fullName + '!',
                        text: 'Redirecting to your dashboard...',
                        confirmButtonColor: '#6ba83d',
                        timer: 1500,
                        timerProgressBar: true,
                        showConfirmButton: false
                    }).then(() => {
                        window.location.href = 'student.html';
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Login Failed',
                        text: 'Invalid student credentials',
                        confirmButtonColor: '#6ba83d'
                    });
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
            
            Swal.fire({
                icon: 'success',
                title: 'Registration Successful!',
                text: 'Your account has been created. Please login.',
                confirmButtonColor: '#6ba83d',
                timer: 3000,
                timerProgressBar: true
            });
        });
    }
    
    // Complete working script for admin registration
    document.addEventListener('DOMContentLoaded', function() {
        
        // Initialize next student number on page load
        const adminStudentNoInput = document.getElementById('adminStudentNo');
        if (adminStudentNoInput) {
            const students = JSON.parse(localStorage.getItem('berean_students')) || [];
            const nextId = students.length > 0 ? Math.max(...students.map(s => parseInt(s.studentNo))) + 1 : 1;
            adminStudentNoInput.value = String(nextId).padStart(4, '0');
        }
        
        // Admin Registration Form Handler
        const adminRegistrationForm = document.getElementById('adminRegistrationForm');
        if (adminRegistrationForm) {
            
            adminRegistrationForm.addEventListener('submit', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('Form submitted!');
                
                // Get current students array
                let students = JSON.parse(localStorage.getItem('berean_students')) || [];
                let nextId = students.length > 0 ? Math.max(...students.map(s => parseInt(s.studentNo))) + 1 : 1;
                
                // Get form values - using direct getElementById
                const fullName = document.getElementById('adminFullName')?.value.trim();
                const password = document.getElementById('adminPassword')?.value;
                const dob = document.getElementById('adminDob')?.value;
                const age = document.getElementById('adminAge')?.value;
                
                console.log('Form values:', { fullName, password, dob, age });
                
                // Validate required fields
                if (!fullName) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Required Field',
                        text: 'Full Name is required!',
                        confirmButtonColor: '#6ba83d'
                    });
                    return false;
                }
                
                if (!password) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Required Field',
                        text: 'Password is required!',
                        confirmButtonColor: '#6ba83d'
                    });
                    return false;
                }
                
                if (!dob) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Required Field',
                        text: 'Date of Birth is required!',
                        confirmButtonColor: '#6ba83d'
                    });
                    return false;
                }
                
                if (!age) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Required Field',
                        text: 'Age is required!',
                        confirmButtonColor: '#6ba83d'
                    });
                    return false;
                }
                
                // Create new student object
                const newStudent = {
                    studentNo: String(nextId).padStart(4, '0'),
                    fullName: fullName,
                    nickname: document.getElementById('adminNickname')?.value.trim() || '',
                    dob: dob,
                    age: age,
                    civilStatus: document.getElementById('adminCivilStatus')?.value.trim() || '',
                    nationality: document.getElementById('adminNationality')?.value.trim() || '',
                    presentAddress: document.getElementById('adminPresentAddress')?.value.trim() || '',
                    mobileNo: document.getElementById('adminMobileNo')?.value.trim() || '',
                    occupation: document.getElementById('adminOccupation')?.value.trim() || '',
                    businessAddress: document.getElementById('adminBusinessAddress')?.value.trim() || '',
                    businessTel: document.getElementById('adminBusinessTel')?.value.trim() || '',
                    schoolGraduated: document.getElementById('adminSchoolGraduated')?.value.trim() || '',
                    dateGraduated: document.getElementById('adminDateGraduated')?.value || '',
                    degreeAwards: document.getElementById('adminDegreeAwards')?.value.trim() || '',
                    charRefName: document.getElementById('adminCharRefName')?.value.trim() || '',
                    refContact: document.getElementById('adminRefContact')?.value.trim() || '',
                    emergencyName: document.getElementById('adminEmergencyName')?.value.trim() || '',
                    emergencyAddress: document.getElementById('adminEmergencyAddress')?.value.trim() || '',
                    emergencyNo: document.getElementById('adminEmergencyNo')?.value.trim() || '',
                    relation: document.getElementById('adminRelation')?.value.trim() || '',
                    homeChurch: document.getElementById('adminHomeChurch')?.value.trim() || '',
                    churchAddress: document.getElementById('adminChurchAddress')?.value.trim() || '',
                    pastorName: document.getElementById('adminPastorName')?.value.trim() || '',
                    dateSaved: document.getElementById('adminDateSaved')?.value || '',
                    dateBaptized: document.getElementById('adminDateBaptized')?.value || '',
                    ministries: document.getElementById('adminMinistries')?.value.trim() || '',
                    specialSkills: document.getElementById('adminSpecialSkills')?.value.trim() || '',
                    instruments: document.getElementById('adminInstruments')?.value.trim() || '',
                    reasonEnrolling: document.getElementById('adminReasonEnrolling')?.value.trim() || '',
                    healthInfo: document.getElementById('adminHealthInfo')?.value.trim() || '',
                    testimony: document.getElementById('adminTestimony')?.value.trim() || '',
                    password: password,
                    enrolledSubjects: []
                };
                
                console.log('New student created:', newStudent);
                
                // Add to students array
                students.push(newStudent);
                
                // Save to localStorage
                localStorage.setItem('berean_students', JSON.stringify(students));
                console.log('Saved to localStorage, total students:', students.length);
                
                // Update next ID
                nextId++;
                
                // Reset the form
                adminRegistrationForm.reset();
                
                // Update the student number field for next registration
                if (adminStudentNoInput) {
                    adminStudentNoInput.value = String(nextId).padStart(4, '0');
                }
                
                // Update the students table if function exists
                if (typeof populateAdminStudentsTable === 'function') {
                    populateAdminStudentsTable();
                }
                
                // Update student select dropdown if function exists
                if (typeof populateStudentSelects === 'function') {
                    populateStudentSelects();
                }
                
                // Show success message
                Swal.fire({
                    icon: 'success',
                    title: 'Registration Successful!',
                    html: `
                        <div style="text-align: center;">
                            <p><strong>${newStudent.fullName}</strong> has been registered successfully!</p>
                            <p class="mb-0">Student Number: <span class="badge bg-success">${newStudent.studentNo}</span></p>
                        </div>
                    `,
                    confirmButtonColor: '#6ba83d',
                    confirmButtonText: 'Great!',
                    timer: 4000,
                    timerProgressBar: true
                }).then(() => {
                    // Optionally scroll back to top
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
                
                return false;
            });
        }
    });
    
    // Admin enrollment form
    const adminEnrollmentForm = document.getElementById('adminEnrollmentForm');
    if (adminEnrollmentForm) {
        adminEnrollmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const studentNo = document.getElementById('adminEnrollStudentSelect').value;
            const type = document.getElementById('adminEnrollType').value;
            const student = students.find(s => s.studentNo === studentNo);
            if (!student) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Student not found.',
                    confirmButtonColor: '#6ba83d'
                });
                return;
            }
            enrollSubjects(student, type, 'admin');
            saveStudents();
            
            Swal.fire({
                icon: 'success',
                title: 'Enrollment Successful!',
                text: 'Student has been enrolled in the selected subjects.',
                confirmButtonColor: '#6ba83d',
                timer: 3000,
                timerProgressBar: true
            });
            
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
            
            Swal.fire({
                icon: 'success',
                title: 'Enrollment Successful!',
                text: 'You have been enrolled in the selected subjects.',
                confirmButtonColor: '#6ba83d',
                timer: 3000,
                timerProgressBar: true
            });
            
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
            
            if (student) {
                let detailsHTML = '<div style="text-align: left;">';
                Object.keys(student).forEach(key => {
                    if (key !== 'enrolledSubjects' && key !== 'password') {
                        detailsHTML += `<p style="margin-bottom: 8px;"><strong>${key}:</strong> ${student[key] || 'N/A'}</p>`;
                    }
                });
                detailsHTML += '</div>';
                
                Swal.fire({
                    title: 'Your Profile',
                    html: detailsHTML,
                    width: '700px',
                    confirmButtonColor: '#6ba83d',
                    confirmButtonText: 'Close'
                });
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
    
    // Logout buttons with confirmation
    const adminLogout = document.getElementById('adminLogout');
    const studentLogout = document.getElementById('studentLogout');
    
    if (adminLogout) {
        adminLogout.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Close sidebar on mobile before showing modal
            if (window.innerWidth <= 968) {
                const adminSidebar = document.getElementById('adminSidebar');
                if (adminSidebar) {
                    adminSidebar.classList.remove('show');
                }
            }
            
            // Small delay to ensure sidebar closes before modal appears
            setTimeout(() => {
                Swal.fire({
                    title: 'Logout Confirmation',
                    text: 'Are you sure you want to logout?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#6ba83d',
                    cancelButtonColor: '#6c757d',
                    confirmButtonText: '<i class="bi bi-check-circle me-1"></i> Yes, logout',
                    cancelButtonText: '<i class="bi bi-x-circle me-1"></i> Cancel'
                }).then((result) => {
                    if (result.isConfirmed) {
                        sessionStorage.clear();
                        Swal.fire({
                            icon: 'success',
                            title: 'Logged Out',
                            text: 'You have been logged out successfully.',
                            confirmButtonColor: '#6ba83d',
                            timer: 1500,
                            timerProgressBar: true,
                            showConfirmButton: false
                        }).then(() => {
                            window.location.href = 'index.html';
                        });
                    }
                });
            }, 100);
        });
    }
    
    if (studentLogout) {
        studentLogout.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Close sidebar on mobile before showing modal
            if (window.innerWidth <= 968) {
                const studentSidebar = document.getElementById('studentSidebar');
                if (studentSidebar) {
                    studentSidebar.classList.remove('show');
                }
            }
            
            // Small delay to ensure sidebar closes before modal appears
            setTimeout(() => {
                Swal.fire({
                    title: 'Logout Confirmation',
                    text: 'Are you sure you want to logout?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#6ba83d',
                    cancelButtonColor: '#6c757d',
                    confirmButtonText: '<i class="bi bi-check-circle me-1"></i> Yes, logout',
                    cancelButtonText: '<i class="bi bi-x-circle me-1"></i> Cancel'
                }).then((result) => {
                    if (result.isConfirmed) {
                        sessionStorage.clear();
                        Swal.fire({
                            icon: 'success',
                            title: 'Logged Out',
                            text: 'You have been logged out successfully.',
                            confirmButtonColor: '#6ba83d',
                            timer: 1500,
                            timerProgressBar: true,
                            showConfirmButton: false
                        }).then(() => {
                            window.location.href = 'index.html';
                        });
                    }
                });
            }, 100);
        });
    }
    
    // Initialize based on current page
    if (adminDashboard) {
        const user = JSON.parse(sessionStorage.getItem('user') || 'null');
        if (user && user.type === 'admin') {
            populateStudentSelects();
            populateSubjectsMulti([document.getElementById('adminSubjectsMulti')].filter(Boolean));
            populateAdminStudentsTable();
            setupStudentSearch(); // Add search functionality
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