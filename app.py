import os
import bcrypt

from datetime import timedelta
from dotenv import load_dotenv

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity
)

# Load environment variables from the .env file
load_dotenv()

# Create the Flask application
app = Flask(__name__)


# ==========================================
# CORS CONFIGURATION
# ==========================================

# Allow requests from the local React frontend
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Allow requests from the deployed Vercel frontend
frontend_url = os.getenv("FRONTEND_URL")

if frontend_url:
    allowed_origins.append(frontend_url.rstrip("/"))

# Apply CORS to API endpoints only
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": allowed_origins
        }
    }
)


# ==========================================
# JWT AUTHENTICATION CONFIGURATION
# ==========================================

# Get the JWT secret from environment variables
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

# Stop the application if the JWT secret is missing
if not app.config["JWT_SECRET_KEY"]:
    raise RuntimeError("JWT_SECRET_KEY is missing from the .env file")

# Set access tokens to expire after 15 minutes
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=15)

# Initialize JWT authentication
jwt = JWTManager(app)


# ==========================================
# DATABASE CONFIGURATION
# ==========================================

# Get the PostgreSQL connection string from environment variables
database_url = os.getenv("DATABASE_URL")

# Stop the application if the database URL is missing
if not database_url:
    raise RuntimeError("DATABASE_URL is missing from the .env file")

# Convert PostgreSQL URLs to use the psycopg driver
if database_url.startswith("postgres://"):
    database_url = database_url.replace(
        "postgres://",
        "postgresql+psycopg://",
        1
    )

elif database_url.startswith("postgresql://"):
    database_url = database_url.replace(
        "postgresql://",
        "postgresql+psycopg://",
        1
    )

# Configure SQLAlchemy
app.config["SQLALCHEMY_DATABASE_URI"] = database_url

# Initialize SQLAlchemy
db = SQLAlchemy(app)


@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "error": "Resource not found"
    }), 404

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({
        "error": "Method not allowed"
    }), 405

@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({
        "error": "Internal server error"
    }), 500

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
# CREATE USER (ADMIN ONLY)
@app.route("/api/users", methods=["POST"])
@jwt_required()
def create_user():
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    if current_user.role != "admin":
        return jsonify({"error": "Access forbidden"}), 403

    data = request.get_json()

    if not isinstance(data, dict):
        return jsonify({"error": "A valid JSON object is required"}), 400

    required_fields = ["name", "email", "password", "role"]

    if not all(field in data for field in required_fields):
        return jsonify({"error": "Name, email, password, and role are required"}), 400

    if not all(
        isinstance(data[field], str) and data[field].strip()
        for field in required_fields
    ):
        return jsonify({"error": "All fields must be non-empty strings"}), 400

    name = data["name"].strip()
    email = data["email"].strip().lower()
    password = data["password"]
    role = data["role"].strip().lower()

    if role not in ["student", "teacher"]:
        return jsonify({"error": "Role must be student or teacher"}), 400

    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        return jsonify({"error": "Email is already registered"}), 409

    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    user = User(
        name=name,
        email=email,
        password_hash=hashed_password,
        role=role
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": f"{role.capitalize()} account created successfully"
    }), 201

# GET ALL USERS (ADMIN ONLY)
@app.route("/api/users", methods=["GET"])
@jwt_required()
def get_users():
    # Get the ID of the authenticated user
    current_user_id = get_jwt_identity()

    # Find the user in the database
    current_user = db.session.get(User, current_user_id)

    # Check whether the user exists
    if current_user is None:
        return jsonify({
            "error": "User not found"
        }), 404

    # Check whether the user is an administrator
    if current_user.role != "admin":
        return jsonify({
            "error": "Access forbidden"
        }), 403

    # Retrieve all users
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

    return jsonify(users_data), 200


# GET ONE USER (ADMIN ONLY)
@app.route("/api/users/<int:user_id>", methods=["GET"])
@jwt_required()  # Require a valid access token
def get_user(user_id):

    # 1. Identify the user making the request
    current_user_id = get_jwt_identity()

    # 2. Find the authenticated user in the database
    current_user = db.session.get(User, current_user_id)

    # Reject the request if the authenticated user doesn't exist
    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # 3. Only admins can view individual user accounts
    if current_user.role != "admin":
        return jsonify({"error": "Access forbidden"}), 403

    # 4. Find the requested user
    user = db.session.get(User, user_id)

    if user is None:
        return jsonify({
            "error": "User not found"
        }), 404

    # 5. Return the user's public information
    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role
    }), 200



