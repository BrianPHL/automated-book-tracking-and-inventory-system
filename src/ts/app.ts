// ? Dependencies
import express from 'express';
import { Pool, createPool } from 'mysql2';
import * as dotenv from 'dotenv';

// ? Routes
import loginRoute from './routes/login.js';
import errorRoute from './routes/error.js';
import staffDashboardRoute from './routes/staff-dashboard.js';
import studentDashboardRoute from './routes/student-dashboard.js';

dotenv.config()

const app = express()
const pool: Pool = createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE_NAME
})

app.use('/static', express.static('public'))

app.get('/', loginRoute)
app.get('/error', errorRoute)
app.get('/staff-dashboard', staffDashboardRoute)
app.get('/student-dashboard', studentDashboardRoute)

app.listen(process.env.EXPRESS_PORT)