"use strict";

const core = require('@actions/core')
const https = require('https')
const http = require('http')
const fs = require('fs')
const { exit } = require('process');

let if_local
wbt_init()


function wbt_init() {
    // test if run locally or in github actions
    const process_argv = process.argv.slice(2)
    let argv
    if (process_argv.includes('--local')) {
        const yargs = require('yargs')
        argv = yargs(process.argv.slice(2)).argv
        if_local = true
    } else {
        argv = {
            bearerToken: core.getInput('bearer-token', { required: true }),
            screenName: core.getInput('screen-name', { required: true }),
            getType: core.getInput('get-type', { required: false }),
            count: core.getInput('count', { required: false }),
            ifOnlyMedia: core.getInput('if-only-media', { required: false }),
            outputDir: core.getInput('output-dir', { required: false }),
        }
        if_local = false
    }

    const config = {}
    //verify variable and assign value
    if (argv.bearerToken == '' || argv.bearerToken === undefined) {
        custom_log('error', 'local_init: bearer-token is empty.')
    } else {
        config['bearerToken'] = argv.bearerToken
    }
    if (argv.screenName == '' || argv.screenName === undefined) {
        custom_log('error','local_init: screen-name is empty.')
    } else {
        config['screenName'] = argv.screenName
    }
    if (!(argv.getType == 'tweets' || argv.getType == 'likes' || argv.getType == 'both')){
        custom_log(`warning','local_init: get-type = ${argv.getType} and it is invalid. Set to "tweets".`)
        config['getType'] = 'tweets'
    } else {
        config['getType'] = argv.getType
    }
    if (!(argv.ifOnlyMedia == 'true' || argv.ifOnlyMedia == 'false')) {
        custom_log('warning',`local_init: if-only-media = ${argv.ifOnlyMedia} and it is invalid. Set to "false".`)
        config['ifOnlyMedia'] = false
    } else if (argv.ifOnlyMedia == 'true') {
        config['ifOnlyMedia'] = true
    } else {
        config['ifOnlyMedia'] = false
    }
    const count_splited = argv.count.split(',')
    if (count_splited.length == 2) {
        config['tweetCount'] = count_splited[0]
        config['likesCount'] = count_splited[1]
    } else {
        custom_log('error','local_init: count is invalid.')
    }
    if (argv.outputDir == '' || argv.outputDir === undefined) {
        console.log('local_init: output-dir uses default value "output".')
        config['outputDir'] = 'output'
    } else {
        config['outputDir'] = argv.outputDir
    }

    wbt_main(config)
}

function wbt_main(config) {
    // test token validity
    api_get('/1.1/application/rate_limit_status.json?resources=statuses', config.bearerToken, function (result) {
        if (result.hasOwnProperty('errors')) {
            custom_log('error', `twitter api error, message: ${result.errors[0].message}`)
        } else {
            console.log('test twitter api success.')
            // start to get data
            switch (config.getType) {
                case 'tweets':
                get_tweets(config)
                break
        
                case 'likes':
                get_likes(config)
                break

                case 'both':
                get_likes(config)
                get_tweets(config)
            }
        }
    })
}

async function get_tweets(config) {
    // get user info
    const user_data_promise = new Promise ((resolve, rejects) => {
        api_get(`/2/users/by/username/${config.screenName}`, config.bearerToken, function(result){
            if (result.hasOwnProperty('errors')) {
                custom_log('error', `get_tweets: twitter api error, message: ${result.errors[0].message}`)
                rejects(result.errors[0].message)
            } else {
                console.log('get_tweets: get user data success.')
                resolve(result.data)
            }
        })
    })
    const user_data = await user_data_promise

    // get tweet list with media_keys
    const tweet_data_promise = new Promise ((resolve, rejects) => {
        api_get(`/2/users/${user_data.id}/tweets?expansions=attachments.media_keys&media.fields=duration_ms,height,media_key,preview_image_url,type,url,width,alt_text&max_results=${config.tweetCount}`, config.bearerToken, function(result) {
            if (result.hasOwnProperty('errors')) {
                custom_log('error', `get_tweets: twitter api error, message: ${result.errors[0].message}`)
                rejects(result.errors[0].message)
            } else {
                console.log(`get_tweets: successfully get ${result.data.length} tweets.`)
                resolve(result)
            }
        })
    })
    const query_raw = await tweet_data_promise
    
    // handle query_raw
    const query_output = {
        'data': [],
        'meta': query_raw.meta,
        'user': user_data
    }
    for (let i = 0; i < query_raw.data.length; i = i + 1) {
        if (query_raw.data[i].hasOwnProperty('attachments')) {
            query_output.data.push(query_raw.data[i])  // move basic data
            query_output.data[query_output.data.length - 1].attachments['media'] = [] // create array to hold extended media data
            // start to move "media" section
            const media_keys = query_raw.data[i].attachments.media_keys
            for (let key of media_keys){
                for (let j = 0; j < query_raw.includes.media.length; j = j + 1) {
                    if (key == query_raw.includes.media[j].media_key) {
                        query_output.data[query_output.data.length - 1].attachments.media.push(query_raw.includes.media[j]) // perform move
                        query_raw.includes.media.splice(j, 1)
                        break
                    }
                }
            }
        } else {
            if (!(config.ifOnlyMedia)) {
                query_output.data.push(query_raw.data[i])
            }
        }
    }
    if (config.ifOnlyMedia) {
        let deleted = query_raw.data.length - query_output.data.length
        console.log(`get_tweets: omit ${deleted} tweets that do not contain any media.`)
    }

    // output file
    save_json(config, 'tweets', query_output, function (if_success, filepath) {
        if (if_success) {
            console.log(`get_tweets: successfully write output_json to ${filepath}`)
        }
    })
}

