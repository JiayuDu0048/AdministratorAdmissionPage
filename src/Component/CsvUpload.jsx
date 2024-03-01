import React, { useState } from "react";
import Papa from "papaparse";
import axios from "axios";

function CsvUpload({onCsvData}) {
    const [dragging, setDragging] = useState(false);
    const [csvFile, setCsvFile] = useState(null);

    // Remove the selected file
    const handleRemoveFile = () => {
        setCsvFile(null);
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
        let files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type === "text/csv") {
                setCsvFile(file);
            } else {
                alert("Please drop a CSV file.");
            }
        }
    };

    const preprocessData = (data) => {
        return data.map(row => {
            // Extracting session number
            let sessionNumber = null;
            const sessionMatch = row["Session"].match(/Session\s+(\d+)/i);

            if (sessionMatch) {
                sessionNumber = sessionMatch[1];
                console.log(sessionNumber);
                console.log(typeof sessionNumber);
            }
            

            // Extracting session modality
            let sessionModality = "Unknown"; // Default to Unknown if not specified or not matched
            const modalityMatch = row["Session"] && row["Session"].match(/\((Online|In-person)\)/i);
            if (modalityMatch) {
                sessionModality = modalityMatch[1];
            } else {
                console.log("Session modality not found in:", row["Session"]);
            }

            // Transform the row object to match the columns in the table
            return {
                NNumber: row["Campus ID"],
                Name: `${row["Preferred"]} ${row["Last"]}`,
                Email: row["Email"],
                Session: sessionNumber,
                SessionModality: sessionModality,
                AdmissionStatus: row["Application Status"],

                //TO DO?
                MatriculationStatus: "TBD",
                UnityStatus: "TBD",
                CourseraStatus: "TBD",
                SurveyStatus: "TBD" 
            };
        });
    };


    // Function to parse the CSV file
    const parseCsv = (file) => {
        Papa.parse(file, {
            complete: (result) => {
                // After parsing, send the data to the backend
                // sendDataToBackend(result.data);

                // Use callback function to send data from child to parent
                const preprocessedData = preprocessData(result.data);
                onCsvData(preprocessedData);
            },
            header: true,
        });
    };

    // TO DO:  Function to send data to the backend
    // const sendDataToBackend = async (data) => {
    //     try {
    //         const response = await axios.post("YOUR_BACKEND_ENDPOINT", data);
    //         console.log("Upload response: ", response.data);
    //         // Handle success 
    //     } catch (error) {
    //         console.error("Error uploading data: ", error);
    //         // Handle error
    //     }
    // };

    const handleUpload = () => {
        if (!csvFile) {
            alert("Please drop a CSV file first.");
            return;
        }
        parseCsv(csvFile);
    };

    // return (
    //     <div className="marginGlobal">
    //         <div
    //             className={`styleUpload ${dragging ? "dragging" : ""}`}
    //             onDragEnter={handleDragEnter}
    //             onDragOver={handleDragOver}
    //             onDragLeave={handleDragLeave}
    //             onDrop={handleDrop}
    //         >
    //             <button type="button" className="btn btn-primary btn-lg" onClick={handleUpload}>
    //                 Upload
    //             </button>
    //             <h2 className="textUpload">/ </h2>
    //             <h3 className="textUpload">Drag & Drop .csv file here</h3>
    //         </div>
    //     </div>
    // );

    return (
        <div className="marginGlobal">
            <div
                className={`styleUpload ${dragging ? "dragging" : ""}`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {csvFile ? (
                    <>
                        <div className="row mb-3">
                            <div className="col">
                                <span>File: {csvFile.name}</span>
                            </div>
                        </div>
                        <div className="row justify-content-end">
                            <div className="col-6">
                                <button onClick={handleRemoveFile} className="btn btn-danger btn-lg me-2">
                                    Remove
                                </button>
                            </div>
                            <div className="col-auto">
                                <button type="button" className="btn btn-primary btn-lg" onClick={handleUpload}>
                                    Upload
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <button type="button" className="btn btn-primary btn-lg" onClick={handleUpload} disabled>
                            Upload
                        </button>
                        <h2 className="textUpload">/ </h2>
                        <h3 className="textUpload">Drop one csv file here</h3>
                    </>
                )}
            </div>
        </div>
    );
}

export default CsvUpload;
