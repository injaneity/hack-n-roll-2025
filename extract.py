import requests
from bs4 import BeautifulSoup

# URL of the LinkedIn home page
url = "https://www.linkedin.com"

# Make a GET request to fetch the HTML content
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36"
}

try:
    response = requests.get(url, headers=headers)
    response.raise_for_status()  # Raise HTTPError for bad responses (4xx and 5xx)

    # Parse the HTML content
    soup = BeautifulSoup(response.content, "html.parser")

    # Save the content as an HTML file
    output_file = "linkedin_home.html"
    with open(output_file, "w", encoding="utf-8") as file:
        file.write(soup.prettify())

    print(f"HTML content saved to {output_file}")

except requests.exceptions.RequestException as e:
    print(f"An error occurred: {e}")
