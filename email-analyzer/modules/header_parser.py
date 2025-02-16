import re

def parse_email_header(header):
    """Extracts sender IP, authentication, and routing info from email header"""
    results = {
        "Return-Path": None,
        "Sender IP": None,
        "SPF": None,
        "DKIM": None,
        "DMARC": None,
        "Received Hops": []
    }

    for line in header.split("\n"):
        if "Return-Path:" in line:
            results["Return-Path"] = line.split(":")[1].strip()

        if "Received: from" in line:
            ip_match = re.search(r'\[(\d+\.\d+\.\d+\.\d+)\]', line)
            if ip_match:
                results["Sender IP"] = ip_match.group(1)
            results["Received Hops"].append(line.strip())

        if "spf=" in line.lower():
            results["SPF"] = line.strip()
        if "dkim=" in line.lower():
            results["DKIM"] = line.strip()
        if "dmarc=" in line.lower():
            results["DMARC"] = line.strip()

    return results
