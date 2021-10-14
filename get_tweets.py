import os
import json
import requests


def get(screen_name, query_header, count, only_pic, output_dic):
    # get user id
    query_user_raw = requests.get('https://api.twitter.com/2/users/by/username/{}'.format(screen_name), headers=query_header)
    query_user = json.loads(query_user_raw.content)
    if 'errors' in query_user:
        print('[error] twitter api error, code {}, message: {}'.format(query_user['errors'][0]['code'], query_user['errors'][0]['message']))
        exit(2)
    if len(query_user) == 0:
        print('[error] get_tweets.get(): query_user is empty')
        exit(2)
    user_id = query_user['data']['id']

    # get tweet list
    query_payload = {
        'max_results': count,
    }
    query_list_raw = requests.get('https://api.twitter.com/2/users/{}/tweets'.format(user_id), headers=query_header, params=query_payload)
    query_list = json.loads(query_list_raw.content)
    if 'errors' in query_list:
        print('[error] twitter api error, code {}, message: {}'.format(query_list['errors'][0]['code'], query_list['errors'][0]['message']))
        exit(2)
    if len(query_list['data']) == 0:
        print('[error] get_tweets.get(): query_list is empty')
        exit(2)
    print('[debug] successfully get {} tweets from get_tweets.get()'.format(len(query_list['data'])))

    # need to re-write
    # if only_pic is Ture, omit tweets that don't contain pic
    if only_pic:
        query_list_output = []
        for i in range(0, len(query_list['data'])):
            if 'media' in query_list[i]['entities']:
                query_list_output.append(query_list[i])
        print('[debug] omit {} tweets that do not contain any pic'.format(len(query_list['data']) - len(query_list_output['data'])))
    else:
        query_list_output = query_list

    # output file to $github_workspace/output/$twitter_tweets.json
    output_json = json.dumps(query_list_output)
    if not os.path.exists(output_dic + '/output'):
        os.mkdir(output_dic + '/output')
    json_file = open(output_dic + '/output/{}_likes.json'.format(screen_name), 'w+')
    json_file.write(output_json)
    json_file.close()
    print('[debug] successfully write output_json to $github_workspace/output/$twitter_likes.json')
