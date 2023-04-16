import express from "express";
const studentDashboardRoute = express.Router();
studentDashboardRoute.get('/student-dashboard', (req, res) => {
    res.sendFile('student-dashboard.html', { root: 'public' });
});
export default studentDashboardRoute;
