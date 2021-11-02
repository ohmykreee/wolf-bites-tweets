"use strict";

const core = require('@actions/core')
const fs = require('fs');
const { exit } = require('process');

const tweets_path = `${process.env.GITHUB_WORKSPACE}/test/kreeejiang_tweets.json`
const likes_path = `${process.env.GITHUB_WORKSPACE}/test/kreeejiang_likes.json`

fs.stat(tweets_path, function (err, stats) {
    if (err === null) {
        core.notice(`tweets json file exists, with size ${stats.size} bytes.`)
    } else {
        core.setFailed(`Test get_tweets failed: ${err.message}`)
        exit()
    }
})

fs.stat(likes_path, function (err, stats) {
    if (err === null) {
        core.notice(`likes json file exists, with size ${stats.size} bytes.`)
    } else {
        core.setFailed(`Test get_likes failed: ${err.message}`)
        exit()
    }
})