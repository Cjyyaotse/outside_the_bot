import json

def sort_jsonl_by_longitude(input_file, output_file):
    # Read all JSON objects from the input file
    data = []
    with open(input_file, 'r') as f:
        for line in f:
            try:
                json_obj = json.loads(line.strip())
                if 'coordinates' in json_obj and len(json_obj['coordinates']) == 2:
                    data.append(json_obj)
            except json.JSONDecodeError:
                print(f"Skipping invalid JSON line: {line.strip()}")

    # Sort by longitude (first element of coordinates)
    sorted_data = sorted(data, key=lambda x: float(x['coordinates'][0]))

    # Write sorted JSON objects to output file
    with open(output_file, 'w') as f:
        for item in sorted_data:
            f.write(json.dumps(item) + '\n')

if __name__ == "__main__":
    input_file = "datasets/text_coordinates_regions.jsonl"
    output_file = "datasets/sorted_text_coordinates_regions.jsonl"
    sort_jsonl_by_longitude(input_file, output_file)
    print(f"Sorted data written to {output_file}")
