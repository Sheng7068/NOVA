from flask import Flask, render_template, request, jsonify
from API import *

app = Flask(__name__)

# Serve the HTML file
@app.route("/")
def index():
    return render_template("index.html")  # Ensure `index.html` is in a `templates` folder

# Endpoint to receive context list and textarea content
@app.route("/submit_data", methods=["POST"])
def submit_data():
    data = request.get_json()
    context_list = data.get("contextList", [])
    user_added_prompts = []
    for d in context_list:
        user_added_prompts.append((d["keyword"], d["suggestion"]))
    previous_suggestions = []
    full_input = data.get("bigInput", "")
    full_input = full_input.split("\n")
    for i in range(len(full_input)):
        full_input[i] = f"{str(i + 1)} {full_input[i]}"
    code = "\n".join(full_input)
    # Example: Log the received data
    # print("Context List:", context_list)
    # print("Big Input Text:", big_input)
    print(prompt_GPT(previous_suggestions, user_added_prompts, code))
    
    # Perform any processing needed here and send a response back
    return jsonify({"message": "Data received successfully!"})
if __name__ == "__main__":
    app.run(debug=True)