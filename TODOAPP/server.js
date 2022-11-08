//기본셋팃
//새로운 라브리를 만들어 주세요
const express = require('express');

//express를 이용하여 새로운 객체를 만들어주세요
const app = express();

/** 
 * body-perser 라이브러리 사용 
 * 요청 데이터 해석을 쉽게 도와줌
 * */
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));

app.listen(8080, function(){
    console.log('listening on 8080')
});

//누군가가 /pet으로 방문을 하면.. pet관련된 안내문을 띄워주자
app.get('/pet', function(요청, 응답){
    응답.send('펫용품 쇼핑 페이지입니다.');
});

/** 
 * 함수 안의 함수 : 콜백함수 - 순차적으로 실행하고 싶을 때 
 * 두 가지 파라미터 가질 수 있음 .get('경로',function(요청내용,응답할방법){}
 * ES6 신문법
 * */
app.get('/beauty', (request, response)=>{
    response.send('뷰티용품 쇼핑 페이지입니다아.')
});

app.get('/write', function(request, response){
    response.sendFile(__dirname + '/write.html')
});

/** 
 * "/"하나만 쓰면 홈 
 * sendFile() html 파일 보낼 수 있음 
 * */
app.get('/', function(request, response){
    response.sendFile(__dirname + '/index.html')
});

/**
 * form 데이터 보내기
 * 요청 데이터를 쉽게 볼 수 있음
 */
app.post('/add',function(요청, 응답){
    응답.send('전송완료')
    console.log(요청.body.title)
    console.log(요청.body.date)
    console.log(요청.body)
});