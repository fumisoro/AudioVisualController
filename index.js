var Julius = require('julius'),
    grammar = new Julius.Grammar(),
    Net = require('net'),
    __ = require('underscore'),
    exec = require('child_process').exec,
    child,
    timerId,
    activeFlg = false;

var commonKeyword = {
        startStr: "へいマイク",
        closeStr: "操作終了",
        onStr: "起動",
        offStr: "電源オフ"
    }

var blueRayKeyword = {
        blueRayStr: "ブルーレイ,",
        chapterNextStr: "チャプターつぎ",
        chapterBeforeStr: "チャプターまえ",
        endPlayStr: "再生終了",
        playStr: "再生",
        fastForwardStr: "早送り",
        rewindStr: "巻き戻し",
        stopPlayStr: "停止"
    }

var tvKeyword = {
        tvStr: "テレビ",
        channelNextStr: "チャンネルつぎ",
        channelBeforeStr: "チャンネルまえ",
        volumeUpStr: "音量だい",
        volumeDownStr: "音量しょう",
        modeChangeStr: "入力切り換え",
        wiiUStr: "うぃーゆー",
        ps4Str: "ぴーえすふぉー"
    }

__.each(commonKeyword, function(value, key){
    grammar.add(commonKeyword[key]);
    console.log(commonKeyword[key]);
});

__.each(blueRayKeyword, function(value, key){
    grammar.add(blueRayKeyword[key]);
    console.log(blueRayKeyword[key]);
});

__.each(tvKeyword, function(value, key){
    grammar.add(tvKeyword[key]);
    console.log(tvKeyword[key]);
});

var volume = 20;


var BDHOST = '192.168.11.3';
var TVHOST = '192.168.11.9';
var PORT = 10002;
var blueClient = new Net.Socket();
var tvClient = new Net.Socket();
blueClient.setKeepAlive(true);
tvClient.setKeepAlive(true);

tvClient.connect(PORT, TVHOST, function(){
    console.log('CONNECTED TO: ' + TVHOST + ':' + PORT+" TV");
    tvClient.write('aquos\n');
    tvClient.write('pass\n');
});

blueClient.connect(PORT, BDHOST, function() {
    console.log('CONNECTED TO: ' + BDHOST + ':' + PORT+" BD");
    blueClient.write('aquos\n');
    blueClient.write('pass\n');
});


blueClient.on('end', function(){
    console.log('blueClient disconnected');
});

tvClient.on('end', function(){
    console.log('tvClient disconnected');
});

blueClient.on('connect', function(){
    console.log('blueClient connect');
});

tvClient.on('connect', function(){
    console.log('tvClient connect');
});

blueClient.on('timeout', function(){
    console.log('blueClient timeout');
});

tvClient.on('timeout', function(){
    console.log('tvClient timeout');
});

blueClient.on('error', function(){
    blueClient.end();
    console.log('blueClient error');
});

tvClient.on('error', function(){
    tvClient.end();
    console.log('tvClient error');
});

blueClient.on('close', function(){
    console.log('blueClient close');
    blueClient.connect(PORT, BDHOST, function(){
        console.log('CONNECTED TO: ' + BDHOST + ':' + PORT+" BD");
        blueClient.write('aquos\n');
        blueClient.write('pass\n');
    });
});

tvClient.on('close', function(){
    console.log('tvClient close');
    tvClient.connect(PORT, TVHOST, function(){
        console.log('CONNECTED TO: ' + TVHOST + ':' + PORT+" TV");
        tvClient.write('aquos\n');
        tvClient.write('pass\n');
    });
});

blueClient.on('data', function(data){
    console.log('blueClient data: ' + data);
});

tvClient.on('data', function(data){
    console.log('tvClient data: ' + data);
});

