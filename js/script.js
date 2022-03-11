//LOGIN START
$("#submit").on("click", function (e) {
  e.preventDefault();

  let username = $("#username").val();
  let password = $("#password").val();

  if (username === "admin" && password === "company") {
    $("#incorrectLogin").modal("hide");
    login();
  } else {
    $("#incorrectLogin").modal("show");
  }
});

function login() {
  location.replace("index.html");
}

function logout() {
  location.replace("login.html");
}

$(".logout").on("click", function (e) {
  e.preventDefault();
  logout();
});

$("#smallLogo").on("click", function (e) {
  e.preventDefault();
  logout();
});
//LOGIN END

// Global Variables START
var currentLocations = [];
var currentDepartments = [];

let firstNameToggle = true;
let lastNameToggle = true;
let emailToggle = true;
let jobTitleToggle = true;
let departmentToggle = true;
let locationToggle = true;
let depAndUsers = {};

// Global Variables END

// Main AJAX & jQuery Code
$(function () {
  getAllUsers();

  $(".tableRow").click(function () {
    var currentEmployee;

    currentEmployee = this.id;
    //console.log(currentEmployee);

    $("#insertEmployeeModal").modal("show");
    //use employee id to get information
    $.ajax({
      type: "GET",
      url: "php/getPersonnelByID.php",
      data: {
        id: currentEmployee,
      },
      dataType: "json",
      async: false,
      success: function (results) {
        const data = results["data"];

        const returnedEmployee = data.personnel["0"];

        $("#employeeModalLabel").html(
          `${returnedEmployee.firstName} ${returnedEmployee.lastName}`
        );
        $("#employeeId").val(returnedEmployee.id);
        $("#employeeFirstName").val(returnedEmployee.firstName);
        $("#employeeLastName").val(returnedEmployee.lastName);
        $("#employeeEmail").val(returnedEmployee.email);
        $("#employeeJob").val(returnedEmployee.jobTitle);
        $("#employeeDepartment").val(returnedEmployee.department);
        $("#employeeLocation").val(returnedEmployee.location);
        $("#edit").attr("userID", returnedEmployee.id);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(errorThrown);
      },
    });

    // Delete Employee start
    $("#delete").click(function () {
      $("#userDeleteModal").modal("show");
      $("#deleteConfirm").html(`${$("#employeeModalLabel").html()}<br>`);

      $(`#delUserConfirm`).on("click", (event) => {
        event.preventDefault();
        var userID = $("#employeeId").val();

        $.ajax({
          type: "POST",
          url: "php/deleteUserByID.php",
          data: {
            id: userID,
          },
          dataType: "json",
          async: false,
          success: function (results) {
            location.reload();
          },

          error: function (jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
          },
        });
      });
    });
  });
  // Delete Employee end

  // Edit employee start
  $("#edit").click(function () {
    $("#userEditModal").modal("show");
    $(".modal-backdrop").show();

    $.ajax({
      type: "GET",
      url: "php/getPersonnelByID.php",
      data: {
        id: $("#edit").attr("userID"),
      },
      dataType: "json",
      async: false,
      success: function (results) {
        const data = results["data"];

        const returnedEmployee = data.personnel["0"];

        $("#edit_user_firstName").val(returnedEmployee.firstName);
        $("#edit_user_lastName").val(returnedEmployee.lastName);
        $("#edit_user_email").val(returnedEmployee.email);
        $("#edit_user_jobTitle").val(returnedEmployee.jobTitle);
        $("#edit_user_department").html(returnedEmployee.department);
        $("#edit_user_location").html(returnedEmployee.location);
        $("#editUserConfirm").attr("userID", returnedEmployee.id);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(errorThrown);
      },
    });

    getDepartmentsByUser();

    let departmentSelection = "";
    for (i = 0; i < currentDepartments.length; i++) {
      if (
        currentDepartments[i].department == $("#edit_user_department").html()
      ) {
        departmentSelection += `<option value="${currentDepartments[i].id}" selected="selected">${currentDepartments[i].department}</option>`;
      } else {
        departmentSelection += `<option value="${currentDepartments[i].id}">${currentDepartments[i].department}</option>`;
      }
    }

    $("#edit_user_department").html(departmentSelection);

    $("#edit_user_department").change(function () {
      let locationSelectionHTML = "";
      let locationID = document.getElementById("edit_user_department").value;

      for (let i = 0; i < currentDepartments.length; i++) {
        if (currentDepartments[i]["id"] == locationID) {
          locationSelectionHTML = `${currentDepartments[i]["location"]}`;
        }
      }

      $("#edit_user_location").html(locationSelectionHTML);
    });
  });
  // Edit employee end

  // Confirm Edit User -> PHP Routine
  $("#editUserForm").submit(function (e) {
    e.preventDefault();
    e.stopPropagation();

    $.ajax({
      type: "POST",
      url: "php/updateUser.php",
      data: {
        firstName: $("#edit_user_firstName").val(),
        lastName: $("#edit_user_lastName").val(),
        email: $("#edit_user_email").val(),
        jobTitle: $("#edit_user_jobTitle").val(),
        departmentID: $("#edit_user_department").val(),
        id: $("#editUserConfirm").attr("userID"),
      },
      dataType: "json",
      async: false,
      success: function (results) {
        location.reload();
      },

      error: function (jqXHR, textStatus, errorThrown) {
        console.log(errorThrown);
      },
    });
  });

  // Add Employee Modal
  $(`#addEmployee`).on("click", (event) => {
    $("#addEmployeeModal").modal("show");
    getDepartmentsByUser();

    let departmentSelection = ``;

    for (i = 0; i < currentDepartments.length; i++) {
      departmentSelection += `<option value="${currentDepartments[i].id}">${currentDepartments[i].department}</option>`;
    }

    $("#add_user_department").html(departmentSelection);

    function updateLocation() {
      let locationSelectionHTML = "";
      let locationID = document.getElementById("add_user_department").value;

      for (let i = 0; i < currentDepartments.length; i++) {
        if (currentDepartments[i]["id"] == locationID) {
          locationSelectionHTML = `${currentDepartments[i]["location"]}`;
        }
      }

      $("#add_user_location").html(locationSelectionHTML);
    }

    updateLocation();

    $("#add_user_department").change(function () {
      updateLocation();
    });
  });

  // Confirm Add Employee
  $("#newUserForm").submit(function (e) {
    e.preventDefault();
    e.stopPropagation();

    $.ajax({
      type: "POST",
      url: "php/insertUser.php",
      data: {
        firstName: $("#add_user_firstName").val(),
        lastName: $("#add_user_lastName").val(),
        email: $("#add_user_email").val(),
        jobTitle: $("#add_user_jobTitle").val(),
        departmentID: $("#add_user_department").val(),
      },
      dataType: "json",
      async: false,
      success: function (results) {
        location.reload();
      },

      error: function (jqXHR, textStatus, errorThrown) {
        console.log(errorThrown);
      },
    });
  });

  // Department Modal Behaviour
  $(`#departments`).on("click", (event) => {
    $(".modal-backdrop").show(); // Show the grey overlay.
    $("#departmentsModal").modal("show");
    generateDepartmentList();

    $("#addDepartment").click(function () {
      $("#addDepartmentModal").modal("show");
      document.getElementById("newDepName").value = "";
      getLocations();

      let locationSelection = "";
      for (i = 0; i < currentLocations.length; i++) {
        locationSelection += `<option value="${currentLocations[i].id}">${currentLocations[i].location}</option>`;
      }

      $("#newDepLocation").html(locationSelection);
    });

    // Edit Department
    $(".depTableRow").click(function () {
      $(".modal-backdrop").show(); // Show the grey overlay.
      $("#departmentEditModal").modal("show");

      $("#editDepName").val(`${this.title}`);
      $("#editDepForm").attr("depID", `${this.attributes.departmentID.value}`);
      //console.log(this);
      var depID = this.id;
      var locID = this.attributes.location.value;

      if (this.attributes.users.value == 0) {
        $("#deleteDepBtn").show();
        $("#departmentDelete").attr(
          "departmentName",
          this.attributes.title.value
        );
        $("#departmentDelete").attr(
          "departmentID",
          this.attributes.departmentID.value
        );
      } else {
        $("#deleteDepBtn").hide();
      }

      getLocations();
      let locationSelection = "";
      for (i = 0; i < currentLocations.length; i++) {
        if (currentLocations[i].id == locID) {
          locationSelection += `<option value="${currentLocations[i].id}" selected="selected">${currentLocations[i].location}</option>`;
        } else {
          locationSelection += `<option value="${currentLocations[i].id}">${currentLocations[i].location}</option>`;
        }
      }

      $("#editDepLocation").html(locationSelection);
    });

    // Confirm Edit Department -> PHP Routine
    $("#editDepForm").submit(function (e) {
      e.preventDefault();
      e.stopPropagation();

      $.ajax({
        type: "POST",
        url: "php/updateDepartment.php",
        data: {
          name: $("#editDepName").val(),
          locationID: $("#editDepLocation").val(),
          departmentID: this.attributes.depID.value,
        },
        dataType: "json",
        async: false,
        success: function (results) {
          location.reload();
        },

        error: function (jqXHR, textStatus, errorThrown) {
          console.log(errorThrown);
        },
      });
    });

    // Delete Department
    $("#departmentDelete").click(function () {
      $(".modal-backdrop").show();
      $("#departmentDeleteModal").modal("show");

      var depID = this.attributes.departmentID.value;
      console.log(depID);

      $("#delDepConfirm").click(function () {
        var depIDInt = parseInt(depID);

        $.ajax({
          type: "POST",
          url: "php/deleteDepartmentByID.php",
          data: {
            id: depIDInt,
          },
          dataType: "json",
          async: false,
          success: function (results) {
            //reloads current document
            location.reload();
          },

          error: function (jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
          },
        });
      });
    });
    getDepartmentsByUser();
    //console.log(depAndUsers);
    //if the value = 0, then you can delete department, else delete employees first
    for (const [key, value] of Object.entries(depAndUsers)) {
      if (`${value}` == 0) {
        //allow user to delete this department
        $("#delDepConfirm").on("click", function () {
          $("#departmentDeleteModal").modal("show");
        });
      } else if (`${value}` > 0) {
        //User cannot delete department
        $("#delDepConfirm").on("click", function () {
          $("#departmentDeleteModalError").modal("show");
        });
      }
    }
  });

  // Add Department -> PHP Routine
  $("#addDepForm").submit(function (e) {
    e.preventDefault();
    e.stopPropagation();

    $.ajax({
      type: "POST",
      url: "php/insertDepartment.php",
      data: {
        name: $("#newDepName").val(),
        locationID: $("#newDepLocation").val(),
      },
      dataType: "json",
      async: false,
      success: function (results) {
        location.reload();
      },

      error: function (jqXHR, textStatus, errorThrown) {
        console.log(errorThrown);
      },
    });
  });

  // --------------------------------------------------------- Locations ---------------------------------------------------------

  // Location Modal Behaviour
  $(`#locations`).on("click", (event) => {
    $("#locationsModal").modal("show");

    // Generate the html table with locations list
    $.ajax({
      type: "GET",
      url: "php/getLocations.php",
      data: {},
      dataType: "json",
      async: false,
      success: function (results) {
        let data = results["data"];
        let locArray = [];
        let loc_html = ``;

        for (let i = 0; i < data.length; i++) {
          locArray.push(data[i]);
        }

        for (let i = 0; i < locArray.length; i++) {
          loc_html += `<tr id="${locArray[i].id}" class=" locationEdit locTableRow" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#locationEditModal" locationName="${locArray[i].location}" locationID="${locArray[i].id}" departments="${locArray[i].departments}"><td scope="row" class="locationHeader">${locArray[i].location}</td></tr>`;
        }

        $("#locationsList").html(loc_html);
      },

      error: function (jqXHR, textStatus, errorThrown) {
        console.log(errorThrown);
      },
    });

    // Edit Location Modal
    $(".locationEdit").click(function () {
      $(".modal-backdrop").show();
      $("#locationEditModal").modal("show");

      $("#edit_location_name").val(this.attributes.locationName.value);
      $("#edit_location_name").attr("locID", this.attributes.locationID.value);

      if (this.attributes.departments.value == 0) {
        $("#deleteLocBtn").show();
        $("#locationDelete").attr(
          "locationName",
          this.attributes.locationName.value
        );
        $("#locationDelete").attr(
          "locationID",
          this.attributes.locationID.value
        );
      } else {
        $("#deleteLocBtn").hide();
      }
    });

    // Delete Location -> PHP Routine
    $("#locationDelete").click(function () {
      $("#delLocName").html(`${this["attributes"]["locationName"]["value"]}`);
      $("#locationDeleteModal").modal("show");

      var locID = this.attributes.locationID.value;

      $("#delLocForm").submit(function (e) {
        e.preventDefault();
        e.stopPropagation();

        $("#locationDeleteModal").modal("hide");
        $("#locationEditModal").modal("hide");
        $("#locationsModal").modal("hide");

        $.ajax({
          type: "POST",
          url: "php/deleteLocationByID.php",
          data: {
            locationID: locID,
          },
          dataType: "json",
          async: false,
          success: function (results) {},

          error: function (jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
          },
        });
      });
    });
  });

  // Edit Location -> PHP Routine
  $("#editLocForm").submit(function (e) {
    e.preventDefault();
    e.stopPropagation();

    $.ajax({
      type: "POST",
      url: "php/updateLocation.php",
      data: {
        name: $("#edit_location_name").val(),
        locationID: $("#edit_location_name").attr("locID"),
      },
      dataType: "json",
      async: false,
      success: function (results) {
        location.reload();
      },

      error: function (jqXHR, textStatus, errorThrown) {
        console.log(errorThrown);
      },
    });
  });

  // Add Location - Modal
  $("#addLocation").click(function () {
    $(".modal-backdrop").show();
    $("#addLocationModal").modal("show");
    $("#newLocName").val("");
  });

  // Add Location -> PHP Routine
  $("#addLocForm").submit(function (e) {
    e.preventDefault();
    e.stopPropagation();

    $.ajax({
      type: "POST",
      url: "php/insertLocation.php",
      data: {
        name: $("#newLocName").val(),
      },
      dataType: "json",
      async: false,
      success: function (results) {
        location.reload();
      },

      error: function (jqXHR, textStatus, errorThrown) {
        console.log(errorThrown);
      },
    });
  });
  // Search Functionality
  $("#search").click(function () {
    $("#resetBtn").attr("style", "visibility: visible");
    var option = $("#searchSelect").val();

    if (option == "firstName") {
      $.ajax({
        type: "GET",
        url: "php/firstNameSearch.php",
        data: {
          search: "%" + document.getElementById("searchField").value + "%",
        },
        dataType: "json",
        async: false,
        success: function (results) {
          generateSearchResultsUsers(results);
        },

        error: function (jqXHR, textStatus, errorThrown) {
          console.log(errorThrown);
        },
      });
    } else if (option == "lastName") {
      $.ajax({
        type: "GET",
        url: "php/lastNameSearch.php",
        data: {
          search: "%" + document.getElementById("searchField").value + "%",
        },
        dataType: "json",
        async: false,
        success: function (results) {
          generateSearchResultsUsers(results);
        },

        error: function (jqXHR, textStatus, errorThrown) {
          console.log(errorThrown);
        },
      });
    } else if (option == "email") {
      $.ajax({
        type: "GET",
        url: "php/emailSearch.php",
        data: {
          search: "%" + document.getElementById("searchField").value + "%",
        },
        dataType: "json",
        async: false,
        success: function (results) {
          generateSearchResultsUsers(results);
        },

        error: function (jqXHR, textStatus, errorThrown) {
          console.log(errorThrown);
        },
      });
    } else if (option == "jobTitle") {
      $.ajax({
        type: "GET",
        url: "php/jobSearch.php",
        data: {
          search: "%" + document.getElementById("searchField").value + "%",
        },
        dataType: "json",
        async: false,
        success: function (results) {
          generateSearchResultsUsers(results);
        },

        error: function (jqXHR, textStatus, errorThrown) {
          console.log(errorThrown);
        },
      });
    } else if (option == "department") {
      $.ajax({
        type: "GET",
        url: "php/departmentSearch.php",
        data: {
          search: "%" + document.getElementById("searchField").value + "%",
        },
        dataType: "json",
        async: false,
        success: function (results) {
          generateSearchResultsUsers(results);
        },

        error: function (jqXHR, textStatus, errorThrown) {
          console.log(errorThrown);
        },
      });
    } else if (option == "location") {
      $.ajax({
        type: "GET",
        url: "php/locationSearch.php",
        data: {
          search: "%" + document.getElementById("searchField").value + "%",
        },
        dataType: "json",
        async: false,
        success: function (results) {
          generateSearchResultsUsers(results);
        },

        error: function (jqXHR, textStatus, errorThrown) {
          console.log(errorThrown);
        },
      });
    }
  });

  // Reset button functionalit
  $("#resetBtn").on("click", () => {
    $("#resetBtn").attr("style", "visibility: hidden");
    $("#searchField").val("");
    getAllUsers();
  });

  // Dynamic behaviour for searchBar
  $(window).on("resize", function () {
    var win = $(this);
    if (win.width() < 1250) {
      $("#searchBar").removeClass("col-6");
      $("#searchBar").addClass("col-10");
    }
  });
});

