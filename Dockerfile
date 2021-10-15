FROM python:3.9-alpine

ADD main.py /main.py

ADD get_tweets.py /get_tweets.py

ADD get_likes.py /get_likes.py

RUN pip install requests

CMD ["python", "/main.py"]