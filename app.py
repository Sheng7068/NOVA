from flask import Flask, render_template, request, jsonify
from API import prompt_GPT  # Ensure this is correctly imported

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")  # Make sure `index.html` is in a `templates` folder

@app.route("/submit_data", methods=["POST"])
def submit_data():
    data = request.get_json()

    context_list = data.get("contextList", [])
    user_added_prompts = [(d["keyword"], d["suggestion"]) for d in context_list]
    
    # Get all accumulated previous suggestions
    previous_suggestions = data.get("previousSuggestions", [])
    
    # Process big input text for line numbers
    full_input = data.get("bigInput", "")
    full_input = full_input.split("\n")
    for i in range(len(full_input)):
        full_input[i] = f"{str(i + 1)} {full_input[i]}"
    code = "\n".join(full_input)

    # Generate new suggestions from GPT using the accumulated suggestions
    new_suggestions = prompt_GPT(previous_suggestions, user_added_prompts, code)
    print(new_suggestions)
    
    return jsonify({
        "message": "Data received successfully!",
        "suggestions": new_suggestions  # Return only new suggestions
    })

if __name__ == "__main__":
    app.run(debug=True)
