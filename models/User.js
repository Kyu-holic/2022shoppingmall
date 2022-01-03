const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50,
    },
    email: {
        type: String,
        trim: true,
        unique: 1,
    },
    password: {
        type: String,
        minlength: 5,
    },
    lastname: {
        type: String,
        maxlength: 50,
    },
    role: {
        type: Number,
        default: 0,
    },
    image: String,
    token: {
        type: String,
    },
    tokenExp: {
        type: Number,
    },
});

// user model에 user 정보를 저장하기 전에 function을 한다는 의미
userSchema.pre("save", function (next) {
    var user = this;

    // password가 변화될 때만 bcrypt를 이용해서 암호화한다
    if (user.isModified("password")) {
        // 비밀번호를 암호화 시킨다.
        bcrypt.genSalt(saltRounds, function (err, salt) {
            // 에러가 났다면 next 로 보냄
            if (err) return next(err);
            // salt가 제대로 생성되었다면
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err);
                // 성공했다면 plain password를 hash 비밀번호로 바꿔줌
                user.password = hash;
                next();
            });
        });
        // 비밀번호를 바꾸는 것을 바꿀 때는 next()를 해줘야
        // 바로  register router로 갈 수 있다.
    } else {
        next();
    }
});

// login router에서 user.comparePassword 부분
userSchema.methods.comparePassword = function (plainPassword, cb) {
    // this.password는 암호화 된 비밀번호
    // plainPassword와 암호화 된 비밀번호가 일치하는지
    // bcrypt의 compare method를 통해 확인
    bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
        // 강의에서 cb(err), 로 나오니 cb(err);로 바꿀 것
        if (err) return cb(err);
        // 다음에 오는 cb는 err는 null 이고 두 비밀번호는
        // '같다'라는 뜻
        cb(null, isMatch);
    });
};

// login router에서 user.generateToken 부분
userSchema.methods.generateToken = function (cb) {
    var user = this;

    // jsonwebtoken을 이용하여 token 생성하기
    // user_id + secretToken = token

    var token = jwt.sign(user._id.toHexString(), "secretToken");

    user.token = token;
    user.save(function (err, user) {
        if (err) return cb(err);
        cb(null, user);
    });
};

const User = mongoose.model("User", userSchema);

module.exports = { User };
