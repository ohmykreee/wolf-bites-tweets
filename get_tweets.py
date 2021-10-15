import os
import json
import requests
import copy


def get(screen_name, query_header, count, only_pic, output_dic):
    # get user id
    query_user_raw = requests.get('https://api.twitter.com/2/users/by/username/{}'.format(screen_name), headers=query_header)
    query_user = json.loads(query_user_raw.content)
    if 'errors' in query_user:
        print('[error] twitter api error, message: {}'.format(query_user['errors'][0]['message']))
        exit(2)
    if len(query_user) == 0:
        print('[error] get_tweets.get(): query_user is empty')
        exit(2)
    user_id = query_user['data']['id']

    # get tweet list with media_keys
    query_payload = {
        'max_results': count,
        'expansions': 'attachments.media_keys',
        'media.fields': 'duration_ms,height,media_key,preview_image_url,type,url,width,alt_text'
    }
    query_list_raw = requests.get('https://api.twitter.com/2/users/{}/tweets'.format(user_id), headers=query_header, params=query_payload)
    query_list = json.loads(query_list_raw.content)
    if 'errors' in query_list:
        print('[error] twitter api error, message: {}'.format(query_list['errors'][0]['message']))
        exit(2)
    if len(query_list['data']) == 0:
        print('[error] get_tweets.get(): query_list is empty')
        exit(2)
    print('[debug] successfully get {} tweets from get_tweets.get()'.format(len(query_list['data'])))

    # if only_pic is Ture, omit tweets that don't contain pic
    if only_pic:
        query_list_output = copy.deepcopy(query_list)  # need deep copy!
        for i in range(0, len(query_list['data'])):
            if 'attachments' not in query_list['data'][i]:
                query_list_output['data'].pop(i)
        print('[debug] omit {} tweets that do not contain any pic'.format(len(query_list['data']) - len(query_list_output['data'])))
    else:
        query_list_output = query_list

    # output file to $github_workspace/output/$twitter_tweets.json
    output_json = json.dumps(query_list_output)
    if not os.path.exists(output_dic + '/output'):
        os.mkdir(output_dic + '/output')
    json_file = open(output_dic + '/output/{}_tweets.json'.format(screen_name), 'w+')
    json_file.write(output_json)
    json_file.close()
    print('[debug] successfully write output_json to {}/output/{}_tweets.json'.format(output_dic, screen_name))
