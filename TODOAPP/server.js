//기본셋팃
//새로운 라브리를 만들어 주세요
const express = require('express');

//express를 이용하여 새로운 객체를 만들어주세요
const app = express();

app.listen(8080, function(){
    console.log('listening on 8080')
});

//누군가가 /pet으로 방문을 하면.. pet관련된 안내문을 띄워주자
app.get('/pet', function(요청, 응답){
    응답.send('펫용품 쇼핑 페이지입니다.');
});

app.get('/beauty', function(request, response){
    response.send('뷰티용품 쇼핑 페이지입니다아.')
});

app.get('/write', function(request, response){
    response.sendFile(__dirname + '/write.html')
});

/** "/"하나만 쓰면 홈 */
/** sendFile() html 파일 보낼 수 있음 */
app.get('/', function(request, response){
    response.sendFile(__dirname + '/index.html')
});

