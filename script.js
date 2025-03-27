// script.js
const ciks = [
    "0001675249", // Rivian Automotive, Inc.
    "0001823085", // Reddit, Inc.
    "0000320193", // Apple Inc.
    "0001318605", // Tesla, Inc.
    "0001045810", // NVIDIA Corporation
     "0001769628",
     "0001855474",
    // Add more CIKs here
  ];
  
  async function getFilings(cik) {
    console.log(`Fetching data for CIK: ${cik}`); // Add this line
    const url = `https://data.sec.gov/submissions/CIK${cik}.json`;
  
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "to.tonybaby@gmail.com", // Required by SEC
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log(`Data fetched for CIK ${cik}:`, data); // Add this line
      return data;
    } catch (error) {
      console.error(`Could not fetch data for CIK ${cik}:`, error);
      return null;
    }
  }
  
  function displayRecentS1Filings(data, cik) {
    console.log(`Displaying filings for CIK: ${cik}`, data); // Add this line
    if (!data || !data.filings || !data.filings.recent) {
      console.warn(`No filings found for CIK ${cik}`);
      return;
    }
  
    const recentFilings = data.filings.recent;
    const s1Filings = [];
  
    for (let i = 0; i < recentFilings.form.length; i++) {
      if (recentFilings.form[i] === "S-1" || recentFilings.form[i] === "S-1/A") {
        s1Filings.push({
          form: recentFilings.form[i],
          accessionNumber: recentFilings.accessionNumber[i],
          fileNumber: recentFilings.fileNumber[i],
          reportDate: recentFilings.reportDate[i],
          filingDate: recentFilings.filingDate[i],
        });
      }
    }
  
    // Sort by filing date (most recent first)
    s1Filings.sort((a, b) => new Date(b.filingDate) - new Date(a.filingDate));
  
    // **Remove the slice operation**
    // const top10Filings = s1Filings.slice(0, 10);
  
    // Display the filings on the page
    const filingsList = document.getElementById("filings-list");
    if (!filingsList) {
      console.error("Element with ID 'filings-list' not found in the HTML.");
      return;
    }
  
    // **Check if s1Filings is empty**
    if (s1Filings.length === 0) {
      const listItem = document.createElement("li");
      listItem.textContent = `No S-1 filings found for CIK ${cik}`;
      filingsList.appendChild(listItem);
      return; // Exit the function
    }
  
    s1Filings.forEach((filing) => { // Use s1Filings directly
      const listItem = document.createElement("li");
      const filingLink = document.createElement("a");
  
      // Construct the filing URL (using the SEC EDGAR browser)
      const filingUrl = `https://www.sec.gov/Archives/edgar/data/${cik}/${filing.accessionNumber.replace(/\-/g, "")}/${filing.accessionNumber}.txt`;
  
      filingLink.href = filingUrl;
      filingLink.textContent = `${filing.form} - ${filing.filingDate}`;
      filingLink.target = "_blank"; // Open in new tab
  
      listItem.appendChild(filingLink);
      filingsList.appendChild(listItem);
    });
  }
  
  async function main() {
    for (const cik of ciks) {
      const data = await getFilings(cik);
      if (data) {
        displayRecentS1Filings(data, cik);
      }
    }
  }
  
  document.addEventListener("DOMContentLoaded", main); // Run after DOM is loaded