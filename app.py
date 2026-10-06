from flask import Flask

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


@app.route("/")
def home():
    return "School portal ApI"

if __name__ ==  "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
