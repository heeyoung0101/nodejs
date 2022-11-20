/** router 실행 시켜주세요(express방식으로) */
var router = require('express').Router();

/** app 대신 router */
router.get('/sports', function(요청, 응답){
    응답.send('스포츠 게시판');
});

router.get('/game', function(요청, 응답){
    응답.send('게임 게시판');
});

/** module.exports = 내 보낼 변수명
 * require('파일경로 or 라이브러리명') => 다른 파일이나 라이브러리 여기에 첨부하겠습니다.
 */
module.exports = router;