grammar.compile(function(err, result){
    if (err) throw err

    var julius = new Julius(grammar.getJconf());

    // 発話待機
    julius.on('speechReady', function() {
        console.log('onSpeechReady');
    });

    // 発話開始
    julius.on('speechStart', function() {
        console.log('onSpeechStart');
    });

    // 発話終了
    julius.on('speechStop', function() {
        console.log('onSpeechStop');
    });

    // 音声認識エンジン開始
    julius.on('start', function() {
        console.log('onStart');
    });

    // 音声認識エンジン一時停止（stop した時に呼ばれる）
    julius.on('pause', function() {
        console.log('onPause');
    });

    // 認識結果を str で返す
    julius.on('result', function(str) {
        console.log('認識結果:', str);
        if (!activeFlg){
            switch (str){
                case commonKeyword["startStr"]:
                    activeFlg = true;
                    speak("コマンドを受け付けます");
                    timerId = setTimeout(function(){
                        close();
                    }, 10000)
                    break;
            }
        }else{
            switch (str){
                    case commonKeyword["closeStr"]:
                        close();
                        break;
                    case commonKeyword["onStr"]:
                        tvClient.write('POWR1   \n');
                        speak(str);
                        break;
                    case commonKeyword["offStr"]:
                        tvClient.write('POWR0   \n');
                        speak(str);
                        break;
                    case blueRayKeyword["chapterNextStr"]:
                        blueClient.write('DSKF    \n');
                        speak(str);
                        break;
                    case blueRayKeyword["chapterBeforeStr"]:
                        blueClient.write('DSKB    \n');
                        speak(str);
                        break;
                    case blueRayKeyword["stopPlayStr"]:
                        blueClient.write('DPUS    \n');
                        speak(str);
                        break;
                    case blueRayKeyword["playStr"]:
                        blueClient.write('DPLY    \n');
                        speak(str);
                        break;
                    case blueRayKeyword["endPlayStr"]:
                        blueClient.write('DSTP    \n');
                        speak(str);
                        break;
                    case blueRayKeyword["fastForwardStr"]:
                        blueClient.write('DFWD    \n');
                        speak(str);
                        break;
                    case blueRayKeyword["rewindStr"]:
                        blueClient.write('DREV    \n');
                        speak(str);
                        break;
                    case blueRayKeyword["onStr"]:
                        blueClient.write('POWR1   \n');
                        speak(str);
                        break;
                    case blueRayKeyword["offStr"]:
                        blueClient.write('POWR0   \n');
                        speak(str);
                        break;
                    case tvKeyword["channelNextStr"]:
                        tvClient.write('CHUP    \n');
                        speak(str);
                        break;
                    case tvKeyword["channelBeforeStr"]:
                        tvClient.write('CHDW    \n');
                        speak(str);
                        break;
                    case tvKeyword["modeChangeStr"]:
                        tvClient.write('ITGD    \n');
                        speak(str);
                        break;
                    case tvKeyword["wiiUStr"]:
                    case tvKeyword["ps4Str"]:
                        tvClient.write('IAVD3   \n');
                        break;
                    case tvKeyword["tvStr"]:
                        tvClient.write('ITVD    \n');
                        speak(str);
                        break;
                    case tvKeyword["volumeUpStr"]:
                        volume += 1;
                        console.log(volume);
                        tvClient.write("VOLM"+volume+"  \n");
                        speak(str);
                        break;
                    case tvKeyword["volumeDownStr"]:
                        volume -= 1;
                        console.log(volume);
                        tvClient.write("VOLM"+volume+"  \n");
                        speak(str);
                        break;
                    default:
                        speak("もう一度お願いします");
                }
            }
    });

    // エラー発生
    julius.on('error', function(str) {
        console.error('エラー', str);
    });

    julius.start();
})

function speak(str){
    child = exec("~/AudioVisualController/aquestalkpi/AquesTalkPi '"+str+"' | aplay");
}

function close(){
    clearTimeout(timerId);
    activeFlg = false;
    speak("受付を終了します");
}
