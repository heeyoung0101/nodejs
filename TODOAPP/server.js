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

/** FOMM 태그에서 다른 메서드(PUT, DELETE) 요청하기 */
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

/** session 만들기 라이브러리 */
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

/** app.use 요청과 응답 사이에 동작 미들웨어, 나는 static 파일을 보관하기 위해  public 파일을 쓸 거야 */
app.use('/public', express.static('public'));
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



/** 누군가가 '/pet'으로 방문을 하면.. pet관련된 안내문을 띄워주자 */
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
    response.render('write.ejs');
   // response.sendFile(__dirname + '/write.html')
});

/** 
 * "/"하나만 쓰면 홈 
 * sendFile() html 파일 보낼 수 있음 
 * */
app.get('/', function(request, response){
    response.render('index.ejs');
   // response.sendFile(__dirname + '/index.html')
});

/**
 * form 데이터 보내기
 * 요청 데이터를 쉽게 볼 수 있음
 */
app.post('/add',function(요청, 응답){
    //db에서 원하는 하나의 데이터를 꺠내주세요
    //유니크한 id값을 부여하기 위해 
    db.collection('counter').findOne({name : '게시물개수'}, function(에러, 결과){
        console.log(결과);
        var 총게시물개수 = 결과.totalPost;
        //post라는 파일에 insert (Object 자료형)
        db.collection('post').insertOne({_id : 총게시물개수 + 1, 제목 : 요청.body.title, 날짜 : 요청.body.date}, function(에러, 결과){ 
            console.log('저장완료');
            //counter라는 totalPost 항목도 1 증가시켜야 함, UpdateOne / UpdateMany
            //{어떤 데이터를 수정할지}, {수정할 값}
            //operator 써야함, $set은 바꿔주세요, $inc은 더해주세요
            db.collection('counter').updateOne({name : '게시물개수'}, {$inc : {totalPost : 1}}, function(에러, 결과){})
                if(에러){return console.log(에러)}
        });
        응답.render('write.ejs');
    //응답.send('전송완료')
      //  console.log(요청.body.title)
        //console.log(요청.body.date)
        //console.log(요청.body)
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

/** 글 삭제하기 AJAX */
app.delete('/delete', function(요청, 응답){
    console.log(요청.body);
    //요청.body 안의 문자를 숫자로 변환
    요청.body._id = parseInt(요청.body._id);
    console.log(요청.body);
    //요청.body에 담겨온 게시물번호를 가진 글을 db에서 찾아서 삭제해 주세요 
    db.collection('post').deleteOne(요청.body, function(에러, 결과){
        console.log('삭제완료');
       //응답코드 200을 보내주세요(성공), 400은 실패, 500은 서버 문제
        응답.status(200).send({message : '성공했습니다'});
       // 응답.status(400).send({message : '실패했습니다'}); //실패
    });
});

/** detail 로 접속하면 detail.ejs 보여줌 */
app.get('/detail/:id', function(요청, 응답){ // 'detail/어쩌구' 로 get요청을 하면(파라미터 기능)
    요청.params.id = parseInt(요청.params.id);
    db.collection('post').findOne({_id : 요청.params.id}, function(에러, 결과){ // _id 값이 파라미터의 id 인 데이터 하나를 찾아와주세요
        console.log(결과);
        응답.render('detail.ejs', { data: 결과 });
    })
    
})

/** 글 수정 페이지 */
app.get('/edit/:id', function(요청, 응답){
    요청.params.id = parseInt(요청.params.id);
    db.collection('post').findOne({_id : 요청.params.id}, function(에러, 결과){ // _id 값이 파라미터의 id 인 데이터 하나를 찾아와주세요
        console.log(결과);
        응답.render('edit.ejs', { data: 결과});
    
})
})

/** 글 수정하기 put요청 */
app.put('/edit', function(요청, 응답){
    console.log(요청.body.id);
    db.collection('post').updateOne({_id : parseInt(요청.body.id)}, { $set : {제목 : 요청.body.title, 날짜 : 요청.body.date}}, function(){
        console.log('수정완료');
        응답.redirect('/list'); //요청이 완료되었을 때 이동할 경로
    });
});

app.get('/login', function(요청, 응답){
    응답.render('login.ejs');
});

/** 아이디 검사 */
app.post('/login', passport.authenticate('local', {
    failureRedirect: '/fail'
}), function(요청, 응답){
    응답.redirect('/');
});

passport.use(new LocalStrategy({
    usernameField: 'id', // 사용자가 제출한 아이디가 어디 적혔는지
    passwordField: 'pw', // 사용자가 제출한 비번이 어디 적혔는지 
    session: true, //세션을 만들건지
    passReqToCallback: false, // 아이디, 비번 말고 다른 정보검사가 필요한지
}), function(입력한아이디, 입력한비번, done){
    console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ id: 입력한아이디}, function(에러, 결과){
        if(에러) return done(에러)
        if(!결과) return done(null, false, {messafe: '존재하지 않는 아이디요'})
        if(입력한비번 == 결과.pw){
            return done(null, 결과)
        } else {
            return done(null, false, {message: '비번틀렸어요'})
        }
    })
});