import React, { useEffect, useRef, useState } from "react";
import $ from "jquery";
import "datatables.net";
import "datatables.net-bs5";
//import "/Users/jiayudu/AdmissionPage/node_modules/bootstrap/dist/js/bootstrap.bundle.js";
import 'bootstrap/dist/js/bootstrap.bundle'; //Change the above line to relative path-> more compatible
import "@popperjs/core";
import CsvUpload from "./CSVupload";
import axiosProvider from "../utils/axiosConfig";

function Table() {
  const startingIndex = 5;
  // const StatusNames = Object.keys(rows[0]).slice(startingIndex);
  const [rows, setRows] = useState([]);
  const StatusNames = rows[0] ? Object.keys(rows[0]).slice(startingIndex) : [];
  const [pendingChanges, setPendingChanges] = useState({ emailUpdates: {}, statusUpdates: {} });

  //Save pending changes function
  const accumulateEmailChange = (NNumber, newEmail) => {
    setRows(currentRows =>
      currentRows.map(row =>
        row.NNumber === NNumber ? { ...row, Email: newEmail} : row));

    setPendingChanges(prev => ({
      ...prev,
      emailUpdates: { ...prev.emailUpdates, [NNumber]: newEmail }
    }));
  };

  const accumulateStatusChange = (NNumber, StatusName, newStatus) => {
    setRows(currentRows =>
      currentRows.map(row =>
        row.NNumber === NNumber ? { ...row, [StatusName]: newStatus } : row
      ));

    setPendingChanges(prev => ({
      ...prev,
      statusUpdates: { ...prev.statusUpdates, [NNumber]: { ...prev.statusUpdates[NNumber], [StatusName]: newStatus } }
    }));
  };

  //Edit Mode function
  const [isEditing, setIsEditing] = useState(false);
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
      const allSuccess = results.every(result => result.status >= 200 && result.status < 300);
      console.log(results);
      
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
                    existingMap.set(row.NNumber, row);
                }
            }); 
            return Array.from(existingMap.values());
        });
    } else {
        console.error("Received CSV data is not an array:", newData);
    }
  };

  
  //Load the table using datatable and reload when the rows changed
  const tableRef = useRef(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosProvider.get('/api/students', {
          withCredentials: true
        });
        const filteredData = response.data
          .filter(row => !row.deleted) // Exclude deleted records
          .map(({ deleted, deletedAt, __v, _id, ...keepAttrs }) => ({
            ...keepAttrs, 
            AdmissionStatus: keepAttrs.AdmissionStatus ? 'Finished' : 'Unfinished',
            MatriculationStatus: keepAttrs.MatriculationStatus ? 'Finished' : 'Unfinished',
            UnityStatus: keepAttrs.UnityStatus ? 'Finished' : 'Unfinished',
            CourseraStatus: keepAttrs.CourseraStatus ? 'Finished' : 'Unfinished',
            SurveyStatus: keepAttrs.SurveyStatus ? 'Finished' : 'Unfinished',
          }));
        
        setRows(filteredData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, []);
  

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
      // DataTables is already initialized, so we manually manage updates
      // to avoid destroying and reinitializing it.
      let dataTableInstance = $dataTable.DataTable();

      // Temporarily disable state saving to avoid saving state during data update
      dataTableInstance.state.clear();

      // Perform necessary data updates here. 
      dataTableInstance.rows.add(rows).draw();

      // Re-enable state saving after updates: this must work together with stateSave: true
      dataTableInstance.state.save();
    }

    // Cleanup function to destroy the DataTable instance on component unmount (Don't delete this!)
    return () => {
      if ($.fn.dataTable.isDataTable($dataTable)) {
        $dataTable.DataTable().destroy();
      }
    };
  }, [rows]); // Only re-run when `rows` changes

  

  //Multiple choice and delete function
  const [selectedRows, setSelectedRows] = useState([]);
  function handleCheckboxChange(rowNNumber) {
    if (selectedRows.includes(rowNNumber)) {
      setSelectedRows(selectedRows.filter((NNumber) => NNumber !== rowNNumber));
    } else {
      setSelectedRows([...selectedRows, rowNNumber]);
    }
  }


  const deleteSelectedRows =  async () => {
    const updatedRows = rows.filter((row) => !selectedRows.includes(row.NNumber));
    setRows(updatedRows);
    
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
        } else {
            console.error("Failed to delete rows");
        }
    }catch(error){
      console.error("Error deleting rows:", error);
    }  
    setSelectedRows([]);
  }

 
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
        <h2 style={{marginLeft: '30px'}}>Drop .csv files here to upload student data: </h2>
        <ul style={{listStyleType: 'disc', margin: '20px', fontSize: '18px'}}>
                <li> Drop only one csv file at one time. </li>
                <li>Please make sure that this file contains the following columns: N Number, Students' Names, Email, and Session.</li>
                <li>You can drop files that contain previous student records. The system will only add new students into the database. </li>
        </ul>
        {/* Upload function */}
        <CsvUpload onCsvData={handleCsvData}> </CsvUpload>

        {/* Edit Mode & Save button*/}
        <div className="editPositionController" style={{ marginBottom: '70px', marginLeft: '-70px', marginTop: '-50px'}}>
          {isEditing ? (
            <button
              className="btn btn-secondary"
              data-bs-toggle="modal"
              data-bs-target="#SaveConfirm"
              data-bs-backdrop="true"
              style={{
                marginRight: 10,
                width: 100,
                height: 30,
                display: "flex",
                paddingLeft: 32,
                alignItems: "center",
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
                width: 100,
                height: 30,
                display: "flex",
                paddingLeft: 32,
                alignItems: "center",
              }}
              onClick={handleEditClick}
              type="button"
            >
              Edit
            </button>
          )}
        </div>
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

        {/* Delete & Confirm function */}
        <div className="selected-info">
          <p>{selectedRows.length} rows selected</p>
          <button
            className="btn btn-sm btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#exampleModal"
            data-bs-backdrop="false"
          >
            Delete
          </button>
        </div>
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

        {/* Table */}
       <div key={rows.length} className="table-responsive" style={{margin: '21px'}}> 
         {/* React feature: force re-render the table everytime the key is changed */}
        <table ref={tableRef} className="table table-sm table-hover" style={{marginTop: '15px'}}>
          <thead className="table-light">
            <tr>
              <th scope="col">
                <input type="checkbox" id="headCheckbox"></input>
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
                    onClick={() => handleCheckboxChange(row.NNumber)}
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
                      >
                        {/* <option value=""></option> */}
                        <option value="Unfinished">Unfinished</option>
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
      </div>
    </>
  );
}

export default Table;
