# Leave Management System

A simple full-stack web application to manage leave requests for hostel. Students can apply for casual or medical leaves, check their leave balances, and track their application status. Admins can manage leave requests efficiently.

### Student Features:
- **Apply for Leaves**: Casual or Medical leaves.
- **Check Leave Balances**: See available leave days.
- **Track Leave Applications**: View the history of approved, pending, or rejected leaves.

### Admin Features:
- **Manage Leave Requests**: Approve or reject leave applications.
- **View All Leave Records**: Get a holistic view of employee leave data.

## Tech Stack

### Backend:
- **Express.js**
- **Oracle Database XE**
- **JWT Authentication**

### Frontend:
- **React.js**
- **Axios** for API calls
- **CSS** for styling

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/milantony05/leave-management.git
   ```

2. Navigate to the project directory:
   ```bash
   cd leave-management
   ```

3. Create the .env file:
   ```bash
   cd server
   touch .env
   ```

4. Set the environment variables in the .env file:
   ```
   # Oracle Database Configuration
   ORACLE_USER=your_username
   ORACLE_PASSWORD=your_password
   ORACLE_CONNECTION_STRING=localhost:1521/XE

   # JWT Secret for Authentication
   JWT_SECRET=your_jwt_secret_key
   ```

5. Start the backend:
   ```bash
   cd server
   npm install
   npm run setup-db
   npm start
   ```

6. Start the frontend:
   ```bash
   cd client
   npm install
   npm run build
   npm start
   ```

## Gallery

![1](https://github.com/user-attachments/assets/490cf234-ad3d-4b3d-b51f-63e3869ccf15)

![2](https://github.com/user-attachments/assets/6026e613-dbd5-4009-8e59-79f247129d7e)

![3](https://github.com/user-attachments/assets/74e19d46-7636-45e9-82c7-20286fc7157d)

![4](https://github.com/user-attachments/assets/d5816c86-4697-4b83-85c3-ce2d642a1e7f)

## Contact

**Milan Tony** - milantony2005@gmail.com
