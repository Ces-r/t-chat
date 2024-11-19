const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const WebSocket = require('ws');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
// encrypt password
const bcrypt = require('bcryptjs');
// cookies
const session = require('express-session');
// uploading stuff
const multer = require('multer');

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'views')));
app.use('/views', express.static(path.join(__dirname, 'views')));
app.use(session({secret: 'superSecret', resave: false, saveUninitialized: false}));

app.set('view engine', 'ejs');
const PORT = 5000;
const IP = '192.168.1.86';



// start the database 
let db;
(async () => {
	db = await open({
		filename: 'users.sqlite',
		driver: sqlite3.Database
	});
})();



// storage 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'views', 'userimgs')); // Save files to FinalProject/views/userimgs
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // Add timestamp and random number for uniqueness
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });



// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Handle new WebSocket connection
wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        try {
            const parsedMessage = JSON.parse(message);
            // Broadcast the structured message to all clients
            wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(parsedMessage));
                }
            });
        } catch (err) {
            console.error('Error handling message:', err);
        }
    });
    // Handle client disconnection
    
});
    


// Routes
app.get('/login', async (req, res) => {

    if(!req.session.user){
        return res.render('login');
    } else{
        return res.redirect('/chat');
}
});

app.get('/logout', (req, res) => {
    // delete the user session
    delete req.session.user;
    return res.render('login');
});


app.post('/login', async (req, res) => {
    let errors = [];
    let username = req.body.lusername;
    let password = req.body.lpassword;
    console.log("Username: ", username);
    console.log("Password: ", password);
    
    if(!username.trim() || !password.trim()){
        errors.push("Make sure to not leave any fields blank!")
    }

    if (errors.length > 0) {
        return res.render('login', {errors: errors})
    }

   const userdata = await db.get(`SELECT * FROM userbase where username = ?`, [username]);

   if(userdata){
    console.log("user exists");
    //console.log(userdata.password);
    const compare = await bcrypt.compare(password, userdata.password);
        if(compare){
            console.log("worked, logged in successfully")
            // add it to session
            req.session.user = userdata;
            
            
            // if log in successful, send them to chat
            return res.redirect('/chat');
        } else {
            errors.push("passwords dont match");
            return res.render('login', {errors: errors});
        }

   } 
   else {
    errors.push("user doesn't exist")
    console.log(errors)
    return res.render('login', {errors: errors});
   }

});


app.post('/register', async (req, res) => {
    errors = [];
    let username = req.body.rusername;
    let password = req.body.rpassword;
    let confirm = req.body.cpassword;
    const pfp = "/views/userimgs/user.svg"
    console.log("Username: ", username);
    console.log("Password: ", password);
    console.log("Confirm Password: ", confirm);

    // double check if the fields are actually filled.
    if(!username.trim() || !password.trim()){
        errors.push("Make sure to not leave any fields blank!")
    }
    if (errors.length > 0) {
        return res.render('login', {errors: errors})
    }

    if(password === confirm){
        // bcrypt password

        let hash = await bcrypt.hash(password, 10);
        console.log(hash);

        // double check if the username is taken:
        const userdata = await db.get(`SELECT * FROM userbase where username = ?`, [username]);
        if(userdata){
            console.log("username taken");
            errors.push("Username taken!");
            return res.render('login', {errors: errors});
        }


        await db.run(`INSERT INTO userbase 
            (username, password, profilepic) VALUES (?, ?, ?)`, [username, hash, pfp]);
            //const checkdb = await db.all('SELECT * FROM userbase');
            //console.log(checkdb);
            const newuser = await db.get(`SELECT * FROM userbase where username = ?`, [username]);
            req.session.user = newuser;
            return res.redirect('/settings');
    } else {
            console.log("error wrong confirmation password ")
            errors.push("Wrong confirmation password")
            return res.render('login', {errors: errors});
            }
});

app.get('/', async (req, res) => {
    return res.render("home");
});

app.get('/chat', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    } else {
        const user = req.session.user;
        // Pass user to the template
        return res.render('chat', 
            { 
                user: user
            });
    }
});

app.get('/settings', (req, res)  =>{
    if(!req.session.user){
        return res.redirect('/login');
    } else {
        const user = req.session.user;
        return res.render('settings', 
            {
                user: user
             });
    }

});

    app.post('/upload', upload.single('profilepic'), async (req, res) => {
        
        if(!req.session.user){
            return res.redirect("/login");
        }
        
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }
        let errors = [];
        //console.log(req.file.mimetype);
        if(!req.file.mimetype.includes("image")){
            console.log("this is not an image!!!")
            errors.push("Not a valid image file.")
            return res.render('settings', {
                user: req.session.user,
                errors: errors
            });
        }

        const filepath = `/userimgs/${req.file.filename}`
        console.log(filepath);

        await db.run("UPDATE userbase SET profilepic = ? where id = ?", [filepath, req.session.user.id]);

        req.session.user.profilepic = filepath;
        res.redirect("/settings");
    });


app.post('/change', async (req, res) =>{
    if(!req.session.user){
        return res.redirect("/login");
    }

    if(!req.body.username || req.body.username.trim() === ""){
        return res.redirect("/settings");
    }

    const username = req.body.username.trim();
    console.log(username);
    await db.run("UPDATE userbase SET username = ? WHERE id = ?", [username, req.session.user.id]);
    req.session.user.username = username;
    res.redirect("/settings")

});

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on http://${IP}:${PORT}`);
});
