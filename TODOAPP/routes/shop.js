/** router 실행 시켜주세요(express방식으로) */
var router = require('express').Router();

function 로그인했니(요청, 응답, next){
    if(요청.user){ // 로그인 한 상태면 요청.user가 항상 달라붙어 있음
        console.log(요청.user);
        next(); // 요청.user가 있으면 통과
    } else {
        응답.send('르그인안하셨는데요?'); // 요청.user가 없으면 경고메세지 응답
    }
}

/** router 내의 모든 url에 적용할 수 있는 미들웨어 */
router.use(로그인했니);

/** 해당 URL에만 적용 */
router.use('/shirts', 로그인했니)

/** app 대신 router */
router.get('/shirts', function(요청, 응답){
    응답.send('셔츠 파는 페이지입니다.');
});

router.get('/pants', function(요청, 응답){
    응답.send('바지 파는 페이지입니다.');
});

/** module.exports = 내 보낼 변수명
 * require('파일경로 or 라이브러리명') => 다른 파일이나 라이브러리 여기에 첨부하겠습니다.
 */
module.exports = router;