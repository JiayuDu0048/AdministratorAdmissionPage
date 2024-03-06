import React, { useState } from "react";
import Papa from "papaparse";
import axiosProvider from "../utils/axiosConfig";
import axios from 'axios';

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
                //Update these fields from admin
                AdmissionStatus: "",
                MatriculationStatus: "",
                UnityStatus: "",
                CourseraStatus: "",
                SurveyStatus: "" 
            };
        });
    };


    // Function to parse the CSV file
    const parseCsv = (file) => {
        Papa.parse(file, {
            complete: (result) => {
                // Use callback function to send data from child to parent
                const preprocessedData = preprocessData(result.data);
                onCsvData(preprocessedData);

                // After parsing, send the data to the backend
                sendDataToBackend(preprocessedData);
            },
            header: true,
        });
    };

    // Function to send data to the backend
    const sendDataToBackend = async (data) => {
        // console.log("Sending data to the backend", JSON.stringify(data, null, 2))
        try {
            const response = await axiosProvider.post("/populate/data", data, {
                headers: {
                  'Content-Type': 'application/json'
                }});
        } catch (error) {
            console.error("Error uploading data: ", error.response ? error.response.data : error);//if error.response exists, see the detailed data
        }
    };

    const handleUpload = () => {
        if (!csvFile) {
            alert("Please drop a CSV file first.");
            return;
        }
        parseCsv(csvFile);
    };


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