function generateSearchResultsUsers(results) {
  let searchData = results["data"];
  let list = searchData["personnel"];

  var search_html_table = "";

  // Update Main HTML Table
  for (i = 0; i < list.length; i++) {
    search_html_table += `<tr class="tableRow" id="${list[i].id}"><td scope="row" class="tableIcon"><img src="images/eye.png" alt="eye icon" class="eyeIcon"></i></td><td scope="row">${list[i].firstName}</td><td scope="row">${list[i].lastName}</td><td scope="row" class="hider1">${list[i].email}</td><td scope="row" class="hider1">${list[i].jobTitle}</td><td scope="row" class="hider2">${list[i].department}</td><td scope="row" class="hider2">${list[i].location}</td></tr>`;
  }

  //$('#mainTable').html(`${search_html_table}`);
  $("#sqlTable").find("tbody").html(`${search_html_table}`);
}

function getLocations() {
  $.ajax({
    type: "GET",
    url: "php/getLocations.php",
    data: {},
    dataType: "json",
    async: false,
    success: function (results) {
      currentLocations = [];
      let data = results["data"];

      for (let i = 0; i < data.length; i++) {
        currentLocations.push(data[i]);
      }
    },

    error: function (jqXHR, textStatus, errorThrown) {
      console.log(errorThrown);
    },
  });
}

