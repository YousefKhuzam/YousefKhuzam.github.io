import requests

def check_blacklist(ip):
    """Checks if the IP is blacklisted using Spamhaus API"""
    blacklist_status = "Not Blacklisted"
    try:
        response = requests.get(f"https://api.spamhaus.org/query/{ip}")
        if "listed" in response.text.lower():
            blacklist_status = "Blacklisted ⚠️"
    except:
        pass  # Handle API failures

    return {"IP": ip, "Blacklist Status": blacklist_status}
