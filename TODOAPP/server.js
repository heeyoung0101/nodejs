/** 
 * 기본셋팃
 * 새로운 라브리를 만들어 주세요
 * */
const express = require('express');

/** 
 * express를 이용하여 새로운 객체를 만들어주세요
 * */
const app = express();

/** 
 * body-perser 라이브러리 사용 
 * 요청 데이터 해석을 쉽게 도와줌
 * express 라이브러리 깔면 자동으로 
 * */
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));

/** Mongo DB 사용하기 */
const MongoClient = require('mongodb').MongoClient;

/** EJS 사용하기 */
app.set('view engine', 'ejs');

MongoClient.connect('mongodb+srv://admin:adminhee@cluster0.jtsym6a.mongodb.net/?retryWrites=true&w=majority', function(에러, client){
    if(에러) return console.log(에러) 
    
    db = client.db('todoapp'); //todoapp이라는 database에 접속해주세요

    /** 
     * db.collection('post').insertOne({이름 : 'John', 나이 : 27, _id : 100}, function(에러, 결과){ //post라는 파일에 insert (Object 자료형)
        console.log('저장완료');
    }); 
    */

    app.listen(8080, function(){ //몽고디비 접속 완료되면 서버 실행해 주세요
        console.log('listening on 8080')
    });
})



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

    db.collection('post').insertOne({제목 : 요청.body.title, 날짜 : 요청.body.date, _id : 2}, function(에러, 결과){ //post라는 파일에 insert (Object 자료형)
    console.log('저장완료');
      
    응답.send('전송완료')
        console.log(요청.body.title)
        console.log(요청.body.date)
        console.log(요청.body)
    }); 
});

/** 실제 db에 저장된 데이터들로 예쁘게 꾸며진 HTML보여줌 */
app.get('/list', function(요청, 응답){

    //db에 저장된 post라는 collection의 모든 데이터를 꺼내주세요
    db.collection('post').find().toArray(function(에러, 결과){
        console.log(결과);
        //list.ejs  안에 결과를 출력
        응답.render('list.ejs', {posts : 결과 });
    });
    

});