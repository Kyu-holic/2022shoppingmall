// 배포할 때 사용하는 것
module.exports = {
    // HEROKU로 배포 시 동일하게 해줘야 함
    mongoURI: process.env.MONGO_URI,
};
