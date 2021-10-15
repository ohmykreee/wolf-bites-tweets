FROM python:3.9-apline

ADD requirements.txt /requirements.txt

ADD main.py /main.py

ADD get_tweets.py /get_tweets.py

ADD get_likes.py /get_likes.py

RUN pip install -r /requirements.txt

CMD ["python", "/main.py"]