import express from "express";

const loginRoute = express.Router()

loginRoute.get('/', (req, res) => {
    res.sendFile('login.html', {root: 'public'})
})

export default loginRoute;