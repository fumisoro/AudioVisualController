var Julius = require('julius'),
    grammar = new Julius.Grammar(),
    Net = require('net'),
    __ = require('underscore'),
    exec = require('child_process').exec,
    freq_list = require('./freq_list'),
    child,
    timerId,
    commandMode = "done";

var commonKeyword = {
        startStr: "へいマイク",
        closeStr: "操作終了",
        onStr: "起動",
        offStr: "電源オフ",
        airStr: "エアコン",
        normalStr: "ノーマル",
        lightStr: "電気",
        changeStr: "切り換え"
    }

var blueRayKeyword = {
        blueRayStr: "ブルーレイ",
        chapterNextStr: "チャプターつぎ",
        chapterBeforeStr: "チャプターまえ",
        endPlayStr: "再生終了",
        playStr: "再生",
        fastForwardStr: "早送り",
        rewindStr: "巻き戻し",
        stopPlayStr: "停止",
        programsStr: "録画リスト",
        upStr: "うえいどう",
        downStr: "したいどう",
        leftStr: "ひだりいどう",
        rightStr: "みぎいどう",
        backStr: "もどる"
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
    // if (data.toJSON().data.toString() == [79,75,13,13,10].toString()){
    //     speak("成功しました");
    // }
});

tvClient.on('data', function(data){
    console.log('tvClient data: ' + data);
    // if (data.toJSON().data.toString() == [79,75,13,13,10].toString()){
    //     speak("成功しました");
    // }
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
        if (commandMode == "done"){
            switch (str){
                case commonKeyword["startStr"]:
                    commandMode = "normal";
                    keepAliveTimer("コマンドを受け付けます")
                    break;
            }
        }else if(commandMode == "normal"){
            switch (str){
                    case commonKeyword["lightStr"]:
                        commandMode = "light";
                        keepAliveTimer(str + "モードに移行");
                        break;
                    case commonKeyword["airStr"]:
                        commandMode = "air"
                        keepAliveTimer(str + "モードに移行");
                        break;
                    case commonKeyword["closeStr"]:
                        close();
                        break;
                    case blueRayKeyword["blueRayStr"]:
                        commandMode = "powerBluRay";
                        keepAliveTimer(str + "モードに移行");
                        break;
                    case tvKeyword["tvStr"]:
                        commandMode = "powerTv";
                        keepAliveTimer(str + "モードに移行");
                        break;
                    case blueRayKeyword["chapterNextStr"]:
                        blueClient.write('DSKF    \n');
                        keepAliveTimer(str);
                        break;
                    case blueRayKeyword["chapterBeforeStr"]:
                        blueClient.write('DSKB    \n');
                        keepAliveTimer(str);
                        break;
                    case blueRayKeyword["stopPlayStr"]:
                        blueClient.write('DPUS    \n');
                        keepAliveTimer(str);
                        break;
                    case blueRayKeyword["playStr"]:
                        blueClient.write('DPLY    \n');
                        keepAliveTimer(str);
                        break;
                    case blueRayKeyword["endPlayStr"]:
                        blueClient.write('DSTP    \n');
                        keepAliveTimer(str);
                        break;
                    case blueRayKeyword["fastForwardStr"]:
                        blueClient.write('DFWD    \n');
                        keepAliveTimer(str);
                        break;
                    case blueRayKeyword["rewindStr"]:
                        blueClient.write('DREV    \n');
                        keepAliveTimer(str);
                        break;
                    case blueRayKeyword["onStr"]:
                        blueClient.write('POWR1   \n');
                        keepAliveTimer(str);
                        break;
                    case blueRayKeyword["offStr"]:
                        blueClient.write('POWR0   \n');
                        keepAliveTimer(str);
                        break;
                    case blueRayKeyword["programsStr"]:
                        irkitSignal(freq_list.programs);
                        keepAliveTimer(str);
                        break;
                    case blueRayKeyword["upStr"]:
                        irkitSignal(freq_list.up);
                        keepAliveTimer(str);
                        break;
                    case blueRayKeyword["downStr"]:
                        irkitSignal(freq_list.down);
                        keepAliveTimer(str);
                        break;
                    case blueRayKeyword["rightStr"]:
                        irkitSignal(freq_list.right);
                        keepAliveTimer(str);
                        break;
                    case blueRayKeyword["leftStr"]:
                        irkitSignal(freq_list.left);
                        keepAliveTimer(str);
                        break;
                    case blueRayKeyword["backStr"]:
                        irkitSignal(freq_list.back);
                        keepAliveTimer(str);
                        break;
                    case tvKeyword["channelNextStr"]:
                        tvClient.write('CHUP    \n');
                        keepAliveTimer(str);
                        break;
                    case tvKeyword["channelBeforeStr"]:
                        tvClient.write('CHDW    \n');
                        keepAliveTimer(str);
                        break;
                    case tvKeyword["modeChangeStr"]:
                        tvClient.write('ITGD    \n');
                        keepAliveTimer(str);
                        break;
                    case tvKeyword["wiiUStr"]:
                        irkitSignal(freq_list.wiiu);
                        tvClient.write('IAVD3   \n');
                        keepAliveTimer(str);
                        break;
                    case tvKeyword["ps4Str"]:
                        tvClient.write('IAVD3   \n');
                        keepAliveTimer(str);
                        break;
                    case tvKeyword["volumeUpStr"]:
                        volume += 2;
                        console.log(volume);
                        tvClient.write("VOLM"+volume+"  \n");
                        keepAliveTimer(str);
                        break;
                    case tvKeyword["volumeDownStr"]:
                        volume -= 2;
                        console.log(volume);
                        tvClient.write("VOLM"+volume+"  \n");
                        keepAliveTimer(str);
                        break;
                    default:
                        keepAliveTimer("もう一度お願いします");
                }
            } else if(commandMode == "powerBluRay"){
                switch(str){
                    case commonKeyword["onStr"]:
                        blueClient.write('POWR1   \n');
                        keepAliveTimer(str);
                        commandMode = "normal";
                        break;
                    case commonKeyword["offStr"]:
                        blueClient.write('POWR0   \n');
                        keepAliveTimer(str);
                        commandMode = "normal";
                        break;
                    case commonKeyword["normalStr"]:
                        commandMode = "normal"
                        keepAliveTimer(str+"モードに移行");
                        break;
                }
            } else if(commandMode == "powerTv"){
                switch(str){
                    case commonKeyword["onStr"]:
                        tvClient.write('POWR1   \n');
                        keepAliveTimer(str);
                        commandMode = "normal";
                        break;
                    case commonKeyword["offStr"]:
                        tvClient.write('POWR0   \n');
                        keepAliveTimer(str);
                        commandMode = "normal";
                        break;
                    case commonKeyword["normalStr"]:
                        commandMode = "normal"
                        keepAliveTimer(str+"モードに移行");
                        break;
                }
            } else if(commandMode == "air"){
                switch(str){
                    case commonKeyword["onStr"]:
                        irkitSignal(freq_list.airOn);
                        keepAliveTimer(str);
                        commandMode = "normal"
                        break;
                    case commonKeyword["offStr"]:
                        irkitSignal(freq_list.airOff);
                        keepAliveTimer(str);
                        commandMode = "normal"
                        break;
                    case commonKeyword["normalStr"]:
                        commandMode = "normal"
                        keepAliveTimer(str+"モードに移行");
                        break;
                }
            } else if(commandMode == "light"){
                switch(str){
                    case commonKeyword["changeStr"]:
                        irkitSignal(freq_list.light);
                        keepAliveTimer(str);
                        break;
                    case commonKeyword["normalStr"]:
                        commandMode = "normal"
                        keepAliveTimer(str+"モードに移行");
                        break;
                }
            }
    });

    // juliusエラー処理
    julius.on('error', function(str) {
        console.error('エラー', str);
    });

    julius.start();
})

function irkitSignal(freq){
    child = exec("curl -i 'http://192.168.11.14/messages' -H 'X-Requested-With: curl' -d '"+JSON.stringify(freq)+"'",
        {timeout: 90000},
        function(error, stdout, stderr){
            if (stdout.substr(9,3) == "200"){
                speak("成功しました");
            }
            if(error !== null) {
               speak("失敗しました");
            }
        });
    console.log ("curl -i 'http://192.168.11.14/messages' -H 'X-Requested-With: curl' -d '"+JSON.stringify(freq)+"'");
}

function speak(str){
    child = exec("~/AudioVisualController/aquestalkpi/AquesTalkPi '"+str+"' | aplay");
}

function close(){
    clearTimeout(timerId);
    commandMode = "done";
    speak("受付を終了しました");

}

function keepAliveTimer(str){
    speak(str);
    clearTimeout(timerId);
    timerId = setTimeout(function(){
        close();
    }, 10000)
}
