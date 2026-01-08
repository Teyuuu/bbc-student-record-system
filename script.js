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

// Helper function to safely calculate next student ID
// This function finds the first available gap in student numbers, or returns the next sequential number
function calculateNextId() {
    if (students.length === 0) return 1;
    
    // Get all valid student numbers and convert to integers
    const studentNumbers = students
        .map(s => {
            const num = parseInt(s.studentNo);
            return isNaN(num) ? 0 : num;
        })
        .filter(num => num > 0)
        .sort((a, b) => a - b); // Sort in ascending order
    
    if (studentNumbers.length === 0) return 1;
    
    // Find the first gap starting from 1
    // If we have [1, 3], we should return 2
    // If we have [2, 3], we should return 1
    // If we have [1, 2, 3], we should return 4
    for (let i = 1; i <= studentNumbers.length; i++) {
        if (!studentNumbers.includes(i)) {
            return i; // Found a gap, return it
        }
    }
    
    // No gaps found, return the next number after the maximum
    return Math.max(...studentNumbers) + 1;
}

let nextId = calculateNextId();

// Admin credentials
const adminUsername = 'admin';
const adminPassword = 'admin123';

// Helper functions
function refreshStudents() {
    try {
        students = JSON.parse(localStorage.getItem('berean_students')) || [];
        nextId = calculateNextId();
    } catch (error) {
        console.error('Error loading students from localStorage:', error);
        students = [];
        nextId = 1;
        // Show user-friendly error if storage is blocked
        if (error.name === 'SecurityError' || error.name === 'QuotaExceededError') {
            Swal.fire({
                icon: 'warning',
                title: 'Storage Access Issue',
                text: 'Please allow storage access in your browser settings for the system to work properly.',
                confirmButtonColor: '#6ba83d'
            });
        }
    }
}

function saveStudents() {
    try {
        localStorage.setItem('berean_students', JSON.stringify(students));
        // Update nextId after saving
        nextId = calculateNextId();
    } catch (error) {
        console.error('Error saving students to localStorage:', error);
        // Show user-friendly error
        Swal.fire({
            icon: 'error',
            title: 'Save Failed',
            html: `
                <p>Unable to save student data. This might be due to:</p>
                <ul class="text-start">
                    <li>Browser storage is disabled</li>
                    <li>Storage quota exceeded</li>
                    <li>Privacy settings blocking storage</li>
                </ul>
                <p class="mt-2"><strong>Please check your browser settings and try again.</strong></p>
            `,
            confirmButtonColor: '#6ba83d'
        });
        throw error; // Re-throw to prevent continuing with unsaved data
    }
}

// Validation helper functions
function validateNumericField(value, fieldName) {
    if (!value) return { valid: true }; // Empty is OK for optional fields
    const numericValue = value.replace(/[\s\-\+\(\)]/g, ''); // Remove common phone formatting
    if (!/^\d+$/.test(numericValue)) {
        return { 
            valid: false, 
            message: `${fieldName} should only contain numbers` 
        };
    }
    return { valid: true };
}

function checkDuplicateField(value, fieldName, currentStudentNo = null) {
    if (!value) return { duplicate: false }; // Empty is OK
    
    const normalizedValue = value.trim().toLowerCase();
    
    // Check for duplicates
    const duplicate = students.find(s => {
        // Skip current student if editing
        if (currentStudentNo && s.studentNo === currentStudentNo) return false;
        
        if (fieldName === 'Full Name') {
            return s.fullName && s.fullName.trim().toLowerCase() === normalizedValue;
        } else if (fieldName === 'Mobile No.') {
            const mobile = (s.mobileNo || '').replace(/[\s\-\+\(\)]/g, '').toLowerCase();
            const searchMobile = normalizedValue.replace(/[\s\-\+\(\)]/g, '').toLowerCase();
            return mobile && mobile === searchMobile;
        }
        return false;
    });
    
    if (duplicate) {
        return { 
            duplicate: true, 
            message: `${fieldName} already exists for student ${duplicate.studentNo} - ${duplicate.fullName}` 
        };
    }
    
    return { duplicate: false };
}

