const express = require('express')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const port = process.env.PORT || 3000
const app = express()

app.get("/", (req, res) => {
    if(!req.query.token){
    
    
    return res.send(`<h1>Oauth-demo</h1>

        <a href="./auth">Sign in with Github </a>
    
    `)
    } else {
        const user = jwt.verify(req.query.token, process.env.JWT_SECRET);


        return res.send(`<h1>Välkommen ${user.name} du är inloggad som ${user.userName}!</h1>

        
    
    `)
    }
});
// Github Auth
app.get("/auth", (req,res) => {
//console.log(`https://github.com/login/oauth/authorize?scope=read:user&client_id=${process.env.CLIENT_ID}`)

res.redirect(`https://github.com/login/oauth/authorize?scope=read:user&client_id=${process.env.CLIENT_ID}`)
});
// Github Callback
app.get("/github-callback", async (req,res) => {
    const body = {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code: req.query.code // GitHub skickar denna "temporary code grant"
    }
    try {
      const response = await fetch("https://github.com/login/oauth/access_token", {
        method: 'POST' ,
        headers: {'Content-type': 'application/json', 'Accept': 'application/json'},
        body: JSON.stringify(body)
      })  
      const tokenData = await response.json();
      console.log(tokenData)


     const responseUser = await fetch("https://api.github.com/user", {
        headers: {'Authorization': `Bearer  ${tokenData.access_token}`}
      }) ;

      const githubUser = await responseUser.json();
      console.log(githubUser);

      const token = jwt.sign({
        sub: githubUser.id,
        userName: githubUser.login,
        name: githubUser.name,
        company: githubUser.company
      }, process.env.JWT_SECRET, {expiresIn: '1h'})

      res.redirect(`/?token=${token}`)
      console.log("JWT:", token);
      
    } catch (err) {
        console.log(err)
        res.status(500).json({error: err.message})
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
});