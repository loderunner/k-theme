from flask import Flask
import requests
import os, sys
from PIL import Image
from theme import generate_theme, rgb_to_css
from werkzeug.exceptions import InternalServerError
from dotenv import load_dotenv

if os.environ.get("FLASK_ENV") is not None:
    for env in [
        "",
        ".local",
        f".{os.environ['FLASK_ENV']}",
        f".{os.environ['FLASK_ENV']}.local",
    ]:
        load_dotenv(f".env{env}", override=True)

app = Flask(__name__)


@app.errorhandler(InternalServerError)
def handle_error(err):
    print(err, file=sys.stderr)


@app.route("/api/theme/<theme_id>", methods=["GET"])
def get_theme(theme_id):
    json_url = f"{os.environ['BLOB_STORAGE_URL']}/{theme_id}.json"
    print(f"retrieving {json_url}")
    res = requests.get(json_url)
    if res.ok == False:
        return "entry not found", 404

    print("retrieved entry, parsing JSON")
    entry = res.json()

    print(f"retrieving {entry['url']} and reading image")
    res = requests.get(entry["url"], stream=True)
    if res.ok == False:
        return "image not found", 404

    img = Image.open(res.raw).resize((256, 256), Image.Resampling.NEAREST)

    print("generating theme")
    theme = generate_theme(img, max_iterations=1)

    print("theme generated")
    return {
        "black": rgb_to_css(theme[0]),
        "red": rgb_to_css(theme[1]),
        "green": rgb_to_css(theme[2]),
        "yellow": rgb_to_css(theme[3]),
        "blue": rgb_to_css(theme[4]),
        "magenta": rgb_to_css(theme[5]),
        "cyan": rgb_to_css(theme[6]),
        "white": rgb_to_css(theme[7]),
        "brightBlack": rgb_to_css(theme[8]),
        "brightRed": rgb_to_css(theme[9]),
        "brightGreen": rgb_to_css(theme[10]),
        "brightYellow": rgb_to_css(theme[11]),
        "brightBlue": rgb_to_css(theme[12]),
        "brightMagenta": rgb_to_css(theme[13]),
        "brightCyan": rgb_to_css(theme[14]),
        "brightWhite": rgb_to_css(theme[15]),
    }