# UPDATE USER (ADMIN ONLY)
@app.route("/api/users/<int:user_id>", methods=["PUT"])
@jwt_required()  # Require a valid access token
def update_user(user_id):

    # 1. Identify the user making the request
    current_user_id = get_jwt_identity()

    # 2. Find the authenticated user in the database
    current_user = db.session.get(User, current_user_id)

    # Reject the request if the authenticated user no longer exists
    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # 3. Only administrators can update user accounts
    if current_user.role != "admin":
        return jsonify({"error": "Access forbidden"}), 403

    # 4. Find the account the admin wants to update
    user = db.session.get(User, user_id)

    if user is None:
        return jsonify({"error": "User not found"}), 404

    # 5. Read the incoming JSON request body
    data = request.get_json()

    # Ensure the request contains a valid JSON object
    if not isinstance(data, dict):
        return jsonify({
            "error": "A valid JSON object is required"
        }), 400

    # 6. Update the user's name if provided
    if "name" in data:
        if not isinstance(data["name"], str) or not data["name"].strip():
            return jsonify({
                "error": "Name must be a non-empty string"
            }), 400

        user.name = data["name"].strip()

    # 7. Update the user's email if provided
    if "email" in data:
        if not isinstance(data["email"], str) or not data["email"].strip():
            return jsonify({
                "error": "Email must be a non-empty string"
            }), 400

        # Normalize the email to lowercase
        email = data["email"].strip().lower()

        # Check whether another user already has this email
        existing_user = User.query.filter_by(email=email).first()

        if existing_user and existing_user.id != user.id:
            return jsonify({
                "error": "Email is already registered"
            }), 409

        user.email = email

    # 8. Update the password if provided
    if "password" in data:
        if not isinstance(data["password"], str) or not data["password"]:
            return jsonify({
                "error": "Password must be a non-empty string"
            }), 400

        # Hash the new password before storing it
        hashed_password = bcrypt.hashpw(
            data["password"].encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        user.password_hash = hashed_password

    # 9. Update the user's role if provided
    if "role" in data:
        role = data["role"]

        # Only allow student or teacher roles through this endpoint
        if not isinstance(role, str) or role not in ["student", "teacher"]:
            return jsonify({
                "error": "Role must be student or teacher"
            }), 400

        user.role = role

    # 10. Save the changes to the database
    db.session.commit()

    # 11. Return a success response
    return jsonify({
        "message": "User updated successfully"
    }), 200

# DELETE USER (ADMIN ONLY)
@app.route("/api/users/<int:user_id>", methods=["DELETE"])
@jwt_required()  # Require a valid access token
def delete_user(user_id):

    # 1. Identify the user making the request
    current_user_id = get_jwt_identity()

    # 2. Find the authenticated user in the database
    current_user = db.session.get(User, current_user_id)

    # Reject the request if the authenticated user doesn't exist
    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # 3. Only admins can delete user accounts
    if current_user.role != "admin":
        return jsonify({"error": "Access forbidden"}), 403

    # 4. Find the account the admin wants to delete
    user = db.session.get(User, user_id)

    if user is None:
        return jsonify({"error": "User not found"}), 404

    # 5. Delete the account from the database
    db.session.delete(user)
    db.session.commit()

    # 6. Confirm successful deletion
    return jsonify({
        "message": "User deleted successfully"
    }), 200

# ==================== STUDENT CRUD ====================
# CREATE STUDENT (ADMIN ONLY)
@app.route("/api/students", methods=["POST"])
@jwt_required()  # Require a valid access token
def create_student():

    # 1. Identify the user making the request
    current_user_id = get_jwt_identity()

    # 2. Find the authenticated user in the database
    current_user = db.session.get(User, current_user_id)

    # Reject the request if the user no longer exists
    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # 3. Only admins can create student profiles
    if current_user.role != "admin":
        return jsonify({"error": "Access forbidden"}), 403

    # 4. Read the incoming JSON data
    data = request.get_json()

    # Ensure the request contains a valid JSON object
    if not isinstance(data, dict):
        return jsonify({
            "error": "A valid JSON object is required"
        }), 400

    # 5. Check that all required fields are provided
    required_fields = ["user_id", "admission_number", "class_id"]

    if not all(field in data for field in required_fields):
        return jsonify({
            "error": "user_id, admission_number, and class_id are required"
        }), 400

    # 6. Validate the ID fields
    if type(data["user_id"]) is not int or type(data["class_id"]) is not int:
        return jsonify({
            "error": "user_id and class_id must be integers"
        }), 400

    # Validate the admission number
    if not isinstance(data["admission_number"], str) or not data["admission_number"].strip():
        return jsonify({
            "error": "Admission number must be a non-empty string"
        }), 400

    # 7. Check that the user account exists
    user = db.session.get(User, data["user_id"])

    if user is None:
        return jsonify({"error": "User not found"}), 404

    # Only accounts with the student role can have student profiles
    if user.role != "student":
        return jsonify({
            "error": "The selected user must have the student role"
        }), 400

    # 8. Check that the class exists
    school_class = db.session.get(Class, data["class_id"])

    if school_class is None:
        return jsonify({"error": "Class not found"}), 404

    # 9. Create the student profile
    student = Student(
        user_id=data["user_id"],
        admission_number=data["admission_number"].strip(),
        class_id=data["class_id"]
    )

    db.session.add(student)
    db.session.commit()

    # 10. Confirm successful creation
    return jsonify({
        "message": "Student created successfully"
    }), 201


# GET ALL STUDENTS (ADMIN ONLY)
@app.route("/api/students", methods=["GET"])
@jwt_required()  # Require a valid access token
def get_students():

    # 1. Identify the user making the request
    current_user_id = get_jwt_identity()

    # 2. Find the authenticated user in the database
    current_user = db.session.get(User, current_user_id)

    # Reject the request if the user no longer exists
    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # 3. Only admins can view all student profiles
    if current_user.role != "admin":
        return jsonify({"error": "Access forbidden"}), 403

    # 4. Retrieve all student profiles
    students = Student.query.all()

    # Prepare a list to hold the student information
    students_data = []

    # 5. Convert each student object into a dictionary
    for student in students:
        student_data = {
            "id": student.id,
            "user_id": student.user_id,
            "admission_number": student.admission_number,
            "class_id": student.class_id
        }

        students_data.append(student_data)

    # 6. Return the student list
    return jsonify(students_data), 200


# GET ONE STUDENT (AUTHENTICATED USERS)
@app.route("/api/students/<int:student_id>", methods=["GET"])
@jwt_required()  # Require a valid access token
def get_student(student_id):

    # 1. Identify the user making the request
    current_user_id = get_jwt_identity()

    # 2. Find the authenticated user in the database
    current_user = db.session.get(User, current_user_id)

    # Reject the request if the user no longer exists
    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # 3. Find the requested student profile
    student = db.session.get(Student, student_id)

    if student is None:
        return jsonify({
            "error": "Student not found"
        }), 404

    # 4. Only admins can view any student's profile
    if current_user.role == "admin":
        pass

    # 5. Students can view only their own profile
    elif current_user.role == "student":
        if student.user_id != current_user.id:
            return jsonify({
                "error": "Access forbidden"
            }), 403

    # 6. Teachers cannot access student profiles through this endpoint yet
    else:
        return jsonify({
            "error": "Access forbidden"
        }), 403

    # 7. Return the student's profile
    return jsonify({
        "id": student.id,
        "user_id": student.user_id,
        "admission_number": student.admission_number,
        "class_id": student.class_id
    }), 200

# UPDATE STUDENT (ADMIN ONLY)
@app.route("/api/students/<int:student_id>", methods=["PUT"])
@jwt_required()
def update_student(student_id):
    # 1. Identify the authenticated user
    current_user_id = get_jwt_identity()

    # 2. Find the user in the database
    current_user = db.session.get(User, current_user_id)

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # 3. Only admins can update student profiles
    if current_user.role != "admin":
        return jsonify({"error": "Access forbidden"}), 403

    # 4. Find the student profile
    student = db.session.get(Student, student_id)

    if student is None:
        return jsonify({"error": "Student not found"}), 404

    # 5. Read and validate the request body
    data = request.get_json()

    if not isinstance(data, dict):
        return jsonify({"error": "A valid JSON object is required"}), 400

    required_fields = ["admission_number", "class_id"]

    if not all(field in data for field in required_fields):
        return jsonify({
            "error": "admission_number and class_id are required"
        }), 400

    # 6. Validate the admission number
    if (
        not isinstance(data["admission_number"], str)
        or not data["admission_number"].strip()
    ):
        return jsonify({
            "error": "Admission number must be a non-empty string"
        }), 400

    # 7. Validate the class ID
    if type(data["class_id"]) is not int:
        return jsonify({
            "error": "class_id must be an integer"
        }), 400

    # 8. Confirm that the requested class exists
    school_class = db.session.get(Class, data["class_id"])

    if school_class is None:
        return jsonify({"error": "Class not found"}), 404

    # 9. Update the student profile
    student.admission_number = data["admission_number"].strip()
    student.class_id = data["class_id"]

    # 10. Save the changes
    db.session.commit()

    return jsonify({
        "message": "Student updated successfully",
        "student": {
            "id": student.id,
            "user_id": student.user_id,
            "admission_number": student.admission_number,
            "class_id": student.class_id
        }
    }), 200

# DELETE STUDENT (ADMIN ONLY)
@app.route("/api/students/<int:student_id>", methods=["DELETE"])
@jwt_required()
def delete_student(student_id):
    # 1. Identify the authenticated user
    current_user_id = get_jwt_identity()

    # 2. Find the user in the database
    current_user = db.session.get(User, current_user_id)

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # 3. Only admins can delete student profiles
    if current_user.role != "admin":
        return jsonify({"error": "Access forbidden"}), 403

    # 4. Find the student profile
    student = db.session.get(Student, student_id)

    if student is None:
        return jsonify({"error": "Student not found"}), 404

    # 5. Delete the student profile
    db.session.delete(student)
    db.session.commit()

    return jsonify({
        "message": "Student deleted successfully"
    }), 200

# ==================== CLASS CRUD ====================
# CREATE CLASS (ADMIN ONLY)
@app.route("/api/classes", methods=["POST"])
@jwt_required()
def create_class():
    # 1. Identify the logged-in user
    current_user_id = get_jwt_identity()

    # 2. Find the user in the database
    current_user = db.session.get(User, current_user_id)

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # 3. Only admins can create classes
    if current_user.role != "admin":
        return jsonify({"error": "Access forbidden"}), 403

    # 4. Read the request body
    data = request.get_json()

    if not isinstance(data, dict):
        return jsonify({"error": "A valid JSON object is required"}), 400

    # 5. Validate the class name
    name = data.get("name")

    if not isinstance(name, str) or not name.strip():
        return jsonify({"error": "A valid class name is required"}), 400

    # 6. Create the class
    new_class = Class(name=name.strip())

    db.session.add(new_class)
    db.session.commit()

    # 7. Return the successful response
    return jsonify({
        "message": "Class created successfully",
        "class": {
            "id": new_class.id,
            "name": new_class.name
        }
    }), 201



# GET ALL CLASSES (ADMIN ONLY)
@app.route("/api/classes", methods=["GET"])
@jwt_required()
def get_classes():
    # 1. Identify the logged-in user
    current_user_id = get_jwt_identity()

    # 2. Find the user in the database
    current_user = db.session.get(User, current_user_id)

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # 3. Only admins can view all classes
    if current_user.role != "admin":
        return jsonify({"error": "Access forbidden"}), 403

    # 4. Retrieve all classes
    classes = Class.query.all()

    # 5. Convert the classes into a list of dictionaries
    classes_data = []

    for school_class in classes:
        class_data = {
            "id": school_class.id,
            "name": school_class.name
        }

        classes_data.append(class_data)

    # 6. Return the list of classes
    return jsonify(classes_data), 200

# GET ONE CLASS (ADMIN, ASSIGNED TEACHER, OR STUDENT IN THAT CLASS)
@app.route("/api/classes/<int:class_id>", methods=["GET"])
@jwt_required()
def get_class(class_id):

    # 1. Identify the logged-in user
    current_user_id = get_jwt_identity()

    # 2. Find the user in the database
    current_user = db.session.get(User, current_user_id)

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # 3. Find the requested class
    school_class = db.session.get(Class, class_id)

    if school_class is None:
        return jsonify({"error": "Class not found"}), 404

    # 4. Admins can view any class
    if current_user.role == "admin":
        pass

    # 5. Students can view only their own class
    elif current_user.role == "student":

        student = Student.query.filter_by(
            user_id=current_user.id
        ).first()

        if student is None:
            return jsonify({
                "error": "Student profile not found"
            }), 404

        if student.class_id != school_class.id:
            return jsonify({
                "error": "You can only view your own class"
            }), 403

    # 6. Teachers can view only classes assigned to them
    elif current_user.role == "teacher":

        teacher = Teacher.query.filter_by(
            user_id=current_user.id
        ).first()

        if teacher is None:
            return jsonify({
                "error": "Teacher profile not found"
            }), 404

        assignment = TeachingAssignment.query.filter_by(
            teacher_id=teacher.id,
            class_id=school_class.id
        ).first()

        if assignment is None:
            return jsonify({
                "error": "You are not assigned to this class"
            }), 403

    # 7. Reject any unrecognized role
    else:
        return jsonify({"error": "Access forbidden"}), 403

    # 8. Return the class details
    return jsonify({
        "id": school_class.id,
        "name": school_class.name
    }), 200

# UPDATE CLASS (ADMIN ONLY)
@app.route("/api/classes/<int:class_id>", methods=["PUT"])
@jwt_required()
def update_class(class_id):
    # 1. Identify the logged-in user
    current_user_id = get_jwt_identity()
    # 2. Find the user in the database
    current_user = db.session.get(User, current_user_id)

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # 3. Only admins can update classes
    if current_user.role != "admin":
        return jsonify({"error": "Access forbidden"}), 403

    # 4. Find the class to update
    school_class = db.session.get(Class, class_id)

    if school_class is None:
        return jsonify({"error": "Class not found"}), 404

    # 5. Read and validate the request body
    data = request.get_json()

    if not isinstance(data, dict):
        return jsonify({"error": "A valid JSON object is required"}), 400

    name = data.get("name")

    if not isinstance(name, str) or not name.strip():
        return jsonify({"error": "A valid class name is required"}), 400

    # 6. Update the class name
    school_class.name = name.strip()

    # 7. Save the changes
    db.session.commit()

    return jsonify({
        "message": "Class updated successfully",
        "class": {
            "id": school_class.id,
            "name": school_class.name
        }
    }), 200

# DELETE CLASS (ADMIN ONLY)
@app.route("/api/classes/<int:class_id>", methods=["DELETE"])
@jwt_required()
def delete_class(class_id):
    # 1. Identify the logged-in user
    current_user_id = get_jwt_identity()

    # 2. Find the user in the database
    current_user = db.session.get(User, current_user_id)

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # 3. Only admins can delete classes
    if current_user.role != "admin":
        return jsonify({"error": "Access forbidden"}), 403

    # 4. Find the class to delete
    school_class = db.session.get(Class, class_id)

    if school_class is None:
        return jsonify({"error": "Class not found"}), 404

    # 5. Delete the class
    db.session.delete(school_class)
    db.session.commit()

    return jsonify({
        "message": "Class deleted successfully"
    }), 200

# ==================== TEACHER CRUD ====================
# CREATE TEACHER (ADMIN ONLY)
@app.route("/api/teachers", methods=["POST"])
@jwt_required()
def create_teacher():
    # Identify the logged-in user
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # Only admins can create teacher profiles
    if current_user.role != "admin":
        return jsonify({"error": "Access forbidden"}), 403

    # Validate request data
    data = request.get_json()

    if not isinstance(data, dict):
        return jsonify({"error": "A valid JSON object is required"}), 400

    user_id = data.get("user_id")

    if type(user_id) is not int:
        return jsonify({"error": "user_id must be an integer"}), 400

    # Find the associated User account
    user = db.session.get(User, user_id)

    if user is None:
        return jsonify({"error": "User not found"}), 404

    if user.role != "teacher":
        return jsonify({
            "error": "The selected user must have the teacher role"
        }), 400

    # Prevent duplicate teacher profiles
    existing_teacher = Teacher.query.filter_by(user_id=user_id).first()

    if existing_teacher is not None:
        return jsonify({
            "error": "This user already has a teacher profile"
        }), 409

    # Create the teacher profile
    teacher = Teacher(user_id=user_id)

    db.session.add(teacher)
    db.session.commit()

    return jsonify({
        "message": "Teacher created successfully",
        "teacher": {
            "id": teacher.id,
            "user_id": teacher.user_id
        }
    }), 201

# GET ALL TEACHERS (ADMIN ONLY)
@app.route("/api/teachers", methods=["GET"])
@jwt_required()
def get_teachers():
    # Identify the logged-in user
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # Only admins can view all teacher profiles
    if current_user.role != "admin":
        return jsonify({"error": "Access forbidden"}), 403

    # Retrieve all teacher profiles
    teachers = Teacher.query.all()

    teachers_data = []

    for teacher in teachers:
        teachers_data.append({
            "id": teacher.id,
            "user_id": teacher.user_id
        })

    return jsonify(teachers_data), 200


# GET ONE TEACHER (ADMIN ONLY)
@app.route("/api/teachers/<int:teacher_id>", methods=["GET"])
@jwt_required()
def get_teacher(teacher_id):
    # Identify the logged-in user
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # Only admins can view teacher profiles through this endpoint
    if current_user.role != "admin":
        return jsonify({"error": "Access forbidden"}), 403

    # Find the requested teacher
    teacher = db.session.get(Teacher, teacher_id)

    if teacher is None:
        return jsonify({"error": "Teacher not found"}), 404

    return jsonify({
        "id": teacher.id,
        "user_id": teacher.user_id
    }), 200


# UPDATE TEACHER (ADMIN ONLY)
@app.route("/api/teachers/<int:teacher_id>", methods=["PUT"])
@jwt_required()
def update_teacher(teacher_id):
    # Identify the logged-in user
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # Only admins can update teacher profiles
    if current_user.role != "admin":
        return jsonify({"error": "Access forbidden"}), 403

    # Find the teacher profile
    teacher = db.session.get(Teacher, teacher_id)

    if teacher is None:
        return jsonify({"error": "Teacher not found"}), 404

    # Validate request data
    data = request.get_json()

    if not isinstance(data, dict):
        return jsonify({"error": "A valid JSON object is required"}), 400

    user_id = data.get("user_id")

    if type(user_id) is not int:
        return jsonify({"error": "user_id must be an integer"}), 400

    # Find the replacement User account
    user = db.session.get(User, user_id)

    if user is None:
        return jsonify({"error": "User not found"}), 404

    if user.role != "teacher":
        return jsonify({
            "error": "The selected user must have the teacher role"
        }), 400

    # Prevent assigning the same User account to another teacher profile
    existing_teacher = Teacher.query.filter_by(user_id=user_id).first()

    if existing_teacher is not None and existing_teacher.id != teacher.id:
        return jsonify({
            "error": "This user already has a teacher profile"
        }), 409

    # Update the teacher profile
    teacher.user_id = user_id

    db.session.commit()

    return jsonify({
        "message": "Teacher updated successfully",
        "teacher": {
            "id": teacher.id,
            "user_id": teacher.user_id
        }
    }), 200


# DELETE TEACHER (ADMIN ONLY)
@app.route("/api/teachers/<int:teacher_id>", methods=["DELETE"])
@jwt_required()
def delete_teacher(teacher_id):
    # Identify the logged-in user
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # Only admins can delete teacher profiles
    if current_user.role != "admin":
        return jsonify({"error": "Access forbidden"}), 403

    # Find the teacher profile
    teacher = db.session.get(Teacher, teacher_id)

    if teacher is None:
        return jsonify({"error": "Teacher not found"}), 404

    # Delete the teacher profile
    db.session.delete(teacher)
    db.session.commit()

    return jsonify({
        "message": "Teacher deleted successfully"
    }), 200

# ==================== CREATE SUBJECT (ADMIN ONLY) ====================

@app.route("/api/subjects", methods=["POST"])
@jwt_required()
def create_subject():
    # Identify the currently logged-in user
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    # Check whether the user exists
    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # Only admins can create subjects
    if current_user.role != "admin":
        return jsonify({"error": "Access forbidden"}), 403

    # Read and validate the JSON request body
    data = request.get_json()

    if not isinstance(data, dict):
        return jsonify({"error": "A valid JSON object is required"}), 400

    name = data.get("name")

    if not isinstance(name, str) or not name.strip():
        return jsonify({"error": "A valid subject name is required"}), 400

    # Create the subject
    new_subject = Subject(name=name.strip())

    db.session.add(new_subject)
    db.session.commit()

    return jsonify({
        "message": "Subject created successfully",
        "subject": {
            "id": new_subject.id,
            "name": new_subject.name
        }
    }), 201

# ==================== GET ALL SUBJECTS ====================

@app.route("/api/subjects", methods=["GET"])
@jwt_required()
def get_subjects():
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # Admins can view all subjects
    if current_user.role == "admin":
        subjects = Subject.query.all()

    # Students can view subjects taught to their class
    elif current_user.role == "student":
        student = Student.query.filter_by(
            user_id=current_user.id
        ).first()

        if student is None:
            return jsonify({
                "error": "Student profile not found"
            }), 404

        assignments = TeachingAssignment.query.filter_by(
            class_id=student.class_id
        ).all()

        subject_ids = {
            assignment.subject_id for assignment in assignments
        }

        subjects = Subject.query.filter(
            Subject.id.in_(subject_ids)
        ).all()

    # Teachers can view subjects assigned to them
    elif current_user.role == "teacher":
        teacher = Teacher.query.filter_by(
            user_id=current_user.id
        ).first()

        if teacher is None:
            return jsonify({
                "error": "Teacher profile not found"
            }), 404

        assignments = TeachingAssignment.query.filter_by(
            teacher_id=teacher.id
        ).all()

        subject_ids = {
            assignment.subject_id for assignment in assignments
        }

        subjects = Subject.query.filter(
            Subject.id.in_(subject_ids)
        ).all()

    else:
        return jsonify({"error": "Access forbidden"}), 403

    subjects_data = [
        {
            "id": subject.id,
            "name": subject.name
        }
        for subject in subjects
    ]

    return jsonify(subjects_data), 200


# ==================== GET ONE SUBJECT ====================

@app.route("/api/subjects/<int:subject_id>", methods=["GET"])
@jwt_required()
def get_subject(subject_id):
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    subject = db.session.get(Subject, subject_id)

    if subject is None:
        return jsonify({"error": "Subject not found"}), 404

    # Admins can view any subject
    if current_user.role == "admin":
        pass

    # Students can view subjects assigned to their class
    elif current_user.role == "student":
        student = Student.query.filter_by(
            user_id=current_user.id
        ).first()

        if student is None:
            return jsonify({
                "error": "Student profile not found"
            }), 404

        assignment = TeachingAssignment.query.filter_by(
            class_id=student.class_id,
            subject_id=subject.id
        ).first()

        if assignment is None:
            return jsonify({
                "error": "This subject is not assigned to your class"
            }), 403

    # Teachers can view subjects assigned to them
    elif current_user.role == "teacher":
        teacher = Teacher.query.filter_by(
            user_id=current_user.id
        ).first()

        if teacher is None:
            return jsonify({
                "error": "Teacher profile not found"
            }), 404

        assignment = TeachingAssignment.query.filter_by(
            teacher_id=teacher.id,
            subject_id=subject.id
        ).first()

        if assignment is None:
            return jsonify({
                "error": "You are not assigned to this subject"
            }), 403

    else:
        return jsonify({"error": "Access forbidden"}), 403

    return jsonify({
        "id": subject.id,
        "name": subject.name
    }), 200


# ==================== UPDATE SUBJECT (ADMIN ONLY) ====================

@app.route("/api/subjects/<int:subject_id>", methods=["PUT"])
@jwt_required()
def update_subject(subject_id):
    # Identify the currently logged-in user
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # Only admins can update subjects
    if current_user.role != "admin":
        return jsonify({"error": "Access forbidden"}), 403

    # Find the subject
    subject = db.session.get(Subject, subject_id)

    if subject is None:
        return jsonify({"error": "Subject not found"}), 404

    # Validate the request body
    data = request.get_json()

    if not isinstance(data, dict):
        return jsonify({"error": "A valid JSON object is required"}), 400

    name = data.get("name")

    if not isinstance(name, str) or not name.strip():
        return jsonify({"error": "A valid subject name is required"}), 400

    # Update the subject
    subject.name = name.strip()

    db.session.commit()

    return jsonify({
        "message": "Subject updated successfully",
        "subject": {
            "id": subject.id,
            "name": subject.name
        }
    }), 200


# ==================== DELETE SUBJECT (ADMIN ONLY) ====================

@app.route("/api/subjects/<int:subject_id>", methods=["DELETE"])
@jwt_required()
def delete_subject(subject_id):
    # Identify the currently logged-in user
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # Only admins can delete subjects
    if current_user.role != "admin":
        return jsonify({"error": "Access forbidden"}), 403

    # Find the subject
    subject = db.session.get(Subject, subject_id)

    if subject is None:
        return jsonify({"error": "Subject not found"}), 404

    # Delete the subject
    db.session.delete(subject)
    db.session.commit()

    return jsonify({
        "message": "Subject deleted successfully"
    }), 200


# ==================== CREATE TEACHING ASSIGNMENT (ADMIN ONLY) ====================

@app.route("/api/teaching-assignments", methods=["POST"])
@jwt_required()
def create_teaching_assignment():
    # Identify the logged-in user
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # Only admins can create teaching assignments
    if current_user.role != "admin":
        return jsonify({"error": "Access forbidden"}), 403

    # Validate the request body
    data = request.get_json()

    if not isinstance(data, dict):
        return jsonify({"error": "A valid JSON object is required"}), 400

    teacher_id = data.get("teacher_id")
    class_id = data.get("class_id")
    subject_id = data.get("subject_id")

    # Validate the IDs
    if any(
        isinstance(value, bool) or not isinstance(value, int) or value <= 0
        for value in (teacher_id, class_id, subject_id)
    ):
        return jsonify({
            "error": "teacher_id, class_id, and subject_id must be positive integers"
        }), 400

    # Check that the teacher profile exists
    teacher = db.session.get(Teacher, teacher_id)

    if teacher is None:
        return jsonify({"error": "Teacher not found"}), 404

    # Check that the class exists
    school_class = db.session.get(Class, class_id)

    if school_class is None:
        return jsonify({"error": "Class not found"}), 404

    # Check that the subject exists
    subject = db.session.get(Subject, subject_id)

    if subject is None:
        return jsonify({"error": "Subject not found"}), 404

    # Prevent duplicate assignments for the same teacher, class, and subject
    existing_assignment = TeachingAssignment.query.filter_by(
        teacher_id=teacher_id,
        class_id=class_id,
        subject_id=subject_id
    ).first()

    if existing_assignment is not None:
        return jsonify({
            "error": "This teaching assignment already exists"
        }), 409

    # Create the assignment
    new_assignment = TeachingAssignment(
        teacher_id=teacher_id,
        class_id=class_id,
        subject_id=subject_id
    )

    db.session.add(new_assignment)
    db.session.commit()

    return jsonify({
        "message": "Teaching assignment created successfully",
        "teaching_assignment": {
            "id": new_assignment.id,
            "teacher_id": new_assignment.teacher_id,
            "class_id": new_assignment.class_id,
            "subject_id": new_assignment.subject_id
        }
    }), 201


# ==================== GET ALL TEACHING ASSIGNMENTS (ADMIN ONLY) ====================

@app.route("/api/teaching-assignments", methods=["GET"])
@jwt_required()
def get_teaching_assignments():
    # Identify the logged-in user
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # Only admins can view all teaching assignments
    if current_user.role != "admin":
        return jsonify({"error": "Access forbidden"}), 403

    # Retrieve all assignments
    teaching_assignments = TeachingAssignment.query.all()

    assignments_data = []

    for assignment in teaching_assignments:
        assignments_data.append({
            "id": assignment.id,
            "teacher_id": assignment.teacher_id,
            "class_id": assignment.class_id,
            "subject_id": assignment.subject_id
        })

    return jsonify(assignments_data), 200


# ==================== GET ONE TEACHING ASSIGNMENT (ADMIN ONLY) ====================

@app.route(
    "/api/teaching-assignments/<int:teaching_assignment_id>",
    methods=["GET"]
)
@jwt_required()
def get_teaching_assignment(teaching_assignment_id):
    # Identify the logged-in user
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # Only admins can view individual assignments through this endpoint
    if current_user.role != "admin":
        return jsonify({"error": "Access forbidden"}), 403

    # Find the assignment
    assignment = db.session.get(
        TeachingAssignment,
        teaching_assignment_id
    )

    if assignment is None:
        return jsonify({"error": "Teaching assignment not found"}), 404

    return jsonify({
        "id": assignment.id,
        "teacher_id": assignment.teacher_id,
        "class_id": assignment.class_id,
        "subject_id": assignment.subject_id
    }), 200


# ==================== UPDATE TEACHING ASSIGNMENT (ADMIN ONLY) ====================

@app.route(
    "/api/teaching-assignments/<int:teaching_assignment_id>",
    methods=["PUT"]
)
@jwt_required()
def update_teaching_assignment(teaching_assignment_id):
    # Identify the logged-in user
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # Only admins can update teaching assignments
    if current_user.role != "admin":
        return jsonify({"error": "Access forbidden"}), 403

    # Find the assignment
    assignment = db.session.get(
        TeachingAssignment,
        teaching_assignment_id
    )

    if assignment is None:
        return jsonify({"error": "Teaching assignment not found"}), 404

    # Validate the request body
    data = request.get_json()

    if not isinstance(data, dict):
        return jsonify({"error": "A valid JSON object is required"}), 400

    teacher_id = data.get("teacher_id")
    class_id = data.get("class_id")
    subject_id = data.get("subject_id")

    # All three fields are required for this PUT request
    if any(
        isinstance(value, bool) or not isinstance(value, int) or value <= 0
        for value in (teacher_id, class_id, subject_id)
    ):
        return jsonify({
            "error": "teacher_id, class_id, and subject_id must be positive integers"
        }), 400

    # Verify the teacher profile
    teacher = db.session.get(Teacher, teacher_id)

    if teacher is None:
        return jsonify({"error": "Teacher not found"}), 404

    # Verify the class
    school_class = db.session.get(Class, class_id)

    if school_class is None:
        return jsonify({"error": "Class not found"}), 404

    # Verify the subject
    subject = db.session.get(Subject, subject_id)

    if subject is None:
        return jsonify({"error": "Subject not found"}), 404

    # Prevent duplicate assignments, excluding this assignment itself
    duplicate = TeachingAssignment.query.filter_by(
        teacher_id=teacher_id,
        class_id=class_id,
        subject_id=subject_id
    ).filter(
        TeachingAssignment.id != assignment.id
    ).first()

    if duplicate is not None:
        return jsonify({
            "error": "This teaching assignment already exists"
        }), 409

    # Update the assignment
    assignment.teacher_id = teacher_id
    assignment.class_id = class_id
    assignment.subject_id = subject_id

    db.session.commit()

    return jsonify({
        "message": "Teaching assignment updated successfully",
        "teaching_assignment": {
            "id": assignment.id,
            "teacher_id": assignment.teacher_id,
            "class_id": assignment.class_id,
            "subject_id": assignment.subject_id
        }
    }), 200


# ==================== DELETE TEACHING ASSIGNMENT (ADMIN ONLY) ====================

@app.route(
    "/api/teaching-assignments/<int:teaching_assignment_id>",
    methods=["DELETE"]
)
@jwt_required()
def delete_teaching_assignment(teaching_assignment_id):
    # Identify the logged-in user
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # Only admins can delete teaching assignments
    if current_user.role != "admin":
        return jsonify({"error": "Access forbidden"}), 403

    # Find the assignment
    assignment = db.session.get(
        TeachingAssignment,
        teaching_assignment_id
    )

    if assignment is None:
        return jsonify({"error": "Teaching assignment not found"}), 404

    # Delete the assignment
    db.session.delete(assignment)
    db.session.commit()

    return jsonify({
        "message": "Teaching assignment deleted successfully"
    }), 200


# ==================== CREATE ACADEMIC SESSION (ADMIN ONLY) ====================

@app.route("/api/academic-sessions", methods=["POST"])
@jwt_required()
def create_academic_session():
    # Identify the logged-in user
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # Only admins can create academic sessions
    if current_user.role != "admin":
        return jsonify({"error": "Access forbidden"}), 403

    # Validate the request body
    data = request.get_json()

    if not isinstance(data, dict):
        return jsonify({"error": "A valid JSON object is required"}), 400

    session_name = data.get("session")
    term = data.get("term")

    if not isinstance(session_name, str) or not session_name.strip():
        return jsonify({"error": "A valid academic session is required"}), 400

    if not isinstance(term, str) or not term.strip():
        return jsonify({"error": "A valid academic term is required"}), 400

    # Prevent duplicate session and term combinations
    existing_session = AcademicSession.query.filter_by(
        session=session_name.strip(),
        term=term.strip()
    ).first()

    if existing_session is not None:
        return jsonify({
            "error": "This academic session and term already exist"
        }), 409

    # Create the academic session
    new_academic_session = AcademicSession(
        session=session_name.strip(),
        term=term.strip()
    )

    db.session.add(new_academic_session)
    db.session.commit()

    return jsonify({
        "message": "Academic session created successfully",
        "academic_session": {
            "id": new_academic_session.id,
            "session": new_academic_session.session,
            "term": new_academic_session.term
        }
    }), 201


# ==================== GET ALL ACADEMIC SESSIONS (ADMIN ONLY) ====================

@app.route("/api/academic-sessions", methods=["GET"])
@jwt_required()
def get_academic_sessions():
    # Identify the logged-in user
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    if current_user.role != "admin":
        return jsonify({"error": "Access forbidden"}), 403

    # Retrieve all academic sessions
    academic_sessions = AcademicSession.query.all()

    sessions_data = []

    for academic_session in academic_sessions:
        sessions_data.append({
            "id": academic_session.id,
            "session": academic_session.session,
            "term": academic_session.term
        })

    return jsonify(sessions_data), 200


# ==================== GET ONE ACADEMIC SESSION (ADMIN ONLY) ====================

@app.route(
    "/api/academic-sessions/<int:academic_session_id>",
    methods=["GET"]
)
@jwt_required()
def get_academic_session(academic_session_id):
    # Identify the logged-in user
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    if current_user.role != "admin":
        return jsonify({"error": "Access forbidden"}), 403

    # Find the academic session
    academic_session = db.session.get(
        AcademicSession,
        academic_session_id
    )

    if academic_session is None:
        return jsonify({"error": "Academic session not found"}), 404

    return jsonify({
        "id": academic_session.id,
        "session": academic_session.session,
        "term": academic_session.term
    }), 200



# ==================== UPDATE ACADEMIC SESSION (ADMIN ONLY) ====================

@app.route(
    "/api/academic-sessions/<int:academic_session_id>",
    methods=["PUT"]
)
@jwt_required()
def update_academic_session(academic_session_id):
    # Identify the logged-in user
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    if current_user.role != "admin":
        return jsonify({"error": "Access forbidden"}), 403

    # Find the academic session
    academic_session = db.session.get(
        AcademicSession,
        academic_session_id
    )

    if academic_session is None:
        return jsonify({"error": "Academic session not found"}), 404

    # Validate the request body
    data = request.get_json()

    if not isinstance(data, dict):
        return jsonify({"error": "A valid JSON object is required"}), 400

    session_name = data.get("session")
    term = data.get("term")

    if not isinstance(session_name, str) or not session_name.strip():
        return jsonify({"error": "A valid academic session is required"}), 400

    if not isinstance(term, str) or not term.strip():
        return jsonify({"error": "A valid academic term is required"}), 400

    # Prevent duplicate session and term combinations
    duplicate = AcademicSession.query.filter_by(
        session=session_name.strip(),
        term=term.strip()
    ).filter(
        AcademicSession.id != academic_session.id
    ).first()

    if duplicate is not None:
        return jsonify({
            "error": "This academic session and term already exist"
        }), 409

    # Update the academic session
    academic_session.session = session_name.strip()
    academic_session.term = term.strip()

    db.session.commit()

    return jsonify({
        "message": "Academic session updated successfully",
        "academic_session": {
            "id": academic_session.id,
            "session": academic_session.session,
            "term": academic_session.term
        }
    }), 200


# ==================== DELETE ACADEMIC SESSION (ADMIN ONLY) ====================

@app.route(
    "/api/academic-sessions/<int:academic_session_id>",
    methods=["DELETE"]
)
@jwt_required()
def delete_academic_session(academic_session_id):
    # Identify the logged-in user
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    if current_user.role != "admin":
        return jsonify({"error": "Access forbidden"}), 403

    # Find the academic session
    academic_session = db.session.get(
        AcademicSession,
        academic_session_id
    )

    if academic_session is None:
        return jsonify({"error": "Academic session not found"}), 404

    # Delete the academic session
    db.session.delete(academic_session)
    db.session.commit()

    return jsonify({
        "message": "Academic session deleted successfully"
    }), 200

# ==================== CREATE RESULT ====================

@app.route("/api/results", methods=["POST"])
@jwt_required()
def create_result():

    # 1. Identify the logged-in user
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # 2. Only admins and teachers can create results
    if current_user.role not in ("admin", "teacher"):
        return jsonify({"error": "Access forbidden"}), 403

    # 3. Read and validate the request body
    data = request.get_json()

    if not isinstance(data, dict):
        return jsonify({
            "error": "A valid JSON object is required"
        }), 400

    student_id = data.get("student_id")
    subject_id = data.get("subject_id")
    score = data.get("score")
    academic_session_id = data.get("academic_session_id")

    # 4. Validate the IDs
    ids = (student_id, subject_id, academic_session_id)

    if any(
        isinstance(value, bool)
        or not isinstance(value, int)
        or value <= 0
        for value in ids
    ):
        return jsonify({
            "error": "student_id, subject_id, and academic_session_id must be positive integers"
        }), 400

    # 5. Validate the score
    if (
        isinstance(score, bool)
        or not isinstance(score, (int, float))
        or not 0 <= score <= 100
    ):
        return jsonify({
            "error": "Score must be a number between 0 and 100"
        }), 400

    # 6. Find the student profile
    student = db.session.get(Student, student_id)

    if student is None:
        return jsonify({"error": "Student not found"}), 404

    # 7. Find the subject
    subject = db.session.get(Subject, subject_id)

    if subject is None:
        return jsonify({"error": "Subject not found"}), 404

    # 8. Find the academic session
    academic_session = db.session.get(
        AcademicSession,
        academic_session_id
    )

    if academic_session is None:
        return jsonify({
            "error": "Academic session not found"
        }), 404

    # 9. Check whether this result already exists
    existing_result = Result.query.filter_by(
        student_id=student_id,
        subject_id=subject_id,
        academic_session_id=academic_session_id
    ).first()

    if existing_result:
        return jsonify({
            "error": "A result already exists for this student, subject, and academic session"
        }), 409

    # 10. Teachers must be assigned to this student's class and subject
    if current_user.role == "teacher":

        teacher = Teacher.query.filter_by(
            user_id=current_user.id
        ).first()

        if teacher is None:
            return jsonify({
                "error": "Teacher profile not found"
            }), 404

        assignment = TeachingAssignment.query.filter_by(
            teacher_id=teacher.id,
            class_id=student.class_id,
            subject_id=subject_id
        ).first()

        if assignment is None:
            return jsonify({
                "error": "You are not assigned to this class and subject"
            }), 403

    # 11. Calculate the grade on the server
    if score >= 70:
        grade = "A"
    elif score >= 60:
        grade = "B"
    elif score >= 50:
        grade = "C"
    elif score >= 45:
        grade = "D"
    elif score >= 40:
        grade = "E"
    else:
        grade = "F"

    # 12. Create the result
    new_result = Result(
        student_id=student_id,
        subject_id=subject_id,
        score=score,
        grade=grade,
        academic_session_id=academic_session_id
    )

    db.session.add(new_result)
    db.session.commit()

    # 13. Return the created result
    return jsonify({
        "message": "Result created successfully",
        "result": {
            "id": new_result.id,
            "student_id": new_result.student_id,
            "subject_id": new_result.subject_id,
            "score": new_result.score,
            "grade": new_result.grade,
            "academic_session_id": new_result.academic_session_id
        }
    }), 201

# ==================== GET ALL RESULTS ====================

@app.route("/api/results", methods=["GET"])
@jwt_required()
def get_results():
    # Identify the logged-in user
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # Admins can view every result
    if current_user.role == "admin":
        results = Result.query.all()

    # Teachers can view results within their assigned classes and subjects
    elif current_user.role == "teacher":
        teacher = Teacher.query.filter_by(
            user_id=current_user.id
        ).first()

        if teacher is None:
            return jsonify({
                "error": "Teacher profile not found"
            }), 404

        assignments = TeachingAssignment.query.filter_by(
            teacher_id=teacher.id
        ).all()

        if not assignments:
            return jsonify([]), 200

        assignment_pairs = [
            (assignment.class_id, assignment.subject_id)
            for assignment in assignments
        ]

        results = (
            Result.query
            .join(Student, Result.student_id == Student.id)
            .filter(
                db.or_(*[
                    db.and_(
                        Student.class_id == class_id,
                        Result.subject_id == subject_id
                    )
                    for class_id, subject_id in assignment_pairs
                ])
            )
            .all()
        )

    # Students cannot access the all-results endpoint
    elif current_user.role == "student":
        return jsonify({
            "error": "Access forbidden. Use your own results endpoint."
        }), 403

    else:
        return jsonify({"error": "Access forbidden"}), 403

    results_data = []

    for result in results:
        results_data.append({
            "id": result.id,
            "student_id": result.student_id,
            "subject_id": result.subject_id,
            "score": result.score,
            "grade": result.grade,
            "academic_session_id": result.academic_session_id
        })

    return jsonify(results_data), 200


# ==================== GET MY RESULTS (STUDENT) ====================

@app.route("/api/my-results", methods=["GET"])
@jwt_required()
def get_my_results():
    # Identify the logged-in user
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # Only students can access this endpoint
    if current_user.role != "student":
        return jsonify({"error": "Access forbidden"}), 403

    # Find the student profile linked to this account
    student = Student.query.filter_by(
        user_id=current_user.id
    ).first()

    if student is None:
        return jsonify({"error": "Student profile not found"}), 404

    # Retrieve only this student's results
    results = Result.query.filter_by(
        student_id=student.id
    ).all()

    # Format the results
    results_data = []

    for result in results:
        results_data.append({
            "id": result.id,
            "student_id": result.student_id,
            "subject_id": result.subject_id,
            "score": result.score,
            "grade": result.grade,
            "academic_session_id": result.academic_session_id
        })

    return jsonify(results_data), 200


# ==================== GET ONE RESULT ====================

@app.route("/api/results/<int:result_id>", methods=["GET"])
@jwt_required()
def get_result(result_id):
    # Identify the logged-in user
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # Find the result
    result = db.session.get(Result, result_id)

    if result is None:
        return jsonify({"error": "Result not found"}), 404

    # Admins can view any result
    if current_user.role == "admin":
        pass

    # Students can view only their own results
    elif current_user.role == "student":
        student = Student.query.filter_by(
            user_id=current_user.id
        ).first()

        if student is None:
            return jsonify({
                "error": "Student profile not found"
            }), 404

        if result.student_id != student.id:
            return jsonify({"error": "Access forbidden"}), 403

    # Teachers can view results for their assigned classes and subjects
    elif current_user.role == "teacher":
        teacher = Teacher.query.filter_by(
            user_id=current_user.id
        ).first()

        if teacher is None:
            return jsonify({
                "error": "Teacher profile not found"
            }), 404

        student = db.session.get(Student, result.student_id)

        assignment = TeachingAssignment.query.filter_by(
            teacher_id=teacher.id,
            class_id=student.class_id,
            subject_id=result.subject_id
        ).first()

        if assignment is None:
            return jsonify({"error": "Access forbidden"}), 403

    else:
        return jsonify({"error": "Access forbidden"}), 403

    return jsonify({
        "id": result.id,
        "student_id": result.student_id,
        "subject_id": result.subject_id,
        "score": result.score,
        "grade": result.grade,
        "academic_session_id": result.academic_session_id
    }), 200

# ==================== UPDATE RESULT ====================

@app.route("/api/results/<int:result_id>", methods=["PUT"])
@jwt_required()
def update_result(result_id):

    # 1. Identify the logged-in user
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # 2. Only admins and teachers can update results
    if current_user.role not in ("admin", "teacher"):
        return jsonify({"error": "Access forbidden"}), 403

    # 3. Find the result to update
    result = db.session.get(Result, result_id)

    if result is None:
        return jsonify({"error": "Result not found"}), 404

    # 4. Identify the teacher and check the existing assignment
    teacher = None

    if current_user.role == "teacher":
        teacher = Teacher.query.filter_by(
            user_id=current_user.id
        ).first()

        if teacher is None:
            return jsonify({
                "error": "Teacher profile not found"
            }), 404

        existing_student = db.session.get(
            Student, result.student_id
        )

        if existing_student is None:
            return jsonify({"error": "Student not found"}), 404

        existing_assignment = TeachingAssignment.query.filter_by(
            teacher_id=teacher.id,
            class_id=existing_student.class_id,
            subject_id=result.subject_id
        ).first()

        if existing_assignment is None:
            return jsonify({
                "error": "Access forbidden"
            }), 403

    # 5. Validate the request body
    data = request.get_json()

    if not isinstance(data, dict):
        return jsonify({
            "error": "A valid JSON object is required"
        }), 400

    student_id = data.get("student_id")
    subject_id = data.get("subject_id")
    score = data.get("score")
    academic_session_id = data.get("academic_session_id")

    # 6. Validate the IDs
    ids = (student_id, subject_id, academic_session_id)

    if any(
        isinstance(value, bool)
        or not isinstance(value, int)
        or value <= 0
        for value in ids
    ):
        return jsonify({
            "error": "student_id, subject_id, and academic_session_id must be positive integers"
        }), 400

    # 7. Validate the score
    if (
        isinstance(score, bool)
        or not isinstance(score, (int, float))
        or not 0 <= score <= 100
    ):
        return jsonify({
            "error": "Score must be a number between 0 and 100"
        }), 400

    # 8. Verify that the student exists
    student = db.session.get(Student, student_id)

    if student is None:
        return jsonify({"error": "Student not found"}), 404

    # 9. Verify that the subject exists
    subject = db.session.get(Subject, subject_id)

    if subject is None:
        return jsonify({"error": "Subject not found"}), 404

    # 10. Verify that the academic session exists
    academic_session = db.session.get(
        AcademicSession,
        academic_session_id
    )

    if academic_session is None:
        return jsonify({
            "error": "Academic session not found"
        }), 404

    # 11. Teachers must be assigned to the new class and subject
    if current_user.role == "teacher":
        new_assignment = TeachingAssignment.query.filter_by(
            teacher_id=teacher.id,
            class_id=student.class_id,
            subject_id=subject_id
        ).first()

        if new_assignment is None:
            return jsonify({
                "error": "You are not assigned to the new class and subject"
            }), 403

    # 12. Prevent duplicate results
    existing_result = Result.query.filter_by(
        student_id=student_id,
        subject_id=subject_id,
        academic_session_id=academic_session_id
    ).first()

    if existing_result and existing_result.id != result.id:
        return jsonify({
            "error": "A result already exists for this student, subject, and academic session"
        }), 409

    # 13. Calculate the grade on the server
    if score >= 70:
        grade = "A"
    elif score >= 60:
        grade = "B"
    elif score >= 50:
        grade = "C"
    elif score >= 45:
        grade = "D"
    elif score >= 40:
        grade = "E"
    else:
        grade = "F"

    # 14. Update the result
    result.student_id = student_id
    result.subject_id = subject_id
    result.score = score
    result.grade = grade
    result.academic_session_id = academic_session_id

    db.session.commit()

    # 15. Return the updated result
    return jsonify({
        "message": "Result updated successfully",
        "result": {
            "id": result.id,
            "student_id": result.student_id,
            "subject_id": result.subject_id,
            "score": result.score,
            "grade": result.grade,
            "academic_session_id": result.academic_session_id
        }
    }), 200


# ==================== DELETE RESULT ====================

@app.route("/api/results/<int:result_id>", methods=["DELETE"])
@jwt_required()
def delete_result(result_id):

    # 1. Identify the logged-in user
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # 2. Only admins can delete results
    if current_user.role != "admin":
        return jsonify({"error": "Access forbidden"}), 403

    # 3. Find the result
    result = db.session.get(Result, result_id)

    if result is None:
        return jsonify({"error": "Result not found"}), 404

    # 4. Delete the result
    db.session.delete(result)
    db.session.commit()

    # 5. Confirm deletion
    return jsonify({
        "message": "Result deleted successfully",
        "result_id": result_id
    }), 200


@app.route("/api/register", methods=["POST"])
def register():
    # Get the registration data sent by the user
    data = request.get_json()

    if not data or not all(
    field in data for field in ["name", "email", "password"]
    ):
        return jsonify({
        "error": "Name, email, and password are required"
    }), 400


    # Check that none of the required fields is empty
    if not all(data[field].strip() for field in ["name", "email", "password"]):
         return jsonify({
        "error": "Name, email, and password cannot be empty"
    }), 400

    # Check whether the email is already registered
    existing_user = User.query.filter_by(email=data["email"]).first()

    if existing_user:
     return jsonify({
        "error": "Email is already registered"
    }), 409

    # Get the password the user entered
    password = data["password"]

    # Convert the password into a secure hash
    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    )

    # Create a new User using the registration information
    user = User(
        name=data["name"],
        email=data["email"],
        password_hash=hashed_password.decode("utf-8"),
        role="student"
    )

    # Add the new user to the database
    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "Registration successful"
    })


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()

    # Check that required fields exist
    if not data or not all(
        field in data for field in ["email", "password"]
    ):
        return jsonify({
            "error": "Email and password are required"
        }), 400

    # Check that fields are not empty
    if not all(
        isinstance(data[field], str) and data[field].strip()
        for field in ["email", "password"]
    ):
        return jsonify({
            "error": "Email and password cannot be empty"
        }), 400

    # Get the login details
    email = data["email"].strip()
    password = data["password"]

    # Find the user
    user = User.query.filter_by(email=email).first()

    # Check whether the user exists
    if user is None:
        return jsonify({
            "error": "Invalid email or password"
        }), 401

    # Verify the password
    password_correct = bcrypt.checkpw(
        password.encode("utf-8"),
        user.password_hash.encode("utf-8")
    )

    # Reject incorrect passwords
    if not password_correct:
        return jsonify({
            "error": "Invalid email or password"
        }), 401

    # Generate an access token
    access_token = create_access_token(
        identity=str(user.id)
    )

    # Return the token and the user's actual role
    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "role": user.role
    }), 200

@app.route("/api/protected", methods=["GET"])
@jwt_required()
def protected():
    # Get the ID of the user identified by the access token
    current_user_id = get_jwt_identity()

    return jsonify({
        "message": "You have accessed a protected route",
        "user_id": current_user_id
    }), 200


@app.route("/api/me", methods=["GET"])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()

    user = db.session.get(User, current_user_id)

    if user is None:
        return jsonify({
            "error": "User not found"
        }), 404

    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role
    }), 200


@app.route("/api/admin-only", methods=["GET"])
@jwt_required()
def admin_only():
    # Get the ID of the authenticated user
    current_user_id = get_jwt_identity()

    # Find the user in the database
    user = db.session.get(User, current_user_id)

    # Check whether the user still exists
    if user is None:
        return jsonify({
            "error": "User not found"
        }), 404

    # Check whether the user is an administrator
    if user.role != "admin":
        return jsonify({
            "error": "Access forbidden"
        }), 403

    # Allow access to administrators
    return jsonify({
        "message": "Welcome, administrator!"
    }), 200



@app.route("/")
def home():
    return "School portal ApI"

if __name__ ==  "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)

