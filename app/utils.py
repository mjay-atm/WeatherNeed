import json
import os
from dotenv import load_dotenv  # install python_dotenv
import requests
from ast import literal_eval


def city_report(WEATHER_API_KEY, save_dir, city, dic_city2no):
    
    os.makedirs(save_dir, exist_ok=True)
    city_no = dic_city2no[city]
    url = f'https://opendata.cwb.gov.tw/fileapi/v1/opendataapi/F-C0032-{city_no}?Authorization={WEATHER_API_KEY}&downloadType=WEB&format=JSON'
    r = requests.get(url, allow_redirects=True)
    #open(json_name, 'wb').write(r.content)
    d = literal_eval(r.content.decode("utf-8"))

    sentences = d['cwbopendata']['dataset']['parameterSet']['parameter']
    article = ''
    for s in sentences:
        article += s['parameterValue']
        article += '\n'
    with open(f'{save_dir}/{city}.txt', 'w') as f:
        print(article, file = f)
    
    return article


def taiwan_report(WEATHER_API_KEY, save_dir):

    os.makedirs(save_dir, exist_ok=True)
    url = f'https://opendata.cwb.gov.tw/fileapi/v1/opendataapi/F-C0032-031?Authorization={WEATHER_API_KEY}&downloadType=WEB&format=JSON'
    r = requests.get(url, allow_redirects=True)
    #open(json_name, 'wb').write(r.content)
    d = literal_eval(r.content.decode("utf-8"))
    
    uri = d['cwbopendata']['dataset']['resource']['uri']
    r = requests.get(uri, allow_redirects=True)
    article = r.text
    article = article.replace("天氣小幫手", "")
    with open(f'{save_dir}/全臺.txt', 'w') as f:
        print(article, file = f)

    return article


def load_topic(topic, topic_dir):

    article = ''
    with open(f'{topic_dir}/{topic}.txt', 'r') as f:
        for i, line in enumerate(f.readlines()):
            article += line

    return article
    

if __name__ == '__main__':
    
    load_dotenv()
    WEATHER_API_KEY = os.environ["WEATHER_API_KEY"]
    save_dir = 'topic'
    
    no_list = [str(i).zfill(3) for i in range(9, 31)]
    #print(no_list)
    dic_city2no = {}
    with open(f'city_list.txt', 'r') as f:
        for i, city in enumerate(f.readlines()):
            dic_city2no[city.replace("\n", "")] = no_list[i]
    
    #print(dic_city2no)
    
    city = '台北市'
    city_no = dic_city2no[city]
    #city_report(WEATHER_API_KEY, save_dir, city, dic_city2no)
    #taiwan_report(WEATHER_API_KEY, save_dir)
    load_topic('食', save_dir)