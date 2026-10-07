from flask import Flask, request, jsonify

from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///school.db"
db = SQLAlchemy(app)

# USER MODEL
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)


# STUDENT MODEL
class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("user.id"),
        nullable=False
    )
    admission_number = db.Column(
        db.String(50),
        unique=True,
        nullable=False
    )
    class_id = db.Column(
        db.Integer,
        db.ForeignKey("class.id"),
        nullable=False
    )


# CLASS MODEL
class Class(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(
        db.String(100),
        unique=True,
        nullable=False
    )


# TEACHER MODEL
class Teacher(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("user.id"),
        nullable=False
    )


# SUBJECT MODEL
class Subject(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(
        db.String(100),
        nullable=False
    )


# TEACHING ASSIGNMENT MODEL
class TeachingAssignment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(
        db.Integer,
        db.ForeignKey("teacher.id"),
        nullable=False
    )
    class_id = db.Column(
        db.Integer,
        db.ForeignKey("class.id"),
        nullable=False
    )
    subject_id = db.Column(
        db.Integer,
        db.ForeignKey("subject.id"),
        nullable=False
    )


# ACADEMIC SESSION MODEL
class AcademicSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    session = db.Column(
        db.String(20),
        nullable=False
    )
    term = db.Column(
        db.String(20),
        nullable=False
    )


# RESULT MODEL
class Result(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(
        db.Integer,
        db.ForeignKey("student.id"),
        nullable=False
    )
    subject_id = db.Column(
        db.Integer,
        db.ForeignKey("subject.id"),
        nullable=False
    )
    score = db.Column(
        db.Integer,
        nullable=False
    )
    grade = db.Column(
        db.String(5),
        nullable=False
    )
    academic_session_id = db.Column(
        db.Integer,
        db.ForeignKey("academic_session.id"),
        nullable=False
    )


    # ==================== USER CRUD ====================

# CREATE USER
@app.route("/api/users", methods=["POST"])
def create_user():
    data = request.get_json()

    user = User(
        name=data["name"],
        email=data["email"],
        password_hash=data["password_hash"],
        role=data["role"]
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "User created successfully"
    })


# GET ALL USERS
@app.route("/api/users", methods=["GET"])
def get_users():
    users = User.query.all()
    users_data = []

    for user in users:
        user_data = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }

        users_data.append(user_data)

    return jsonify(users_data)


# GET ONE USER
@app.route("/api/users/<int:user_id>")
def get_user(user_id):
    user = User.query.filter_by(id=user_id).first()

    if user is None:
        return jsonify({
            "error": "User not found"
        }), 404

    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role
    })


