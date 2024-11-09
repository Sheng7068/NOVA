from flask import Flask, render_template, request, jsonify

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
    big_input = data.get("bigInput", "")
    
    # Example: Log the received data
    print("Context List:", context_list)
    print("Big Input Text:", big_input)
    
    # Perform any processing needed here and send a response back
    return jsonify({"message": "Data received successfully!"})
if __name__ == "__main__":
    app.run(debug=True)