import os
from typing import Annotated

import requests
from fastapi import FastAPI
from pydantic import StringConstraints
from theme import generate_theme, read_image, rgb_to_css

app = FastAPI()


@app.post("/theme/{theme_id}")
async def get_theme(
    theme_id: Annotated[str, StringConstraints(pattern="[0-9A-Za-z]")]
):
    json_url = f"{os.environ['BLOB_STORAGE_URL']}/{theme_id}.json"
    print(f"retrieving {json_url}")
    res = requests.get(json_url)
    if res.ok == False:
        return "entry not found", 404

    print("retrieved entry, parsing JSON")
    entry = res.json()

    img_url = entry["url"]
    print(f"retrieving {img_url} and reading image")
    res = requests.head(img_url)
    if res.ok == False:
        return "image not found", 404

    img = read_image(img_url)

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
