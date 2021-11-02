# Wolf-Bites-Tweets

[![](https://github.com/ohmykreee/wolf-bites-tweets/actions/workflows/test-function.yaml/badge.svg)](https://github.com/ohmykreee/wolf-bites-tweets/actions/workflows/test-function.yaml)


## What is this?
~~A wolf bites every tweets he sees.~~   

It is a GitHub action package that gets a specific Twitter account's tweeted or liked tweets from official Twitter API and stores as json files: `${GITHUB_WORKSPACE}/output/${screen-name}_tweets.json` and `${GITHUB_WORKSPACE}/output/${screen-name}_likes.json` (in default).

**Please notice**:
- this script mainly focuses on collecting information about a tweet's media (photos or video).
- Since `v2`, the whole project is rewritten with JavaScript and runs with Node.js. The older version(written in Python) is no longer in maintenance（files in "v1-archive" are `v1.0.7`)

## Usage
```yml
jobs:

  fetch:
    runs-on: ubuntu-latest
    steps:
      - name: Run wolf-bites-tweets
        uses: ohmykreee/wolf-bites-tweets@2.0.0
        with:
          screen-name: kreeejiang
          bearer-token: ${{ secrets.BEARER_TOKEN }}
          get-type: both
          count: 50,100
          if-only-media: true
          output-dir: output
```
- `screen-name`   
Normally it is `@kreeejiang` without `@`.    
For more information please refer to Twitter's official API documents: [Data dictionary: User object, Standard v1.1](https://developer.twitter.com/en/docs/twitter-api/v1/data-dictionary/object-model/user).

- `bearer-token`   
The Bearer token from your Twitter dev account. You can pass it through secrets: `Repository setttings -> Secrets -> New repository secrets`.   
For more information about Bearer token please refer to Twitter's official API documents: [Authentication: Using and generating Bearer Tokens](https://developer.twitter.com/en/docs/authentication/oauth-2-0/bearer-tokens).

- `get-type`   
Accept `tweets`, `likes`, `both`, which means get infomation of tweets only, likes only, both tweets and likes, and save separately in `${scree-nname}_tweets.json` and `${screen-name}_likes.json`.   
The default value is `tweets` if not be specified.

- `count`   
The number of tweets it will get from the API. **Please notice that** it only accept form like `50,100`. The first number will be used in `get_tweets`, and the second number will be used in `get_likes`, **DO NOT use white space, DO NOT pass third number to it**.   
Please notice that there are max limitation in API `/2/users/:id/tweets` (100) , `/1.1/favorites/list.json` (200) and min limitation in `/2/users/:id/tweets` (5), or you will get error.   
For more information please refer to Twitter's official API documents [GET /2/users/:id/tweets](https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/api-reference/get-users-id-tweets) and [GET /1.1/favorites/list.json](https://developer.twitter.com/en/docs/twitter-api/v1/tweets/post-and-engage/api-reference/get-favorites-list).   
The default value is `10,10` if not be specified.

- `if-only-media` (optional)   
Accept `true` or `false`. When set to `true`, it will remove tweets that don't contain any media (this tweet only has text) **After getting the data from Twitter API**, which means you will get objects less than the number you set in the `count` section.   
The default value is `false` if not be specified.

- `output-dir` (optional)   
You can specify the directory name where json files are saved. The folder will be created in `${GITHUB_WORKSPACE}`, where your repository files are checked-out.   
The default value is `output` if not be specified.   
(For more information about `${GITHUB_WORKSPACE}` or GitHub action's environment variables, please refer to [GitHub Action - Environment variables](https://docs.github.com/en/actions/learn-github-actions/environment-variables).)

You can go to the example repository using this GitHub action: https://github.com/ohmykreee/WBT-for-kblog/


## Command Line Interface
You can choose to run it on your local machine.   
(The Node.js version used in development is `v12.22.7`)

### Clone Repository
```bash
git clone https://github.com/ohmykreee/wolf-bites-tweets
cd ./wolf-bites-tweets
```
### Install Dependencies
```bash
npm install --production
```
### Run It
```bash
node ./index.js --local --bearer-token=*** --screen-name=kreeejiang --get-type=both --count=10,10 if-only-media=true --output-dir=output
```
Flag `--local` will let program run in local mode.   
Other arguments are the same in section [Usage](#usage).

The folder `${output-dir}` will be created in where `index.js` are placed.

## Other
- Works better with [ohmykreee/wolf-chews-tweets](https://github.com/ohmykreee/wolf-chews-tweets)

- 项目背后的故事（v2）：https://blog.ohmykreee.top/article/notes-of-developing-wbt-2.0.0/