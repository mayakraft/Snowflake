// START / STOP BOT:
//  ssh into your EC2: (ssh -i "yourkeyfile.pem" ubuntu@52.33.245.123)
//  MAKE A VIRTUAL DISPLAY: type:
//    sudo nohup Xvfb :1 -screen 0 1024x768x24 &
//    export DISPLAY=":1"
//  START BOT: forever -o out.log -e err.log start bot.js
//  STOP BOT: forever stop bot.js
//  STOP ALL BOTS: forever stopall

var myTwitterName = 'SnowflakeBot';

var Twit = require('twit');
var config = require('./config');
var exec = require('child_process').exec;
var fs = require('fs');
// var IPAConversion = require('./ipa');
const words = require('cmu-pronouncing-dictionary')
var T = new Twit(config)

///////////////////////////////////////////
// TWEET AN ATTACHED IMAGE MADE IN PROCESSING

// compile the processing app (File -> Export Application)
//    specify location here:
// var imagemakerFolder = '`pwd`/application.linux-armv6hf/';
// var imagemakerFolder = '`pwd`/application.linux32/';
var imagemakerFolder = 'application.linux64/';
// var imagemakerFolder = '`pwd`/application.macosx/';


// console.log("Starting Twitter Bot..");
tweetImage();
setInterval(tweetImage, 1000 * 60 * 60);

function tweetImage(tweetTextContent, tweetReplyID){
	if(tweetTextContent == undefined)
		tweetTextContent = ' ';

	// UNCOMPILED PROCESSING SKETCH
	// var cmd = 'processing-java --sketch=`pwd`/imagemaker --run';
	// exec(cmd, processing);

	// COMPILED PROCESSING SKETCH
	var cmd = '`pwd`/' + imagemakerFolder + 'imagemaker';
	exec(cmd, processing);

	function processing(error, stdout, stderr){
		if(error){
			console.log(error);
			if(stdout){
				console.log(stdout);
			}
			if(stderr){
				console.log(stderr);
			}
			return;
		}
		var imageFile = imagemakerFolder + 'output.png';
		var params = {
			encoding: 'base64'
		};
		var b64 = fs.readFileSync(imageFile, params);
		T.post('media/upload', { media_data: b64}, uploaded);

		function uploaded(err, data, response){
			// console.log('image uploaded');
			// media has been uploaded, now we can tweet with the ID of the image
			var id = data.media_id_string;
			var tweet = {
				status: tweetTextContent,
				media_ids: [id]
			}
			if(tweetReplyID != undefined){
				console.log('this is a tweet response to someone ' + tweetReplyID);
				tweet = {
					status: tweetTextContent,
					in_reply_to_status_id: tweetReplyID,
					media_ids: [id]
				}
				console.log('augmented the tweet body');
			}
			T.post('statuses/update', tweet, tweeted);
			// console.log(data);
			function tweeted(err, data, response) {
				if(err){
					console.log('ERROR: ' + err);
				}
				else{
					// console.log('tweet posted');
					fs.exists(imageFile, function(exists) {
						if(exists) fs.unlink(imageFile);
					});
					// console.log(data);
				}
			};
		}
	}
}


////////////////////////////
// TWEET AT A REPEATING INTERVAL

// tweetIt();
// setInterval(tweetIt, 1000 * 60 * 5);



////////////////////////////
// BASIC TWEET

function tweetIt(txt){
	var tweet = { 
		status: txt
	};
	function gotData(err, data, response) {
		if(err){
			console.log('ERROR: ' + err);
		}
		else{
			console.log('tweet posted');
			// console.log(data);
		}
	};
	T.post('statuses/update', tweet, gotData);
}


////////////////////////////////
// REPLY TO TWEETS AT ME

// var stream = T.stream('user');
// stream.on('tweet', tweetEvent);

// console.log("watching for tweets..");

function tweetEvent(eventMsg){
	var replyto = eventMsg.in_reply_to_screen_name;
	var text = eventMsg.text;
	var from = eventMsg.user.screen_name;
	var tweetReplyID = eventMsg.id_str;

	if(replyto === myTwitterName){
		console.log(from + ' sent us a tweet: "' + text + '"');
		var tweetContent = text.toLowerCase().replace('@'+myTwitterName.toLowerCase(),'');
		// tweetContent = tweetContent.replace('@'+myTwitterName,'');

		tweetContent = tweetContent.replace(' ', '');

		if(tweetContent === '' || tweetContent === ' '){
			console.log('Attepting IPA of ' + from);
			IPAFromWord(from, from, tweetReplyID);
		}
		else{
			console.log('Attepting IPA of ' + tweetContent);
			IPAFromWord(tweetContent, from, tweetReplyID);
		}
		var newTweet = '@' + from + ' your snowflake!';
		// tweetIt(newTweet);
		tweetImage(from);
	}
	// console.log("event");
	// var name = eventMsg.source.name;
	// var screenName = eventMsg.source.screen_name;
}

