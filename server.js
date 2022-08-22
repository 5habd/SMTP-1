{const express = require("express");
const app = express();
const server = require("http").Server(app);
app.set("view engine", "ejs");
app.use(express.static("public"));

const { v4: uuidv4 } = require("uuid");

const io = require("socket.io")(server, {
    cors: {
        origin: '*'
    }
});

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true,
});

app.use("/peerjs", peerServer);

var nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    port:465,
    host:'smtp.gmail.com',
    auth:{
        user:'nephorst@gmail.com',  
        pass:'guecgmqgmtvbsymb',
    }, 
    secure:true
})

app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
    res.render("index", { roomId: req.params.room });
});

app.post("/send-mail",(req, res) => {
    const to = req.body.to;
    const url = req.body.url;
    const mailData = {
        from:"nephorst@gmail.com",
        to: to, //
        subject:"Join meet ^_^",
        html:`<p>hi there,</p><p>come and join for a video chat here -${url}</p>`
    }
    transporter.sendMail(mailData,(error,info)=>{
        if(erorr){
            return console.log(error)
        }
        res.status(200).send({
            message:"invitation sent successfully",
            messgae_id:info.messageId
        })
    })
})

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId, userName) => {
        socket.join(roomId);
        io.to(roomId).emit("user-connected", userId);
        socket.on("message", (message) => {
            io.to(roomId).emit("createMessage", message, userName);
        });
    });
});

server.listen(process.env.PORT || 3030);}