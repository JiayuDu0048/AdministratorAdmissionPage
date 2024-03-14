import React, { useEffect, useRef, useState } from "react";
import $ from "jquery";
import "datatables.net";
import "datatables.net-bs5";
//import "/Users/jiayudu/AdmissionPage/node_modules/bootstrap/dist/js/bootstrap.bundle.js";
import 'bootstrap/dist/js/bootstrap.bundle'; //Change the above line to relative path-> more compatible
import "@popperjs/core";
import CsvUpload from "./CSVupload";

function Table() {
  const [rows, setRows] = useState([]);

  const startingIndex = 5;
  // const StatusNames = Object.keys(rows[0]).slice(startingIndex);
  const StatusNames = rows[0] ? Object.keys(rows[0]).slice(startingIndex) : [];

  const handleEmailUpdate = (NNumber, newEmail) => {
    setRows(currentRows =>
      currentRows.map(row => 
        row.NNumber === NNumber ? { ...row, Email: newEmail } : row
      )
    );
  };
 
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
    const $dataTable = $(tableRef.current);

    if (!$.fn.dataTable.isDataTable($dataTable)) {
      // Initialize DataTables only if it hasn't been initialized
      $dataTable.DataTable({
        responsive: true,
        autoWidth: false,
        stateSave: true, // Enable state saving to remember the table's state
        // Add other DataTables options here
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



  

  //multiple choice and delete function
  const [selectedRows, setSelectedRows] = useState([]);
  function handleCheckboxChange(rowId) {
    if (selectedRows.includes(rowId)) {
      setSelectedRows(selectedRows.filter((id) => id !== rowId));
    } else {
      setSelectedRows([...selectedRows, rowId]);
    }
  }
  function deleteSelectedRows() {
    const updatedRows = rows.filter((row) => !selectedRows.includes(row.id));
    setSelectedRows([]);
    setRows(updatedRows);
  }

  //Edit Mode function
  const [isEditing, setIsEditing] = useState(false);
  function handleEditClick() {
    setIsEditing(true);
  }
  function handleSaveClick() {
    setIsEditing(false);
    // 添加保存编辑内容的代码
  }

  const handleStatusChange = (NNumber, StatusName, newStatus) => { 
    const updatedData = rows.map((row) => {
      if (row.NNumber === NNumber) {
        return { ...row, [StatusName]: newStatus };
      }
      return row;
    });
    setRows(updatedData);
  }; 
  

  //session change function
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

  //status detect
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
        {/* Upload function */}
        <CsvUpload onCsvData={handleCsvData}> </CsvUpload>

        {/* Edit Mode & Save button*/}
        <div className="editPositionController" style={{ marginBottom: '70px', marginLeft: '-80px', marginTop: '-50px'}}>
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
                  Discard
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
       <div key={rows.length} className="table-responsive"> 
         {/* React feature: force re-render the table everytime the key is changed */}
        <table ref={tableRef} className="table table-sm table-hover">
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
                    onClick={() => handleCheckboxChange(row.id)}
                  />
                </th>
                <td>{row.NNumber}</td>
                <td>{row.Name}</td>
                <td>
                  {isEditing ? (
                    <input
                      type="text"
                      defaultValue={row.Email}
                      onBlur={(e) => handleEmailUpdate(row.NNumber, e.target.value)}
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
                        handleStatusChange(row.NNumber, "Session", e.target.value)
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
                          handleStatusChange(row.NNumber, StatusName, e.target.value)
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
