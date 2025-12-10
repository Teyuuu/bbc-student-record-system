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

        const allSubjects = [];
        Object.keys(curriculum).forEach(year => {
            Object.keys(curriculum[year]).forEach(sem => {
                curriculum[year][sem].forEach(name => {
                    allSubjects.push({year, sem, name});
                });
            });
        });

        let students = JSON.parse(localStorage.getItem('berean_students')) || [];
        let nextId = students.length > 0 ? Math.max(...students.map(s => parseInt(s.studentNo))) + 1 : 1;

        const adminUsername = 'admin';
        const adminPassword = 'admin123';

        function saveStudents() {
            localStorage.setItem('berean_students', JSON.stringify(students));
        }

        function showAlert(message, type = 'success') {
            const alertBox = document.getElementById('alertBox');
            alertBox.className = `alert alert-${type}`;
            alertBox.textContent = message;
            alertBox.style.display = 'block';
            setTimeout(() => alertBox.style.display = 'none', 3000);
        }

        function switchPage(pageId) {
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.getElementById(pageId).classList.add('active');
        }

        function showSection(sectionId) {
            document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
            
            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelector(`[data-section="${sectionId}"]`)?.classList.add('active');
        }

        // Menu Toggle
        document.getElementById('menuToggle').addEventListener('click', function() {
            const adminSidebar = document.getElementById('adminSidebar');
            const studentSidebar = document.getElementById('studentSidebar');
            const adminContent = document.getElementById('adminContent');
            const studentContent = document.getElementById('studentContent');

            if (adminSidebar) {
                adminSidebar.classList.toggle('show');
            }
            if (studentSidebar) {
                studentSidebar.classList.toggle('show');
            }
        });

        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (this.dataset.section) {
                    showSection(this.dataset.section);
                }
            });
        });

        // Role Selection
        document.getElementById('role').addEventListener('change', function() {
            const adminFields = document.getElementById('adminFields');
            const studentFields = document.getElementById('studentFields');
            const adminUser = document.getElementById('adminUser');
            const adminPass = document.getElementById('adminPass');
            const studentNoLogin = document.getElementById('studentNoLogin');
            const studentPass = document.getElementById('studentPass');
            
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

        // Login
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const role = document.getElementById('role').value;
            if (role === 'Admin') {
                const user = document.getElementById('adminUser').value;
                const pass = document.getElementById('adminPass').value;
                if (user === adminUsername && pass === adminPassword) {
                    sessionStorage.setItem('user', JSON.stringify({type: 'admin'}));
                    switchPage('adminDashboard');
                    populateStudentSelects();
                    populateSubjectsMulti([document.getElementById('adminSubjectsMulti')]);
                    populateAdminStudentsTable();
                } else {
                    showAlert('Invalid admin credentials', 'error');
                }
            } else {
                const studentNo = document.getElementById('studentNoLogin').value;
                const pass = document.getElementById('studentPass').value;
                const student = students.find(s => s.studentNo === studentNo && s.password === pass);
                if (student) {
                    sessionStorage.setItem('user', JSON.stringify({type: 'student', studentNo: student.studentNo}));
                    switchPage('studentDashboard');
                    showStudentDashboard(student);
                } else {
                    showAlert('Invalid student credentials', 'error');
                }
            }
        });

        // Show Register
        document.getElementById('showRegister').addEventListener('click', function() {
            switchPage('registrationPage');
            document.getElementById('studentNo').value = String(nextId).padStart(4, '0');
        });

        // Back to Login
        document.getElementById('backToLogin').addEventListener('click', function() {
            switchPage('loginPage');
        });

        // Registration
        document.getElementById('registrationForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const student = createStudentObject('');
            student.password = document.getElementById('password').value;
            student.enrolledSubjects = [];
            students.push(student);
            nextId++;
            saveStudents();
            this.reset();
            switchPage('loginPage');
            showAlert('Registration successful! Please login.');
        });

        function createStudentObject(prefix) {
            return {
                studentNo: String(nextId).padStart(4, '0'),
                fullName: document.getElementById(prefix + 'fullName').value.trim(),
                nickname: document.getElementById(prefix + 'nickname').value.trim(),
                dob: document.getElementById(prefix + 'dob').value,
                age: document.getElementById(prefix + 'age').value,
                civilStatus: document.getElementById(prefix + 'civilStatus').value.trim(),
                nationality: document.getElementById(prefix + 'nationality').value.trim(),
                presentAddress: document.getElementById(prefix + 'presentAddress').value.trim(),
                mobileNo: document.getElementById(prefix + 'mobileNo').value.trim(),
                occupation: document.getElementById(prefix + 'occupation').value.trim(),
                businessAddress: document.getElementById(prefix + 'businessAddress').value.trim(),
                businessTel: document.getElementById(prefix + 'businessTel').value.trim(),
                schoolGraduated: document.getElementById(prefix + 'schoolGraduated').value.trim(),
                dateGraduated: document.getElementById(prefix + 'dateGraduated').value,
                degreeAwards: document.getElementById(prefix + 'degreeAwards').value.trim(),
                charRefName: document.getElementById(prefix + 'charRefName').value.trim(),
                refContact: document.getElementById(prefix + 'refContact').value.trim(),
                emergencyName: document.getElementById(prefix + 'emergencyName').value.trim(),
                emergencyAddress: document.getElementById(prefix + 'emergencyAddress').value.trim(),
                emergencyNo: document.getElementById(prefix + 'emergencyNo').value.trim(),
                relation: document.getElementById(prefix + 'relation').value.trim(),
                homeChurch: document.getElementById(prefix + 'homeChurch').value.trim(),
                churchAddress: document.getElementById(prefix + 'churchAddress').value.trim(),
                pastorName: document.getElementById(prefix + 'pastorName').value.trim(),
                dateSaved: document.getElementById(prefix + 'dateSaved').value,
                dateBaptized: document.getElementById(prefix + 'dateBaptized').value,
                ministries: document.getElementById(prefix + 'ministries').value.trim(),
                specialSkills: document.getElementById(prefix + 'specialSkills').value.trim(),
                instruments: document.getElementById(prefix + 'instruments').value.trim(),
                reasonEnrolling: document.getElementById(prefix + 'reasonEnrolling').value.trim(),
                healthInfo: document.getElementById(prefix + 'healthInfo').value.trim(),
                testimony: document.getElementById(prefix + 'testimony').value.trim()
            };
        }

        function populateStudentSelects() {
            const select = document.getElementById('adminEnrollStudentSelect');
            select.innerHTML = '<option value="">-- Choose Student --</option>';
            students.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.studentNo;
                opt.textContent = `${s.studentNo} - ${s.fullName}`;
                select.appendChild(opt);
            });
        }

        function populateSubjectsMulti(selects) {
            selects.forEach(select => {
                select.innerHTML = '';
                allSubjects.forEach(sub => {
                    const opt = document.createElement('option');
                    opt.value = JSON.stringify(sub);
                    opt.textContent = `${sub.year} ${sub.sem} - ${sub.name}`;
                    select.appendChild(opt);
                });
            });
        }

        function populateAdminStudentsTable() {
            const tbody = document.querySelector('#adminStudentsTable tbody');
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

        function showStudentDashboard(student) {
            document.getElementById('studentName').textContent = student.fullName;
            document.getElementById('studentNameTop').textContent = student.fullName;
            document.getElementById('studentAvatar').textContent = student.fullName.charAt(0).toUpperCase();
            populateSubjectsMulti([document.getElementById('studentSubjectsMulti')]);
            populateStudentSubjectsTable(student);
            document.getElementById('subjectCount').textContent = (student.enrolledSubjects || []).length;
        }

        function populateStudentSubjectsTable(student) {
            const tbody = document.querySelector('#studentSubjectsTable tbody');
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

        // Admin Registration
        document.getElementById('adminRegistrationForm').addEventListener('submit', function(e) {
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
            document.getElementById('adminStudentNo').value = String(nextId).padStart(4, '0');
            alert('Student registered successfully!');
        });

        // Admin Enrollment
        document.getElementById('adminEnrollmentForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const studentNo = document.getElementById('adminEnrollStudentSelect').value;
            const type = document.getElementById('adminEnrollType').value;
            const student = students.find(s => s.studentNo === studentNo);
            if (!student) return alert('Student not found.');
            enrollSubjects(student, type, 'admin');
            saveStudents();
            alert('Enrollment successful!');
            this.reset();
            document.getElementById('adminSingleOptions').style.display = 'none';
            document.getElementById('adminBundleOptions').style.display = 'block';
        });

        // Student Enrollment
        document.getElementById('studentEnrollmentForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const currentUser = JSON.parse(sessionStorage.getItem('user'));
            const student = students.find(s => s.studentNo === currentUser.studentNo);
            const type = document.getElementById('studentEnrollType').value;
            enrollSubjects(student, type, 'student');
            saveStudents();
            populateStudentSubjectsTable(student);
            document.getElementById('subjectCount').textContent = student.enrolledSubjects.length;
            alert('Enrollment successful!');
            this.reset();
            document.getElementById('studentSingleOptions').style.display = 'none';
            document.getElementById('studentBundleOptions').style.display = 'block';
        });

        function enrollSubjects(student, type, prefix) {
            if (type === 'bundle') {
                const year = document.getElementById(prefix + 'YearSelect').value;
                const sem = document.getElementById(prefix + 'SemSelect').value;
                const subjects = curriculum[year][sem] || [];
                subjects.forEach(name => {
                    const sub = {year, sem, name};
                    if (!student.enrolledSubjects.some(s => s.name === name)) {
                        student.enrolledSubjects.push(sub);
                    }
                });
            } else {
                const multi = document.getElementById(prefix + 'SubjectsMulti');
                Array.from(multi.selectedOptions).forEach(opt => {
                    const sub = JSON.parse(opt.value);
                    if (!student.enrolledSubjects.some(s => s.name === sub.name)) {
                        student.enrolledSubjects.push(sub);
                    }
                });
            }
        }

        // Change enroll type
        ['admin', 'student'].forEach(prefix => {
            document.getElementById(prefix + 'EnrollType').addEventListener('change', function() {
                const bundle = document.getElementById(prefix + 'BundleOptions');
                const single = document.getElementById(prefix + 'SingleOptions');
                if (this.value === 'bundle') {
                    bundle.style.display = 'block';
                    single.style.display = 'none';
                } else {
                    bundle.style.display = 'none';
                    single.style.display = 'block';
                }
            });
        });

        // Search
        document.getElementById('searchForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('searchName').value.trim().toLowerCase();
            const student = students.find(s => s.fullName.toLowerCase() === name);
            const results = document.getElementById('searchResults');
            const tbody = document.querySelector('#subjectsTable tbody');
            tbody.innerHTML = '';
            if (student && student.enrolledSubjects.length > 0) {
                document.getElementById('resultName').textContent = `${student.fullName} - Subjects Taken`;
                student.enrolledSubjects.forEach(sub => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td>${sub.year}</td><td>${sub.sem}</td><td>${sub.name}</td>`;
                    tbody.appendChild(tr);
                });
                results.style.display = 'block';
            } else {
                results.style.display = 'block';
                document.getElementById('resultName').textContent = student ? 'No subjects enrolled' : 'Student not found';
            }
        });

        // View Modal
        window.showViewModal = function(studentNo) {
            const student = students.find(s => s.studentNo === studentNo);
            const details = document.getElementById('viewDetails');
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
            tbody.innerHTML = '';
            (student.enrolledSubjects || []).forEach(sub => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${sub.year}</td><td>${sub.sem}</td><td>${sub.name}</td>`;
                tbody.appendChild(tr);
            });
            document.getElementById('viewModal').style.display = 'block';
        };

        // Edit Modal
        window.showEditModal = function(studentNo) {
            const student = students.find(s => s.studentNo === studentNo);
            document.getElementById('editFullName').value = student.fullName;
            document.getElementById('editNickname').value = student.nickname || '';
            document.getElementById('editDob').value = student.dob || '';
            document.getElementById('editAge').value = student.age || '';
            document.getElementById('editMobileNo').value = student.mobileNo || '';
            document.getElementById('editOccupation').value = student.occupation || '';
            document.getElementById('editPresentAddress').value = student.presentAddress || '';
            document.getElementById('editPassword').value = '';
            document.getElementById('editForm').dataset.studentno = studentNo;
            document.getElementById('editModal').style.display = 'block';
        };

        // Save Edit
        document.getElementById('editForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const studentNo = this.dataset.studentno;
            const student = students.find(s => s.studentNo === studentNo);
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
            alert('Updated successfully!');
        });

        // Delete
        window.deleteStudent = function(studentNo) {
            if (confirm('Are you sure you want to delete this student?')) {
                students = students.filter(s => s.studentNo !== studentNo);
                saveStudents();
                populateAdminStudentsTable();
                populateStudentSelects();
            }
        };

        // View Profile
        document.getElementById('viewProfile').addEventListener('click', function() {
            const currentUser = JSON.parse(sessionStorage.getItem('user'));
            const student = students.find(s => s.studentNo === currentUser.studentNo);
            const details = document.getElementById('profileDetails');
            details.innerHTML = '';
            Object.keys(student).forEach(key => {
                if (key !== 'enrolledSubjects' && key !== 'password') {
                    const p = document.createElement('p');
                    p.innerHTML = `<strong>${key}:</strong> ${student[key] || 'N/A'}`;
                    p.style.marginBottom = '8px';
                    details.appendChild(p);
                }
            });
            document.getElementById('profileModal').style.display = 'block';
        });

        // Close modals
        document.getElementById('closeView').addEventListener('click', () => document.getElementById('viewModal').style.display = 'none');
        document.getElementById('closeEdit').addEventListener('click', () => document.getElementById('editModal').style.display = 'none');
        document.getElementById('closeProfile').addEventListener('click', () => document.getElementById('profileModal').style.display = 'none');

        // Close modal on outside click
        window.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });

        // Logout
        document.getElementById('adminLogout').addEventListener('click', function() {
            sessionStorage.clear();
            location.reload();
        });

        document.getElementById('studentLogout').addEventListener('click', function() {
            sessionStorage.clear();
            location.reload();
        });

        // On load
        window.addEventListener('load', function() {
            // Initialize required fields based on default role
            document.getElementById('adminUser').required = true;
            document.getElementById('adminPass').required = true;
            document.getElementById('studentNoLogin').required = false;
            document.getElementById('studentPass').required = false;
            
            const currentUser = JSON.parse(sessionStorage.getItem('user'));
            if (currentUser) {
                if (currentUser.type === 'admin') {
                    switchPage('adminDashboard');
                    populateStudentSelects();
                    populateSubjectsMulti([document.getElementById('adminSubjectsMulti')]);
                    populateAdminStudentsTable();
                    document.getElementById('adminStudentNo').value = String(nextId).padStart(4, '0');
                } else {
                    const student = students.find(s => s.studentNo === currentUser.studentNo);
                    switchPage('studentDashboard');
                    showStudentDashboard(student);
                }
            } else {
                switchPage('loginPage');
            }
            document.getElementById('studentNo').value = String(nextId).padStart(4, '0');
            document.getElementById('adminStudentNo').value = String(nextId).padStart(4, '0');
            populateSubjectsMulti([document.getElementById('adminSubjectsMulti'), document.getElementById('studentSubjectsMulti')]);
        });