import React, { useEffect, useRef, useState } from "react";
import $ from "jquery";
import "datatables.net";
import "datatables.net-bs5";
import "/Users/jiayudu/AdmissionPage/node_modules/bootstrap/dist/js/bootstrap.bundle.js";
import "@popperjs/core";

function Table() {
  //Data
  const [rows, setRows] = useState([
    {
      id: 1,
      Name: "John",
      NNumber: "12345678",
      Email: "john2342@gmail.com",
      session: "1",
      sessionModality: "In-person",
    },
    {
      id: 2,
      Name: "Jane",
      NNumber: "86754321",
      Email: "jane897@gmail.com",
      session: "2",
      sessionModality: "In-person",
    },
    {
      id: 3,
      Name: "Bob",
      NNumber: "09754678",
      Email: "Bob9089@gmail.com",
      session: "3",
      sessionModality: "Online",
    },
  ]);

  //Load the table using datatable and reload when the rows changed
  const tableRef = useRef(null);
  useEffect(() => {
    $(tableRef.current).DataTable();
  }, [rows]);

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

  //email change function
  const handleEmailChange = (id, newEmail) => {
    const updatedData = rows.map((row) => {
      if (row.id === id) {
        return { ...row, Email: newEmail };
      }
      return row;
    });
    setRows(updatedData);
  };

  //session change function
  const handleStatusChange = (id, newStatus) => {
    const updatedData = rows.map((row) => {
      if (row.id === id) {
        return { ...row, session: newStatus };
      }
      return row;
    });
    setRows(updatedData);
  };
  const getStatus = (session) => {
    if (session === "1") {
      return "In-person";
    } else if (session === "2") {
      return "In-person";
    } else if (session === "3") {
      return "Online";
    } else {
      return "Unknown";
    }
  };

  return (
    <>
      <div className="marginGlobal">
        {/* Upload function */}
        <div className="styleUpload">
          <button type="button" className="btn btn-primary btn-lg">
            Upload
          </button>
          <h2 className="textUpload">/ </h2>
          <h3 className="textUpload">Drag & Drop .csv file here</h3>
        </div>

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
          class="modal fade"
          id="SaveConfirm"
          tabindex="-1"
          aria-labelledby="SaveConfirmLabel"
          aria-hidden="true"
        >
          <div class="modal-dialog">
            <div class="modal-content ">
              <div class="modal-header">
                <h1 class="modal-title fs-5" id="SaveConfirmLabel">
                  Confirmation
                </h1>
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div class="modal-body">
                Are you sure you want to make these changes?
              </div>
              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Discard
                </button>
                <button
                  onClick={handleSaveClick}
                  type="button"
                  class="btn btn-primary"
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
          tabindex="-1"
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
              <th scope="col">Admission Status</th>
              <th scope="col">Matriculation Status</th>
              <th scope="col">Unity Status</th>
              <th scope="col">Coursera Status</th>
              <th scope="col">Survey Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
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
                        handleEmailChange(row.id, e.target.value)
                      }
                    />
                  ) : (
                    row.Email
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <select
                      value={row.session}
                      onChange={(e) =>
                        handleStatusChange(row.id, e.target.value)
                      }
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                  ) : (
                    row.session
                  )}
                </td>
                <td>{getStatus(row.session)}</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Table;
