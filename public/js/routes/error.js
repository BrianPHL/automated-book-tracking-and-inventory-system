import express from "express";
const errorRoute = express.Router();
errorRoute.get('/error', (req, res) => {
    res.sendFile('error.html', { root: 'public' });
});
export default errorRoute;
