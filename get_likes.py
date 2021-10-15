import os
import json
import requests


def get(screen_name, query_header, count, only_pic, output_dic):
    # get like list
    query_payload = {
        'count': count,
        'screen_name': screen_name
    }
    query_list_raw = requests.get('https://api.twitter.com/1.1/favorites/list.json', headers=query_header, params=query_payload)
    query_list = json.loads(query_list_raw.content)
    if 'errors' in query_list:
        print('[error] twitter api error, message: {}'.format(query_list['errors'][0]['message']))
        exit(3)
    if len(query_list) == 0:
        print('[error] get_likes.get(): query_list is empty')
        exit(3)
    print('[debug] successfully get {} tweets from get_likes.get()'.format(len(query_list)))

    # if only_pic is True, omit tweets that don't contain pic
    if only_pic:
        query_list_output = []
        for i in range(0, len(query_list)):
            if 'media' in query_list[i]['entities']:
                query_list_output.append(query_list[i])
        print('[debug] omit {} tweets that do not contain any pic'.format(len(query_list) - len(query_list_output)))
    else:
        query_list_output = query_list

    # output file to $github_workspace/output/$twitter_likes.json
    output_json = json.dumps(query_list_output)
    if not os.path.exists(output_dic + '/output'):
        os.mkdir(output_dic + '/output')
    json_file = open(output_dic + '/output/{}_likes.json'.format(screen_name), 'w+')
    json_file.write(output_json)
    json_file.close()
    print('[debug] successfully write output_json to {}/output/{}_likes.json'.format(output_dic, screen_name))
