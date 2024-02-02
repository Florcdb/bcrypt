const express = require('express')
const jwt = require('jsonwebtoken');
const secret = `el_lobo_no_maulla`
const session = require('express-session')


const users = [
    { id: 1, username: 'usuario1', password: 'contraseña1', name: 'Usuario Uno' },
    { id: 2, username: 'usuario2', password: 'contraseña2', name: 'Usuario Dos' },
    { id: 3, username: 'usuario3', password: 'contraseña3', name: 'Usuario Tres' },
    { id: 4, username: 'usuario4', password: 'contraseña4', name: 'Usuario Cuatro' },
    { id: 5, username: 'usuario5', password: 'contraseña5', name: 'Usuario Cinco' },
    { id: 6, username: 'usuario6', password: 'contraseña6', name: 'Usuario Seis' },
  ];
  
  module.exports = users

const app = express()
const PORT = 3000; 



  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());


app.use(
    session({
        secret: `el_lobo_no_maulla`,
        resave: false,
        saveUninintialized: true,
        cookie : {secure:false},
    })
)


function generateToken (user){
    return jwt.sign({user: user.id}, secret, {
        expiresIn: '1h',
    }
        )
}

function verifyToken(req, res, next) {
    const token =req.session.token;
    if (!token){
        return res.status(401).json({ mensaje: 'token no generado'})
    }
jwt.verify(token, secret, (err, decoded) => {
    if (err){
        return res.status(401).json({mensaje: 'token inválido'})
    }
    req.user = decoded.user;
    next()
})
}

app.get('/', (req, res) => {
    const loginForm = `
    <form action="/login" method="post">
    <label for="username">Usuario :</label>
    <input type="text" id="username" name="username" required><br>
    
    <label for="password">Contraseña :</label>
    <input type="password" id="password" name="password" required><br>
    
    <button type="submit">Iniciar sesión</button>
    </form>
    <a href="/dashboard">dashboard</a>
    `;
    res.send(loginForm)
})


app.post('/login', (req, res) => {
    const {username, password} = req.body;
    const user = users.find(
        (user) => user.username === username && user.password === password
    )

if(user) {
    const token = generateToken(user)
    req.session.token = token;
    res.redirect('/dashboard')
} else {
    res.status(401).json({mensaje: 'credenciales incorrectas'})
}
})

app.get('/dashboard', verifyToken, (req, res) => {
    const userId = req.user;
    const user = users.find((user) => user.id === userId);
    if (user) {
      res.send(`
      Bienvenido, ${user.name}
      <p>Este es tu ID: ${user.id} </p>
      <p>Este es tu nombre de usuario: ${user.username}</p>
      <a href = "/">Home</a>
      <form action="/logout" method="post">
      <button type="submit"> Cerrar sesión </button>
      </form>
      `);
    } else {
      res.status(401).json({ mensaje: `Usuario no encontrado` });
    }
  });
  
  app.post('/logout', (req, res)=> {
    req.session.destroy();
    res.redirect('/')
  }) 




app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`)
})

