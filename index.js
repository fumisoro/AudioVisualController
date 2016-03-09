var Julius = require('julius'),
    grammar = new Julius.Grammar(),
    Net = require('net');


grammar.add("つぎ");
grammar.add("まえ");


var HOST = '192.168.11.3';
var PORT = 10002;
var client = new Net.Socket();
client.connect(PORT, HOST, function() {
    console.log('CONNECTED TO: ' + HOST + ':' + PORT);
    client.write('aquos\n');
    client.write('pass\n');
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
        if (str=="つぎ"){
            client.write('DSKF    \n');
        }
        if (str=="まえ"){
            client.write('DSKB    \n');
        }
    });

    // エラー発生
    julius.on('error', function(str) {
        console.error('エラー', str);
    });

    julius.start();
})