async function get_likes(config) {
    // get likes list
    const likes_data_promise = new Promise ((resolve, rejects) => {
        api_get(`/1.1/favorites/list.json?count=${config.likesCount}&screen_name=${config.screenName}`, config.bearerToken, function (result) {
            if (result.hasOwnProperty('errors')) {
                custom_log('error', `get_likes: twitter api error, message: ${result.errors[0].message}`)
                rejects(result.errors[0].message)
            } else {
                console.log(`get_likes: successfully get ${result.length} tweets.`)
                resolve(result)
            }
        })
    })
    const query_raw = await likes_data_promise

    // if ifOnlyMedia, omit tweets that don't contain any media
    const query_output = []
    for (let i = 0; i < query_raw.length; i = i + 1) {
        if (config.ifOnlyMedia) {
            if (query_raw[i].entities.hasOwnProperty('media')) {
                query_output.push(query_raw[i])
            }
        } else {
            query_output.push(query_raw[i])
        }
    }
    if (config.ifOnlyMedia) {
        let deleted = query_raw.length - query_output.length
        console.log(`get_likes: omit ${deleted} tweets that do not contain any media.`)
    }

    // output file
    save_json(config, 'likes', query_output, function (if_success, filepath) {
        if (if_success) {
            console.log(`get_likes: successfully write output_json to ${filepath}`)
        }
    })

}

function api_get(path, token, callback) {
    const options = {
            host: 'api.twitter.com',
            port: 443,
            path: path,
            headers: {'Authorization': `Bearer ${token}`},
            method: 'GET',
    }

    const port = options.port == 443 ? https : http
  
    let output = ''
  
    const req = port.request(options, (res) => {
      console.log(`${options.host} : ${res.statusCode}`)
      res.setEncoding('utf8')
  
      res.on('data', (chunk) => {
        output += chunk
      });
  
      res.on('end', () => {
        let obj = JSON.parse(output)
  
        callback(obj)
      })
    })
  
    req.on('error', (err) => {
        custom_log('error', err.message)
    })
  
    req.end();
}

function save_json(config, type, data, callback) {
    // determine save path
    let save_path
    if (if_local) {
        save_path = `${__dirname}/${config.outputDir}`
    } else {
        save_path = `${process.env.GITHUB_WORKSPACE}/${config.outputDir}`
    }

    // create folder
    if (!fs.existsSync(save_path)){
        fs.mkdirSync(save_path);
    }
    
    //save file
    const write_data = JSON.stringify(data)
    const file_path = `${save_path}/${config.screenName}_${type}.json`
    fs.writeFile(file_path, write_data, function (err) {
        if (err) {
            custom_log('error', `save_json: ${err.message}`)
            callback(false, file_path)
        } else {
            callback(true, file_path)
        }
    })
}

function custom_log(type, message) {
    if (if_local) {
        switch (type) {
            case 'notice':
                console.log(message)
                break
            case 'warning':
                console.log(`\x1b[33m Warning: ${message} \x1b[0m`)
                break
            case 'error':
                console.log(`\x1b[41m Error: ${message} \x1b[0m`)
                exit(1)
        }
    } else {
        switch (type) {
            case 'notice':
                core.notice(message)
                break
            case 'warning':
                core.warning(message)
            case 'error':
                core.setFailed(message)
                exit()
        }
    }
}
