# app.py
# This is our Flask server - the "waiter" that handles incoming requests.

from flask import Flask, jsonify, render_template
import random
from quotes import QUOTES  # importing our data from quotes.py

# Step A: Create the Flask application instance.
# __name__ tells Flask where to look for resources (templates, static files, etc.)
app = Flask(__name__)


# Step B: Define a route.
# A "route" connects a URL (like /) to a Python function.
# When someone visits this URL, Flask runs the function below and sends back
# whatever it returns.
#
# render_template() looks inside the templates/ folder automatically and
# returns the rendered HTML, which the browser then displays as a real page
# (instead of raw JSON text).
@app.route("/")
def home():
    return render_template("index.html")


# We moved the old JSON welcome message here, at /api, in case you (or a
# teammate) still want to see the raw API info without loading the frontend.
@app.route("/api")
def api_info():
    return jsonify({
        "message": "Welcome to the Daily Quote Generator API!",
        "endpoints": {
            "GET /quotes": "Returns all quotes",
            "GET /quotes/random": "Returns one random quote",
            "GET /quotes/<int:id>": "Returns a specific quote by ID"
        }
    })


# Step C: GET /quotes - returns ALL quotes
@app.route("/quotes")
def get_all_quotes():
    # jsonify() converts our Python list/dict into proper JSON format
    # and sets the correct HTTP headers automatically.
    return jsonify(QUOTES)


# Step D: GET /quotes/random - returns ONE random quote
# IMPORTANT: this route must be defined BEFORE /quotes/<int:id>.
# Why? Flask checks routes top to bottom. If /quotes/<int:id> came first,
# Flask would try to convert "random" into an integer and fail with a 404.
@app.route("/quotes/random")
def get_random_quote():
    quote = random.choice(QUOTES)
    return jsonify(quote)


# Step E: GET /quotes/<int:id> - returns ONE quote by its ID
# The <int:id> part is called a "dynamic URL segment" or "route parameter".
# It tells Flask: "whatever number appears here, capture it and pass it
# into the function as the variable `id`, and make sure it's an integer."
@app.route("/quotes/<int:id>")
def get_quote_by_id(id):
    # This is a "list comprehension" - a compact way to filter a list.
    # It says: "give me every quote in QUOTES whose id matches the one requested"
    matching_quotes = [q for q in QUOTES if q["id"] == id]

    if matching_quotes:
        return jsonify(matching_quotes[0])
    else:
        # If no quote was found, we return a proper error response.
        # 404 is the standard HTTP status code for "Not Found".
        return jsonify({"error": f"No quote found with id {id}"}), 404


# Step F: Run the server
# This block only runs when you execute `python app.py` directly
# (not when this file is imported elsewhere).
if __name__ == "__main__":
    app.run(debug=True, port=5000)
