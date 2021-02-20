import sys
import json
from newspaper import Article
from newspaper import Config
url = sys.argv[1]

user_agent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'
config = Config()
config.browser_user_agent = user_agent

article = Article(url, config=config)

article.download()
article.parse()
text = ' '.join(article.text.split(' ')[:1000])

export = {
  "title": article.title,
  "text": text
}

app_json = json.dumps(export)
print(app_json)




# from requests import get
# response = get(url)

# extractor = Goose()
# article = extractor.extract(raw_html=response.content)
