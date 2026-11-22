# Security

## Overview
FleetFlow uses basic security measures to protect users, vehicles, trips, and operational data.

---

## Authentication

- Users log in using email and password.
- Passwords are hashed using bcrypt before being stored.
- JWT tokens are used for authentication.
- Passwords are never stored in plain text.

---

## Authorization
FleetFlow uses Role-Based Access Control (RBAC).

### Roles
**Admin**

- Manage users, drivers, vehicles, and trips.
**Dispatcher**

- Assign drivers and manage trips.
**Driver**

- View assigned trips and update trip status.
**Viewer**

- Read-only access to reports.
Users can only access features allowed for their role.

---

## Data Protection

- Sensitive configuration values are stored in environment variables (`.env`).
- The `.env` file is excluded from Git using `.gitignore`.
- Production deployments should use HTTPS.

---

## Input Validation
FleetFlow uses Pydantic models to validate user input and reduce the risk of invalid or malicious data being submitted.

Protection against:

- SQL Injection
- Invalid input data
- Malformed requests

---

## Logging
The application logs important events such as:

- User login attempts
- Trip creation
- Driver assignments
- System errors
Passwords and secret keys are never logged.

---

## Security Risks and Mitigation

Risk | Mitigation

Unauthorized Access | JWT Authentication and RBAC

SQL Injection | SQLAlchemy ORM and validation

Password Theft | bcrypt password hashing

Secret Exposure | Environment variables

---

## Security Testing
The following security checks are performed:

- Authentication testing
- Authorization testing
- Input validation testing
- API endpoint testing

---

## Future Improvements

- Multi-Factor Authentication (MFA)
- Rate limiting
- Audit trail improvements
- Automated vulnerability scanning
