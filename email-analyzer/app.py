from flask import Flask, render_template, request, jsonify
from modules.header_parser import parse_email_header
from modules.ip_lookup import get_ip_info
from modules.blacklist_check import check_blacklist

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    email_header = data.get("header", "")

    # Step 1: Extract Header Data
    header_data = parse_email_header(email_header)

    # Step 2: IP Intelligence
    sender_ip = header_data.get("Sender IP", None)
    ip_info = get_ip_info(sender_ip) if sender_ip else {}

    # Step 3: Blacklist Check
    blacklist_status = check_blacklist(sender_ip) if sender_ip else {}

    # Merge results
    analysis = {
        "Header Data": header_data,
        "IP Intelligence": ip_info,
        "Blacklist Status": blacklist_status
    }

    return jsonify(analysis)

if __name__ == '__main__':
    app.run(debug=True)