function getDepartmentsByUser() {
  $.ajax({
    type: "GET",
    url: "php/getDepartmentsByUser.php",
    data: {},
    dataType: "json",
    async: false,
    success: function (results) {
      currentDepartments = [];
      let data = results["data"];
      //console.log(data);
      for (let i = 0; i < data.length; i++) {
        currentDepartments.push(data[i]);
        depAndUsers[data[i].department] = data[i].users;
      }
    },

    error: function (jqXHR, textStatus, errorThrown) {
      console.log(errorThrown);
    },
  });
}

function generateDepartmentList() {
  // Generate the html table with department list
  $.ajax({
    type: "GET",
    url: "php/getDepartmentsByUser.php",
    data: {},
    dataType: "json",
    async: false,
    success: function (results) {
      let data = results["data"];
      let depArray = [];
      let dep_html = ``;

      for (let i = 0; i < data.length; i++) {
        depArray.push(data[i]);
      }

      for (let i = 0; i < depArray.length; i++) {
        dep_html += `<tr id="${depArray[i].id}" class=" departmentEdit depTableRow" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#departmentEditModal" title="${depArray[i].department}" location="${depArray[i].locationID}" users="${depArray[i].users}" departmentID="${depArray[i].id}"><td class="tableIcon"><img src="images/departments.png" alt="department image" id="departmentIcon"></td><td scope="row" class="department"> ${depArray[i].department} </td><td scope="row" class="department_location"> ${depArray[i].location} </td>`;
      }

      $("#departmentsList").html(dep_html);
    },

    error: function (jqXHR, textStatus, errorThrown) {
      console.log(errorThrown);
    },
  });
}

