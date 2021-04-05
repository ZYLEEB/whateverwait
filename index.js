
//langauge and dialect setting
var langs =
    [['Afrikaans', ['af-ZA']],
    ['Bahasa Indonesia', ['id-ID']],
    ['Bahasa Melayu', ['ms-MY']],
    ['Català', ['ca-ES']],
    ['Čeština', ['cs-CZ']],
    ['Deutsch', ['de-DE']],
    ['English', ['en-AU', 'Australia'],
        ['en-CA', 'Canada'],
        ['en-IN', 'India'],
        ['en-NZ', 'New Zealand'],
        ['en-ZA', 'South Africa'],
        ['en-GB', 'United Kingdom'],
        ['en-US', 'United States']],
    ['Español', ['es-AR', 'Argentina'],
        ['es-BO', 'Bolivia'],
        ['es-CL', 'Chile'],
        ['es-CO', 'Colombia'],
        ['es-CR', 'Costa Rica'],
        ['es-EC', 'Ecuador'],
        ['es-SV', 'El Salvador'],
        ['es-ES', 'España'],
        ['es-US', 'Estados Unidos'],
        ['es-GT', 'Guatemala'],
        ['es-HN', 'Honduras'],
        ['es-MX', 'México'],
        ['es-NI', 'Nicaragua'],
        ['es-PA', 'Panamá'],
        ['es-PY', 'Paraguay'],
        ['es-PE', 'Perú'],
        ['es-PR', 'Puerto Rico'],
        ['es-DO', 'República Dominicana'],
        ['es-UY', 'Uruguay'],
        ['es-VE', 'Venezuela']],
    ['Euskara', ['eu-ES']],
    ['Français', ['fr-FR']],
    ['Galego', ['gl-ES']],
    ['Hrvatski', ['hr_HR']],
    ['IsiZulu', ['zu-ZA']],
    ['Íslenska', ['is-IS']],
    ['Italiano', ['it-IT', 'Italia'],
        ['it-CH', 'Svizzera']],
    ['Magyar', ['hu-HU']],
    ['Nederlands', ['nl-NL']],
    ['Norsk bokmål', ['nb-NO']],
    ['Polski', ['pl-PL']],
    ['Português', ['pt-BR', 'Brasil'],
        ['pt-PT', 'Portugal']],
    ['Română', ['ro-RO']],
    ['Slovenčina', ['sk-SK']],
    ['Suomi', ['fi-FI']],
    ['Svenska', ['sv-SE']],
    ['Türkçe', ['tr-TR']],
    ['български', ['bg-BG']],
    ['Pусский', ['ru-RU']],
    ['Српски', ['sr-RS']],
    ['한국어', ['ko-KR']],
    ['中文', ['cmn-Hans-CN', '普通话 (中国大陆)'],
        ['cmn-Hans-HK', '普通话 (香港)'],
        ['cmn-Hant-TW', '中文 (台灣)'],
        ['yue-Hant-HK', '粵語 (香港)']],
    ['日本語', ['ja-JP']],
    ['Lingua latīna', ['la']]];

for (let i = 0; i < langs.length; i++) {
    select_language.options[i] = new Option(langs[i][0], i);
}
// set Chinese as defaut select_language  
select_language.selectedIndex = 29;
updateCountry();
select_dialect.selectedIndex = 2;
showInfo('info_start');

function updateCountry() {
    for (var i = select_dialect.options.length - 1; i >= 0; i--) {
        select_dialect.remove(i);
    }
    var list = langs[select_language.selectedIndex];
    for (var i = 1; i < list.length; i++) {
        select_dialect.options.add(new Option(list[i][1], list[i][0]));
    }
    select_dialect.style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
}


//speech recognition and counting
let final_transcript = '';
let recognizing = false;
let ignore_onend;
let start_timestamp;
let countMap = new Map();
countMap.set('反正', 0);
countMap.set('等一下', 0);

if (!('webkitSpeechRecognition' in window)) {
    upgrade();
} else {
    var recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = function () {
        recognizing = true;
    };

    recognition.onerror = function (event) {
        if (event.error == 'no-speech') {
            showInfo('info_no_speech');
            ignore_onend = true;
        }
        if (event.error == 'audio-capture') {
            showInfo('info_no_microphone');
            ignore_onend = true;
        }
        if (event.error == 'not-allowed') {
            if (event.timeStamp - start_timestamp < 100) {
                showInfo('info_blocked');
                $("#start_button").text('開始上課');
            } else {
                showInfo('info_denied');
                $("#start_button").text('開始上課');
            }
            ignore_onend = true;
        }
    };

    recognition.onend = function () {
        recognizing = false;
        if (ignore_onend) {
            return;
        }
    };


    recognition.onresult = function (event) {
        var interim_transcript = '';
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                let substring = event.results[i][0].transcript;
                for (let [key, value] of countMap) {
                    let idString = "#" + key;
                    while (substring.indexOf(key) != -1 && substring.length >= key.length) {
                        countMap.set(key, ++value);
                        $(idString).text(value);
                        $(idString).effect("bounce");
                        substring = substring.substring(substring.indexOf(key) + key.length);
                    }
                }
                final_transcript += event.results[i][0].transcript;
            } else {
                interim_transcript += event.results[i][0].transcript;
            }
        }
        final_transcript = capitalize(final_transcript);
        final_span.innerHTML = linebreak(final_transcript);
        interim_span.innerHTML = linebreak(interim_transcript);

    }


}

function upgrade() {
    start_button.style.visibility = 'hidden';
    showInfo('info_upgrade');
}

var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
    return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

var first_char = /\S/;
function capitalize(s) {
    return s.replace(first_char, function (m) { return m.toUpperCase(); });
}

function startButton(event) {
    if (recognizing) {
        recognition.stop();
        $("#start_button").text('開始上課');
        $("#detect").prop('disabled', false);
        $("#addButton").prop('disabled', false);
        $("#clearButton").prop('disabled', false);
        return;
    } else {

        $("#detect").prop('disabled', true);
        $("#addButton").prop('disabled', true);
        $("#clearButton").prop('disabled', true);
    }

    final_transcript = '';
    recognition.lang = select_dialect.value;
    recognition.start();
    $("#start_button").text('停止上課');
    ignore_onend = false;
    final_span.innerHTML = '';
    interim_span.innerHTML = '';
    showInfo('info_allow');
    start_timestamp = event.timeStamp;
}

function showInfo(s) {
    if (s) {
        for (var child = info.firstChild; child; child = child.nextSibling) {
            if (child.style) {
                child.style.display = child.id == s ? 'inline' : 'none';
            }
        }
        info.style.visibility = 'visible';
    } else {
        info.style.visibility = 'hidden';
    }
}



//button action

function addDetect() {
    let detect = $("#detect").val();
    $("#detect").val("");
    if (detect.trim() != "") {
        countMap.set(detect, 0);
        let idString = "\'" + detect + "\'";
        $("#board").append(" <div  class='countBoard'><p >" + detect + "</p> <p class='countNumber' id=" + idString + ">0</p></div>")
    } else (
        alert("要輸入文字喔")
    )
}

function clearButton() {
    if (confirm("確定要清空嗎?複製記錄的內容沒?")) {
        for (let [key, value] of countMap) {
            let idString = "#" + key;
            $(idString).parent().remove();

        }
        countMap.clear();
        $("#final_span").html("貓咪和狗狗都是可愛的!<br>1.選擇語言<br>2.新增偵測文字<br>3.按下按鈕<br>開始上課！");
        $("#detect").prop('disable', recognizing ? false : true);

    }

}
