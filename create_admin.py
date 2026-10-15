import getpass
import bcrypt
from app import app, db, User

with app.app_context():
    name = input("Admin name: ").strip()
    email = input("Admin email: ").strip().lower()
    password = getpass.getpass("Admin password: ")
    confirm_password = getpass.getpass("Confirm admin password: ")

    if not name or not email or not password or not confirm_password:
        print("All fields are required.")

    elif password != confirm_password:
        print("Passwords do not match.")

    elif User.query.filter_by(email=email).first():
        print("A user with that email already exists.")

    else:
        password_hash = bcrypt.hashpw(
            password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        admin = User(
            name=name,
            email=email,
            password_hash=password_hash,
            role="admin"
        )

        db.session.add(admin)
        db.session.commit()

        print("Admin account created successfully.")