function validateRegistrationData(formData, prefix = '') {
    const errors = [];
    const warnings = [];
    
    // Validate numeric fields
    const numericFields = [
        { id: prefix + 'MobileNo', name: 'Mobile No.' },
        { id: prefix + 'EmergencyNo', name: 'Emergency No.' },
        { id: prefix + 'BusinessTel', name: 'Business Tel No.' },
        { id: prefix + 'RefContact', name: 'Reference Contact' }
    ];
    
    numericFields.forEach(field => {
        const input = document.getElementById(field.id);
        if (input && input.value) {
            const validation = validateNumericField(input.value, field.name);
            if (!validation.valid) {
                errors.push(validation.message);
            }
        }
    });
    
    // Check for duplicates in important fields
    const fullName = formData.fullName || (prefix ? document.getElementById(prefix + 'FullName')?.value.trim() : '');
    const mobileNo = formData.mobileNo || (prefix ? document.getElementById(prefix + 'MobileNo')?.value.trim() : '');
    
    if (fullName) {
        const duplicateCheck = checkDuplicateField(fullName, 'Full Name');
        if (duplicateCheck.duplicate) {
            warnings.push(duplicateCheck.message);
        }
    }
    
    if (mobileNo) {
        const duplicateCheck = checkDuplicateField(mobileNo, 'Mobile No.');
        if (duplicateCheck.duplicate) {
            warnings.push(duplicateCheck.message);
        }
    }
    
    return { errors, warnings };
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

function updateAdminStudentNumberField() {
    const adminStudentNoInput = document.getElementById('adminStudentNo');
    if (adminStudentNoInput) {
        // Refresh students array and recalculate nextId
        refreshStudents();
        adminStudentNoInput.value = String(nextId).padStart(4, '0');
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
    
    // Update student number field when registration section is shown
    if (sectionId === 'adminRegister') {
        updateAdminStudentNumberField();
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
        gender: document.getElementById(prefix + 'Gender')?.value.trim() || document.getElementById(prefix + 'gender')?.value.trim() || '',
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
            const searchTerm = this.value.toLowerCase().trim();
            const rows = document.querySelectorAll('#adminStudentsTable tbody tr');
            
            if (searchTerm === '') {
                // Show all rows if search is empty
                rows.forEach(row => {
                    row.style.display = '';
                });
                return;
            }
            
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 3) {
                    const studentNo = cells[0].textContent.toLowerCase();
                    const fullName = cells[1].textContent.toLowerCase();
                    const mobileNo = cells[2].textContent.toLowerCase();
                    
                    // Search in student number, name, and mobile number
                    const matches = studentNo.includes(searchTerm) || 
                                  fullName.includes(searchTerm) || 
                                  mobileNo.includes(searchTerm);
                    
                    row.style.display = matches ? '' : 'none';
                }
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
    
    if (avatarElem) {
        // Clear any existing content completely
        while (avatarElem.firstChild) {
            avatarElem.removeChild(avatarElem.firstChild);
        }
        avatarElem.textContent = '';
        avatarElem.innerHTML = '';
        
        // Determine gender icon - use person icons for man/woman
        let gender = '';
        if (student.gender) {
            gender = String(student.gender).toLowerCase().trim();
        }
        
        let iconClass = 'bi bi-person-fill'; // Default icon
        
        if (gender === 'male' || gender === 'm') {
            iconClass = 'bi bi-person-fill'; // Man person icon
        } else if (gender === 'female' || gender === 'f') {
            iconClass = 'bi bi-person-fill'; // Woman person icon (same icon, but we can style differently if needed)
        }
        
        // Create and append icon
        const icon = document.createElement('i');
        icon.className = iconClass;
        icon.style.fontSize = '1.8em';
        icon.style.color = 'white';
        icon.style.display = 'block';
        avatarElem.appendChild(icon);
    }
    
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
    if (!student) {
        return { success: false, message: 'Student not found' };
    }
    
    if (!student.enrolledSubjects) student.enrolledSubjects = [];
    
    if (type === 'bundle') {
        const yearSelect = document.getElementById(prefix + 'YearSelect');
        const semSelect = document.getElementById(prefix + 'SemSelect');
        
        if (!yearSelect || !semSelect) {
            return { success: false, message: 'Year and Semester selects not found' };
        }
        
        const year = yearSelect.value;
        const sem = semSelect.value;
        
        if (!year || !sem) {
            return { success: false, message: 'Please select both Year and Semester' };
        }
        
        if (!curriculum[year] || !curriculum[year][sem]) {
            return { success: false, message: `No subjects found for ${year} ${sem}` };
        }
        
        const subjects = curriculum[year][sem];
        let addedCount = 0;
        
        subjects.forEach(name => {
            const sub = {year, sem, name};
            if (!student.enrolledSubjects.some(s => s.name === name && s.year === year && s.sem === sem)) {
                student.enrolledSubjects.push(sub);
                addedCount++;
            }
        });
        
        return { 
            success: true, 
            message: `Successfully enrolled in ${addedCount} subject(s)`,
            count: addedCount
        };
    } else {
        const multi = document.getElementById(prefix + 'SubjectsMulti');
        
        if (!multi) {
            return { success: false, message: 'Subjects select not found' };
        }
        
        const selectedOptions = Array.from(multi.selectedOptions);
        
        if (selectedOptions.length === 0) {
            return { success: false, message: 'Please select at least one subject' };
        }
        
        let addedCount = 0;
        
        selectedOptions.forEach(opt => {
            try {
                const sub = JSON.parse(opt.value);
                if (!student.enrolledSubjects.some(s => s.name === sub.name && s.year === sub.year && s.sem === sub.sem)) {
                    student.enrolledSubjects.push(sub);
                    addedCount++;
                }
            } catch (e) {
                console.error('Error parsing subject:', e);
            }
        });
        
        return { 
            success: true, 
            message: `Successfully enrolled in ${addedCount} subject(s)`,
            count: addedCount
        };
    }
}

// View Modal
window.showViewModal = function(studentNo) {
    const student = students.find(s => s.studentNo === studentNo);
    
    if (student) {
        // Helper function to create form field with icon
        function createField(icon, label, value, isFullWidth = false, isImportant = false) {
            const displayValue = value || '<span class="text-muted fst-italic">N/A</span>';
            const colClass = isFullWidth ? 'col-12' : 'col-md-6';
            const highlightClass = isImportant ? 'border-success border-2 bg-light' : '';
            const iconColor = isImportant ? 'text-success' : 'text-primary';
            
            return `
                <div class="${colClass} mb-3">
                    <label class="form-label small mb-1 d-flex align-items-center" style="font-weight: 600; color: #555;">
                        <i class="${icon} ${iconColor} me-2"></i>${label}
                    </label>
                    <div class="form-control-plaintext border rounded p-2 ${highlightClass}" style="min-height: 38px; background-color: ${isImportant ? '#f0f7eb' : '#fff'};">
                        ${displayValue}
                    </div>
                </div>
            `;
        }
        
        // Helper function to create section box
        function createSection(title, icon, content, color = 'primary') {
            const colorMap = {
                'primary': 'bg-primary bg-opacity-10 border-primary',
                'success': 'bg-success bg-opacity-10 border-success',
                'info': 'bg-info bg-opacity-10 border-info',
                'warning': 'bg-warning bg-opacity-10 border-warning',
                'danger': 'bg-danger bg-opacity-10 border-danger'
            };
            
            return `
                <div class="card mb-3 ${colorMap[color]}" style="border-width: 2px !important;">
                    <div class="card-header ${colorMap[color]} border-0 pb-2">
                        <h6 class="mb-0 d-flex align-items-center">
                            <i class="${icon} me-2 text-${color === 'primary' ? 'primary' : color}"></i>
                            <strong>${title}</strong>
                        </h6>
                    </div>
                    <div class="card-body">
                        <div class="row g-3">
                            ${content}
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Personal Information Section
        const personalInfo = `
            ${createField('bi bi-hash', 'Student Number', `<span class="badge bg-success fs-6">${student.studentNo}</span>`, false, true)}
            ${createField('bi bi-person-fill', 'Full Name', student.fullName, false, true)}
            ${createField('bi bi-person-badge', 'Nickname', student.nickname)}
            ${createField('bi bi-calendar-event', 'Date of Birth', student.dob)}
            ${createField('bi bi-123', 'Age', student.age)}
            ${createField('bi bi-gender-ambiguous', 'Gender', student.gender)}
            ${createField('bi bi-heart-fill', 'Civil Status', student.civilStatus)}
            ${createField('bi bi-flag-fill', 'Nationality', student.nationality)}
        `;
        
        // Contact Information Section
        const contactInfo = `
            ${createField('bi bi-geo-alt-fill', 'Present Address', student.presentAddress, true)}
            ${createField('bi bi-phone-fill', 'Mobile No.', student.mobileNo, false, true)}
            ${createField('bi bi-briefcase-fill', 'Occupation', student.occupation)}
            ${createField('bi bi-building', 'Business/Company Address', student.businessAddress, true)}
            ${createField('bi bi-telephone-fill', 'Business Tel No.', student.businessTel)}
        `;
        
        // Educational Background Section
        const educationInfo = `
            ${createField('bi bi-mortarboard-fill', 'School Graduated', student.schoolGraduated)}
            ${createField('bi bi-calendar-check', 'Date Graduated', student.dateGraduated)}
            ${createField('bi bi-trophy-fill', 'Degree/Honors/Awards', student.degreeAwards, true)}
        `;
        
        // References Section
        const referencesInfo = `
            ${createField('bi bi-person-check-fill', 'Character Reference Name', student.charRefName)}
            ${createField('bi bi-telephone', 'Reference Contact', student.refContact)}
        `;
        
        // Emergency Contact Section
        const emergencyInfo = `
            ${createField('bi bi-person-exclamation', 'Emergency Contact Name', student.emergencyName, false, true)}
            ${createField('bi bi-house-fill', 'Emergency Address', student.emergencyAddress, true)}
            ${createField('bi bi-telephone-forward', 'Emergency No.', student.emergencyNo, false, true)}
            ${createField('bi bi-people', 'Relation', student.relation)}
        `;
        
        // Church Information Section
        const churchInfo = `
            ${createField('bi bi-church', 'Home Church', student.homeChurch)}
            ${createField('bi bi-geo', 'Church Address', student.churchAddress, true)}
            ${createField('bi bi-person-badge-fill', 'Pastor\'s Name', student.pastorName)}
            ${createField('bi bi-calendar-heart', 'Date Saved', student.dateSaved)}
            ${createField('bi bi-water', 'Date Baptized', student.dateBaptized)}
            ${createField('bi bi-journal-check', 'Ministries Involved', student.ministries, true)}
        `;
        
        // Skills & Additional Info Section
        const additionalInfo = `
            ${createField('bi bi-star-fill', 'Special Skills', student.specialSkills, true)}
            ${createField('bi bi-music-note-beamed', 'Musical Instruments', student.instruments, true)}
            ${createField('bi bi-chat-left-text', 'Reason for Enrolling', student.reasonEnrolling, true)}
            ${createField('bi bi-heart-pulse', 'Health Information', student.healthInfo, true)}
            ${createField('bi bi-book-half', 'Brief Testimony', student.testimony, true)}
        `;
        
        let detailsHTML = `
            <div class="container-fluid p-0">
                ${createSection('Personal Information', 'bi bi-person-circle-fill', personalInfo, 'primary')}
                ${createSection('Contact Information', 'bi bi-telephone-fill', contactInfo, 'info')}
                ${createSection('Educational Background', 'bi bi-mortarboard', educationInfo, 'warning')}
                ${createSection('Character References', 'bi bi-person-check', referencesInfo, 'info')}
                ${createSection('Emergency Contact', 'bi bi-exclamation-triangle-fill', emergencyInfo, 'danger')}
                ${createSection('Church Information', 'bi bi-church', churchInfo, 'success')}
                ${createSection('Additional Information', 'bi bi-info-circle-fill', additionalInfo, 'primary')}
            </div>
        `;
        
        // Enrolled Subjects Section
        let subjectsHTML = '';
        if (student.enrolledSubjects && student.enrolledSubjects.length > 0) {
            subjectsHTML = `
                <div class="card border-success mb-0" style="border-width: 2px !important;">
                    <div class="card-header bg-success bg-opacity-10 border-0">
                        <h6 class="mb-0 d-flex align-items-center">
                            <i class="bi bi-book-fill text-success me-2"></i>
                            <strong>Enrolled Subjects</strong>
                            <span class="badge bg-success ms-2">${student.enrolledSubjects.length}</span>
                        </h6>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-bordered table-hover table-sm mb-0">
                                <thead class="table-success">
                                    <tr>
                                        <th><i class="bi bi-calendar3 me-1"></i>Year</th>
                                        <th><i class="bi bi-calendar-range me-1"></i>Semester</th>
                                        <th><i class="bi bi-book me-1"></i>Subject</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${student.enrolledSubjects.map(sub => `
                                        <tr>
                                            <td><span class="badge bg-primary">${sub.year}</span></td>
                                            <td><span class="badge bg-info">${sub.sem}</span></td>
                                            <td><i class="bi bi-book me-2 text-success"></i>${sub.name}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        } else {
            subjectsHTML = `
                <div class="card border-info mb-0">
                    <div class="card-body text-center py-4">
                        <i class="bi bi-inbox fs-1 text-muted d-block mb-2"></i>
                        <p class="text-muted mb-0">No subjects enrolled yet.</p>
                    </div>
                </div>
            `;
        }
        
        Swal.fire({
            title: '<div class="d-flex align-items-center"><i class="bi bi-person-circle-fill text-success me-2 fs-4"></i><span>Student Details</span></div>',
            html: detailsHTML + subjectsHTML,
            width: '950px',
            confirmButtonColor: '#6ba83d',
            confirmButtonText: '<i class="bi bi-check-circle me-1"></i> Close',
            customClass: {
                popup: 'text-start',
                htmlContainer: 'p-0'
            },
            showCloseButton: true,
            padding: '1.5rem'
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
                <div class="text-start" style="max-height: 70vh; overflow-y: auto;">
                    <div class="alert alert-info d-flex align-items-center mb-3">
                        <i class="bi bi-info-circle-fill fs-5 me-2"></i>
                        <div>Edit student information. Fields marked with <span class="text-danger">*</span> are required.</div>
                    </div>
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label class="form-label"><i class="bi bi-hash me-2"></i>Student No. <span class="text-danger">*</span></label>
                            <input type="text" id="swal-studentNo" class="form-control" value="${student.studentNo}" required>
                            <small class="text-muted">Change student number if needed</small>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label"><i class="bi bi-person-fill me-2"></i>Full Name <span class="text-danger">*</span></label>
                            <input type="text" id="swal-fullName" class="form-control" value="${student.fullName || ''}" placeholder="Enter full name" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label"><i class="bi bi-person-badge me-2"></i>Nickname</label>
                            <input type="text" id="swal-nickname" class="form-control" value="${student.nickname || ''}" placeholder="Enter nickname">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label"><i class="bi bi-calendar-event me-2"></i>Date of Birth <span class="text-danger">*</span></label>
                            <input type="date" id="swal-dob" class="form-control" value="${student.dob || ''}" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label"><i class="bi bi-123 me-2"></i>Age <span class="text-danger">*</span></label>
                            <input type="number" id="swal-age" class="form-control" value="${student.age || ''}" min="15" placeholder="Enter age" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label"><i class="bi bi-gender-ambiguous me-2"></i>Gender <span class="text-danger">*</span></label>
                            <select id="swal-gender" class="form-select" required>
                                <option value="">Select Gender</option>
                                <option value="Male" ${(student.gender || '').toLowerCase() === 'male' ? 'selected' : ''}>Male</option>
                                <option value="Female" ${(student.gender || '').toLowerCase() === 'female' ? 'selected' : ''}>Female</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label"><i class="bi bi-heart-fill me-2"></i>Civil Status</label>
                            <input type="text" id="swal-civilStatus" class="form-control" value="${student.civilStatus || ''}" placeholder="e.g., Single, Married">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label"><i class="bi bi-flag-fill me-2"></i>Nationality</label>
                            <input type="text" id="swal-nationality" class="form-control" value="${student.nationality || 'Filipino'}">
                        </div>
                        <div class="col-12">
                            <label class="form-label"><i class="bi bi-geo-alt-fill me-2"></i>Present Address</label>
                            <input type="text" id="swal-address" class="form-control" value="${student.presentAddress || ''}" placeholder="Enter complete address">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label"><i class="bi bi-phone-fill me-2"></i>Mobile No.</label>
                            <input type="tel" id="swal-mobile" class="form-control" value="${student.mobileNo || ''}" pattern="[0-9\s\-\+\(\)]+" placeholder="e.g., 0912-345-6789">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label"><i class="bi bi-briefcase-fill me-2"></i>Occupation</label>
                            <input type="text" id="swal-occupation" class="form-control" value="${student.occupation || ''}" placeholder="Enter occupation">
                        </div>
                        <div class="col-12">
                            <label class="form-label"><i class="bi bi-building me-2"></i>Business/Company Address</label>
                            <input type="text" id="swal-businessAddress" class="form-control" value="${student.businessAddress || ''}" placeholder="Enter business address">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label"><i class="bi bi-telephone-fill me-2"></i>Business Tel No.</label>
                            <input type="tel" id="swal-businessTel" class="form-control" value="${student.businessTel || ''}" pattern="[0-9\s\-\+\(\)]+" placeholder="e.g., 02-123-4567">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label"><i class="bi bi-mortarboard-fill me-2"></i>School Graduated</label>
                            <input type="text" id="swal-schoolGraduated" class="form-control" value="${student.schoolGraduated || ''}" placeholder="Enter school name">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label"><i class="bi bi-calendar-check me-2"></i>Date Graduated</label>
                            <input type="date" id="swal-dateGraduated" class="form-control" value="${student.dateGraduated || ''}">
                        </div>
                        <div class="col-12">
                            <label class="form-label"><i class="bi bi-trophy-fill me-2"></i>Degree/Honors/Awards</label>
                            <input type="text" id="swal-degreeAwards" class="form-control" value="${student.degreeAwards || ''}" placeholder="Enter degrees, honors, or awards">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label"><i class="bi bi-person-check-fill me-2"></i>Character Reference Name</label>
                            <input type="text" id="swal-charRefName" class="form-control" value="${student.charRefName || ''}" placeholder="Enter reference name">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label"><i class="bi bi-telephone-forward me-2"></i>Emergency No.</label>
                            <input type="tel" id="swal-emergencyNo" class="form-control" value="${student.emergencyNo || ''}" pattern="[0-9\s\-\+\(\)]+" placeholder="e.g., 0912-345-6789">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label"><i class="bi bi-person-exclamation me-2"></i>Emergency Contact Name</label>
                            <input type="text" id="swal-emergencyName" class="form-control" value="${student.emergencyName || ''}" placeholder="Enter emergency contact name">
                        </div>
                        <div class="col-12">
                            <label class="form-label"><i class="bi bi-house-fill me-2"></i>Emergency Address</label>
                            <input type="text" id="swal-emergencyAddress" class="form-control" value="${student.emergencyAddress || ''}" placeholder="Enter emergency contact address">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label"><i class="bi bi-people me-2"></i>Relation</label>
                            <input type="text" id="swal-relation" class="form-control" value="${student.relation || ''}" placeholder="e.g., Father, Mother, Sibling">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label"><i class="bi bi-church me-2"></i>Home Church</label>
                            <input type="text" id="swal-homeChurch" class="form-control" value="${student.homeChurch || ''}" placeholder="Enter church name">
                        </div>
                        <div class="col-12">
                            <label class="form-label"><i class="bi bi-geo me-2"></i>Church Address</label>
                            <input type="text" id="swal-churchAddress" class="form-control" value="${student.churchAddress || ''}" placeholder="Enter church address">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label"><i class="bi bi-person-badge-fill me-2"></i>Pastor's Name</label>
                            <input type="text" id="swal-pastorName" class="form-control" value="${student.pastorName || ''}" placeholder="Enter pastor's name">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label"><i class="bi bi-calendar-heart me-2"></i>Date Saved</label>
                            <input type="date" id="swal-dateSaved" class="form-control" value="${student.dateSaved || ''}">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label"><i class="bi bi-water me-2"></i>Date Baptized</label>
                            <input type="date" id="swal-dateBaptized" class="form-control" value="${student.dateBaptized || ''}">
                        </div>
                        <div class="col-12">
                            <label class="form-label"><i class="bi bi-journal-check me-2"></i>Ministries Involved</label>
                            <input type="text" id="swal-ministries" class="form-control" value="${student.ministries || ''}" placeholder="Enter ministries (comma separated)">
                        </div>
                        <div class="col-12">
                            <label class="form-label"><i class="bi bi-star-fill me-2"></i>Special Skills</label>
                            <input type="text" id="swal-specialSkills" class="form-control" value="${student.specialSkills || ''}" placeholder="Enter special skills">
                        </div>
                        <div class="col-12">
                            <label class="form-label"><i class="bi bi-music-note-beamed me-2"></i>Musical Instruments</label>
                            <input type="text" id="swal-instruments" class="form-control" value="${student.instruments || ''}" placeholder="Enter instruments">
                        </div>
                        <div class="col-12">
                            <label class="form-label"><i class="bi bi-key-fill me-2"></i>Password</label>
                            <input type="password" id="swal-password" class="form-control" placeholder="Enter new password (leave blank to keep current)">
                            <small class="text-muted">Leave blank to keep current password</small>
                        </div>
                        <div class="col-12">
                            <label class="form-label"><i class="bi bi-chat-left-text me-2"></i>Reason for Enrolling</label>
                            <textarea id="swal-reasonEnrolling" class="form-control" rows="3" placeholder="Share your reason for enrolling...">${student.reasonEnrolling || ''}</textarea>
                        </div>
                        <div class="col-12">
                            <label class="form-label"><i class="bi bi-heart-pulse me-2"></i>Health Information</label>
                            <textarea id="swal-healthInfo" class="form-control" rows="3" placeholder="Any medical conditions, allergies, or health concerns...">${student.healthInfo || ''}</textarea>
                        </div>
                        <div class="col-12">
                            <label class="form-label"><i class="bi bi-book-half me-2"></i>Brief Testimony</label>
                            <textarea id="swal-testimony" class="form-control" rows="5" placeholder="Share your testimony...">${student.testimony || ''}</textarea>
                        </div>
                    </div>
                </div>
            `,
            width: '900px',
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
                    const existingStudent = students.find(s => s.studentNo === newStudentNo);
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
                    gender: document.getElementById('swal-gender').value.trim(),
                    civilStatus: document.getElementById('swal-civilStatus').value.trim(),
                    nationality: document.getElementById('swal-nationality').value.trim(),
                    presentAddress: document.getElementById('swal-address').value.trim(),
                    mobileNo: document.getElementById('swal-mobile').value.trim(),
                    occupation: document.getElementById('swal-occupation').value.trim(),
                    businessAddress: document.getElementById('swal-businessAddress').value.trim(),
                    businessTel: document.getElementById('swal-businessTel').value.trim(),
                    schoolGraduated: document.getElementById('swal-schoolGraduated').value.trim(),
                    dateGraduated: document.getElementById('swal-dateGraduated').value,
                    degreeAwards: document.getElementById('swal-degreeAwards').value.trim(),
                    charRefName: document.getElementById('swal-charRefName').value.trim(),
                    refContact: document.getElementById('swal-refContact') ? document.getElementById('swal-refContact').value.trim() : '',
                    emergencyName: document.getElementById('swal-emergencyName').value.trim(),
                    emergencyAddress: document.getElementById('swal-emergencyAddress').value.trim(),
                    emergencyNo: document.getElementById('swal-emergencyNo').value.trim(),
                    relation: document.getElementById('swal-relation').value.trim(),
                    homeChurch: document.getElementById('swal-homeChurch').value.trim(),
                    churchAddress: document.getElementById('swal-churchAddress').value.trim(),
                    pastorName: document.getElementById('swal-pastorName').value.trim(),
                    dateSaved: document.getElementById('swal-dateSaved').value,
                    dateBaptized: document.getElementById('swal-dateBaptized').value,
                    ministries: document.getElementById('swal-ministries').value.trim(),
                    specialSkills: document.getElementById('swal-specialSkills').value.trim(),
                    instruments: document.getElementById('swal-instruments').value.trim(),
                    reasonEnrolling: document.getElementById('swal-reasonEnrolling').value.trim(),
                    healthInfo: document.getElementById('swal-healthInfo').value.trim(),
                    testimony: document.getElementById('swal-testimony').value.trim(),
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
                student.gender = data.gender;
                student.civilStatus = data.civilStatus || '';
                student.nationality = data.nationality || '';
                student.presentAddress = data.presentAddress;
                student.mobileNo = data.mobileNo;
                student.occupation = data.occupation;
                student.businessAddress = data.businessAddress || '';
                student.businessTel = data.businessTel || '';
                student.schoolGraduated = data.schoolGraduated || '';
                student.dateGraduated = data.dateGraduated || '';
                student.degreeAwards = data.degreeAwards || '';
                student.charRefName = data.charRefName || '';
                student.refContact = data.refContact || '';
                student.emergencyName = data.emergencyName || '';
                student.emergencyAddress = data.emergencyAddress || '';
                student.emergencyNo = data.emergencyNo || '';
                student.relation = data.relation || '';
                student.homeChurch = data.homeChurch || '';
                student.churchAddress = data.churchAddress || '';
                student.pastorName = data.pastorName || '';
                student.dateSaved = data.dateSaved || '';
                student.dateBaptized = data.dateBaptized || '';
                student.ministries = data.ministries || '';
                student.specialSkills = data.specialSkills || '';
                student.instruments = data.instruments || '';
                student.reasonEnrolling = data.reasonEnrolling || '';
                student.healthInfo = data.healthInfo || '';
                student.testimony = data.testimony || '';
                if (data.password) student.password = data.password;
                
                // Update avatar if student is logged in
                const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');
                if (currentUser.studentNo === student.studentNo) {
                    showStudentDashboard(student);
                }
                
                saveStudents();
                populateAdminStudentsTable();
                populateStudentSelects();
                
                // Update the admin registration form's student number field
                updateAdminStudentNumberField();
                
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
            
            // Update the admin registration form's student number field
            updateAdminStudentNumberField();
            
            showAlert('Student deleted successfully!');
        }
    });
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Add input validation for numeric fields (phone numbers)
    function setupNumericFieldValidation() {
        const numericFields = [
            'mobileNo', 'adminMobileNo',
            'businessTel', 'adminBusinessTel',
            'refContact', 'adminRefContact',
            'emergencyNo', 'adminEmergencyNo'
        ];
        
        numericFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', function(e) {
                    // Allow numbers, spaces, dashes, plus, and parentheses for phone formatting
                    let value = this.value;
                    // Remove any characters that aren't numbers, spaces, dashes, plus, or parentheses
                    value = value.replace(/[^0-9\s\-\+\(\)]/g, '');
                    this.value = value;
                });
                
                field.addEventListener('blur', function() {
                    // Clean up the value on blur (remove extra spaces, etc.)
                    let value = this.value.replace(/\s+/g, ' ').trim();
                    this.value = value;
                });
            }
        });
    }
    
    // Setup numeric field validation
    setupNumericFieldValidation();
    
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
            // Refresh students array to get latest data before showing registration
            refreshStudents();
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
            
            // Get form data
            const student = createStudentObject('');
            student.password = document.getElementById('password').value;
            
            // Validate form data
            const validation = validateRegistrationData(student, '');
            
            // Show errors if any
            if (validation.errors.length > 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    html: validation.errors.map(err => `<p>• ${err}</p>`).join(''),
                    confirmButtonColor: '#6ba83d'
                });
                return;
            }
            
            // Show warnings for duplicates and ask for confirmation
            if (validation.warnings.length > 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Duplicate Data Detected',
                    html: `
                        <div class="text-start">
                            <p>The following information already exists in the system:</p>
                            <ul class="text-start">
                                ${validation.warnings.map(warn => `<li>${warn}</li>`).join('')}
                            </ul>
                            <p class="mt-3"><strong>Do you want to continue with registration?</strong></p>
                        </div>
                    `,
                    showCancelButton: true,
                    confirmButtonColor: '#6ba83d',
                    cancelButtonColor: '#6c757d',
                    confirmButtonText: 'Yes, Continue',
                    cancelButtonText: 'Cancel'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Proceed with registration
                        student.enrolledSubjects = [];
                        students.push(student);
                        saveStudents();
                        registrationForm.reset();
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
                    }
                });
                return;
            }
            
            // No errors or warnings, proceed with registration
            student.enrolledSubjects = [];
            students.push(student);
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
    
    // Initialize next student number on page load (for admin registration)
    // This will be updated when the registration section is shown or after edits
    updateAdminStudentNumberField();
    
    // Admin Registration Form Handler
    const adminRegistrationForm = document.getElementById('adminRegistrationForm');
    if (adminRegistrationForm) {
        
        adminRegistrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Form submitted!');
            
            // Use global students array and nextId
                
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
                
                // Validate form data (numeric fields and duplicates)
                const formData = {
                    fullName: fullName,
                    mobileNo: document.getElementById('adminMobileNo')?.value.trim() || ''
                };
                const validation = validateRegistrationData(formData, 'admin');
                
                // Show errors if any
                if (validation.errors.length > 0) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Validation Error',
                        html: validation.errors.map(err => `<p>• ${err}</p>`).join(''),
                        confirmButtonColor: '#6ba83d'
                    });
                    return false;
                }
                
                // Handle duplicate warnings
                if (validation.warnings.length > 0) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Duplicate Data Detected',
                        html: `
                            <div class="text-start">
                                <p>The following information already exists in the system:</p>
                                <ul class="text-start">
                                    ${validation.warnings.map(warn => `<li>${warn}</li>`).join('')}
                                </ul>
                                <p class="mt-3"><strong>Do you want to continue with registration?</strong></p>
                            </div>
                        `,
                        showCancelButton: true,
                        confirmButtonColor: '#6ba83d',
                        cancelButtonColor: '#6c757d',
                        confirmButtonText: 'Yes, Continue',
                        cancelButtonText: 'Cancel'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            // Continue with registration
                            proceedWithAdminRegistration();
                        }
                    });
                    return false;
                }
                
                // No warnings, proceed with registration
                proceedWithAdminRegistration();
                
                function proceedWithAdminRegistration() {
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
                
                // Add to global students array
                students.push(newStudent);
                
                // Save to localStorage (this also updates nextId)
                saveStudents();
                console.log('Saved to localStorage, total students:', students.length);
                
                // Reset the form
                adminRegistrationForm.reset();
                
                // Update the student number field for next registration
                updateAdminStudentNumberField();
                
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
                }
                
                return false;
            });
        }
    
    // Admin enrollment form
    const adminEnrollmentForm = document.getElementById('adminEnrollmentForm');
    if (adminEnrollmentForm) {
        adminEnrollmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const studentNo = document.getElementById('adminEnrollStudentSelect').value;
            const type = document.getElementById('adminEnrollType').value;
            
            // Validate student selection
            if (!studentNo) {
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: 'Please select a student.',
                    confirmButtonColor: '#6ba83d'
                });
                return;
            }
            
            // Validate enrollment type
            if (!type) {
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: 'Please select an enrollment type.',
                    confirmButtonColor: '#6ba83d'
                });
                return;
            }
            
            // Find student
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
            
            // Enroll subjects
            const result = enrollSubjects(student, type, 'admin');
            
            if (!result.success) {
                Swal.fire({
                    icon: 'error',
                    title: 'Enrollment Failed',
                    text: result.message || 'Failed to enroll student.',
                    confirmButtonColor: '#6ba83d'
                });
                return;
            }
            
            // Save changes
            saveStudents();
            
            // Update UI
            populateAdminStudentsTable();
            
            // Show success message
            Swal.fire({
                icon: 'success',
                title: 'Enrollment Successful!',
                text: result.message || 'Student has been enrolled in the selected subjects.',
                confirmButtonColor: '#6ba83d',
                timer: 3000,
                timerProgressBar: true
            });
            
            // Reset form
            this.reset();
            document.getElementById('adminEnrollType').value = 'bundle';
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
            if (!currentUser || !currentUser.studentNo) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'User session not found. Please login again.',
                    confirmButtonColor: '#6ba83d'
                }).then(() => {
                    window.location.href = 'index.html';
                });
                return;
            }
            
            const student = students.find(s => s.studentNo === currentUser.studentNo);
            if (!student) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Student record not found.',
                    confirmButtonColor: '#6ba83d'
                });
                return;
            }
            
            const type = document.getElementById('studentEnrollType').value;
            if (!type) {
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: 'Please select an enrollment type.',
                    confirmButtonColor: '#6ba83d'
                });
                return;
            }
            
            // Enroll subjects
            const result = enrollSubjects(student, type, 'student');
            
            if (!result.success) {
                Swal.fire({
                    icon: 'error',
                    title: 'Enrollment Failed',
                    text: result.message || 'Failed to enroll in subjects.',
                    confirmButtonColor: '#6ba83d'
                });
                return;
            }
            
            // Save changes
            saveStudents();
            
            // Update UI
            populateStudentSubjectsTable(student);
            const countElem = document.getElementById('subjectCount');
            if (countElem) countElem.textContent = student.enrolledSubjects.length;
            
            // Show success message
            Swal.fire({
                icon: 'success',
                title: 'Enrollment Successful!',
                text: result.message || 'You have been enrolled in the selected subjects.',
                confirmButtonColor: '#6ba83d',
                timer: 3000,
                timerProgressBar: true
            });
            
            // Reset form
            this.reset();
            document.getElementById('studentEnrollType').value = 'bundle';
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
                const yearSelect = document.getElementById(prefix + 'YearSelect');
                const semSelect = document.getElementById(prefix + 'SemSelect');
                const subjectsMulti = document.getElementById(prefix + 'SubjectsMulti');
                
                if (bundle && single) {
                    if (this.value === 'bundle') {
                        bundle.style.display = 'block';
                        single.style.display = 'none';
                        
                        // Make bundle fields required
                        if (yearSelect) yearSelect.required = true;
                        if (semSelect) semSelect.required = true;
                        if (subjectsMulti) subjectsMulti.required = false;
                    } else {
                        bundle.style.display = 'none';
                        single.style.display = 'block';
                        
                        // Make single fields required
                        if (yearSelect) yearSelect.required = false;
                        if (semSelect) semSelect.required = false;
                        if (subjectsMulti) subjectsMulti.required = true;
                    }
                }
            });
        }
    });
    
    // Search form - improved to search by name or student number
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchTerm = document.getElementById('searchName').value.trim();
            
            if (!searchTerm) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Search Required',
                    text: 'Please enter a student name or student number to search.',
                    confirmButtonColor: '#6ba83d'
                });
                return;
            }
            
            const results = document.getElementById('searchResults');
            const tbody = document.querySelector('#subjectsTable tbody');
            const resultNameElem = document.getElementById('resultName');
            
            if (tbody) tbody.innerHTML = '';
            
            if (!results || !resultNameElem) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Search results container not found.',
                    confirmButtonColor: '#6ba83d'
                });
                return;
            }
            
            // Try to find student by student number first, then by name
            let student = null;
            const searchLower = searchTerm.toLowerCase();
            
            // Check if search term looks like a student number (numeric or contains numbers)
            const isNumericSearch = /^\d+$/.test(searchTerm.replace(/\s/g, ''));
            
            if (isNumericSearch) {
                // Search by student number (exact match or partial)
                const studentNoSearch = searchTerm.replace(/\s/g, '').padStart(4, '0');
                student = students.find(s => {
                    const studentNo = s.studentNo.replace(/\s/g, '').toLowerCase();
                    return studentNo === studentNoSearch.toLowerCase() || 
                           studentNo.includes(searchTerm.toLowerCase());
                });
            }
            
            // If not found by number, search by name (partial match)
            if (!student) {
                student = students.find(s => {
                    const fullName = s.fullName.toLowerCase();
                    const nickname = (s.nickname || '').toLowerCase();
                    return fullName.includes(searchLower) || 
                           nickname.includes(searchLower) ||
                           fullName === searchLower;
                });
            }
            
            // Display results
            if (student) {
                if (student.enrolledSubjects && student.enrolledSubjects.length > 0) {
                    resultNameElem.innerHTML = `
                        <div class="d-flex align-items-center">
                            <i class="bi bi-person-circle me-2"></i>
                            <span><strong>${student.fullName}</strong> (${student.studentNo}) - Enrolled Subjects</span>
                        </div>
                    `;
                    
                    student.enrolledSubjects.forEach(sub => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td><span class="badge bg-primary">${sub.year}</span></td>
                            <td><span class="badge bg-info">${sub.sem}</span></td>
                            <td><i class="bi bi-book me-2 text-success"></i>${sub.name}</td>
                        `;
                        tbody.appendChild(tr);
                    });
                    
                    results.style.display = 'block';
                    
                    // Scroll to results
                    results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    resultNameElem.innerHTML = `
                        <div class="d-flex align-items-center">
                            <i class="bi bi-person-circle me-2"></i>
                            <span><strong>${student.fullName}</strong> (${student.studentNo}) - No subjects enrolled</span>
                        </div>
                    `;
                    results.style.display = 'block';
                    
                    if (tbody) {
                        tbody.innerHTML = `
                            <tr>
                                <td colspan="3" class="text-center text-muted py-4">
                                    <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                                    <p class="mb-0">This student has not enrolled in any subjects yet.</p>
                                </td>
                            </tr>
                        `;
                    }
                }
            } else {
                resultNameElem.innerHTML = `
                    <div class="d-flex align-items-center text-danger">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        <span>Student not found</span>
                    </div>
                `;
                results.style.display = 'block';
                
                if (tbody) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="3" class="text-center text-muted py-4">
                                <i class="bi bi-search fs-1 d-block mb-2"></i>
                                <p class="mb-0">No student found matching "${searchTerm}"</p>
                                <small class="text-muted">Try searching by full name or student number</small>
                            </td>
                        </tr>
                    `;
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
                // Helper function to create form field with icon
                function createField(icon, label, value, isFullWidth = false, isImportant = false) {
                    const displayValue = value || '<span class="text-muted fst-italic">N/A</span>';
                    const colClass = isFullWidth ? 'col-12' : 'col-md-6';
                    const highlightClass = isImportant ? 'border-success border-2 bg-light' : '';
                    const iconColor = isImportant ? 'text-success' : 'text-primary';
                    
                    return `
                        <div class="${colClass} mb-3">
                            <label class="form-label small mb-1 d-flex align-items-center" style="font-weight: 600; color: #555;">
                                <i class="${icon} ${iconColor} me-2"></i>${label}
                            </label>
                            <div class="form-control-plaintext border rounded p-2 ${highlightClass}" style="min-height: 38px; background-color: ${isImportant ? '#f0f7eb' : '#fff'};">
                                ${displayValue}
                            </div>
                        </div>
                    `;
                }
                
                // Helper function to create section box
                function createSection(title, icon, content, color = 'primary') {
                    const colorMap = {
                        'primary': 'bg-primary bg-opacity-10 border-primary',
                        'success': 'bg-success bg-opacity-10 border-success',
                        'info': 'bg-info bg-opacity-10 border-info',
                        'warning': 'bg-warning bg-opacity-10 border-warning',
                        'danger': 'bg-danger bg-opacity-10 border-danger'
                    };
                    
                    return `
                        <div class="card mb-3 ${colorMap[color]}" style="border-width: 2px !important;">
                            <div class="card-header ${colorMap[color]} border-0 pb-2">
                                <h6 class="mb-0 d-flex align-items-center">
                                    <i class="${icon} me-2 text-${color === 'primary' ? 'primary' : color}"></i>
                                    <strong>${title}</strong>
                                </h6>
                            </div>
                            <div class="card-body">
                                <div class="row g-3">
                                    ${content}
                                </div>
                            </div>
                        </div>
                    `;
                }
                
                // Personal Information Section
                const personalInfo = `
                    ${createField('bi bi-hash', 'Student Number', `<span class="badge bg-success fs-6">${student.studentNo}</span>`, false, true)}
                    ${createField('bi bi-person-fill', 'Full Name', student.fullName, false, true)}
                    ${createField('bi bi-person-badge', 'Nickname', student.nickname)}
                    ${createField('bi bi-calendar-event', 'Date of Birth', student.dob)}
                    ${createField('bi bi-123', 'Age', student.age)}
                    ${createField('bi bi-gender-ambiguous', 'Gender', student.gender)}
                    ${createField('bi bi-heart-fill', 'Civil Status', student.civilStatus)}
                    ${createField('bi bi-flag-fill', 'Nationality', student.nationality)}
                `;
                
                // Contact Information Section
                const contactInfo = `
                    ${createField('bi bi-geo-alt-fill', 'Present Address', student.presentAddress, true)}
                    ${createField('bi bi-phone-fill', 'Mobile No.', student.mobileNo, false, true)}
                    ${createField('bi bi-briefcase-fill', 'Occupation', student.occupation)}
                    ${createField('bi bi-building', 'Business/Company Address', student.businessAddress, true)}
                    ${createField('bi bi-telephone-fill', 'Business Tel No.', student.businessTel)}
                `;
                
                // Educational Background Section
                const educationInfo = `
                    ${createField('bi bi-mortarboard-fill', 'School Graduated', student.schoolGraduated)}
                    ${createField('bi bi-calendar-check', 'Date Graduated', student.dateGraduated)}
                    ${createField('bi bi-trophy-fill', 'Degree/Honors/Awards', student.degreeAwards, true)}
                `;
                
                // References Section
                const referencesInfo = `
                    ${createField('bi bi-person-check-fill', 'Character Reference Name', student.charRefName)}
                    ${createField('bi bi-telephone', 'Reference Contact', student.refContact)}
                `;
                
                // Emergency Contact Section
                const emergencyInfo = `
                    ${createField('bi bi-person-exclamation', 'Emergency Contact Name', student.emergencyName, false, true)}
                    ${createField('bi bi-house-fill', 'Emergency Address', student.emergencyAddress, true)}
                    ${createField('bi bi-telephone-forward', 'Emergency No.', student.emergencyNo, false, true)}
                    ${createField('bi bi-people', 'Relation', student.relation)}
                `;
                
                // Church Information Section
                const churchInfo = `
                    ${createField('bi bi-church', 'Home Church', student.homeChurch)}
                    ${createField('bi bi-geo', 'Church Address', student.churchAddress, true)}
                    ${createField('bi bi-person-badge-fill', 'Pastor\'s Name', student.pastorName)}
                    ${createField('bi bi-calendar-heart', 'Date Saved', student.dateSaved)}
                    ${createField('bi bi-water', 'Date Baptized', student.dateBaptized)}
                    ${createField('bi bi-journal-check', 'Ministries Involved', student.ministries, true)}
                `;
                
                // Skills & Additional Info Section
                const additionalInfo = `
                    ${createField('bi bi-star-fill', 'Special Skills', student.specialSkills, true)}
                    ${createField('bi bi-music-note-beamed', 'Musical Instruments', student.instruments, true)}
                    ${createField('bi bi-chat-left-text', 'Reason for Enrolling', student.reasonEnrolling, true)}
                    ${createField('bi bi-heart-pulse', 'Health Information', student.healthInfo, true)}
                    ${createField('bi bi-book-half', 'Brief Testimony', student.testimony, true)}
                `;
                
                let detailsHTML = `
                    <div class="container-fluid p-0">
                        ${createSection('Personal Information', 'bi bi-person-circle-fill', personalInfo, 'primary')}
                        ${createSection('Contact Information', 'bi bi-telephone-fill', contactInfo, 'info')}
                        ${createSection('Educational Background', 'bi bi-mortarboard', educationInfo, 'warning')}
                        ${createSection('Character References', 'bi bi-person-check', referencesInfo, 'info')}
                        ${createSection('Emergency Contact', 'bi bi-exclamation-triangle-fill', emergencyInfo, 'danger')}
                        ${createSection('Church Information', 'bi bi-church', churchInfo, 'success')}
                        ${createSection('Additional Information', 'bi bi-info-circle-fill', additionalInfo, 'primary')}
                    </div>
                `;
                
                // Enrolled Subjects Section
                let subjectsHTML = '';
                if (student.enrolledSubjects && student.enrolledSubjects.length > 0) {
                    subjectsHTML = `
                        <div class="card border-success mb-0" style="border-width: 2px !important;">
                            <div class="card-header bg-success bg-opacity-10 border-0">
                                <h6 class="mb-0 d-flex align-items-center">
                                    <i class="bi bi-book-fill text-success me-2"></i>
                                    <strong>Enrolled Subjects</strong>
                                    <span class="badge bg-success ms-2">${student.enrolledSubjects.length}</span>
                                </h6>
                            </div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-bordered table-hover table-sm mb-0">
                                        <thead class="table-success">
                                            <tr>
                                                <th><i class="bi bi-calendar3 me-1"></i>Year</th>
                                                <th><i class="bi bi-calendar-range me-1"></i>Semester</th>
                                                <th><i class="bi bi-book me-1"></i>Subject</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${student.enrolledSubjects.map(sub => `
                                                <tr>
                                                    <td><span class="badge bg-primary">${sub.year}</span></td>
                                                    <td><span class="badge bg-info">${sub.sem}</span></td>
                                                    <td><i class="bi bi-book me-2 text-success"></i>${sub.name}</td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    subjectsHTML = `
                        <div class="card border-info mb-0">
                            <div class="card-body text-center py-4">
                                <i class="bi bi-inbox fs-1 text-muted d-block mb-2"></i>
                                <p class="text-muted mb-0">No subjects enrolled yet.</p>
                            </div>
                        </div>
                    `;
                }
                
                Swal.fire({
                    title: '<div class="d-flex align-items-center"><i class="bi bi-person-circle-fill text-success me-2 fs-4"></i><span>Your Profile</span></div>',
                    html: detailsHTML + subjectsHTML,
                    width: '950px',
                    confirmButtonColor: '#6ba83d',
                    confirmButtonText: '<i class="bi bi-check-circle me-1"></i> Close',
                    customClass: {
                        popup: 'text-start',
                        htmlContainer: 'p-0'
                    },
                    showCloseButton: true,
                    padding: '1.5rem'
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
    
    // Update Password buttons
    const adminUpdatePassword = document.getElementById('adminUpdatePassword');
    const studentUpdatePassword = document.getElementById('studentUpdatePassword');
    
    // Admin Update Password
    if (adminUpdatePassword) {
        adminUpdatePassword.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Close sidebar on mobile before showing modal
            if (window.innerWidth <= 968) {
                const adminSidebar = document.getElementById('adminSidebar');
                if (adminSidebar) {
                    adminSidebar.classList.remove('show');
                }
            }
            
            setTimeout(() => {
                Swal.fire({
                    title: 'Update Admin Password',
                    html: `
                        <div class="text-start">
                            <div class="mb-3">
                                <label class="form-label"><i class="bi bi-lock-fill me-2"></i>Current Password *</label>
                                <input type="password" id="swal-currentAdminPass" class="form-control" placeholder="Enter current password" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label"><i class="bi bi-key-fill me-2"></i>New Password *</label>
                                <input type="password" id="swal-newAdminPass" class="form-control" placeholder="Enter new password" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label"><i class="bi bi-shield-check me-2"></i>Confirm New Password *</label>
                                <input type="password" id="swal-confirmAdminPass" class="form-control" placeholder="Confirm new password" required>
                            </div>
                        </div>
                    `,
                    width: '500px',
                    showCancelButton: true,
                    confirmButtonColor: '#6ba83d',
                    cancelButtonColor: '#6c757d',
                    confirmButtonText: '<i class="bi bi-check-circle me-1"></i> Update Password',
                    cancelButtonText: '<i class="bi bi-x-circle me-1"></i> Cancel',
                    preConfirm: () => {
                        const currentPass = document.getElementById('swal-currentAdminPass').value;
                        const newPass = document.getElementById('swal-newAdminPass').value;
                        const confirmPass = document.getElementById('swal-confirmAdminPass').value;
                        
                        if (!currentPass) {
                            Swal.showValidationMessage('Current password is required');
                            return false;
                        }
                        
                        if (currentPass !== adminPassword) {
                            Swal.showValidationMessage('Current password is incorrect');
                            return false;
                        }
                        
                        if (!newPass) {
                            Swal.showValidationMessage('New password is required');
                            return false;
                        }
                        
                        if (newPass.length < 4) {
                            Swal.showValidationMessage('New password must be at least 4 characters');
                            return false;
                        }
                        
                        if (newPass !== confirmPass) {
                            Swal.showValidationMessage('New passwords do not match');
                            return false;
                        }
                        
                        return { newPassword: newPass };
                    }
                }).then((result) => {
                    if (result.isConfirmed && result.value) {
                        // Note: In a real application, you'd update the admin password in a database
                        // For this demo, we'll just show a success message
                        // The admin password is hardcoded, so we can't actually change it in localStorage
                        Swal.fire({
                            icon: 'info',
                            title: 'Password Update',
                            html: `
                                <p>In a production system, the admin password would be updated in the database.</p>
                                <p class="text-muted">For this demo system, the admin password remains: <strong>admin123</strong></p>
                            `,
                            confirmButtonColor: '#6ba83d'
                        });
                    }
                });
            }, 100);
        });
    }
    
    // Student Update Password
    if (studentUpdatePassword) {
        studentUpdatePassword.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Close sidebar on mobile before showing modal
            if (window.innerWidth <= 968) {
                const studentSidebar = document.getElementById('studentSidebar');
                if (studentSidebar) {
                    studentSidebar.classList.remove('show');
                }
            }
            
            const currentUser = JSON.parse(sessionStorage.getItem('user'));
            if (!currentUser || !currentUser.studentNo) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'User session not found. Please login again.',
                    confirmButtonColor: '#6ba83d'
                }).then(() => {
                    window.location.href = 'index.html';
                });
                return;
            }
            
            const student = students.find(s => s.studentNo === currentUser.studentNo);
            if (!student) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Student record not found.',
                    confirmButtonColor: '#6ba83d'
                });
                return;
            }
            
            setTimeout(() => {
                Swal.fire({
                    title: 'Update Password',
                    html: `
                        <div class="text-start">
                            <div class="mb-3">
                                <label class="form-label"><i class="bi bi-lock-fill me-2"></i>Current Password *</label>
                                <input type="password" id="swal-currentStudentPass" class="form-control" placeholder="Enter current password" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label"><i class="bi bi-key-fill me-2"></i>New Password *</label>
                                <input type="password" id="swal-newStudentPass" class="form-control" placeholder="Enter new password" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label"><i class="bi bi-shield-check me-2"></i>Confirm New Password *</label>
                                <input type="password" id="swal-confirmStudentPass" class="form-control" placeholder="Confirm new password" required>
                            </div>
                        </div>
                    `,
                    width: '500px',
                    showCancelButton: true,
                    confirmButtonColor: '#6ba83d',
                    cancelButtonColor: '#6c757d',
                    confirmButtonText: '<i class="bi bi-check-circle me-1"></i> Update Password',
                    cancelButtonText: '<i class="bi bi-x-circle me-1"></i> Cancel',
                    preConfirm: () => {
                        const currentPass = document.getElementById('swal-currentStudentPass').value;
                        const newPass = document.getElementById('swal-newStudentPass').value;
                        const confirmPass = document.getElementById('swal-confirmStudentPass').value;
                        
                        if (!currentPass) {
                            Swal.showValidationMessage('Current password is required');
                            return false;
                        }
                        
                        if (currentPass !== student.password) {
                            Swal.showValidationMessage('Current password is incorrect');
                            return false;
                        }
                        
                        if (!newPass) {
                            Swal.showValidationMessage('New password is required');
                            return false;
                        }
                        
                        if (newPass.length < 4) {
                            Swal.showValidationMessage('New password must be at least 4 characters');
                            return false;
                        }
                        
                        if (newPass !== confirmPass) {
                            Swal.showValidationMessage('New passwords do not match');
                            return false;
                        }
                        
                        return { newPassword: newPass };
                    }
                }).then((result) => {
                    if (result.isConfirmed && result.value) {
                        // Update student password
                        student.password = result.value.newPassword;
                        saveStudents();
                        
                        Swal.fire({
                            icon: 'success',
                            title: 'Password Updated!',
                            text: 'Your password has been updated successfully.',
                            confirmButtonColor: '#6ba83d',
                            timer: 2000,
                            timerProgressBar: true
                        });
                    }
                });
            }, 100);
        });
    }
    
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
            // Refresh students array to get latest data
            refreshStudents();
            populateStudentSelects();
            populateSubjectsMulti([document.getElementById('adminSubjectsMulti')].filter(Boolean));
            populateAdminStudentsTable();
            setupStudentSearch(); // Add search functionality
            updateAdminStudentNumberField();
            
            // Set initial required attributes for enrollment form
            const adminYearSelect = document.getElementById('adminYearSelect');
            const adminSemSelect = document.getElementById('adminSemSelect');
            const adminSubjectsMulti = document.getElementById('adminSubjectsMulti');
            if (adminYearSelect) adminYearSelect.required = true;
            if (adminSemSelect) adminSemSelect.required = true;
            if (adminSubjectsMulti) adminSubjectsMulti.required = false;
        }
    }
    
    if (studentDashboard) {
        const user = JSON.parse(sessionStorage.getItem('user') || 'null');
        if (user && user.type === 'student') {
            // Refresh students array to get latest data
            refreshStudents();
            const student = students.find(s => s.studentNo === user.studentNo);
            if (student) {
                showStudentDashboard(student);
            }
            
            // Set initial required attributes for enrollment form
            const studentYearSelect = document.getElementById('studentYearSelect');
            const studentSemSelect = document.getElementById('studentSemSelect');
            const studentSubjectsMulti = document.getElementById('studentSubjectsMulti');
            if (studentYearSelect) studentYearSelect.required = true;
            if (studentSemSelect) studentSemSelect.required = true;
            if (studentSubjectsMulti) studentSubjectsMulti.required = false;
        }
    }
    
    // Initialize student number on registration page
    if (loginPage) {
        // Refresh students array to get latest data
        refreshStudents();
        const studentNoInput = document.getElementById('studentNo');
        if (studentNoInput) {
            studentNoInput.value = String(nextId).padStart(4, '0');
        }
    }
});