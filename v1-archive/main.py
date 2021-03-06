import os
import json
import requests
from threading import Thread
import get_likes
import get_tweets

# get env variable (Windows dev environment)
# envFile = open('env.txt')
# envLines = envFile.readlines()
# envFile.close()
# env_screen_name = envLines[0][:-1]
# env_bearer_token = envLines[1][:-1]
# env_get_type = envLines[2][:-1]
# env_count = envLines[3][:-1].split(',')
# env_only_pic = bool(envLines[4][:-1])
# env_github_workspace = envLines[5]
# os.environ["https_proxy"] = 'http://localhost:7890'

# get env variable
env_github_workspace = os.environ.get("GITHUB_WORKSPACE")
env_screen_name = os.environ.get("INPUT_SCREEN_NAME")
env_bearer_token = os.environ.get("INPUT_BEARER_TOKEN")
env_get_type = os.environ.get("INPUT_GET_TYPE")
env_count = os.environ.get("INPUT_COUNT").split(',')
env_only_pic = os.environ.get("INPUT_IF_ONLY_MEDIA")

# verify env variable
if env_get_type not in ['tweets', 'likes', 'both']:
    print('[warn] main: env_get_type = {} {}, set to default value "tweets" {}'.format(env_get_type, type(env_get_type), type('tweets')))
    env_get_type = 'tweets'
if env_only_pic in [True, 'True', 'true']:
    print('[debug] main: env_only_pic = {} {}, set to True {}'.format(env_only_pic, type(env_only_pic), type(True)))
    env_only_pic = True
elif env_only_pic in [False, 'False', 'false']:
    print('[debug] main: env_only_pic = {} {}, set to False {}'.format(env_only_pic, type(env_only_pic), type(True)))
    env_only_pic = False
else:
    print('[warn] main: env_only_pic = {} {}, set to default value False {}'.format(env_only_pic, type(env_only_pic), type(False)))
    env_only_pic = False
if len(env_count) == 1:
    tweets_count = likes_count = env_count[0]
    print('[debug] main: env_count = {} {}'.format(env_count, type(env_count)))
elif len(env_count) == 2:
    tweets_count = env_count[0]
    likes_count = env_count[1]
    print('[debug] main: env_count = {} {}'.format(env_count, type(env_count)))
else:
    print('[error] main: the length of "count" should be 1 or 2, not {}!'.format(len(env_count)))
    exit(1)

# test token validity
query_header = {'Authorization': 'Bearer {}'.format(env_bearer_token)}
test_query_raw = requests.get('https://api.twitter.com/1.1/application/rate_limit_status.json?resources=statuses', headers=query_header)
test_query = json.loads(test_query_raw.content)
if 'errors' in test_query:
    print('[error] main: twitter api error, message: {}'.format(test_query['errors'][0]['message']))
    exit(1)
print('[info] main: test token validity success')

# start get data and store json file to $env_github_workspace/output
if env_get_type == 'tweets':
    get_tweets.get(env_screen_name, query_header, tweets_count, env_only_pic, env_github_workspace)
elif env_get_type == 'likes':
    get_likes.get(env_screen_name, query_header, likes_count, env_only_pic, env_github_workspace)
elif env_get_type == 'both':
    t1 = Thread(target=get_tweets.get(env_screen_name, query_header, tweets_count, env_only_pic, env_github_workspace))
    t2 = Thread(target=get_likes.get(env_screen_name, query_header, likes_count, env_only_pic, env_github_workspace))
    t1.start()
    t2.start()
    t1.join()
    t2.join()
