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
        airStr: "エアコンモード",
        normalStr: "ノーマルモード",
        lightStr: "電気",
        changeStr: "切り換え",
        allStr: "すべての機器よ",
        silenceStr: "静まれ",
        reserveStr: "予約",
        goodMorningStr: "おはよう",
        timeNowStr: "いまなんじ"
    }

var blueRayKeyword = {
        blueRayStr: "ブルーレイモード",
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
        tvStr: "テレビモード",
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
                    case commonKeyword["timeNowStr"]://いまなんじ
                        timeNow();
                        break;
                    case commonKeyword["goodMorningStr"]://おはよう
                        getForecast();
                        break;
                    case commonKeyword["allStr"]://すべての機器よ
                        commandMode = "all";
                        keepAliveTimer("はい");
                        break;
                    case commonKeyword["lightStr"]://電気モード
                        commandMode = "light";
                        keepAliveTimer(str + "に移行");
                        break;
                    case commonKeyword["airStr"]://エアコンモード
                        commandMode = "air"
                        keepAliveTimer(str + "に移行");
                        break;
                    case commonKeyword["closeStr"]://操作終了
                        close();
                        break;
                    case blueRayKeyword["blueRayStr"]://ブルーレイモード
                        commandMode = "powerBluRay";
                        keepAliveTimer(str + "に移行");
                        break;
                    case tvKeyword["tvStr"]://テレビモード
                        commandMode = "powerTv";
                        keepAliveTimer(str + "に移行");
                        break;
                    case blueRayKeyword["chapterNextStr"]://チャプターつぎ
                        blueClient.write('DSKF    \n');
                        keepAliveTimer(str);
                        break;
                    case blueRayKeyword["chapterBeforeStr"]://チャプターまえ
                        blueClient.write('DSKB    \n');
                        keepAliveTimer(str);
                        break;
                    case blueRayKeyword["stopPlayStr"]://停止
                        blueClient.write('DPUS    \n');
                        keepAliveTimer(str);
                        break;
                    case blueRayKeyword["playStr"]://再生
                        blueClient.write('DPLY    \n');
                        keepAliveTimer(str);
                        break;
                    case blueRayKeyword["endPlayStr"]://再生終了
                        blueClient.write('DSTP    \n');
                        keepAliveTimer(str);
                        break;
                    case blueRayKeyword["fastForwardStr"]://巻き戻し
                        blueClient.write('DFWD    \n');
                        keepAliveTimer(str);
                        break;
                    case blueRayKeyword["rewindStr"]://早送り
                        blueClient.write('DREV    \n');
                        keepAliveTimer(str);
                        break;
                    case blueRayKeyword["onStr"]://起動
                        blueClient.write('POWR1   \n');
                        keepAliveTimer(str);
                        break;
                    case blueRayKeyword["offStr"]://電源OFF
                        blueClient.write('POWR0   \n');
                        keepAliveTimer(str);
                        break;
                    case blueRayKeyword["programsStr"]://録画リスト
                        irkitSignal(freq_list.programs);
                        keepAliveTimer(str);
                        break;
                    case blueRayKeyword["upStr"]://うえいどう
                        irkitSignal(freq_list.up);
                        keepAliveTimer(str);
                        break;
                    case blueRayKeyword["downStr"]://したいどう
                        irkitSignal(freq_list.down);
                        keepAliveTimer(str);
                        break;
                    case blueRayKeyword["rightStr"]://右移動
                        irkitSignal(freq_list.right);
                        keepAliveTimer(str);
                        break;
                    case blueRayKeyword["leftStr"]://左移動
                        irkitSignal(freq_list.left);
                        keepAliveTimer(str);
                        break;
                    case blueRayKeyword["backStr"]://もどる
                        irkitSignal(freq_list.back);
                        keepAliveTimer(str);
                        break;
                    case tvKeyword["channelNextStr"]://チャンネルつぎ
                        tvClient.write('CHUP    \n');
                        keepAliveTimer(str);
                        break;
                    case tvKeyword["channelBeforeStr"]://チャンネルまえ
                        tvClient.write('CHDW    \n');
                        keepAliveTimer(str);
                        break;
                    case tvKeyword["modeChangeStr"]://入力切替
                        tvClient.write('ITGD    \n');
                        keepAliveTimer(str);
                        break;
                    case tvKeyword["wiiUStr"]://wiiu
                        irkitSignal(freq_list.wiiu);
                        tvClient.write('IAVD3   \n');
                        keepAliveTimer(str);
                        break;
                    case tvKeyword["ps4Str"]://ps4
                        tvClient.write('IAVD3   \n');
                        keepAliveTimer(str);
                        break;
                    case tvKeyword["volumeUpStr"]://おんりょうだい
                        volume += 2;
                        tvClient.write("VOLM"+volume+"  \n");
                        keepAliveTimer(str);
                        break;
                    case tvKeyword["volumeDownStr"]://おんりょうしょう
                        volume -= 2;
                        tvClient.write("VOLM"+volume+"  \n");
                        keepAliveTimer(str);
                        break;
                    default:
                        keepAliveTimer("もう一度お願いします");
                }
            } else if(commandMode == "powerBluRay"){
                switch(str){
                    case commonKeyword["onStr"]://起動
                        blueClient.write('POWR1   \n');
                        keepAliveTimer(str);
                        commandMode = "normal";
                        break;
                    case commonKeyword["offStr"]://電源OFF
                        blueClient.write('POWR0   \n');
                        keepAliveTimer(str);
                        commandMode = "normal";
                        break;
                    case commonKeyword["normalStr"]://ノーマルモード
                        commandMode = "normal"
                        keepAliveTimer(str+"に移行");
                        break;
                    case commonKeyword["lightStr"]://電気モード
                        commandMode = "light";
                        keepAliveTimer(str + "に移行");
                        break;
                    case commonKeyword["airStr"]://エアコンモード
                        commandMode = "air"
                        keepAliveTimer(str + "に移行");
                        break;
                    case commonKeyword["closeStr"]://操作終了
                        close();
                        break;
                    case blueRayKeyword["blueRayStr"]://ブルーレイモード
                        commandMode = "powerBluRay";
                        keepAliveTimer(str + "に移行");
                        break;
                    case tvKeyword["tvStr"]://テレビモード
                        commandMode = "powerTv";
                        keepAliveTimer(str + "に移行");
                        break;
                }
            } else if(commandMode == "powerTv"){
                switch(str){
                    case commonKeyword["onStr"]://起動
                        tvClient.write('POWR1   \n');
                        keepAliveTimer(str);
                        commandMode = "normal";
                        break;
                    case commonKeyword["offStr"]://電源OFF
                        tvClient.write('POWR0   \n');
                        keepAliveTimer(str);
                        commandMode = "normal";
                        break;
                    case commonKeyword["normalStr"]://ノーマルモード
                        commandMode = "normal"
                        keepAliveTimer(str+"に移行");
                        break;
                    case commonKeyword["lightStr"]://電気モード
                        commandMode = "light";
                        keepAliveTimer(str + "に移行");
                        break;
                    case commonKeyword["airStr"]://エアコンモード
                        commandMode = "air"
                        keepAliveTimer(str + "に移行");
                        break;
                    case commonKeyword["closeStr"]://操作終了
                        close();
                        break;
                    case blueRayKeyword["blueRayStr"]://ブルーレイモード
                        commandMode = "powerBluRay";
                        keepAliveTimer(str + "に移行");
                        break;
                    case tvKeyword["tvStr"]://テレビモード
                        commandMode = "powerTv";
                        keepAliveTimer(str + "に移行");
                        break;
                    default:
                        keepAliveTimer("もう一度お願いします");
                }
            } else if(commandMode == "air"){
                switch(str){
                    case commonKeyword["onStr"]://起動
                        irkitSignal(freq_list.airOn);
                        keepAliveTimer(str);
                        commandMode = "normal"
                        break;
                    case commonKeyword["offStr"]: //電源OFF
                        irkitSignal(freq_list.airOff);
                        keepAliveTimer(str);
                        commandMode = "normal"
                        break;
                    case commonKeyword["reserveStr"]://予約
                        irkitSignal(freq_list.airSet);
                        keepAliveTimer(str);
                        commandMode = "normal";
                        break;
                    case commonKeyword["normalStr"]://ノーマルモード
                        commandMode = "normal"
                        keepAliveTimer(str+"に移行");
                        break;
                    case commonKeyword["lightStr"]://電気モード
                        commandMode = "light";
                        keepAliveTimer(str + "に移行");
                        break;
                    case commonKeyword["airStr"]://エアコンモード
                        commandMode = "air"
                        keepAliveTimer(str + "に移行");
                        break;
                    case commonKeyword["closeStr"]://操作終了
                        close();
                        break;
                    case blueRayKeyword["blueRayStr"]://ブルーレイモード
                        commandMode = "powerBluRay";
                        keepAliveTimer(str + "に移行");
                        break;
                    case tvKeyword["tvStr"]://テレビモード
                        commandMode = "powerTv";
                        keepAliveTimer(str + "に移行");
                        break;
                    default:
                        keepAliveTimer("もう一度お願いします");
                }
            } else if(commandMode == "light"){
                switch(str){
                    case commonKeyword["changeStr"]:
                        irkitSignal(freq_list.light);
                        keepAliveTimer(str);
                        break;
                    case commonKeyword["onStr"]:
                        irkitSignal(freq_list.light);
                        setTimeout(function(){
                            irkitSignal(freq_list.light);
                        }, 500);
                        setTimeout(function(){
                            irkitSignal(freq_list.light);
                        }, 1000);
                        commandMode = "normal";
                        keepAliveTimer(str);
                        break;
                    case commonKeyword["offStr"]:
                        irkitSignal(freq_list.light);
                        setTimeout(function(){
                            irkitSignal(freq_list.light);
                        }, 500);
                        commandMode = "normal";
                        keepAliveTimer(str);
                        break;
                    case commonKeyword["normalStr"]://ノーマルモード
                        commandMode = "normal"
                        keepAliveTimer(str+"に移行");
                        break;
                    case commonKeyword["lightStr"]://電気モード
                        commandMode = "light";
                        keepAliveTimer(str + "に移行");
                        break;
                    case commonKeyword["airStr"]://エアコンモード
                        commandMode = "air"
                        keepAliveTimer(str + "に移行");
                        break;
                    case commonKeyword["closeStr"]://操作終了
                        close();
                        break;
                    case blueRayKeyword["blueRayStr"]://ブルーレイモード
                        commandMode = "powerBluRay";
                        keepAliveTimer(str + "に移行");
                        break;
                    case tvKeyword["tvStr"]://テレビモード
                        commandMode = "powerTv";
                        keepAliveTimer(str + "に移行");
                        break;
                    default:
                        keepAliveTimer("もう一度お願いします");
                }
            } else if(commandMode == "all"){
                switch(str){
                    case commonKeyword["silenceStr"]:
                        blueClient.write('POWR0   \n');
                        tvClient.write('POWR0   \n');
                        irkitSignal(freq_list.light);
                        irkitSignal(freq_list.airOff);
                        setTimeout(function(){
                            irkitSignal(freq_list.light);
                        }, 500)
                        keepAliveTimer("かしこまりました");
                        commandMode = "normal";
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

function getForecast(){
    var result;
    child = exec("curl 'http://weather.livedoor.com/forecast/webservice/json/v1?city=130010'",
        {timeout: 90000},
        function(error, stdout, stderr){
            if(stdout){
                var todayForecast = JSON.parse(unescapeUnicode(stdout))["forecasts"][0];
                var time = getNow();

                speak("おはようございます。今日は"+time.month+"月"+time.day+"日"+time.week+"曜日です。今の時刻は"+time.hour+"時"+time.minute+"分"+time.second+"秒です。天気は"+todayForecast["telop"]+"です。");
            }
            if(error !== null) {
               speak("失敗しました");
            }
        });
}

function timeNow(){
    var time = getNow();
    speak("今の時刻は"+time.hour+"時"+time.minute+"分"+time.second+"秒です。");
}

function irkitSignal(freq){
    child = exec("curl -i 'http://192.168.11.14/messages' -H 'X-Requested-With: curl' -d '"+JSON.stringify(freq)+"'",
        {timeout: 90000},
        function(error, stdout, stderr){
            if (stdout.substr(9,3) == "200"){
                // speak("成功しました");
            }
            if(error !== null) {
               speak("失敗しました");
            }
        });
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

function getNow(){
    var date= new Date();
    var year = date.getFullYear();
    var month = date.getMonth()+1;
    var week = date.getDay();
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    w = ["日","月","火","水","木","金","土"];
    return {
            year: year,
            month: month,
            week: w[week],
            day: day,
            hour: hour,
            minute: minute,
            second: second
            };
}

function unescapeUnicode(string) {
    return string.replace(/\\u([a-fA-F0-9]{4})/g,
        function(matchedString, group1) {
            return String.fromCharCode(parseInt(group1, 16));
        });
}
