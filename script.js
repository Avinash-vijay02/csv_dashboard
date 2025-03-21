let csvData = ""; // Store CSV content globally
let allData = [];

document.getElementById("fileInput").addEventListener("change", function () {
    const file = this.files[0];

    if (!file) {
        alert("Please select a CSV file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        csvData = e.target.result; // Store the CSV content
        allData = csvData.split("\n").map(row => row.split(",")); // Store full CSV data
    };
    reader.readAsText(file);
});

document.getElementById("selectAllBtn").addEventListener("click", function () {
    if (!csvData) {
        alert("Please upload a CSV file first.");
        return;
    }
    localStorage.setItem("fullCSVData", JSON.stringify(allData)); // Store data temporarily
    window.open("all_data.html", "_blank"); // Open in new page
});

document.getElementById("processBtn").addEventListener("click", function () {
    if (!csvData) {
        alert("Please upload a CSV file first.");
        return;
    }
    processCSV(csvData);
});

function processCSV(csv) {
    let rows = csv.split("\n").map(row => row.split(","));
    let header = rows[0]; // First row as header
    let data = rows.slice(1); // Remaining rows

    // Remove rows where Column S (index 18) contains "fake_bank"
    let filteredData = data.filter(row => 
        row[18]?.trim() !== "fake_bank" &&
        row[6]?.trim() === "CARD"
    );    

    let duplicates = findAllDuplicates(filteredData);
    displayData(duplicates);
}

function findAllDuplicates(data) {
    let seen = new Map();
    let duplicates = [];

    data.forEach((row, index) => {
        let key = row[16] + row[13] + row[8]; // Using Q (Merchant Name), N (PAN), I (Amount)
        let currentDate = row[14]; // Extracting accurate date from Column O (Date/Time)

        if (seen.has(key)) {
            let prevRows = seen.get(key);
            
            prevRows.forEach(prevRow => {
                let prevTime = new Date(prevRow[14]).getTime();
                let currTime = new Date(currentDate).getTime();
                let timeDiff = Math.abs(currTime - prevTime) / 60000; // Convert to minutes

                if (timeDiff < 10) {
                    duplicates.push([...prevRow]); // Store previous duplicate
                    duplicates.push([...row]); // Store current duplicate with accurate date
                }
            });

            prevRows.push(row); // Add the new row to the existing list
        } else {
            seen.set(key, [row]); // Store first occurrence as an array
        }
    });

    return duplicates;
}

function displayData(data) {
    let tableBody = document.querySelector("#outputTable tbody");
    tableBody.innerHTML = ""; // Clear previous data

    data.forEach(row => {
        let tr = document.createElement("tr");

        let columnsToShow = [24, 23, 18, 6, 1, 4, 16, 8, 13, 14]; // B, E, G, I, N, O (Date), Q, S

        columnsToShow.forEach(index => {
            let td = document.createElement("td");
            td.textContent = row[index] || "N/A"; // Show "N/A" if data is missing
            tr.appendChild(td);
        });

        tableBody.appendChild(tr);
    });

    if (data.length === 0) {
        alert("No data to display.");
    }
}