function IPACallback(text, from, tweetReplyID){
	console.log('Callback received:' + text + ' &:' + from);
	var newTweet = '@' + from + ' ' + text;
	// tweetIt(newTweet);
	tweetImage(newTweet, tweetReplyID);
}

////////////////////////////////
// TWEET BACK AT SOMEONE WHO FOLLOWED YOU

// var stream = T.stream('user');
// stream.on('follow', followed);

// function followed(eventMsg){
// 	console.log("event");
// 	var name = eventMsg.source.name;
// 	var screenName = eventMsg.source.screen_name;
// 	tweetIt('@' + screen_name + ' you are great');
// }

////////////////////////////////
// GET TWEETS USING SEARCH TERMS

// var params = {
// 	q: 'rainbow',
// //	q: 'banana since:2011-11-11',
// 	count: 2
// };

// function gotData(err, data, response) {
// 	var tweets = data.statuses;
// 	for(var i = 0; i < tweets.length; i++){
// 		console.log(tweets[i].text);
// 	}
// 	console.log(data);
// }

// T.get('search/tweets', params, gotData);









////////////////////////////////////////////////
////////    IPA   CONVERSTION    ///////////////
////////////////////////////////////////////////





function IPAFromWord(word, from, tweetReplyID){
	var config = require('./config');
	var exec = require('child_process').exec;
	
	var ARPA_IPA = {
		/*
		 Vowels - Monophthongs
		Arpabet	IPA		Word examples
		AO		ɔ		off (AO1 F); fall (F AO1 L); frost (F R AO1 S T)
		AA		ɑ		father (F AA1 DH ER), cot (K AA1 T)
		IY		i		bee (B IY1); she (SH IY1)
		UW		u		you (Y UW1); new (N UW1); food (F UW1 D)
		EH		ɛ OR e 	ed (R EH1 D); men (M EH1 N)
		IH		ɪ		big (B IH1 G); win (W IH1 N)
		UH		ʊ		should (SH UH1 D), could (K UH1 D)
		AH		ʌ		but (B AH1 T), sun (S AH1 N)
		AH(AH0) ə		sofa (S OW1 F AH0), alone (AH0 L OW1 N)
		AE		æ		at (AE1 T); fast (F AE1 S T)
		AX		ə 		discus (D IH1 S K AX0 S);
		*/
			'AO' : 'ɔ',
			'AO0' : 'ɔ',
			'AO1' : 'ɔ',
			'AO2' : 'ɔ',
			'AA' : 'ɑ',
			'AA0' : 'ɑ',
			'AA1' : 'ɑ',
			'AA2' : 'ɑ',
			'IY' : 'i',
			'IY0' : 'i',
			'IY1' : 'i',
			'IY2' : 'i',
			'UW' : 'u',
			'UW0' : 'u',
			'UW1' : 'u',
			'UW2' : 'u',
			'EH' : 'e', // modern versions use 'e' instead of 'ɛ'
			'EH0' : 'e', // ɛ
			'EH1' : 'e', // ɛ
			'EH2' : 'e', // ɛ
			'IH' : 'ɪ',
			'IH0' : 'ɪ',
			'IH1' : 'ɪ',
			'IH2' : 'ɪ',
			'UH' : 'ʊ',
			'UH0' : 'ʊ',
			'UH1' : 'ʊ',
			'UH2' : 'ʊ',
			'AH' : 'ʌ',
			'AH0' : 'ə',
			'AH1' : 'ʌ',
			'AH2' : 'ʌ',
			'AE' : 'æ',
			'AE0' : 'æ',
			'AE1' : 'æ',
			'AE2' : 'æ',
			'AX' : 'ə',
			'AX0' : 'ə',
			'AX1' : 'ə',
			'AX2' : 'ə',
		/*
		Vowels - Diphthongs
		Arpabet	IPA	Word Examples
		EY		eɪ	say (S EY1); eight (EY1 T)
		AY		aɪ	my (M AY1); why (W AY1); ride (R AY1 D)
		OW		oʊ	show (SH OW1); coat (K OW1 T)
		AW		aʊ	how (HH AW1); now (N AW1)
		OY		ɔɪ	boy (B OY1); toy (T OY1)
		*/
			'EY' : 'eɪ',
			'EY0' : 'eɪ',
			'EY1' : 'eɪ',
			'EY2' : 'eɪ',
			'AY' : 'aɪ',
			'AY0' : 'aɪ',
			'AY1' : 'aɪ',
			'AY2' : 'aɪ',
			'OW' : 'oʊ',
			'OW0' : 'oʊ',
			'OW1' : 'oʊ',
			'OW2' : 'oʊ',
			'AW' : 'aʊ',
			'AW0' : 'aʊ',
			'AW1' : 'aʊ',
			'AW2' : 'aʊ',
			'OY' : 'ɔɪ',
			'OY0' : 'ɔɪ',
			'OY1' : 'ɔɪ',
			'OY2' : 'ɔɪ',
		/*
		Consonants - Stops
		Arpabet	IPA	Word Examples
		P		p	pay (P EY1)
		B		b	buy (B AY1)
		T		t	take (T EY1 K)
		D		d	day (D EY1)
		K		k	key (K IY1)
		G		ɡ	go (G OW1)
		*/
			'P' : 'p',
			'B' : 'b',
			'T' : 't',
			'D' : 'd',
			'K' : 'k',
			'G' : 'g',
		/*
		Consonants - Affricates
		Arpabet	IPA	Word Examples
		CH		tʃ	chair (CH EH1 R)
		JH		dʒ	just (JH AH1 S T); gym (JH IH1 M)
		*/
			'CH' : 'tʃ',
			'JH' : 'dʒ',
	
		/*
		Consonants - Fricatives
		Arpabet	IPA	Word Examples
		F		f	for (F AO1 R)
		V		v	very (V EH1 R IY0)
		TH		θ	thanks (TH AE1 NG K S); Thursday (TH ER1 Z D EY2)
		DH		ð	that (DH AE1 T); the (DH AH0); them (DH EH1 M)
		S		s	say (S EY1)
		Z		z	zoo (Z UW1)
		SH		ʃ	show (SH OW1)
		ZH		ʒ	measure (M EH1 ZH ER0); pleasure (P L EH1 ZH ER)
		HH		h	house (HH AW1 S)
		*/
			'F' : 'f',
			'V' : 'v',
			'TH' : 'θ',
			'DH' : 'ð',
			'S' : 's',
			'Z' : 'z',
			'SH' : 'ʃ',
			'ZH' : 'ʒ',
			'HH' : 'h',
		/*
		Consonants - Nasals
		Arpabet	IPA	Word Examples
		M		m	man (M AE1 N)
		N		n	no (N OW1)
		NG		ŋ	sing (S IH1 NG)
		*/
			'M' : 'm',
			'N' : 'n',
			'NG' : 'ŋ',
	
		/*
		 Consonants - Liquids
		Arpabet	IPA		Word Examples
		L		ɫ OR l	late (L EY1 T)
		R		r OR ɹ	run (R AH1 N)
		*/
			'L' : 'l',
			'R' : 'r',
		/*
		 Vowels - R-colored vowels
		Arpabet			IPA	Word Examples
		ER				ɝ	her (HH ER0); bird (B ER1 D); hurt (HH ER1 T), nurse (N ER1 S)
		AXR				ɚ	father (F AA1 DH ER); coward (K AW1 ER D)
		The following R-colored vowels are contemplated above
		EH R			ɛr	air (EH1 R); where (W EH1 R); hair (HH EH1 R)
		UH R			ʊr	cure (K Y UH1 R); bureau (B Y UH1 R OW0), detour (D IH0 T UH1 R)
		AO R			ɔr	more (M AO1 R); bored (B AO1 R D); chord (K AO1 R D)
		AA R			ɑr	large (L AA1 R JH); hard (HH AA1 R D)
		IH R or IY R	ɪr	ear (IY1 R); near (N IH1 R)
		AW R			aʊr	This seems to be a rarely used r-controlled vowel. In some dialects flower (F L AW1 R; in other dialects F L AW1 ER0)
		*/
			'ER' : 'ɜr',
			'ER0' : 'ɜr',
			'ER1' : 'ɜr',
			'ER2' : 'ɜr',
			'AXR' : 'ər',
			'AXR0' : 'ər',
			'AXR1' : 'ər',
			'AXR2' : 'ər',
		/*
		Consonants - Semivowels
		Arpabet	IPA	Word Examples
		Y		j	yes (Y EH1 S)
		W		w	way (W EY1)
		*/
			'W' : 'w',
			'Y' : 'j' 
	};

	var arpa = words[word];

	if (arpa != undefined){
		console.log('Done building IPA');
		var parts = arpa.split(" ");
		var ipaParts = [];
		for(var i = 0; i < parts.length; i++){
			// var noDigits = parts[i].replace(/[0-9]/g, '');
			ipaParts.push( ARPA_IPA[ parts[i] ] );
		}
		// console.log(parts);
		// console.log(ipaParts);
		var ipa = "";
		for(var i = 0; i < ipaParts.length; i++){
			if(ipaParts[i] != '\n' && ipaParts[i] != ' ')
				ipa = ipa.concat(ipaParts[i]);
		}
		console.log('IPA from ARPA: ' + ipa);
		IPACallback(ipa, from, tweetReplyID);
	}
	else{
		var cmd = 'speak -x --ipa "' + word + '"';
		exec(cmd, LtoSCallback);

		function LtoSCallback(err, data, response){
			console.log('Done inferring IPA');
			// console.log(data);
			var empty = [];
			var ipa = "";
			for(var i = 0; i < data.length; i++){
				if(data[i] != '\n' && data[i] != ' ')
					// empty.push(data[i]);
					ipa = ipa.concat(data[i]);
			}
			console.log('IPA inferred: ' + ipa);
			IPACallback(ipa, from, tweetReplyID);
			// console.log(ipa);
			// console.log(response);
		}

	}
}