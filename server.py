import pandas as pd

def process_csv(file_path):
    # Read CSV file
    df = pd.read_csv(file_path)

    # Remove rows where Column S contains "fake_bank"
    df = df[df["S"] != "fake_bank"]

    # Finding duplicate payments based on Q (Merchant Name), N (PAN), and I (Amount)
    duplicate_groups = df.groupby(["Q", "N", "I"])
    duplicate_payments = []

    for _, group in duplicate_groups:
        if len(group) > 1:  # If duplicates exist
            sorted_group = group.sort_values(by="O")  # Sort by date
            for i in range(len(sorted_group) - 1):
                time_diff = abs(pd.to_datetime(sorted_group.iloc[i + 1]["O"]) - pd.to_datetime(sorted_group.iloc[i]["O"]))
                if time_diff.total_seconds() < 600:  # If time difference < 10 minutes
                    duplicate_payments.append(sorted_group.iloc[i])
                    duplicate_payments.append(sorted_group.iloc[i + 1])

    duplicate_df = pd.DataFrame(duplicate_payments).drop_duplicates()

    # Keep only required columns
    final_columns = ["Y", "X", "S", "G", "B", "E", "Q", "I", "N", "O"]
    duplicate_df = duplicate_df[final_columns]

    return df, duplicate_df

if __name__ == "__main__":
    file_path = "your_file.csv"  # Change this to the actual CSV file path
    full_data, duplicates = process_csv(file_path)

    full_data.to_csv("full_data.csv", index=False)
    duplicates.to_csv("duplicates.csv", index=False)

    print("Processing complete. Files saved as full_data.csv and duplicates.csv.")