# UPDATE USER
@app.route("/api/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    user = User.query.filter_by(id=user_id).first()

    if user is None:
        return jsonify({
            "error": "User not found"
        }), 404

    data = request.get_json()

    user.name = data["name"]
    user.email = data["email"]
    user.password_hash = data["password_hash"]
    user.role = data["role"]

    db.session.commit()

    return jsonify({
        "message": "User updated successfully"
    })


# DELETE USER
@app.route("/api/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    user = User.query.filter_by(id=user_id).first()

    if user is None:
        return jsonify({
            "error": "User not found"
        }), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({
        "message": "User deleted successfully"
    })

# ==================== STUDENT CRUD ====================

# CREATE STUDENT
@app.route("/api/students", methods=["POST"])
def create_student():
    data = request.get_json()

    student = Student(
        user_id=data["user_id"],
        admission_number=data["admission_number"],
        class_id=data["class_id"]
    )

    db.session.add(student)
    db.session.commit()

    return jsonify({
        "message": "Student created successfully"
    })


# GET ALL STUDENTS
@app.route("/api/students", methods=["GET"])
def get_students():
    students = Student.query.all()
    students_data = []

    for student in students:
        student_data = {
            "id": student.id,
            "user_id": student.user_id,
            "admission_number": student.admission_number,
            "class_id": student.class_id
        }

        students_data.append(student_data)

    return jsonify(students_data)


# GET ONE STUDENT
@app.route("/api/students/<int:student_id>")
def get_student(student_id):
    student = Student.query.filter_by(id=student_id).first()

    if student is None:
        return jsonify({
            "error": "Student not found"
        }), 404

    return jsonify({
        "id": student.id,
        "user_id": student.user_id,
        "admission_number": student.admission_number,
        "class_id": student.class_id
    })


# UPDATE STUDENT
@app.route("/api/students/<int:student_id>", methods=["PUT"])
def update_student(student_id):
    student = Student.query.filter_by(id=student_id).first()

    if student is None:
        return jsonify({
            "error": "Student not found"
        }), 404

    data = request.get_json()

    student.admission_number = data["admission_number"]
    student.class_id = data["class_id"]

    db.session.commit()

    return jsonify({
        "message": "Student updated successfully"
    })


# DELETE STUDENT
@app.route("/api/students/<int:student_id>", methods=["DELETE"])
def delete_student(student_id):
    student = Student.query.filter_by(id=student_id).first()

    if student is None:
        return jsonify({
            "error": "Student not found"
        }), 404

    db.session.delete(student)
    db.session.commit()

    return jsonify({
        "message": "Student deleted successfully"
    })

# ==================== CLASS CRUD ====================

# CREATE CLASS
@app.route("/api/class", methods=["POST"])
def create_class():
    data = request.get_json()

    new_class = Class(
        name=data["name"]
    )

    db.session.add(new_class)
    db.session.commit()

    return jsonify({
        "message": "Class created successfully"
    })


# GET ALL CLASSES
@app.route("/api/class", methods=["GET"])
def get_classes():
    classes = Class.query.all()
    classes_data = []

    for new_class in classes:
        class_data = {
            "id": new_class.id,
            "name": new_class.name
        }

        classes_data.append(class_data)

    return jsonify(classes_data)


# GET ONE CLASS
@app.route("/api/class/<int:class_id>")
def get_class(class_id):
    new_class = Class.query.filter_by(id=class_id).first()

    if new_class is None:
        return jsonify({
            "error": "Class not found"
        }), 404

    return jsonify({
        "id": new_class.id,
        "name": new_class.name
    })


# UPDATE CLASS
@app.route("/api/class/<int:class_id>", methods=["PUT"])
def update_class(class_id):
    new_class = Class.query.filter_by(id=class_id).first()

    if new_class is None:
        return jsonify({
            "error": "Class not found"
        }), 404

    data = request.get_json()

    new_class.name = data["name"]

    db.session.commit()

    return jsonify({
        "message": "Class updated successfully"
    })


# DELETE CLASS
@app.route("/api/class/<int:class_id>", methods=["DELETE"])
def delete_class(class_id):
    new_class = Class.query.filter_by(id=class_id).first()

    if new_class is None:
        return jsonify({
            "error": "Class not found"
        }), 404

    db.session.delete(new_class)
    db.session.commit()

    return jsonify({
        "message": "Class deleted successfully"
    })

# ==================== TEACHER CRUD ====================

# CREATE TEACHER
@app.route("/api/teachers", methods=["POST"])
def create_teacher():
    data = request.get_json()

    teacher = Teacher(
        user_id=data["user_id"]
    )

    db.session.add(teacher)
    db.session.commit()

    return jsonify({
        "message": "Teacher created successfully"
    })


# GET ALL TEACHERS
@app.route("/api/teachers", methods=["GET"])
def get_teachers():
    teachers = Teacher.query.all()
    teachers_data = []

    for teacher in teachers:
        teacher_data = {
            "id": teacher.id,
            "user_id": teacher.user_id
        }

        teachers_data.append(teacher_data)

    return jsonify(teachers_data)


# GET ONE TEACHER
@app.route("/api/teachers/<int:teacher_id>")
def get_teacher(teacher_id):
    teacher = Teacher.query.filter_by(id=teacher_id).first()

    if teacher is None:
        return jsonify({
            "error": "Teacher not found"
        }), 404

    return jsonify({
        "id": teacher.id,
        "user_id": teacher.user_id
    })


# UPDATE TEACHER
@app.route("/api/teachers/<int:teacher_id>", methods=["PUT"])
def update_teacher(teacher_id):
    teacher = Teacher.query.filter_by(id=teacher_id).first()

    if teacher is None:
        return jsonify({
            "error": "Teacher not found"
        }), 404

    data = request.get_json()

    teacher.user_id = data["user_id"]

    db.session.commit()

    return jsonify({
        "message": "Teacher updated successfully"
    })


# DELETE TEACHER
@app.route("/api/teachers/<int:teacher_id>", methods=["DELETE"])
def delete_teacher(teacher_id):
    teacher = Teacher.query.filter_by(id=teacher_id).first()

    if teacher is None:
        return jsonify({
            "error": "Teacher not found"
        }), 404

    db.session.delete(teacher)
    db.session.commit()

    return jsonify({
        "message": "Teacher deleted successfully"
    })

# ==================== SUBJECT CRUD ====================

# CREATE SUBJECT
@app.route("/api/subjects", methods=["POST"])
def create_subject():
    data = request.get_json()

    subject = Subject(
        name=data["name"]
    )

    db.session.add(subject)
    db.session.commit()

    return jsonify({
        "message": "Subject created successfully"
    })


# GET ALL SUBJECTS
@app.route("/api/subjects", methods=["GET"])
def get_subjects():
    subjects = Subject.query.all()
    subjects_data = []

    for subject in subjects:
        subject_data = {
            "id": subject.id,
            "name": subject.name
        }

        subjects_data.append(subject_data)

    return jsonify(subjects_data)


# GET ONE SUBJECT
@app.route("/api/subjects/<int:subject_id>")
def get_subject(subject_id):
    subject = Subject.query.filter_by(id=subject_id).first()

    if subject is None:
        return jsonify({
            "error": "Subject not found"
        }), 404

    return jsonify({
        "id": subject.id,
        "name": subject.name
    })


# UPDATE SUBJECT
@app.route("/api/subjects/<int:subject_id>", methods=["PUT"])
def update_subject(subject_id):
    subject = Subject.query.filter_by(id=subject_id).first()

    if subject is None:
        return jsonify({
            "error": "Subject not found"
        }), 404

    data = request.get_json()

    subject.name = data["name"]

    db.session.commit()

    return jsonify({
        "message": "Subject updated successfully"
    })


# DELETE SUBJECT
@app.route("/api/subjects/<int:subject_id>", methods=["DELETE"])
def delete_subject(subject_id):
    subject = Subject.query.filter_by(id=subject_id).first()

    if subject is None:
        return jsonify({
            "error": "Subject not found"
        }), 404

    db.session.delete(subject)
    db.session.commit()

    return jsonify({
        "message": "Subject deleted successfully"
    })


# ==================== TEACHING ASSIGNMENT CRUD ====================

# CREATE TEACHING ASSIGNMENT
@app.route("/api/teaching-assignments", methods=["POST"])
def create_teaching_assignment():
    data = request.get_json()

    teaching_assignment = TeachingAssignment(
        teacher_id=data["teacher_id"],
        class_id=data["class_id"],
        subject_id=data["subject_id"]
    )

    db.session.add(teaching_assignment)
    db.session.commit()

    return jsonify({
        "message": "Teaching assignment created successfully"
    })


# GET ALL TEACHING ASSIGNMENTS
@app.route("/api/teaching-assignments")
def get_teaching_assignments():
    teaching_assignments = TeachingAssignment.query.all()
    teaching_assignments_data = []

    for teaching_assignment in teaching_assignments:
        teaching_assignment_data = {
            "id": teaching_assignment.id,
            "teacher_id": teaching_assignment.teacher_id,
            "class_id": teaching_assignment.class_id,
            "subject_id": teaching_assignment.subject_id
        }

        teaching_assignments_data.append(teaching_assignment_data)

    return jsonify(teaching_assignments_data)


# GET ONE TEACHING ASSIGNMENT
@app.route("/api/teaching-assignments/<int:teaching_assignment_id>")
def get_teaching_assignment(teaching_assignment_id):
    teaching_assignment = TeachingAssignment.query.filter_by(
        id=teaching_assignment_id
    ).first()

    if teaching_assignment is None:
        return jsonify({
            "error": "Teaching assignment not found"
        }), 404

    return jsonify({
        "id": teaching_assignment.id,
        "teacher_id": teaching_assignment.teacher_id,
        "class_id": teaching_assignment.class_id,
        "subject_id": teaching_assignment.subject_id
    })


# UPDATE TEACHING ASSIGNMENT
@app.route("/api/teaching-assignments/<int:teaching_assignment_id>", methods=["PUT"])
def update_teaching_assignment(teaching_assignment_id):
    teaching_assignment = TeachingAssignment.query.filter_by(
        id=teaching_assignment_id
    ).first()

    if teaching_assignment is None:
        return jsonify({
            "error": "Teaching assignment not found"
        }), 404

    data = request.get_json()

    teaching_assignment.teacher_id = data["teacher_id"]
    teaching_assignment.class_id = data["class_id"]
    teaching_assignment.subject_id = data["subject_id"]

    db.session.commit()

    return jsonify({
        "message": "Teaching assignment updated successfully"
    })


# DELETE TEACHING ASSIGNMENT
@app.route("/api/teaching-assignments/<int:teaching_assignment_id>", methods=["DELETE"])
def delete_teaching_assignment(teaching_assignment_id):
    teaching_assignment = TeachingAssignment.query.filter_by(
        id=teaching_assignment_id
    ).first()

    if teaching_assignment is None:
        return jsonify({
            "error": "Teaching assignment not found"
        }), 404

    db.session.delete(teaching_assignment)
    db.session.commit()

    return jsonify({
        "message": "Teaching assignment deleted successfully"
    })

# ==================== ACADEMIC SESSION CRUD ====================

# CREATE ACADEMIC SESSION
@app.route("/api/academic-sessions", methods=["POST"])
def create_academic_session():
    data = request.get_json()

    academic_session = AcademicSession(
        session=data["session"],
        term=data["term"]
    )

    db.session.add(academic_session)
    db.session.commit()

    return jsonify({
        "message": "Academic session created successfully"
    })


# GET ALL ACADEMIC SESSIONS
@app.route("/api/academic-sessions", methods=["GET"])
def get_academic_sessions():
    academic_sessions = AcademicSession.query.all()
    academic_sessions_data = []

    for academic_session in academic_sessions:
        academic_session_data = {
            "id": academic_session.id,
            "session": academic_session.session,
            "term": academic_session.term
        }

        academic_sessions_data.append(academic_session_data)

    return jsonify(academic_sessions_data)


# GET ONE ACADEMIC SESSION
@app.route("/api/academic-sessions/<int:academic_session_id>")
def get_academic_session(academic_session_id):
    academic_session = AcademicSession.query.filter_by(
        id=academic_session_id
    ).first()

    if academic_session is None:
        return jsonify({
            "error": "Academic session not found"
        }), 404

    return jsonify({
        "id": academic_session.id,
        "session": academic_session.session,
        "term": academic_session.term
    })


# UPDATE ACADEMIC SESSION
@app.route("/api/academic-sessions/<int:academic_session_id>", methods=["PUT"])
def update_academic_session(academic_session_id):
    academic_session = AcademicSession.query.filter_by(
        id=academic_session_id
    ).first()

    if academic_session is None:
        return jsonify({
            "error": "Academic session not found"
        }), 404

    data = request.get_json()

    academic_session.session = data["session"]
    academic_session.term = data["term"]

    db.session.commit()

    return jsonify({
        "message": "Academic session updated successfully"
    })


# DELETE ACADEMIC SESSION
@app.route("/api/academic-sessions/<int:academic_session_id>", methods=["DELETE"])
def delete_academic_session(academic_session_id):
    academic_session = AcademicSession.query.filter_by(
        id=academic_session_id
    ).first()

    if academic_session is None:
        return jsonify({
            "error": "Academic session not found"
        }), 404

    db.session.delete(academic_session)
    db.session.commit()

    return jsonify({
        "message": "Academic session deleted successfully"
    })


# ==================== RESULT CRUD ====================

# CREATE RESULT
@app.route("/api/results", methods=["POST"])
def create_result():
    data = request.get_json()

    result = Result(
        student_id=data["student_id"],
        subject_id=data["subject_id"],
        score=data["score"],
        grade=data["grade"],
        academic_session_id=data["academic_session_id"]
    )

    db.session.add(result)
    db.session.commit()

    return jsonify({
        "message": "Result created successfully"
    })


# GET ALL RESULTS
@app.route("/api/results", methods=["GET"])
def get_results():
    results = Result.query.all()
    results_data = []

    for result in results:
        result_data = {
            "id": result.id,
            "student_id": result.student_id,
            "subject_id": result.subject_id,
            "score": result.score,
            "grade": result.grade,
            "academic_session_id": result.academic_session_id
        }

        results_data.append(result_data)

    return jsonify(results_data)


# GET ONE RESULT
@app.route("/api/results/<int:result_id>")
def get_result(result_id):
    result = Result.query.filter_by(id=result_id).first()

    if result is None:
        return jsonify({
            "error": "Result not found"
        }), 404

    return jsonify({
        "id": result.id,
        "student_id": result.student_id,
        "subject_id": result.subject_id,
        "score": result.score,
        "grade": result.grade,
        "academic_session_id": result.academic_session_id
    })


# UPDATE RESULT
@app.route("/api/results/<int:result_id>", methods=["PUT"])
def update_result(result_id):
    result = Result.query.filter_by(id=result_id).first()

    if result is None:
        return jsonify({
            "error": "Result not found"
        }), 404

    data = request.get_json()

    result.student_id = data["student_id"]
    result.subject_id = data["subject_id"]
    result.score = data["score"]
    result.grade = data["grade"]
    result.academic_session_id = data["academic_session_id"]

    db.session.commit()

    return jsonify({
        "message": "Result updated successfully"
    })


# DELETE RESULT
@app.route("/api/results/<int:result_id>", methods=["DELETE"])
def delete_result(result_id):
    result = Result.query.filter_by(id=result_id).first()

    if result is None:
        return jsonify({
            "error": "Result not found"
        }), 404

    db.session.delete(result)
    db.session.commit()

    return jsonify({
        "message": "Result deleted successfully"
    })


@app.route("/")
def home():
    return "School portal ApI"

if __name__ ==  "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)

