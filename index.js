const express = require("express");
const app = express();
const port = 5000;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

// key에서 dev 및 prod 를 가져오기 위함
const config = require("./config/key");

const { User } = require("./models/User");

// bodyparser는 client에서 온 정보를 서버에서 분석할 수 있게
// 해주는 역할

// application/x-www-form-urlencoded로 된 데이터를 분석해서
// 가져올 수 있게 해준다.
app.use(bodyParser.urlencoded({ extended: true }));

// application/json 타입으로 된 것을 분석해서 가져올 수 있게 함
app.use(bodyParser.json());
// cookieparser 사용
app.use(cookieParser());

const mongoose = require("mongoose");
mongoose
    .connect(config.mongoURI)
    .then(() => console.log("MongoDB is connected"))
    .catch((err) => console.log(err));

app.get("/", (req, res) => res.send("Hello world!"));

// 아래는 회원가입을 위한 라우터
app.post("/register", (req, res) => {
    // 회원 가입 할 때 필요한 정보들을 client에서 가져오면
    // 그것들을 데이터 베이스에 넣어준다.

    const user = new User(req.body);

    // mongoDB에서 제공하는 method이며 이렇게하면 정보들이
    // user model에 저장이 된 것.
    user.save((err, userInfo) => {
        // 저장을 할 때 에러가 있다고 하면 client에
        // error가 있다고 json 형식으로 전달
        // success: false와 함께 err메세지 전달
        if (err) return res.json({ success: false, err });
        // 성공했을 때 메세지 전달
        return res.status(200).json({
            success: true,
        });
    });
});

app.post("/login", (req, res) => {
    // 요청된 이메일을 데이터베이스에서 있는지 찾는다.
    User.findOne({ email: req.body.email }, (err, user) => {
        // 만약 User 컬렉션 안에 제공된 email이 하나도 없다면~
        if (!user) {
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다.",
            });
        }

        // 요청된 이메일이 DB에 있다면 비밀번호가 맞는지 확인
        // req.body.password는 plainPassword
        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch)
                return res.json({
                    loginSuccess: false,
                    message: "비밀번호가 틀렸습니다.",
                });

            // 비밀번호까지 맞다면 Token 생성(jsonwebtoken 다운받기)
            // generateToken 부분은 이름 아무렇게나 작성 가능
            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err);

                // token을 저장한다 (cookieParser 인스톨)
                res.cookie("x_auth", user.token)
                    .status(200)
                    .json({ loginSuccess: true, userId: user._id });
            });
        });
    });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