function getAllUsers() {
  // Generate all user data for the table
  $.ajax({
    type: "GET",
    url: "php/getAll.php",
    data: {},
    dataType: "json",
    async: false,
    success: function (results) {
      // Update Main HTML Table
      let data = results["data"];

      let usersArray = [];
      let htmlData = ``;

      for (let i = 0; i < data.length; i++) {
        usersArray.push(data[i]);
      }

      for (let i = 0; i < usersArray.length; i++) {
        htmlData += `<tr class="tableRow" id="${usersArray[i].id}">
        <td scope="row" class="tableIcon"><img src="images/eye.png" alt="eye icon" class="eyeIcon"></td><td scope="row" class="employeeData">${usersArray[
          i
        ].firstName.toUpperCase()}</td><td scope="row" class="employeeData">${usersArray[
          i
        ].lastName.toUpperCase()}</td><td scope="row" class="hider1 employeeData" >${usersArray[
          i
        ].email.toUpperCase()}</td><td scope="row" class="hider1 employeeData" >${usersArray[
          i
        ].jobTitle.toUpperCase()}</td><td scope="row" class="hider2 employeeData">${usersArray[
          i
        ].department.toUpperCase()}</td><td scope="row" class="hider2 employeeData">${usersArray[
          i
        ].location.toUpperCase()}</td></tr>`;
      }

      $("#mainEmployeesTable").html(htmlData);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(errorThrown);
    },
  });
}

let day = new Date().toUTCString().slice(0, 16);

function setTime() {
  let d = new Date(),
    todayDate = document.querySelector("#todayDate");

  todayDate.innerHTML = `${day}, ${formatAMPM(d)}`;

  setTimeout(setTime, 1000);
}

function formatAMPM(date) {
  let hours = date.getHours(),
    minutes = date.getMinutes(),
    seconds = date.getSeconds(),
    ampm = hours >= 12 ? "pm" : "am";

  if (seconds < 10) {
    seconds = `0${seconds}`;
  }
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  let strTime = hours + ":" + minutes + ":" + seconds + " " + ampm;
  return strTime;
}

setTime();
