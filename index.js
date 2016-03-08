var Julius = require('julius')
  , grammar = new Julius.Grammar();

grammar.add("つぎ");
grammar.add("まえ");

grammar.compile(function(err, result){
    if (err) throw err

    var julius = new Julius(grammar.getJconf());

    julius.on('result', function(str){
        console.log('認識結果', str);
    });
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
    });

    // エラー発生
    julius.on('error', function(str) {
        console.error('エラー', str);
    });

    julius.start();
})


