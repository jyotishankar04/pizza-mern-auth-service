function convertPrivateKeyForDocker() {
    // Get the multi-line private key from clipboard or prompt
    const multiLineKey = prompt("Paste your multi-line private key here:");

    if (!multiLineKey) return;

    // Convert to single line with \n escape sequences
    const singleLineKey = multiLineKey
        .trim() // Remove leading/trailing whitespace
        .replace(/\r\n/g, "\n") // Normalize line endings
        .replace(/\n/g, "\\n") // Replace newlines with \n
        .replace(/"|'/g, ""); // Remove any quotes

    // Copy to clipboard
    navigator.clipboard
        .writeText(singleLineKey)
        .then(() => alert("Converted private key copied to clipboard!"))
        .catch((err) => {
            // Fallback if clipboard access is denied
            console.log("Here's your converted private key:");
            console.log(singleLineKey);
            prompt("Copy this:", singleLineKey);
        });
}

// Run the function
convertPrivateKeyForDocker();
