import getpass
import bcrypt
from app import app, db, User

with app.app_context():
    email = input("Admin email: ").strip().lower()
    admin = User.query.filter_by(email=email, role="admin").first()

    if admin is None:
        print("Admin account not found.")
    else:
        password = getpass.getpass("Enter new password: ")
        confirm = getpass.getpass("Confirm new password: ")

        if not password:
            print("Password cannot be empty.")
        elif password != confirm:
            print("Passwords do not match.")
        else:
            admin.password_hash = bcrypt.hashpw(
                password.encode("utf-8"),
                bcrypt.gensalt()
            ).decode("utf-8")

            db.session.commit()
            print("Admin password reset successfully.")