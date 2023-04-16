import express from "express";
const staffDashboardRoute = express.Router();
staffDashboardRoute.get('/staff-dashboard', (req, res) => {
    res.sendFile('staff-dashboard.html', { root: 'public' });
});
export default staffDashboardRoute;
