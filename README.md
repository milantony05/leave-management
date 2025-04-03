# Leave Management System

A full-stack application for managing employee leave requests with React frontend and Express backend.

## Deployment to Vercel

Follow these steps to deploy the application to Vercel:

1. **Create a Vercel Account**: If you don't have one, sign up at [vercel.com](https://vercel.com).

2. **Install Vercel CLI**: If you want to deploy from the command line, install the Vercel CLI:
   ```
   npm install -g vercel
   ```

3. **Login to Vercel**:
   ```
   vercel login
   ```

4. **Deploy the Project**:
   ```
   vercel
   ```
   Or connect your GitHub repository to Vercel and deploy automatically.

5. **Environment Variables**: Make sure to add the following environment variables in the Vercel dashboard:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Secret for JWT token generation
   - Any other environment variables required by your application

## Project Structure

- `/client`: React frontend
- `/server`: Express backend

## Local Development

To run the project locally:

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start development server:
   ```
   npm run dev
   ```

## License

[MIT](LICENSE)
