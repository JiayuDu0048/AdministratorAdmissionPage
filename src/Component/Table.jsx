import React, { useEffect, useRef } from "react";
import $ from "jquery";
import "datatables.net";
import "datatables.net-bs5";
import "datatables.net-select";

function Table() {
  const tableRef = useRef(null);

  useEffect(() => {
    $(tableRef.current).DataTable();
  }, []);

  // checkbox filter
  // const table = $(tableRef.current).DataTable({ id: "example" });

  // $('#example thead input[type="checkbox"]').on("change", function () {
  //   var columnIndex = $(this).closest("th").index();
  //   var checked = $(this).prop("checked");
  //   table
  //     .column(columnIndex)
  //     .nodes()
  //     .to$()
  //     .find('input[type="checkbox"]')
  //     .prop("checked", checked);
  //   table
  //     .column(columnIndex)
  //     .search(checked ? "true" : "")
  //     .draw();
  // });

  return (
    <>
      <table ref={tableRef} className="table table-hover table-bordered">
        <thead>
          <tr class="custom-head">
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
              <input type="checkbox" id="filterbotton"></input>Admission
              Finished
            </th>
            <th scope="col">
              <input type="checkbox"></input>Matriculation Finished
            </th>
            <th scope="col">
              <input type="checkbox"></input>Unity run
            </th>
            <th scope="col">
              <input type="checkbox"></input>Coursera
            </th>
            <th scope="col">
              <input type="checkbox"></input>oogle form
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">1234232</th>
            <td>Mark</td>
            <td>1</td>
            <td>Online</td>
            <td>
              <input type="checkbox"></input>
            </td>
            <td>
              <input type="checkbox"></input>
            </td>
            <td>
              <input type="checkbox" checked disabled></input>
            </td>
            <td>
              <input type="checkbox"></input>
            </td>
            <td>
              <input type="checkbox"></input>
            </td>
          </tr>
          <tr>
            <th scope="row">2234232</th>
            <td>Jacob</td>
            <td>2</td>
            <td>In-person</td>
            <td>
              <input type="checkbox"></input>
            </td>
            <td>
              <input type="checkbox"></input>
            </td>
            <td>
              <input type="checkbox" checked disabled></input>
            </td>
            <td>
              <input type="checkbox"></input>
            </td>
            <td>
              <input type="checkbox"></input>
            </td>
          </tr>
          <tr>
            <th scope="row">32342342</th>
            <td>Larry</td>
            <td>3</td>
            <td>In-person</td>
            <td>
              <input type="checkbox"></input>
            </td>
            <td>
              <input type="checkbox"></input>
            </td>
            <td>
              <input type="checkbox" disabled></input>
            </td>
            <td>
              <input type="checkbox"></input>
            </td>
            <td>
              <input type="checkbox"></input>
            </td>
          </tr>
          <tr>
            <th scope="row">5332332</th>
            <td>Jiayu</td>
            <td>2</td>
            <td>In-person</td>
            <td>
              <input type="checkbox"></input>
            </td>
            <td>
              <input type="checkbox"></input>
            </td>
            <td>
              <input type="checkbox" disabled></input>
            </td>
            <td>
              <input type="checkbox"></input>
            </td>
            <td>
              <input type="checkbox"></input>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

export default Table;
