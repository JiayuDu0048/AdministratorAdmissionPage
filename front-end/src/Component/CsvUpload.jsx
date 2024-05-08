import React, { useState } from "react";
import Papa from "papaparse";
import axiosProvider from "../utils/axiosConfig";
import PopupContent from "./popUpContent";

function CsvUpload({onCsvData}) {
    const [dragging, setDragging] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const [message, setMessage] = useState('')
    const [title, setTitle] = useState('')
    const [showUploadMessage, setShowUploadMessage] = useState(false);


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
        // Filter the csv header & empty lines
        data = data.filter(row => row["Campus ID"] !== "Campus ID" && row["Last"] !== "");
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
                // the admin will update these fields weekly, default value = false -> "Unfinished"
                AdmissionStatus: false,
                MatriculationStatus: false,
                UnityStatus: false,
                CourseraStatus: false,
                SurveyStatus: false
            };
        });
    };


    // Function to parse the CSV file
    const parseCsv = (file) => {
        Papa.parse(file, {
            complete: (result) => {
                const preprocessedData = preprocessData(result.data);

                // After parsing, send the data to the backend
                sendDataToBackend(preprocessedData);
                setCsvFile(null);
                socket.emit('request session update'); 
            },
            header: true,
        });
    };

    // Function to send data to the backend
    const sendDataToBackend = async (data) => {
        // console.log("Sending data to the backend", JSON.stringify(data, null, 2))
        setShowUploadMessage(true);
        try {
            const response = await axiosProvider.post("/populate/data", data, {
                headers: {
                  'Content-Type': 'application/json'
                }});
            
            setTitle("Upload Success!");
            setMessage("All entries have been uploaded.");
            onCsvData(response.data);  // callback function: send data from child to parent
        } catch (error) {
            setTitle("Upload Failed");
            setMessage("Please try again later.");
            console.error("Error uploading data: ", error.response ? error.response.data : error);//if error.response exists, see the detailed data
        }
        setTimeout(() => {
            setShowUploadMessage(false);
            setMessage(""); // Optionally reset the message if desired
        }, 2000);
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
                            <div className="col text-center" style={{marginRight: '20px'}}>
                                <span>{csvFile.name}</span>
                            </div>
                        </div>
                        <div className="row justify-content-end">
                            <div className="col-auto">
                                <button onClick={handleRemoveFile} className="btn btn-danger btn-lg" style={{ width: '100px' }}>
                                    Remove
                                </button>
                            </div>
                            <div className="col-auto">
                                <button type="button" className="btn btn-primary btn-lg" onClick={handleUpload} style={{ width: '100px' }}>
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
            {showUploadMessage && <PopupContent 
              message={message}
              title={title}
            />}
        </div>
    );
}

export default CsvUpload;

