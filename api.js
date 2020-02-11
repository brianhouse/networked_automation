const Twitter = require('twit')
const JSON5 = require('JSON5')
const path = require('path')
const fs = require('fs')
const request = require('request')
const config = require('./config.js')
const print = console.log

const client = new Twitter(config)

function post(text, callback) {
	client.post('statuses/update', {status: text},  function(error, tweet, response) {
		if (error) throw error
		if (callback) callback(tweet)
	})
}

function reply(screen_name, tweet_id, text, callback) {
	screen_name = screen_name.replace('@', '')
	client.post('statuses/update', {status: "@" + screen_name + " " + text, in_reply_to_status_id: tweet_id},  function(error, tweet, response) {
		if (error) throw error
		if (callback) callback(tweet)
	})
}

function postImage(text, image_path, callback) {
	let b64content = fs.readFileSync(image_path, { encoding: 'base64' })
	client.post('media/upload', { media_data: b64content }, function(error, data, response) {
		if (error) throw error
		let media_ids = new Array(data.media_id_string)
		client.post('statuses/update', {media_ids: media_ids, status: text}, function(error, tweet, response) {
			if (error) throw error
			if (callback) callback(tweet)
		})
	})
}

function follow(screen_name, callback) {
	client.post('friendships/create', {screen_name: screen_name}, function(error, user, response) {
		if (error) throw error
		if (callback) callback(user)
	})
}

function retweet(tweet_id, callback) {
	client.post('statuses/retweet/' + tweet_id, {tweet_id: tweet_id}, function(error, tweet, response) {
		if (error) throw error
		if (callback) callback(tweet)
	})
}

function retweetWithComment(tweet_id, text, callback) {
	client.post('statuses/update', {status: text + " " + "https://twitter.com/HouseProf/status/" + tweet_id},  function(error, tweet, response) {
		if (error) throw error
		if (callback) callback(tweet)
	})
}

function like(tweet_id, callback) {
	client.post('favorites/create', {id: tweet_id}, function(error, tweet, response) {
		if (error) throw error
		if (callback) callback(tweet)
	})
}

function timeline(callback) {
	client.get('statuses/home_timeline', {count: 20}, function(error, tweets, response) {
		if (error) throw error
		if (callback) callback(tweets)
	})
}

function search(q, callback) {
	client.get('search/tweets', {q: q, count: 100, result_type: 'recent', include_entities: true}, function(error, data, response) {
		if (error) throw error
		let tweets = data.statuses
		for (let tweet of tweets) {
			if (tweet.entities.media != undefined) {
				let image_url = tweet.entities.media[0].media_url
				let tokens = image_url.split('/')
				download(image_url, "downloaded_images/" + tokens[tokens.length-1], function () {})
			}
		}
		if (callback) callback(tweets)
	})
}

function download(uri, filename, callback) {
	request.head(uri, function(err, res, body) {
    	request(uri).pipe(fs.createWriteStream(filename)).on('close', callback)
  	})
}

function loadData(path) {
	return JSON5.parse(fs.readFileSync(path, {encoding: "utf-8"}))
}

function saveData(path, data) {
	fs.writeFileSync(path, JSON5.stringify(data))
}

function choice(a) {
    return a[Math.floor(Math.random() * a.length)]
}

exports.api = {}
exports.api.post = post
exports.api.postImage = postImage
exports.api.follow = follow
exports.api.retweet = retweet
exports.api.retweetWithComment = retweetWithComment
exports.api.like = like
exports.api.reply = reply
exports.api.timeline = timeline
exports.api.search = search

exports.util = {}
exports.util.loadData = loadData
exports.util.saveData = saveData
exports.util.choice = choice
exports.util.download = download
