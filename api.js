const Twitter = require('twit')
const JSON5 = require('JSON5')
const path = require('path')
const fs = require('fs')
const request = require('request')
const config = require('./config.js')
const print = console.log

const client = new Twitter(config)

async function post(text) {
	return await new Promise((resolve, reject) => {
		client.post('statuses/update', {status: text},  function(error, tweet, response) {
			if (error) throw error
			resolve(tweet)
		})
	})
}

async function reply(tweet, text) {
	return await new Promise((resolve, reject) => {
		screen_name = tweet.user.screen_name.replace('@', '')
		client.post('statuses/update', {status: "@" + tweet.user.screen_name + " " + text, in_reply_to_status_id: tweet.id_str},  function(error, tweet, response) {
			if (error) throw error
			resolve(tweet)
		})
	})
}

async function postImage(text, image_path) {
	return await new Promise((resolve, reject) => {
		let b64content = fs.readFileSync(image_path, { encoding: 'base64' })
		client.post('media/upload', { media_data: b64content }, function(error, data, response) {
			if (error) throw error
			let media_ids = new Array(data.media_id_string)
			client.post('statuses/update', {media_ids: media_ids, status: text}, function(error, tweet, response) {
				if (error) throw error
				resolve(tweet)
			})
		})
	})
}

async function follow(screen_name) {
	return await new Promise((resolve, reject) => {
		client.post('friendships/create', {screen_name: screen_name}, function(error, user, response) {
			if (error) throw error
			resolve(user)
		})
	})
}

async function retweet(tweet) {
	return await new Promise((resolve, reject) => {
		client.post('statuses/retweet/' + tweet.id_str, {tweet_id: tweet.id_str}, function(error, tweet, response) {
			if (error) throw error
			resolve(tweet)
		})
	})
}

async function retweetWithComment(tweet, text) {
	return await new Promise((resolve, reject) => {
		client.post('statuses/update', {status: text + " " + "https://twitter.com/" + tweet.user.screen_name + "/status/" + tweet.id_str},  function(error, tweet, response) {
			if (error) throw error
			resolve(tweet)
		})
	})
}

async function like(tweet) {
	return await new Promise((resolve, reject) => {
		client.post('favorites/create', {id: tweet.id_str}, function(error, tweet, response) {
			if (error) throw error
			resolve(tweet)
		})
	})
}

async function timeline() {
	return await new Promise((resolve, reject) => {
		client.get('statuses/home_timeline', {count: 20}, function(error, tweets, response) {
			if (error) throw error
			resolve(tweets)
		})
	})
}

async function search(q) {
	return await new Promise((resolve, reject) => {
		client.get('search/tweets', {q: q, count: 100, result_type: 'recent', include_entities: true}, function(error, data, response) {
			if (error) throw error
			resolve(data.statuses)
		})
	})
}

async function download(uri, filename) {
	return await new Promise((resolve, reject) => {
		request.head(uri, function(err, res, body) {
	    	request(uri).pipe(fs.createWriteStream(filename)).on('close', resolve)
	  	})
	})
}

async function downloadTweetImage(tweet) {
	if (tweet.entities.media == undefined) return
	return await new Promise((resolve, reject) => {
		let image_url = tweet.entities.media[0].media_url
		let tokens = image_url.split('/')
		download(image_url, "downloaded_images/" + tokens[tokens.length-1], resolve)
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
exports.api.downloadTweetImage = downloadTweetImage

exports.util = {}
exports.util.loadData = loadData
exports.util.saveData = saveData
exports.util.choice = choice
exports.util.download = download
