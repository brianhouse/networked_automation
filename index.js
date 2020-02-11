const {api, util} = require('./api.js')
const print = console.log

async function main() { // if top-level await is finally available, remove this

    // let tweets = await api.search("grammys")
    let tweets = await api.timeline()

    for (let tweet of tweets) {
        print(tweet.id)
        print(tweet.user.screen_name)
        print(tweet.text)
        print()
    }

    // api.post("Hello World")

    // api.postImage("go pios!", "pio.jpg")

    // api.follow("h0use")

    let tweet = tweets[0]

    // api.like(tweet)

    // api.reply(tweet, "Underrated tweet.")

    // api.retweet(tweet)

    // api.retweetWithComment(tweet, "Snarky commentary")

}

main()
