var Julius = require('julius'),
    grammar = new Julius.Grammar(),
    Net = require('net');


grammar.add("チャプターつぎ");
grammar.add("チャプターまえ");
//grammar.add("終了");
grammar.add("再生");
grammar.add("早送り");
grammar.add("巻戻し");
grammar.add("ブルーレイ");
grammar.add("停止");

grammar.add("テレビ");
grammar.add("チャンネルつぎ");
grammar.add("チャンネルまえ");
grammar.add("音量だい");
grammar.add("音量しょう");
grammar.add("入力切り換え");

grammar.add("起動");
grammar.add("電源オフ");
grammar.add("操作終了");


var BDHOST = '192.168.11.3';
var TVHOST = '192.168.11.9';
var PORT = 10002;
var blueClient = new Net.Socket();
blueClient.connect(PORT, BDHOST, function() {
    console.log('CONNECTED TO: ' + BDHOST + ':' + PORT+" BD");
    blueClient.write('aquos\n');
    blueClient.write('pass\n');
});

var tvClient = new Net.Socket();
tvClient.connect(PORT, TVHOST, function(){
    console.log('CONNECTED TO: ' + TVHOST + ':' + PORT+" TV");
    tvClient.write('aquos\n');
    tvClient.write('pass\n');
});


var bootTime = new Date();
bootTime.setSeconds(bootTime.getSeconds() - 10);

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
        if(time.getTime() - bootTime.getTime() > 10000){
            switch (str){
                case "ブルーレイ":
                    bootTime = new Date();
                    operationMode = "blue";
                    break;
                case "テレビ":
                    bootTime = new Date();
                    operationMode = "tv";
                    break;
            }
        }else{
            if (operationMode === "blue"){
                switch (str){
                    case "チャプターつぎ":
                        blueClient.write('DSKF    \n');
                        bootTime = new Date();
                        break;
                    case "チャプターまえ":
                        blueClient.write('DSKB    \n');
                        bootTime = new Date();
                        break;
                    case "停止":
                        blueClient.write('DPUS    \n');
                        bootTime = new Date();
                        break;
                    case "再生":
                        blueClient.write('DPLY    \n');
                        bootTime = new Date();
                        break;
                    case "終了"://停止中
                        blueClient.write('DSTP    \n');
                        bootTime = new Date();
                        break;
                    case "早送り":
                        blueClient.write('DFWD    \n');
                        bootTime = new Date();
                        break;
                    case "巻戻し":
                        blueClient.write('DREV    \n');
                        bootTime = new Date();
                        break;
                    case "起動":
                        blueClient.write('POWR1   \n');
                        break;
                    case "電源オフ":
                        blueClient.write('POWR0   \n');
                        break;
                    case "操作ストップ":
                        bootTime.setSeconds(bootTime.getSeconds() - 10);
                        break;
                }
            } else if(operationMode == "tv"){
                switch(str){
                    case "チャンネルつぎ":
                        tvClient.write('CHUP    \n');
                        break;
                    case "チャンネルまえ":
                        tvClient.write('CHDW    \n');
                        break;
                    case "入力切り換え":
                        tvClient.write('ITGD    \n');
                        break;
                    case "起動":
                        tvClient.write('POWR1   \n');
                        break;
                    case "電源オフ":
                        tvClient.write('POWR0   \n');
                        break;
                    case "操作ストップ":
                        bootTime.setSeconds(bootTime.getSeconds() - 10);
                        break;
                }
            }
        }
    });

    // エラー発生
    julius.on('error', function(str) {
        console.error('エラー', str);
    });

    julius.start();
})


