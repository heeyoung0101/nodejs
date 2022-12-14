/** 
 * 기본셋팃
 * 새로운 라브리를 만들어 주세요
 * */
const express = require('express');

/** node.js 기본 내장 라이브러리, 파일의 경로, 이름, 확장자 등 알아낼 때 */
const path = require('path');

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

/** WebSocket 라이브러리 */
const http = require('http').createServer(app);
const {Server} = require('socket.io');
const io = new Server(http);

/** 환경변수 라이브러리 */
require('dotenv').config();

/** app.use 요청과 응답 사이에 동작 미들웨어, 나는 static 파일을 보관하기 위해  public 파일을 쓸 거야 */
app.use('/public', express.static('public'));

/** 몽고디비 연결 
 * env파일에 저장된 환경변수 불러오기 'process.env.변수명'
*/
var db;
MongoClient.connect(process.env.DB_URL, function(에러, client){
    if(에러) return console.log(에러)     
        db = client.db('todoapp'); //todoapp이라는 database에 접속해주세요
        // app.listen(process.env.PORT, function(){ //몽고디비 접속 완료되면 서버 실행해 주세요
        http.listen(process.env.PORT, function(){ //app.listen이랑 같음, 웹소켓을 위해 바꿔줌
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
    response.render('write.ejs', { 에러 : ''});
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


/** 실제 db에 저장된 데이터들로 예쁘게 꾸며진 HTML보여줌 */
app.get('/list', function(요청, 응답){
    //db에 저장된 post라는 collection의 모든 데이터를 꺼내주세요
    db.collection('post').find().toArray(function(에러, 결과){
        console.log(결과);
        //list.ejs  안에 결과를 출력
        응답.render('list.ejs', {posts : 결과 });
    });
});

/** 조회하기 post요청의 대용품인 query string 
 * binary search 만들고 싶다면 index 만들어 두기(정렬된 사본)
 * 문자의 타입은 text 숫자의 타입은 -1, 1
*/
app.get('/search', (요청, 응답) => {
    console.log(요청.query); // url 쿼리에 담은 값
    var 검색조건 = [
        {
            $search: {
                index: 'search',
                text: {
                    query: 요청.query.value,
                    path: '제목' //제목, 날짜 둘 다 찾고 싶으면 ['제목', '날짜']
                }
            }
        },
        // 검색결과에서 필터주기, defualt는 score대로 정렬
       // { $sort: { _id: 1 } }, // id 순서대로 정렬
       // { $limit: 10}, // 10개까지 보여주기
       // { $project: {제목: 1, _id: 0, score: { $meta: "searchScore"}}} // score는 매칭 점수
    ];
    db.collection('post').aggregate(검색조건).toArray((에러, 결과) => { // search index 사용
        console.log(결과);
        응답.render('search.ejs', {posts : 결과});
    })
    
    /** 
     // 해당 키워드가 포함된 항 일 목록 출력, text index 만들어두면 빠른검색, or검색 가능, -제외 기능, "정확히 일치하는 것만", 띄어쓰기 기준으로 단어를 저장 함(한국, 중국, 일본어에는 안 좋음)
    * db.collection('post').find({$text: { $search: 요청.query.value}}).toArray(function(에러, 결과){ 
        응답.render('search.ejs', {posts : 결과});
    }) 
    */
})


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

/** 아이디 검사하기 */
app.post('/login', passport.authenticate('local', {
    failureRedirect: '/fail'
}), function(요청, 응답){
    응답.redirect('/');
});

app.get('/fail', function(요청, 응답){
    응답.render('fail.ejs');
});

app.get('/mypage', 로그인했니, function(요청, 응답){
    console.log(요청.user.id);
    응답.render('mypage.ejs', {사용자 : 요청.user});
});

function 로그인했니(요청, 응답, next){
    if(요청.user){ // 로그인 한 상태면 요청.user가 항상 달라붙어 있음
        console.log(요청.user);
        next(); // 요청.user가 있으면 통과
    } else {
        응답.send('로그인안하셨는데요?'); // 요청.user가 없으면 경고메세지 응답
    }
}

/** 아이디 검사 실행 */
passport.use(new LocalStrategy({
    usernameField: 'id', // 사용자가 제출한 아이디가 어디 적혔는지
    passwordField: 'pw', // 사용자가 제출한 비번이 어디 적혔는지 
    session: true, // 세션을 만들건지
    passReqToCallback: false, // 아이디, 비번 말고 다른 정보검사가 필요한지
}, function(입력한아이디, 입력한비번, done){
    console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ id: 입력한아이디}, function(에러, 결과){
        // done 은 세 가지 파라미터 가짐 done(서버에러, 성공시사용자db데이터(안 맞으면 false), 에러메세지)
        if(에러) return done(에러) // 에러 처리
        if(!결과) return done(null, false, {messafe: '존재하지 않는 아이디요'}) // 결과에 아무 것도 담겨오지 않았을 때 실행
        if(입력한비번 == 결과.pw){ // 아이디가 있으면 비번이 맞는지, 보안 높여야 함 db데이터와 그대로 비교 
            return done(null, 결과) 
        } else {
            return done(null, false, {message: '비번틀렸어요'})
        }
    })
})); 

/** id를 이용해서 세션을 저장시키는 코드(로그인 성공시 발동) */
passport.serializeUser(function(user, done){ // user가 결과에서 옴
    done(null, user.id) // 보통 id값만 저장, 세션 데이터를 만들고 세션의 id정보를 쿠키로 보냄
});

/** 이 세션 데이터를 가진 사람을 db에서 찾아주세요(마이페이지 접속시 발동) */
passport.deserializeUser(function(아이디, done){ // 아이디는 user.id
    db.collection('login').findOne({id: 아이디}, function(에러, 결과){// 디비에서 위에있는 user.id로 유저를 찾은 뒤에 유저 정보를 넣음
        done(null, 결과)
    })
});

/** 회원기능이 필요하면 passport 셋팅하는 부분이 위에 있어야 함 
 * - 나중에 할 것 
 * 저장 전에 id가 이미 있는지 먼저 찾아봐야
 * id에 알파벳 숫자만 잘 들어있나
 * 비번 저장 전에 암호화했나(라이브러리 사용)
*/
app.post('/register', function(요청, 응답){
    db.collection('login').insertOne({ id : 요청.body.id, pw : 요청.body.pw}, function(에러, 결과){
        응답.redirect('/');
    })
})

/**
 * form 데이터 보내기
 * 요청 데이터를 쉽게 볼 수 있음
 */
 app.post('/add',function(요청, 응답){
    if(요청.user){
    //db에서 원하는 하나의 데이터를 꺠내주세요
    //유니크한 id값을 부여하기 위해 
    if(요청.body.title){
        if(요청.body.date){
            db.collection('counter').findOne({name : '게시물개수'}, function(에러, 결과){
                console.log(결과);
                var 총게시물개수 = 결과.totalPost;
                var 저장할거 = {_id : 총게시물개수 + 1, 제목 : 요청.body.title, 날짜 : 요청.body.date, 작성자 : 요청.user.id}
                //post라는 파일에 insert (Object 자료형)
                db.collection('post').insertOne(저장할거, function(에러, 결과){ 
                    console.log('저장완료');
                    //counter라는 totalPost 항목도 1 증가시켜야 함, UpdateOne / UpdateMany
                    //{어떤 데이터를 수정할지}, {수정할 값}
                    //operator 써야함, $set은 바꿔주세요, $inc은 더해주세요
                    db.collection('counter').updateOne({name : '게시물개수'}, {$inc : {totalPost : 1}}, function(에러, 결과){})
                        if(에러){return console.log(에러)}
                });
                응답.render('write.ejs', { 에러 : '오늘의 할 일이 작성되었습니다!'});
            }); 
        } else {
            응답.render('write.ejs', { 에러 : '날짜를 입력해 주세요'});
        }
    } else {
        응답.render('write.ejs', { 에러 : '할 일과 날짜를 입력해 주세요'});
    }
}else{
    응답.render('login.ejs');
}
    
    //응답.send('전송완료')
      //  console.log(요청.body.title)
        //console.log(요청.body.date)
        //console.log(요청.body)
   
});

/** 글 삭제하기 AJAX */
app.delete('/delete', function(요청, 응답){
    console.log(요청.body);
    //요청.body 안의 문자를 숫자로 변환
    요청.body._id = parseInt(요청.body._id);
    console.log(요청.body);

    var 삭제할데이터 = { _id : 요청.body._id, 작성자 : 요청.user.id}
    //요청.body에 담겨온 게시물번호를 가진 글을 db에서 찾아서 삭제해 주세요 
    db.collection('post').deleteOne(삭제할데이터, function(에러, 결과){
        console.log('삭제완료');
        if(에러) console.log(에러)
       //응답코드 200을 보내주세요(성공), 400은 실패, 500은 서버 문제
        응답.status(200).send({message : '성공했습니다'});
       // 응답.status(400).send({message : '실패했습니다'}); //실패
    });
});

/** routes의 shop.js를 불러오기
 * app.use는 미들웨어 쓰겠다(요청과 응답 사이)
 * 전역/URL별 나뉨
 * '/shop' 경로로 접속하면 이런 미들웨어 적용
 */
app.use('/shop', require('./routes/shop.js'));
app.use('/board/sub', require('./routes/board.js'));

/** multer(파일) 라이브러리 셋팅 */
let multer = require('multer');
const { render } = require('ejs');
var storage = multer.diskStorage({ // 어디에 저장? 하드, 램
    destination : function(req, file, cb){// 이미지를 어떤 경로에 저장할지
        cb(null, './public/image')
    },
    filename: function(req, file, cb){// 파일명 설정
        cb(null, file.originalname) // 오리지널 이름
    }
});
var upload = multer({
    storage : storage,
    fileFilter: function(req, file, callback){// 확장자 거르기 
        var ext = path.extname(file.originalname);// path는 node.js 기본 내장 라이브러리 변수, 파일의 경로, 이름, 확장자 등 알아낼 때
        if(ext != '.jpg' && ext != '.png' && ext != '.jpeg'){
            return callback(new Error('PNG, JPG만 업로드 하세요'))
        }
        callback(null, true)
    }, 
    limits: {// 파일 사이즈 제한
        fileSize: 1024 * 1024 // 1MB
    }
});//미들웨어처럼 불러 쓸 수 있음 

/** 파일 업로드
 * 이미지는 db보다 하드에 저장하는 게 더 쌈
 */
app.get('/upload', function(요청, 응답){
    응답.render('upload.ejs');
})

/** upload.single('업로드할 input의 name 속성') 
 * 여러개면 upload.array('프로필', 10)
*/
app.post('/upload', upload.single('profile'), function(요청, 응답){
    응답.send('업로드완료');
});

app.get('/image/:imageName', function(요청, 응답){
    응답.sendFile(__dirname + '/public/image' + 요청.params.imageName);
})


/** 이 유저와 채팅하기(새로운 채팅룸 만들기) */
app.post('/chatroom', 로그인했니, function(요청, 응답){
    console.log(요청.body);
    var 만들데이터 = {
        member : [요청.body.작성자, 요청.user.id],
        date : new Date(),
        title : 요청.body.작성자 + ' 님 안녕하세요! ' + 요청.user.id + ' 입니다.'
    };
    db.collection('chatroom').insertOne(만들데이터).then((결과)=>{ //콜백함수 대신.then도 사용 가능
        
    })
    
})

app.get('/chat', 로그인했니, function(요청, 응답){
    db.collection('chatroom').find({member : 요청.user.id}).toArray().then((결과)=>{
        응답.render('chat.ejs', {data : 결과});
    })
})

/** 메세지 전송하기 */
app.post('/message', 로그인했니, function(요청, 응답){
    
    var 저장할거 = {
        parent : 요청.body.parent,
        content : 요청.body.content,
        userid : 요청.user.id,
        date : new Date()
    }
    db.collection('message').insertOne(저장할거).then(()=>{
        console.log('DB저장성공');
        응답.send('DB저장성공');

    })
})

/** Server Sent Event(SSE) 서버와 유저간 실시간 소통채널 열기(서버 > 유저 일방적)*/
app.get('/message/:id', 로그인했니, function(요청, 응답){

    // http요청시 header를 이렇게 수정해 주세요
    응답.writeHead(200, {
        "Connection": "Keep-alive",
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
    });

    db.collection('message').find({parent : 요청.params.id}).toArray()
    .then((결과)=>{
        //요청 한 번에 응답 여러번 받을 수 있음
        응답.write('event: test\n');
        응답.write('data: ' + JSON.stringify(결과) + '\n\n'); //JSON은 문자 취급 받음, 따옴표 붙이기
    })
    
    //원래 데이터베이스는 수동적인데, change stream기능을 이용하면 동적으로 db변동사항을 감시해줌
    const pipeline = [
        { $match: {'fullDocument.parent' : 요청.params.id}} //컬렉션 안의 원하는 document만 감시하고 싶으면
    ];
    const collection = db.collection('message');
    const changeStream = collection.watch(pipeline); //실시간 감시해줌
    changeStream.on('change', (result)=>{//해당 컬렉션애 변동 생기면 해당 함수 실행
        console.log(result.fullDocument);
        응답.write('event: test\n');
        응답.write('data: ' + JSON.stringify([result.fullDocument]) + '\n\n');//[]는 규격 통일
    });

});

/** socket 채팅방 접속 */
app.get('/socket', function(요청, 응답){
    응답.render('socket.ejs');
})

/** WebSocket 양방향 실시간 소통 */
io.on('connection', function(socket){
    console.log('유저접속됨');
    //채팅방 만들기
    socket.on('joinroom', function(data){
        socket.join('room1')
    })

    //채팅방 안의 유저들에게만 전송, room1-send로 메세지 보내면 room1에만 broadcast 전송
    socket.on('room1-send', function(data){
        io.to('room1').emit('broadcast', data)
    })
    
    //socket.emit한 메세지를 서버가 수신
    socket.on('user-send', function(data){
        console.log('유저 : ' +  data);
        //서버 > 유저 메세지 전송 (모든 유저에게)
        io.emit('broadcast', data)
        //서버 > 유저 1명간 소통
        io.to(socket.id).emit('broadcast', data)
    })
})