import React, { useEffect, useRef, useState } from "react";
import $ from "jquery";
import "datatables.net";
import "datatables.net-bs5";
//import "/Users/jiayudu/AdmissionPage/node_modules/bootstrap/dist/js/bootstrap.bundle.js";
import 'bootstrap/dist/js/bootstrap.bundle'; //Change the above line to relative path-> more compatible
import "@popperjs/core";
import CsvUpload from "./CSVupload";

function Table() {
  //Sample Data
  const [csvData, setCsvData] = useState([]);
  const [rows, setRows] = useState([]);

  const startingIndex = 5;
  // const StatusNames = Object.keys(rows[0]).slice(startingIndex);
  const StatusNames = rows[0] ? Object.keys(rows[0]).slice(startingIndex) : [];
  console.log(StatusNames)


  //Callback function to receive csv data from CsvUpload
  const handleCsvData = (data) => {
    setCsvData(data);
    console.log(data);
    // Ensure data is an array before setting rows
    if (Array.isArray(data)) {
      setRows(data);
    } else {
      console.error("Received CSV data is not an array:", data);
    }
  };

  
  //Load the table using datatable and reload when the rows changed
  const tableRef = useRef(null);
  useEffect(() => {
    // Only proceed if the table is ready and the DOM is fully updated
    if (rows.length > 0) {
      const $dataTable = $(tableRef.current);
  
      // Check if the DataTable instance already exists
      if ($.fn.dataTable.isDataTable($dataTable)) {
        // If it exists, destroy it to prevent reinitialization errors
        $dataTable.DataTable().destroy();
      }
  
      // Reinitialize DataTables on the next event loop tick to ensure the DOM is updated
      setTimeout(() => {
        $dataTable.DataTable({
          // Configuration options here
        });
      }, 0);
    }
  
    // Cleanup function to destroy the DataTable instance
    return () => {
      if ($.fn.dataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }
    };
  }, [rows]); // Dependency on 'rows' to re-run when data changes
  
  

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

  const handleStatusChange = (id, StatusName, newStatus) => {
    const updatedData = rows.map((row) => {
      if (row.id === id) {
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
        <div className="editPositionController">
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
              <tr key={row.id}>
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
                      value={row.Email}
                      onChange={(e) =>
                        handleStatusChange(row.id, "Email", e.target.value)
                      }
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
                        handleStatusChange(row.id, "session", e.target.value)
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
                          handleStatusChange(row.id, StatusName, e.target.value)
                        }
                      >
                        <option value="Finished">Finished</option>
                        <option value="Unfinished">Unfinished</option>
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
    </>
  );
}

export default Table;
