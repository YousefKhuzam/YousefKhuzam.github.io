import requests
import socket

def get_ip_info(ip):
    """Returns geolocation and reverse DNS info for a given IP"""
    ip_info = {"IP": ip, "Country": "Unknown", "ISP": "Unknown", "Reverse DNS": "N/A"}

    # 🌍 Get geolocation from ipinfo.io (Free API)
    try:
        response = requests.get(f"https://ipinfo.io/{ip}/json")
        data = response.json()
        ip_info["Country"] = data.get("country", "Unknown")
        ip_info["ISP"] = data.get("org", "Unknown")
    except:
        pass  # Handle API failures

    # 🔎 Reverse DNS Lookup
    try:
        ip_info["Reverse DNS"] = socket.gethostbyaddr(ip)[0]
    except:
        pass  # If no reverse DNS record

    return ip_info
