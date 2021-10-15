# Wolf-Bites-Tweets

## What is this?
~~A wolf bites every tweets he sees.~~   
项目背后的故事（正在编写中，将发布在 [Kreee's Blog](https://blog.ohmykreee.top)）

It is a GitHub action package that gets a specific Twitter account's tweeted or liked tweets from official Twitter API and stores as json file `${{secrets.GITHUB_WORKSPACE}}/output/screenname_tweets.json` and `${{secrets.GITHUB_WORKSPACE}}/output/screenname_likes.json`.

Please notice that this script mainly focuses on collecting information about a tweet's media (photos or video).

(For more information about `${{secrets.GITHUB_WORKSPACE}}` or GitHub action's environment variables, please refer to [GitHub Action - Environment variables](https://docs.github.com/en/actions/learn-github-actions/environment-variables).)

## Usage
```yml
jobs:

  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Run wolf-bites-tweets
        uses: ohmykreee/wolf-bites-tweets@1.0.0
        with:
          screen_name: kreeejiang
          bearer_token: ${{ secrets.BEARER_TOKEN }}
          get_type: both
          count: 50
          if_only_pic: true
```
- screen_name   
Normally it is `@kreeejiang` without `@`.    
For more information please refer to Twitter's official API documents: [Data dictionary: User object, Standard v1.1](https://developer.twitter.com/en/docs/twitter-api/v1/data-dictionary/object-model/user).

- bearer_token   
The Bearer token from your Twitter dev account. You can pass it through secrets: `Repository setttings -> Secrets -> New repository secrets`.   
For more information about Bearer token please refer to Twitter's official API documents: [Authentication: Using and generating Bearer Tokens](https://developer.twitter.com/en/docs/authentication/oauth-2-0/bearer-tokens).

- get_type   
Can pass `tweets`, `likes`, `both`, which means get infomation of tweets only, likes only, both tweets and likes, and save separately in `screenname_tweets.json` and `screenname_likes.json`.   
The default value is `tweets` if not pass any value to it.

- count   
The number it will get from the API, both for `get_tweets` and `get_likes`. Please notice that there are max limitation in API `/2/users/:id/tweets` (100) and `/1.1/favorites/list.json` (200) and min limitation in `/2/users/:id/tweets` (5), or you will get error when running.   
For more information please refer to Twitter's official API [GET /2/users/:id/tweets](https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/api-reference/get-users-id-tweets) and [GET /1.1/favorites/list.json](https://developer.twitter.com/en/docs/twitter-api/v1/tweets/post-and-engage/api-reference/get-favorites-list).   
The default value is `10` if not pass any value to it.

- if_only_pic   
Can pass `true` or `false`. When set to `true`, it will remove tweets that don't contain any media (which means this tweet only have text) **After getting the data from Twitter API**, which means you will get objects less than the number you set in the `count` section.   
The default value is `false` if not pass any value to it.

You can go to the example repository using this GitHub action: https://github.com/ohmykreee/WBT-for-kblog/

## Other
Work better with `ohmykreee/wolf-chews-tweets` (still in development)