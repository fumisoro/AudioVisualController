var Julius = require('julius'),
    grammar = new Julius.Grammar(),
    Net = require('net'),
    __ = require('underscore'),
    exec = require('child_process').exec,
    child;

var startStr = "へいマイク",
    closeStr = "操作終了";

grammar.add(startStr);
grammar.add(closeStr);

var bluRayStr = "ブルーレイ"
    blueRayKeyword = {
        chapterNextStr: "チャプターつぎ",
        chapterBeforeStr: "チャプターまえ",
        endPlayStr: "再生終了",
        playStr: "再生",
        fastForwardStr: "早送り",
        rewindStr: "巻き戻し",
        stopPlayStr: "停止",
        onStr: "起動",
        offStr: "電源オフ"
    }

__.each(blueRayKeyword, function(value, key){
    blueRayKeyword[key] = bluRayStr + value;
    grammar.add(blueRayKeyword[key]);
    console.log(blueRayKeyword[key]);
});

var tvStr = "テレビ"
    tvKeyword = {
        channelNextStr: "チャンネルつぎ",
        channelBeforeStr: "チャンネルまえ",
        volumeUpStr: "音量だい",
        volumeDownStr: "音量しょう",
        modeChangeStr: "入力切り換え",
        wiiUStr: "うぃーゆー",
        ps4Str: "ぴーえすふぉー",
        onStr: "起動",
        offStr: "電源オフ",
        tvStr: "テレビ"
    }

__.each(tvKeyword, function(value, key){
    tvKeyword[key] = tvStr + value;
    grammar.add(tvKeyword[key]);
    console.log(tvKeyword[key]);
})

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



var bootTime = new Date();
bootTime.setSeconds(bootTime.getSeconds() - 100);

var operationMode = "";

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
        var time = new Date();
        if (time.getTime() - bootTime.getTime() > 30000){
            switch (str){
                case startStr:
                    child = exec('aplay ~/AudioVisualController/aquestalkpi/start.wav');
                    bootTime = new Date();
                    break;
            }
        }else{
            switch (str){
                    case "うえ移動":
                        blueClient.write("UP      \n");
                        bootTime = new Date();
                        break;
                    case "した移動":
                        blueClient.write("DW      \n");
                        bootTime = new Date();
                        break;
                    case blueRayKeyword["chapterNextStr"]:
                        blueClient.write('DSKF    \n');
                        bootTime = new Date();
                        break;
                    case blueRayKeyword["chapterBeforeStr"]:
                        blueClient.write('DSKB    \n');
                        bootTime = new Date();
                        break;
                    case blueRayKeyword["stopPlayStr"]:
                        blueClient.write('DPUS    \n');
                        bootTime = new Date();
                        break;
                    case blueRayKeyword["playStr"]:
                        blueClient.write('DPLY    \n');
                        bootTime = new Date();
                        break;
                    case blueRayKeyword["endPlayStr"]:
                        blueClient.write('DSTP    \n');
                        bootTime = new Date();
                        break;
                    case blueRayKeyword["fastForwardStr"]:
                        blueClient.write('DFWD    \n');
                        bootTime = new Date();
                        break;
                    case blueRayKeyword["rewindStr"]:
                        blueClient.write('DREV    \n');
                        bootTime = new Date();
                        break;
                    case blueRayKeyword["onStr"]:
                        blueClient.write('POWR1   \n');
                        break;
                    case blueRayKeyword["offStr"]:
                        blueClient.write('POWR0   \n');
                        break;
                    case closeStr:
                        child = exec('aplay ~/AudioVisualController/aquestalkpi/end.wav');
                        bootTime.setSeconds(bootTime.getSeconds() - 60);
                        break;
                    case tvKeyword["channelNextStr"]:
                        tvClient.write('CHUP    \n');
                        bootTime = new Date();
                        break;
                    case tvKeyword["channelBeforeStr"]:
                        tvClient.write('CHDW    \n');
                        bootTime = new Date();
                        break;
                    case tvKeyword["modeChangeStr"]:
                        tvClient.write('ITGD    \n');
                        bootTime = new Date();
                        break;
                    case tvKeyword["wiiUStr"]:
                    case tvKeyword["ps4Str"]:
                        tvClient.write('IAVD3   \n');
                        bootTime = new Date();
                        break;
                    case tvKeyword["tvStr"]:
                        tvClient.write('ITVD    \n');
                        break;
                    case tvKeyword["onStr"]:
                        tvClient.write('POWR1   \n');
                        break;
                    case tvKeyword["offStr"]:
                        tvClient.write('POWR0   \n');
                        break;
                    case tvKeyword["volumeUpStr"]:
                        volume += 1;
                        console.log(volume);
                        tvClient.write("VOLM"+volume+"  \n");
                        bootTime = new Date();
                        break;
                    case tvKeyword["volumeDownStr"]:
                        volume -= 1;
                        console.log(volume);
                        tvClient.write("VOLM"+volume+"  \n");
                        bootTime = new Date();
                        break;
                }
            }
    });

    // エラー発生
    julius.on('error', function(str) {
        console.error('エラー', str);
    });

    julius.start();
})


