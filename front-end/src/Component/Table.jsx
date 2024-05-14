import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import $ from "jquery";
import "datatables.net";
import "datatables.net-bs5";
//import "/Users/jiayudu/AdmissionPage/node_modules/bootstrap/dist/js/bootstrap.bundle.js";
import 'bootstrap/dist/js/bootstrap.bundle'; //Change the above line to relative path-> more compatible
import "@popperjs/core";
import CsvUpload from "./CSVupload";
import { convertArrayOfObjectsToCSV, downloadCSV } from './CsvDownload';
import axiosProvider from "../utils/axiosConfig";
import io from 'socket.io-client';


const serverURL = import.meta.env.VITE_SERVER_URL;
// Establish a connection to the WebSocket server
const socket = io(serverURL, {
  path: '/socket.io' 
});  

function Table() {
  const startingIndex = 5;
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const StatusNames = rows[0] ? Object.keys(rows[0]).slice(startingIndex) : [];
  const [deletedRows, setDeletedRows] = useState([]);
  const [pendingChanges, setPendingChanges] = useState({ emailUpdates: {}, statusUpdates: {} });
  const [isEditing, setIsEditing] = useState(false);
  const [isShowing, setIsShowing] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectDeletedRows, setSelectDeletedRows] = useState([]);

  
  //Save pending changes function
  //Only save email changes
  const accumulateEmailChange = (NNumber, newEmail) => {
    setRows(currentRows =>
      currentRows.map(row =>
        row.NNumber === NNumber ? { ...row, Email: newEmail} : row));

    setPendingChanges(prev => ({
      ...prev,
      emailUpdates: { ...prev.emailUpdates, [NNumber]: newEmail }
    }));
  };

  //Save pending changes: session, all status
  const accumulateStatusChange = (NNumber, StatusName, newStatus) => {
    setRows(currentRows =>
      currentRows.map(row =>
        row.NNumber === NNumber ? { ...row, [StatusName]: newStatus, SessionModality : StatusName === "Session" ? getStatus(newStatus) : row.SessionModality } : row
      ));

    setPendingChanges(prev => ({
      ...prev,
      statusUpdates: { ...prev.statusUpdates, [NNumber]: { ...prev.statusUpdates[NNumber], [StatusName]: newStatus } }
    }));

  };

  // Show/Hide Mode function
  function handleShowClick() {
    setIsEditing(false);
    setIsShowing(true);
    setSelectedRows([]);
  }
  function handleHideClick() {
    setIsShowing(false);
    setSelectDeletedRows([]);
  }
  const handleRecoverSaveClick = async () => {
    if (selectDeletedRows.length === 0) {
        alert("No rows selected for recovery.");
        return;
    }

    try {
        const response = await axiosProvider.post('/api/recover', {
            NNumbers: selectDeletedRows
        });

        if (response.status === 200) {
            
            const recoveredRows = deletedRows.filter(row => selectDeletedRows.includes(row.NNumber));
            setRows([...rows, ...recoveredRows]);
            setDeletedRows(deletedRows.filter(row => !selectDeletedRows.includes(row.NNumber)));
            setSelectDeletedRows([]); // Clear the selection
            console.log("Rows recovered successfully.");
            setIsShowing(false);

        } else {
            throw new Error('Failed to recover rows');
        }
    } catch (error) {
        console.error("Failed to save changes", error.message);
    }
  };




  //Edit Mode function
  function handleEditClick() {
    setIsEditing(true);
  }
  const handleSaveClick = async () =>{
    setIsEditing(false);
    const responses = [];

    try {
      for (const NNumber of Object.keys(pendingChanges.emailUpdates)){
        const newEmail = pendingChanges.emailUpdates[NNumber];
        const response = await axiosProvider.post('/api/updateEmail', { NNumber, newEmail }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        // Add response after waiting is settled
        responses.push(response);
      }
   
      for (const NNumber of Object.keys(pendingChanges.statusUpdates)){
        for (const StatusName of Object.keys(pendingChanges.statusUpdates[NNumber])) {
          const newStatus = pendingChanges.statusUpdates[NNumber][StatusName];
          const response = await axiosProvider.post('/api/updateStatus', { NNumber, StatusName, newStatus }, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          responses.push(response);
        }
      }
      
      const results = await Promise.all(responses); // Don't necessarily need this, since we have previous await before adding to responses
      const allSuccess =  results.every(result => result.status >= 200 && result.status < 300);
  
      
      // If all successful, update the main rows state with the pending changes
      if(allSuccess){
        setRows(currentRows => currentRows.map(row => {
          const emailUpdate = pendingChanges.emailUpdates[row.NNumber];
          const statusUpdate = pendingChanges.statusUpdates[row.NNumber];
          return {
            ...row,
            Email: emailUpdate || row.Email,
            ...statusUpdate
          };
        }));
        
        // Emit an event from the frontend to request updated session stats
        // This requires the backend to have an endpoint listening for this event
        socket.emit('request session update');
        socket.emit('request status update');

      }else{
        //TODO: set error message window
      }
  
      // Reset pending changes
      setPendingChanges({ emailUpdates: {}, statusUpdates: {} });
      console.log("Changes saved to backend successfully.");
    } catch (error) {
      console.error("Failed to save changes", error);
    }
  }

 
  //Callback function to receive csv data from CsvUpload
  const handleCsvData = (newData) => {

    if (Array.isArray(newData)) {
        // currentRows is the most updated version of 'rows'
        setRows((currentRows) => {
            // Create a map of existing rows by some unique identifier, e.g., NNumber
            const existingMap = new Map(currentRows.map(row => [row.NNumber, row]));

            // Iterate over new data and add to the map if not already present
            newData.forEach(row => {
              if (!existingMap.has(row.NNumber)) {
                  const { deleted, deletedAt, addedAt, __v, _id, ...keepAttrs } = row;
                  existingMap.set(row.NNumber, keepAttrs); // Only keep desired attributes
              }
          });

            
            return Array.from(existingMap.values());
        });
    } else {
        console.error("Received CSV data is not an array:", newData);
    }
  };

  function handleDownloadClick(rows) {
    const csvString = convertArrayOfObjectsToCSV(rows);
    downloadCSV(csvString, 'student_database.csv');
  }

  
  //Load the table using datatable and reload when the rows changed
  const tableRef = useRef(null);
  const deletedTableRef = useRef(null);
  useEffect(() => {
    const fetchData = async () => {
    
      try {
        const response = await axiosProvider.get('/api/students', {
          withCredentials: true
        });
        const filteredData = response.data
          .filter(row => !row.deleted) // Exclude deleted records
          .map(({ deleted, deletedAt, addedAt,  __v, _id, ...keepAttrs }) => ({
            ...keepAttrs, 
            AdmissionStatus: keepAttrs.AdmissionStatus ? 'Finished' : 'Unfinished',
            MatriculationStatus: keepAttrs.MatriculationStatus ? 'Finished' : 'Unfinished',
            UnityStatus: keepAttrs.UnityStatus ? 'Finished' : 'Unfinished',
            CourseraStatus: keepAttrs.CourseraStatus ? 'Finished' : 'Unfinished',
            SurveyStatus: keepAttrs.SurveyStatus ? 'Finished' : 'Unfinished',
          }));
        
          // console.log("Filtered data:", filteredData);
          setRows(filteredData);

          const deletedData  = response.data
          .filter(row => row.deleted) 
          .map(({ deleted, deletedAt, addedAt,  __v, _id, ...keepAttrs }) => ({
            ...keepAttrs, 
            AdmissionStatus: keepAttrs.AdmissionStatus ? 'Finished' : 'Unfinished',
            MatriculationStatus: keepAttrs.MatriculationStatus ? 'Finished' : 'Unfinished',
            UnityStatus: keepAttrs.UnityStatus ? 'Finished' : 'Unfinished',
            CourseraStatus: keepAttrs.CourseraStatus ? 'Finished' : 'Unfinished',
            SurveyStatus: keepAttrs.SurveyStatus ? 'Finished' : 'Unfinished',
          }));
          setDeletedRows(deletedData);

      } catch (error) {
        console.error('Error fetching data:', error);
      }   
    };
  
    fetchData();
  }, []);
  

  // UseEffect for Main Table
  useEffect(() => {
    
    const $dataTable = $(tableRef.current);

    if (!$.fn.dataTable.isDataTable($dataTable)) {
      // Initialize DataTables only if it hasn't been initialized
      $dataTable.DataTable({
        responsive: true,
        autoWidth: false,
        stateSave: true, // Enable state saving to remember the table's state
      });
      
    } else {
      // DataTables is already initialized, so we manually manage updates to avoid destroying and reinitializing it.
      let dataTableInstance = $dataTable.DataTable();  
      dataTableInstance.state.clear();          // Temporarily disable state saving to avoid saving state during data update   
      dataTableInstance.rows.add(rows).draw();      // Perform necessary data updates here. 
      dataTableInstance.state.save();        // Re-enable state saving after updates: this must work together with stateSave: true
    }

    // Cleanup function to destroy the DataTable instance on component unmount (Don't delete this!)
    return () => {
      if ($.fn.dataTable.isDataTable($dataTable)) {
        // console.log("Destroying DataTable");
        $dataTable.DataTable().destroy();
      }
    };
  }, [rows]); // Only re-run when `rows` changes



  // UseEffect for Deleted Table
  useEffect(() => {
  const $deletedTable = $(deletedTableRef.current);

  console.log("Table HTML before DataTables initialization:", $deletedTable.html());

  const initializeDataTables = () => {
    const numHeaders = $deletedTable.find("thead th").length;
    const numBodyCells = $deletedTable.find("tbody tr:first td").length;

    console.log(`Header count: ${numHeaders}, Body cell count: ${numBodyCells}`);

    if (numHeaders === numBodyCells) {
      $deletedTable.DataTable({
        responsive: true,
        autoWidth: false,
        destroy: true,
      });
      console.log("DataTables initialized successfully.");
    } else {
      console.error("Table structure mismatch: Headers vs. Body");
    }
  };

  if (!$.fn.dataTable.isDataTable($deletedTable) && deletedRows.length > 0) {
    console.log("Initializing DataTables with data:", deletedRows);
    setTimeout(initializeDataTables, 100);
  }

  return () => {
    if ($.fn.dataTable.isDataTable($deletedTable)) {
      console.log("Destroying DataTables instance.");
      $deletedTable.DataTable().destroy();
    }
  };
}, [deletedRows, isShowing]); // Dependency on deletedRows and isShowing

  


  // Multiple choice and delete function
  function handleCheckboxChange(rowNNumber) { 
     
    if(isShowing){
          //Recover rows in deleted table
      if (selectDeletedRows.includes(rowNNumber)) {
        setSelectDeletedRows(selectDeletedRows.filter((NNumber) => NNumber !== rowNNumber));
      } else {
        setSelectDeletedRows([...selectDeletedRows, rowNNumber]);
      }
    }
    else{ //else: we are deleting rows in main table
      if (selectedRows.includes(rowNNumber)) {
        setSelectedRows(selectedRows.filter((NNumber) => NNumber !== rowNNumber));
      } else {
        setSelectedRows([...selectedRows, rowNNumber]);
      }
    }
    
  }

  const handleHeaderCheckboxChange = (event) => {
    
    if(isShowing){
      if (event.target.checked) {
        // If header checkbox is checked, select all rows
        const allRowIds = deletedRows.map(row => row.NNumber);
        setSelectDeletedRows(allRowIds);

      } else {
        // If header checkbox is unchecked, clear all selections
        setSelectDeletedRows([]);

      }
    }else{
      if (event.target.checked) {
        const allRowIds = rows.map(row => row.NNumber);
        setSelectedRows(allRowIds);
      } else {
        setSelectedRows([]);
      }
    }
    
  };


  const deleteSelectedRows =  async () => {
    const updatedRows = rows.filter((row) => !selectedRows.includes(row.NNumber));
    const rowsToDelete = rows.filter(row => selectedRows.includes(row.NNumber));
    setRows(updatedRows);
    setDeletedRows([...deletedRows, ...rowsToDelete]);
    
    //Call backend deletion router
    try{
        const response = await axiosProvider.delete('delete/rows', {
        data: {selectedNNumbers: selectedRows},
        headers: {
          'Content-Type': 'application/json'
        }
        })
        
        if (response.status === 200) {
          console.log("Rows marked as deleted successfully:", response.data);
          // Update rows to mark as deleted instead of removing them
          const updatedRows = rows.map(row => {
            if (selectedRows.includes(row.NNumber)) {
              return { ...row, deleted: true }; 
            }
            return row;
          });

          socket.emit('request session update');
          socket.emit('request status update');
          
        } else {
            console.error("Failed to delete rows");
        }
    }catch(error){
      console.error("Error deleting rows:", error);
    }  
    setSelectedRows([]);
    
  }

  const handleHelpClick = () => {
    navigate("/help"); // Navigate to the Help page
  };



  //Session change function
  const getStatus = (session) => {
    const sessionStr = String(session);

    if (sessionStr == "1") {
      return "Online";
    } else if (sessionStr == "2") {
      return "In-person";
    } else if (sessionStr == "3") {
      return "In-person";
    } else {
      return "Unknown";
    }
  };

  //Status detect function
  const IsFinished = (status) => {
    if (status === "Finished") {
      return true;
    } else {
      return false;
    }
  };
 

  return ( 
    <>
      <div className="marginGlobal">
      <div className="flexDropArea">
        <div className="groupText">
            <h2>Upload Student Data </h2>
            <ul style={{listStyleType: 'disc', marginLeft: '40px', marginTop: '20px', marginBottom: '20px', marginRight: '40px'}}>
                      <li> Drop only one csv file each time. This file must contain these columns: 'Campus ID', 'Preferred', 'Last', 'Email', 'Session'.</li>
                      <li> The value format for 'Session' must be: Coding for Game Design Session 1/2/3: xxxxx</li>
                      <li> You can drop files that contain previous student records. The system will only add new students into the database. </li>
            </ul>
          </div>
        {/* Upload function */}
        <CsvUpload onCsvData={handleCsvData}> </CsvUpload>
        </div>
        

        <div className="headerContainer">
          <h2 style={{marginTop: '50px', marginLeft: '30px'}}> Student Database </h2>
          {/* Edit Mode & Save button*/}
          <div className="editPositionController" >
            {isEditing ? (
              <button
                className="btn btn-secondary"
                data-bs-toggle="modal"
                data-bs-target="#SaveConfirm"
                data-bs-backdrop="true"
                style={{
                  marginRight: 10,
                  width: 90,
                  height: 40,
                  display: "flex",
                  paddingLeft: 20,
                  alignItems: "center",
                  fontSize: '20px',
                  borderRadius: '20px'
                }}
                type="button"
              >
                Save
              </button>
            ) : (
              <button
                className="btn btn-primary"
                style={{
                  marginRight: 10,
                  width: 83,
                  height: 40,
                  display: "flex",
                  paddingLeft: 20,
                  alignItems: "center",
                  fontSize: '20px',
                  borderRadius: '20px'
                }}
                onClick={handleEditClick}
                type="button"
              >
                Edit
              </button>
            )}
          </div>
          <button
                className="btn btn-success"
                style={{
                  marginRight: 10,
                  width: 143,
                  height: 40,
                  display: "flex",
                  paddingLeft: 20,
                  alignItems: "center",
                  fontSize: '20px',
                  borderRadius: '20px',
                  marginLeft: '23px',
                  marginTop: '50px'
                }}
                type="button"
                onClick={() => handleDownloadClick(rows)}
              >
                Download
            </button>
        </div>

        {/* Save Changes Info Window */}
        <div
          className="modal fade"
          id="SaveConfirm"
          tabIndex="-1"
          aria-labelledby="SaveConfirmLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content ">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="SaveConfirmLabel">
                  Confirmation
                </h1>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                Are you sure you want to make these changes?
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Go Back
                </button>
                <button
                  onClick={handleSaveClick}
                  type="button"
                  className="btn btn-primary"
                  data-bs-dismiss="modal"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lower right card */}
        <div className="selected-info">
          { isShowing ? <p>{selectDeletedRows.length} rows selected</p> 
          :  <p>{selectedRows.length} rows selected</p> }
         
          { isShowing ? 
            <button
            className="btn btn-sm btn-warning"
            data-bs-toggle="modal"
            data-bs-target="#RecoverConfirm"
            data-bs-backdrop="false"
            style={{color: 'white'}}
          >
            Recover
          </button>
          : <button
            className="btn btn-sm btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#exampleModal"
            data-bs-backdrop="false"
          >
            Delete
          </button>

          }
        </div>

        {/* Delete Rows Info Window */}
        <div
          className="modal fade"
          id="exampleModal"
          tabIndex="-1"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modalEnable">
            <div className="modal-content ">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="exampleModalLabel">
                  Confirmation
                </h1>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete these rows?
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <button
                  onClick={deleteSelectedRows}
                  type="button"
                  className="btn btn-primary"
                  data-bs-dismiss="modal"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recover Rows Info Window */}
        <div
          className="modal fade"
          id="RecoverConfirm"
          tabIndex="-1"
          aria-labelledby="SaveConfirmLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content ">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="SaveConfirmLabel">
                  Confirmation
                </h1>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                Are you sure you want to recover these rows?
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Go Back
                </button>
                <button
                  onClick={handleRecoverSaveClick}
                  type="button"
                  className="btn btn-primary"
                  data-bs-dismiss="modal"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>

        
        {/* Main Table */}
       <div key={rows.length} className="table-responsive" style={{margin: '30px'}}> 
         {/* React feature: force re-render the table everytime the key is changed */}
        <table ref={tableRef} className="table table-sm table-hover" style={{marginTop: '15px'}}>
          <thead className="table-light">
            <tr>
              <th scope="col">
                <input type="checkbox" id="headCheckbox"  disabled={isShowing} onClick={handleHeaderCheckboxChange}></input>
              </th>
              <th scope="col">
                N Number
                <img
                  src="https://cdn.icon-icons.com/icons2/906/PNG/512/sort_icon-icons.com_69899.png"
                  alt="Logo"
                  width="20"
                ></img>
              </th>
              <th scope="col">
                Name
                <img
                  src="https://cdn.icon-icons.com/icons2/906/PNG/512/sort_icon-icons.com_69899.png"
                  alt="Logo"
                  width="20"
                ></img>
              </th>
              <th scope="col">
                Email
                <img
                  src="https://cdn.icon-icons.com/icons2/906/PNG/512/sort_icon-icons.com_69899.png"
                  alt="Logo"
                  width="20"
                ></img>
              </th>
              <th scope="col">
                Session
                <img
                  src="https://cdn.icon-icons.com/icons2/906/PNG/512/sort_icon-icons.com_69899.png"
                  alt="Logo"
                  width="20"
                ></img>
              </th>
              <th scope="col">
                Session Modality
                <img
                  src="https://cdn.icon-icons.com/icons2/906/PNG/512/sort_icon-icons.com_69899.png"
                  alt="Logo"
                  width="20"
                ></img>
              </th>
              <th scope="col">
                Admission Status
                <img
                  src="https://cdn.icon-icons.com/icons2/906/PNG/512/sort_icon-icons.com_69899.png"
                  alt="Logo"
                  width="20"
                ></img>
              </th>
              <th scope="col">
                Matriculation Status
                <img
                  src="https://cdn.icon-icons.com/icons2/906/PNG/512/sort_icon-icons.com_69899.png"
                  alt="Logo"
                  width="20"
                ></img>
              </th>
              <th scope="col">
                Unity Status
                <img
                  src="https://cdn.icon-icons.com/icons2/906/PNG/512/sort_icon-icons.com_69899.png"
                  alt="Logo"
                  width="20"
                ></img>
              </th>
              <th scope="col">
                Coursera Status
                <img
                  src="https://cdn.icon-icons.com/icons2/906/PNG/512/sort_icon-icons.com_69899.png"
                  alt="Logo"
                  width="20"
                ></img>
              </th>
              <th scope="col">
                Survey Status
                <img
                  src="https://cdn.icon-icons.com/icons2/906/PNG/512/sort_icon-icons.com_69899.png"
                  alt="Logo"
                  width="20"
                ></img>
              </th>
            </tr>
          </thead>
          <tbody>
            { rows.map((row) => (
              <tr key={row.NNumber}>
                <th scope="row">
                  <input
                    type="checkbox"
                    className="row-checkbox"
                    checked={selectedRows.includes(row.NNumber)}
                    onChange={() => handleCheckboxChange(row.NNumber)}
                    disabled={isShowing}
                  />
                </th>
                <td>{row.NNumber}</td>
                <td>{row.Name}</td>
                <td>
                  {isEditing ? (
                    <input
                      type="text"
                      defaultValue={row.Email}
                      onBlur={(e) => accumulateEmailChange(row.NNumber, e.target.value)}
                    />
                  ) : (
                    row.Email
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <select
                      value={row.Session}
                      onChange={(e) =>
                        accumulateStatusChange(row.NNumber, "Session", e.target.value)
                      }
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                  ) : (
                    row.Session
                  )}
                </td>
                <td>{getStatus(row.Session)}</td>
                {StatusNames.map((StatusName, index) => (
                  <td key={index}>
                    {isEditing ? (
                      <select
                        value={row[StatusName]}
                        onChange={(e) =>
                          accumulateStatusChange(row.NNumber, StatusName, e.target.value)
                        }
                        style={{ color: row[StatusName] === "Finished" ? "#31b900" : "#ff0000", fontWeight: '600'}} 
                      >
                        {/* <option value=""></option> */}
                        <option value="Unfinished" style={{color: 'red'}}>Unfinished</option>
                        <option value="Finished">Finished</option>
                       
                      </select>
                    ) : (
                      <div>
                        {IsFinished(row[StatusName]) ? (
                          <div>
                            <div className="Green-glowing-dot"></div>
                            <div className="Green-text">Finished</div>
                            
                          </div>
                        ) : (
                          <div>
                            <div className="Red-glowing-dot"></div>
                            <div className="Red-text">Unfinished</div>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        
        </div> 
        
        <div className="headerContainer">
          <h2 style={{marginTop: '50px', marginLeft: '30px'}}> Recently Deleted</h2>
          {/* Show & Hide button*/}
          <div className="editPositionController" >
            {isShowing ? (
              <button
                className="btn btn-outline-secondary"
                // data-bs-toggle="modal"
                // data-bs-target="#RecoverConfirm"
                data-bs-backdrop="true"
                style={{
                  marginRight: 10,
                  width: 86,
                  height: 40,
                  display: "flex",
                  paddingLeft: 20,
                  alignItems: "center",
                  fontSize: '20px',
                  borderRadius: '20px',
           
                }}
                type="button"
                onClick={handleHideClick}
              >
                Hide
              </button>
            ) : (
              <button
                className="btn btn-outline-secondary"
                style={{
                  marginRight: 10,
                  width: 98,
                  height: 40,
                  display: "flex",
                  paddingLeft: 20,
                  alignItems: "center",
                  fontSize: '20px',
                  borderRadius: '20px',
                }}
                onClick={handleShowClick}
                type="button"
              >
                Show
              </button>
            )}
          </div>
        </div>


        {/* Table for Recently Deleted Rows */}
        {isShowing && (
            <div className="table-responsive" style={{ margin: '30px' }}>
            <table ref={deletedTableRef} className="table table-sm table-hover" style={{marginTop: '15px'}}>
              <thead className="table-light">
                <tr>
                  <th scope="col">
                    <input type="checkbox" id="headCheckbox2" onClick={handleHeaderCheckboxChange}></input>
                  </th>
                  <th scope="col">
                    N Number
                    <img
                      src="https://cdn.icon-icons.com/icons2/906/PNG/512/sort_icon-icons.com_69899.png"
                      alt="Logo"
                      width="20"
                    ></img>
                  </th>
                  <th scope="col">
                    Name
                    <img
                      src="https://cdn.icon-icons.com/icons2/906/PNG/512/sort_icon-icons.com_69899.png"
                      alt="Logo"
                      width="20"
                    ></img>
                  </th>
                  <th scope="col">
                    Email
                    <img
                      src="https://cdn.icon-icons.com/icons2/906/PNG/512/sort_icon-icons.com_69899.png"
                      alt="Logo"
                      width="20"
                    ></img>
                  </th>
                  <th scope="col">
                    Session
                    <img
                      src="https://cdn.icon-icons.com/icons2/906/PNG/512/sort_icon-icons.com_69899.png"
                      alt="Logo"
                      width="20"
                    ></img>
                  </th>
                  <th scope="col">
                    Session Modality
                    <img
                      src="https://cdn.icon-icons.com/icons2/906/PNG/512/sort_icon-icons.com_69899.png"
                      alt="Logo"
                      width="20"
                    ></img>
                  </th>
                  <th scope="col">
                    Admission Status
                    <img
                      src="https://cdn.icon-icons.com/icons2/906/PNG/512/sort_icon-icons.com_69899.png"
                      alt="Logo"
                      width="20"
                    ></img>
                  </th>
                  <th scope="col">
                    Matriculation Status
                    <img
                      src="https://cdn.icon-icons.com/icons2/906/PNG/512/sort_icon-icons.com_69899.png"
                      alt="Logo"
                      width="20"
                    ></img>
                  </th>
                  <th scope="col">
                    Unity Status
                    <img
                      src="https://cdn.icon-icons.com/icons2/906/PNG/512/sort_icon-icons.com_69899.png"
                      alt="Logo"
                      width="20"
                    ></img>
                  </th>
                  <th scope="col">
                    Coursera Status
                    <img
                      src="https://cdn.icon-icons.com/icons2/906/PNG/512/sort_icon-icons.com_69899.png"
                      alt="Logo"
                      width="20"
                    ></img>
                  </th>
                  <th scope="col">
                    Survey Status
                    <img
                      src="https://cdn.icon-icons.com/icons2/906/PNG/512/sort_icon-icons.com_69899.png"
                      alt="Logo"
                      width="20"
                    ></img>
                  </th>
                </tr>
              </thead>
              <tbody>
                { deletedRows.map((row) => (
                  <tr key={row.NNumber}>
                    <td >
                      <input
                        type="checkbox"
                        className="row-checkbox"
                        checked={selectDeletedRows.includes(row.NNumber)}
                        onChange={() => handleCheckboxChange(row.NNumber)}
                      />
                    </td>
                    <td>{row.NNumber}</td>
                    <td>{row.Name}</td>
                    <td>{row.Email}</td>
                    <td>{row.Session}</td>
                    <td>{row.SessionModality}</td>
                    {['AdmissionStatus', 'MatriculationStatus', 'UnityStatus', 'CourseraStatus', 'SurveyStatus'].map(status => (
                      <td key={status}>
                        {row[status] === "Finished" ? (
                          <div>
                            <div className="Green-glowing-dot"></div>
                            <span className="Green-text">Finished</span>
                          </div>
                        ) : (
                          <div>
                            <div className="Red-glowing-dot"></div>
                            <span className="Red-text">Unfinished</span>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}

          {/* Need Help Link */}
          <div className="headerContainer" style={{marginBottom: '30px'}}>
          <h2 style={{marginTop: '50px', marginLeft: '30px'}}> Still Need Help?</h2>
          {/* Help button*/}
          <div className="editPositionController" >
              <button
                className="btn btn-outline-secondary"
                // data-bs-toggle="modal"
                // data-bs-target="#RecoverConfirm"
                data-bs-backdrop="true"
                style={{
                  marginRight: 10,
                  width: 88,
                  height: 40,
                  display: "flex",
                  paddingLeft: 20,
                  alignItems: "center",
                  fontSize: '20px',
                  borderRadius: '20px',
           
                }}
                type="button"
                onClick={handleHelpClick}
              >
                Help
              </button>
          </div>
        </div>
          
    </div>

</>

);
}

export default Table;
