import requests
import json

url = 'https://questions.examside.com/past-years/gate/gate-cse/operating-systems/deadlocks/__data.json?x-sveltekit-invalidated=01'
resp = requests.get(url)
data = resp.json()['nodes']
flat_data = []
for n in data:
    if isinstance(n, dict) and n.get('type') == 'data':
        flat_data = n.get('data', [])
        break

print(f"Flat data length: {len(flat_data)}")
if flat_data:
    # Print the first 10 items to see structure
    print("\nFirst 10 items:")
    for i, item in enumerate(flat_data[:10]):
        print(f"[{i}]: {str(item)[:200]}")

    # Check item 0
    print("\nItem 0 (Main):")
    main = flat_data[0]
    print(main)

    # Follow 'questions'
    q_ref = main.get('questions')
    print(f"\nQuestions reference: {q_ref}")
    if q_ref and q_ref < len(flat_data):
        q_list = flat_data[q_ref]
        if isinstance(q_list, list) and q_list:
            q0_idx = q_list[0]
            print(f"First item in q_list (index {q0_idx}): {flat_data[q0_idx]}")
            if isinstance(flat_data[q0_idx], dict):
                href_ref = flat_data[q0_idx].get('href')
                print(f"HREF reference: {href_ref}")
                if href_ref and href_ref < len(flat_data):
                    print(f"Value at flat_data[{href_ref}]: {flat_data[href_ref]}")
                    print(f"Type of value: {type(flat_data[href_ref])}")

    # Print all strings in flat_data
    strings = [s for s in flat_data if isinstance(s, str)]
    print(f"\nTotal strings in flat_data: {len(strings)}")
    for s in strings[:10]:
        print(f"  {s[:50]}")

    # Find all items that look like GATE CSE questions
    print("\nSearching for potential slugs (containing 'gate-cse'):")
    possible = [s for s in flat_data if isinstance(s, str) and 'gate-cse' in s.lower()]
    print(f"Found: {len(possible)}")
    for s in possible[:10]:
        print(f"  {s}")
